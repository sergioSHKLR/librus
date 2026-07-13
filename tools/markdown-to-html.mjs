/**
 * Block 1 of 1 — tools/markdown-to-html.mjs
 * Description: MD → HTML + TOC; short links l/w/d/m; containers; footnotes
 * Version: 1.g
 * Revised: 12Jul26
 */

import MarkdownIt from 'markdown-it';
import markdownItFootnote from 'markdown-it-footnote';
import markdownItContainer from 'markdown-it-container';

const LINK_BASES = {
  pt: {
    l: 'https://www.luzespirita.org.br/index.php?lisPage=enciclopedia&item=',
    w: 'https://pt.wikipedia.org/wiki/',
    d: 'https://pt.wiktionary.org/wiki/',
    m: 'https://www.openstreetmap.org/search?query='
  },
  en: {
    l: 'https://www.luzespirita.org.br/index.php?lisPage=enciclopedia&item=',
    w: 'https://en.wikipedia.org/wiki/',
    d: 'https://en.wiktionary.org/wiki/',
    m: 'https://www.openstreetmap.org/search?query='
  }
};

const ANCHOR_REGEX = /\{\#([a-zA-Z0-9-_:.]+)\}$/;

/**
 * Fully unquote a short-link slug. markdown-it often percent-encodes before
 * link_open runs; without this we double-encode (%25C3%25AD).
 */
function fullyDecodeSlug(raw) {
  let cur = String(raw || '');
  for (let i = 0; i < 4; i++) {
    try {
      const next = decodeURIComponent(cur.replace(/\+/g, '%20'));
      if (next === cur) break;
      cur = next;
    } catch {
      break;
    }
  }
  return cur;
}

/**
 * Provider-specific segment encoding after full decode:
 * - w / d / m: UTF-8 diacritics (IRI). Wiki/Wiktionary accept and display them.
 * - l (Luz): single percent-encode — site + dictionary use item=Esp%C3%ADrita form;
 *   raw diacritics / double-encoding both fail.
 */
function encodeLinkSegment(code, slug) {
  if (code === 'l') {
    return encodeURIComponent(slug);
  }
  /* Path-style providers: keep Unicode letters; only escape structural breakers */
  return slug
    .replace(/ /g, code === 'm' ? '%20' : '_')
    .replace(/[?#\\"<>`]/g, (ch) => encodeURIComponent(ch));
}

function createMd() {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: true
  }).use(markdownItFootnote);

  const containers = [
    'center',
    'box',
    'spirit',
    'kardec',
    'bible',
    'toc',
    'chapter-toc',
    'expand',
    'quote',
    'aside',
    'note'
  ];

  for (const name of containers) {
    md.use(markdownItContainer, name, {
      validate(params) {
        return params.trim().match(new RegExp('^' + name + '(?:\\s+|$)'));
      },
      render(tokens, idx) {
        if (tokens[idx].nesting === 1) {
          const title = tokens[idx].info.trim().substring(name.length).trim();
          /* expand / Termos relacionados → native collapsible (closed by default) */
          if (name === 'expand') {
            const label = title || 'Expand';
            const isRelated = /termos\s+relacionados/i.test(label);
            const cls =
              'expand-block' + (isRelated ? ' related-terms-block' : '');
            return (
              '<details class="' +
              cls +
              '">\n' +
              '<summary class="expand-summary">' +
              md.utils.escapeHtml(label) +
              '</summary>\n' +
              '<div class="expand-body">\n'
            );
          }
          const header = title
            ? '<div class="' + name + '-header">' + md.utils.escapeHtml(title) + '</div>'
            : '';
          return '<div class="' + name + '-block">' + header + '<div class="' + name + '-body">\n';
        }
        if (name === 'expand') {
          return '</div></details>\n';
        }
        return '</div></div>\n';
      }
    });
  }

  return md;
}

function stripAnchorFromInline(inlineToken) {
  const match = inlineToken.content.match(ANCHOR_REGEX);
  const cleanText = inlineToken.content.replace(ANCHOR_REGEX, '').trim();
  inlineToken.content = cleanText;
  if (inlineToken.children && inlineToken.children.length) {
    for (let i = inlineToken.children.length - 1; i >= 0; i--) {
      const child = inlineToken.children[i];
      if (child.type === 'text' && ANCHOR_REGEX.test(child.content)) {
        child.content = child.content.replace(ANCHOR_REGEX, '').replace(/\s+$/, '');
        break;
      }
    }
  }
  return match ? match[1] : '';
}

function applyLinkAttrs(md, lang) {
  const bases = LINK_BASES[lang] || LINK_BASES.pt;
  const defaultRender =
    md.renderer.rules.link_open ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options);
    };

  md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    const token = tokens[idx];
    const hrefIdx = token.attrIndex('href');
    if (hrefIdx >= 0) {
      const href = token.attrs[hrefIdx][1] || '';
      /* markdown-it may keep angle-bracket dest as l:… or strip <> */
      const short = href.match(/^<?([lwdm]):(.+?)>?$/);
      if (short) {
        const code = short[1];
        const slug = fullyDecodeSlug(short[2]);
        const base = bases[code] || '';
        token.attrs[hrefIdx][1] = base + encodeLinkSegment(code, slug);
        token.attrSet('data-link-provider', code);
        token.attrSet('data-doutrina-link', '1');
      }
    }
    const titleIdx = token.attrIndex('title');
    if (titleIdx >= 0) {
      const title = token.attrs[titleIdx][1] || '';
      const meta = title.match(/^([lwdm]):(hi|med|lo)$/i);
      if (meta) {
        token.attrSet('data-link-provider', meta[1].toLowerCase());
        token.attrSet('data-link-interest', meta[2].toLowerCase());
        token.attrSet('data-doutrina-link', '1');
        token.attrs[titleIdx][1] = '';
      }
    }
    return defaultRender(tokens, idx, options, env, self);
  };
}

/*
 * ::: bible citation targets:
 * - Book name  → PT Wikipedia prophet / traditional author
 * - Chapter #  → PT Wikipedia numbered chapter (e.g. Mateus_13)
 * - Verse #    → PT Wikisource Almeida 1819 chapter (ARC-line text), e.g. …/Mateus/XIII
 * - ARC        → PT Wikipedia Almeida Revista e Corrigida
 * Keys are ASCII-folded lowercase.
 *
 * Note: modern SBB ARC is copyrighted; Wikisource hosts public-domain
 * João Ferreira de Almeida 1819 (ortografia atualizada) — same lineage.
 */
const BIBLE_PROPHET_WIKI = {
  genesis: 'Moisés',
  exodo: 'Moisés',
  levitico: 'Moisés',
  numeros: 'Moisés',
  deuteronomio: 'Moisés',
  mateus: 'Mateus,_o_Evangelista',
  marcos: 'Marcos,_o_Evangelista',
  lucas: 'Lucas,_o_Evangelista',
  joao: 'João,_o_Evangelista',
  atos: 'Lucas,_o_Evangelista',
  romanos: 'Paulo_de_Tarso',
  corintios: 'Paulo_de_Tarso',
  galatas: 'Paulo_de_Tarso',
  efesios: 'Paulo_de_Tarso',
  filipenses: 'Paulo_de_Tarso',
  colossenses: 'Paulo_de_Tarso',
  tessalonicenses: 'Paulo_de_Tarso',
  timoteo: 'Paulo_de_Tarso',
  tito: 'Paulo_de_Tarso',
  hebreus: 'Paulo_de_Tarso',
  tiago: 'Tiago,_filho_de_Alfeu',
  pedro: 'Simão_Pedro',
  judas: 'Judas_Tadeu',
  apocalipse: 'João,_o_Evangelista'
};

/** Short PT book label used in "Mateus 13" / "Mateus 13:14" page titles */
const BIBLE_CHAPTER_LABEL = {
  genesis: 'Gênesis',
  exodo: 'Êxodo',
  levitico: 'Levítico',
  numeros: 'Números',
  deuteronomio: 'Deuteronômio',
  mateus: 'Mateus',
  marcos: 'Marcos',
  lucas: 'Lucas',
  joao: 'João',
  atos: 'Atos',
  romanos: 'Romanos',
  corintios: 'I_Coríntios',
  galatas: 'Gálatas',
  efesios: 'Efésios',
  filipenses: 'Filipenses',
  colossenses: 'Colossenses',
  tessalonicenses: 'I_Tessalonicenses',
  timoteo: 'I_Timóteo',
  tito: 'Tito',
  hebreus: 'Hebreus',
  tiago: 'Tiago',
  pedro: 'I_Pedro',
  judas: 'Judas',
  apocalipse: 'Apocalipse'
};

const ARC_WIKI = 'https://pt.wikipedia.org/wiki/Almeida_Revista_e_Corrigida';
const WIKI = 'https://pt.wikipedia.org/wiki/';
/** Public-domain Almeida text on PT Wikisource (ARC lineage; chapter pages use Roman numerals) */
const WIKISOURCE_ALMEIDA =
  'https://pt.wikisource.org/wiki/João_Ferreira_de_Almeida_1819_(ortografia_atualizada)';

function foldKey(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function bibleKey(bookName) {
  return foldKey(bookName);
}

/** Prophet / author person article */
function wikiProphetArticle(bookName) {
  const key = bibleKey(bookName);
  return BIBLE_PROPHET_WIKI[key] || String(bookName || '').replace(/\s+/g, '_');
}

/** Short label for Wikipedia chapter pages and Wikisource book path */
function wikiChapterLabel(bookName) {
  const key = bibleKey(bookName);
  return BIBLE_CHAPTER_LABEL[key] || String(bookName || '').replace(/\s+/g, '_');
}

/**
 * Wikisource book segment (no underscores — path uses plain names like Mateus, Gênesis).
 */
function wikisourceBookName(bookName) {
  const label = wikiChapterLabel(bookName);
  return String(label).replace(/_/g, ' ');
}

function firstVerseToken(versText) {
  const m = String(versText || '').match(/(\d+)/);
  return m ? m[1] : '1';
}

/** Strip leading zeros so cap. 06 → Mateus_6 (matches PT wiki titles) */
function normalizeChapterNum(chap) {
  const n = parseInt(String(chap || '1'), 10);
  return Number.isFinite(n) && n > 0 ? String(n) : String(chap || '1');
}

/** Arabic chapter number → Roman numeral (Wikisource …/Mateus/XIII) */
function toRoman(num) {
  let n = parseInt(String(num), 10);
  if (!Number.isFinite(n) || n < 1) n = 1;
  if (n > 3999) n = 3999;
  const map = [
    [1000, 'M'],
    [900, 'CM'],
    [500, 'D'],
    [400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I']
  ];
  let out = '';
  for (const [val, sym] of map) {
    while (n >= val) {
      out += sym;
      n -= val;
    }
  }
  return out;
}

/**
 * Wikisource Almeida chapter URL for a book + chapter (+ optional verse fragment).
 * Path: …/Mateus/XIII  (verses are numbered list items on that page)
 */
function wikisourceArcChapterUrl(bookName, chap, verseNum) {
  const book = wikisourceBookName(bookName);
  const roman = toRoman(chap);
  let url = WIKISOURCE_ALMEIDA + '/' + book + '/' + roman;
  /* Fragment helps deep-link when anchors exist; chapter page always lists verses in order */
  if (verseNum) {
    url += '#' + encodeURIComponent(String(verseNum));
  }
  return url;
}

function wikiA(href, label, interest) {
  const esc = (s) =>
    String(s)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;');
  return (
    '<a href="' +
    esc(href) +
    '" title="" data-link-provider="w" data-doutrina-link="1" data-link-interest="' +
    (interest || 'hi') +
    '" data-bible-cite="1">' +
    esc(label) +
    '</a>'
  );
}

/**
 * Linkify a bible citation string.
 * Example: "Mateus, cap. 13, vers. 14, ARC"
 * → prophet | Wikipedia Mateus_13 | Wikisource …/Mateus/XIII#14 | ARC wiki
 */
function linkifyBibleCitation(cite) {
  const text = String(cite || '').trim();
  if (!text) return text;

  const arcRe = /,\s*ARC\s*$/i;
  const hasArc = arcRe.test(text);
  const body = hasArc ? text.replace(arcRe, '') : text;

  /* One or more "Book, cap. N, vers. …" segments joined by " e " */
  const segRe =
    /([A-Za-zÀ-ÿ]+)\s*,\s*cap\.\s*(\d+)\s*,\s*vers\.\s*([^,]+?)(?=\s+e\s+[A-Za-zÀ-ÿ]+\s*,\s*cap\.|$)/gi;

  let out = '';
  let last = 0;
  let m;
  let any = false;
  while ((m = segRe.exec(body)) !== null) {
    any = true;
    out += body.slice(last, m.index);
    const book = m[1];
    const chap = normalizeChapterNum(m[2]);
    const vers = m[3].trim();
    const v0 = firstVerseToken(vers);
    const label = wikiChapterLabel(book);

    const prophetUrl = WIKI + wikiProphetArticle(book);
    /* Numbered chapter article, e.g. Mateus_13 */
    const chapUrl = WIKI + label + '_' + chap;
    /* Wikisource Almeida chapter (ARC-line text) for the verse */
    const verseUrl = wikisourceArcChapterUrl(book, chap, v0);

    out +=
      wikiA(prophetUrl, book, 'hi') +
      ', cap. ' +
      wikiA(chapUrl, chap, 'med') +
      ', vers. ' +
      wikiA(verseUrl, vers, 'med');
    last = m.index + m[0].length;
  }

  if (!any) {
    /* Not a standard cite (inline quote fragment) — leave plain */
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  }

  out += body.slice(last);
  if (hasArc) {
    out += ', ' + wikiA(ARC_WIKI, 'ARC', 'hi');
  }
  return out;
}

/**
 * Post-process rendered HTML: each ::: bible citation gets ≥4 wiki links.
 * @param {string} html
 */
function enrichBibleBlocks(html) {
  return html.replace(
    /(<div class="bible-block">[\s\S]*?<div class="bible-body">)([\s\S]*?)(<\/div><\/div>)/gi,
    (full, open, body, close) => {
      const next = body.replace(
        /<strong>([^<]*)<\/strong>/gi,
        (sm, cite) => {
          if (!/cap\.\s*\d+/i.test(cite) && !/\bARC\b/i.test(cite)) return sm;
          return '<strong class="bible-cite">' + linkifyBibleCitation(cite) + '</strong>';
        }
      );
      return open + next + close;
    }
  );
}

/**
 * @param {string} bodyContent
 * @param {{ lang?: string }} opts
 */
export function markdownToHtml(bodyContent, opts = {}) {
  const lang = opts.lang === 'en' ? 'en' : 'pt';
  const md = createMd();
  applyLinkAttrs(md, lang);

  const safeContent = typeof bodyContent === 'string' ? bodyContent : '';
  const tokens = md.parse(safeContent, {});
  const tableOfContents = [];

  tokens.forEach((token, idx) => {
    if (token.type !== 'heading_open') return;
    const inlineToken = tokens[idx + 1];
    if (!inlineToken || inlineToken.type !== 'inline') return;

    const id = stripAnchorFromInline(inlineToken);
    if (id) {
      if (!token.attrs) token.attrs = [];
      token.attrs.push(['id', id]);
    }

    tableOfContents.push({
      level: parseInt(token.tag.slice(1), 10),
      text: inlineToken.content.trim(),
      id: id || ''
    });
  });

  const inner = enrichBibleBlocks(md.renderer.render(tokens, md.options, {}));
  return {
    html: '<article class="book">\n' + inner + '\n</article>\n',
    toc: tableOfContents
  };
}

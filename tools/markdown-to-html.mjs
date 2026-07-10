/**
 * Block 1 of 1 — tools/markdown-to-html.mjs
 * Description: MD → HTML + TOC; short links l/w/d/m; containers; footnotes
 * Version: 1.a
 * Revised: 260710 17:30
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
          const header = title
            ? '<div class="' + name + '-header">' + md.utils.escapeHtml(title) + '</div>'
            : '';
          return '<div class="' + name + '-block">' + header + '<div class="' + name + '-body">\n';
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
      const short = href.match(/^([lwdm]):(.+)$/);
      if (short) {
        const code = short[1];
        const slug = short[2];
        const base = bases[code] || '';
        token.attrs[hrefIdx][1] = base + slug;
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

  const inner = md.renderer.render(tokens, md.options, {});
  return {
    html: '<article class="book">\n' + inner + '\n</article>\n',
    toc: tableOfContents
  };
}

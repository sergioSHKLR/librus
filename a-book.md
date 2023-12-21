---
title: ⌨️ Markdown Cheatsheet
layout: book
version: 23.12.20
---

# ⌨️ Markdown Cheatsheet

<table>
  <tbody>
    <tr>
      <td><em>Italics</em></td>
      <td>
<code>*Italics*</code> or <code>_Italics_</code>
</td>
    </tr>
    <tr>
      <td><strong>Bold</strong></td>
      <td>
<code>**Bold**</code> or <code>__Bold__</code>
</td>
    </tr>
    <tr>
      <td><code>Inline code</code></td>
      <td><code>`Inline code`</code></td>
    </tr>
    <tr>
      <td><code>Inline code</code></td>
      <td><code>&lt;code&gt;Inline code&lt;/code&gt;</code></td>
    </tr>
    <tr>
      <td>*Escaping*</td>
      <td><code>\*Escaping\*</code></td>
    </tr>
    <tr>
      <td><del>Strikethrough</del></td>
      <td><code>&lt;del&gt;Strikethrough&lt;/del&gt;</code></td>
    </tr>
    <tr>
      <td>– (en-dash)</td>
      <td><code>--</code></td>
    </tr>
    <tr>
      <td>— (em-dash)</td>
      <td><code>---</code></td>
    </tr>
    <tr>
      <td>… (ellipsis)</td>
      <td><code>...</code></td>
    </tr>
    <tr>
      <td>«guillemet»</td>
      <td>
<code>&lt;&lt;</code> and <code>&gt;&gt;</code>
</td>
    </tr>
    <tr>
      <td>
<span class="emoji" title=":lollipop:">🍭</span><br>
<span class="emoji" title=":+1:">👍
      <td><code>:lollipop:<br>:+1:</code></td>
   </span>
   </td>
   </tr>
   </tbody>
   </table>

<h4 id="paragraph-formatting-and-sectioning">Paragraph formatting and sectioning</h4>

<table>
  <tbody>
    <tr>
      <td>Level 1 header</td>
      <td><code># header {#id}</code></td>
    </tr>
    <tr>
      <td> </td>
      <td>
<code>header</code> with = underline</td>
    </tr>
    <tr>
      <td>Level 2 header</td>
      <td><code>## header {#id}</code></td>
    </tr>
    <tr>
      <td> </td>
      <td>
<code>header</code> with - underline</td>
    </tr>
    <tr>
      <td>Level 3 header</td>
      <td><code>### header {#id}</code></td>
    </tr>
    <tr>
      <td>Level 4 header</td>
      <td><code>#### header {#id}</code></td>
    </tr>
    <tr>
      <td>Block quote</td>
      <td><code>&gt; this is a quote</code></td>
    </tr>
    <tr>
      <td>Line break</td>
      <td><code>This is a\\</code></td>
    </tr>
    <tr>
      <td> </td>
      <td><code>line break</code></td>
    </tr>
    <tr>
      <td>Horizontal rule</td>
      <td>
<code>* * *</code> or <code>---</code>
</td>
    </tr>
    <tr>
      <td>Code paragraph</td>
      <td>Start with four blank indentation.</td>
    </tr>
    <tr>
      <td> </td>
      <td>Delimit with <code>~~~</code> or <code>```</code>
</td>
    </tr>
    <tr>
      <td> </td>
      <td>Delimit with <code>~~~language</code> or <code>```language</code> for color syntax</td>
    </tr>
    <tr>
      <td>Unordered list</td>
      <td>Items with <code>*</code> or <code>-</code> or <code>+</code>
</td>
    </tr>
    <tr>
      <td>Ordered list</td>
      <td>Number and a dot</td>
    </tr>
    <tr>
      <td>Definition list</td>
      <td>Normal paragraph follwoed by <code>:</code> and space</td>
    </tr>
    <tr>
      <td>HTML</td>
      <td>HTML blocks are accepted</td>
    </tr>
    <tr>
      <td>Footnotes</td>
      <td>
<code>[^label]</code> and <code>[^label]: text</code> at the end</td>
    </tr>
    <tr>
      <td>Abbreviations</td>
      <td>
<code>*[label]: description</code> at the end</td>
    </tr>
    <tr>
      <td>Task lists</td>
      <td>
<code>- [ ] Incomplete</code> <code>- [x] Complete</code>
</td>
    </tr>
  </tbody>
</table>

<h4 id="links">Links</h4>

<table>
  <tbody>
    <tr>
      <td>Automatic</td>
      <td><code>&lt;http://www.google.com&gt;</code></td>
    </tr>
    <tr>
      <td>Inline (external)</td>
      <td><code>[google](http://www.google.com)</code></td>
    </tr>
    <tr>
      <td>Inline (internal)</td>
      <td><code>[critic2](/critic2/)</code></td>
    </tr>
    <tr>
      <td>Reference</td>
      <td><code>[google][gid]</code></td>
    </tr>
    <tr>
      <td> </td>
      <td><code>[gid]: http://google.com "optional title"</code></td>
    </tr>
  </tbody>
</table>

<h4 id="images">Images</h4>

<table>
  <tbody>
    <tr>
      <td>Inline</td>
      <td><code>![title](/assets/images/clathrate.png "title"){:height="100px" width="100px"}</code></td>
    </tr>
    <tr>
      <td>Reference</td>
      <td><code>![clath2]</code></td>
    </tr>
    <tr>
      <td> </td>
      <td><code>[clath2]: /assets/images/clathrate.png{:height="100px" width="100px"}</code></td>
    </tr>
    <tr>
      <td>External</td>
      <td><code>![image](https://img.shields.io/badge/new-bleh-green)</code></td>
    </tr>
  </tbody>
</table>

<h4 id="tables">Tables</h4>

<pre>
|---------+---------+---------|
| Header1 | Header2 | Header3 |
|---------|:--------|--------:|
| 1       | 2       | 3       |
| 4       | 5       | 6       |
|---------+---------+---------|
| 8       | 95      | 106     |
| 894     | 345     | 866     |
|=========+=========+=========|
| Foot1   | Foot2   | Foot3   |
|---------+---------+---------|
</pre>

<table>
  <thead>
    <tr>
      <th>Header1</th>
      <th style="text-align: left">Header2</th>
      <th style="text-align: right">Header3</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td style="text-align: left">2</td>
      <td style="text-align: right">3</td>
    </tr>
    <tr>
      <td>4</td>
      <td style="text-align: left">5</td>
      <td style="text-align: right">6</td>
    </tr>
  </tbody>
  <tbody>
    <tr>
      <td>8</td>
      <td style="text-align: left">95</td>
      <td style="text-align: right">106</td>
    </tr>
    <tr>
      <td>894</td>
      <td style="text-align: left">345</td>
      <td style="text-align: right">866</td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td>Foot1</td>
      <td style="text-align: left">Foot2</td>
      <td style="text-align: right">Foot3</td>
    </tr>
  </tfoot>
</table>


<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>

---

<br>





import { escHtml, nl2br, hexToRgba, NUMERALS } from './index.js'

function renderBlockHTML(block, characters, accent) {
  const charMap = {}
  ;(characters || []).forEach(char => {
    charMap[char.id] = char
  })

  if (block.type === 'narrator') {
    return `  <div class="panel fade-in"><div class="narrator">${nl2br(escHtml(block.text || ''))}</div></div>`
  }

  if (block.type === 'monologue') {
    return `  <div class="panel fade-in"><div class="monologue">${nl2br(escHtml(block.text || ''))}</div></div>`
  }

  if (block.type === 'quote') {
    return `  <div class="quote-card fade-in"><p>${nl2br(escHtml(block.text || ''))}</p></div>`
  }

  if (block.type === 'dialogue') {
    const char = charMap[block.speaker] || characters?.[0] || { name: '?', color: '#eee', side: 'left' }
    const name = char.name || '?'
    const isRight = char.side === 'right'
    const thought = block.thought ? `<span class="thought">${escHtml(block.thought)}</span>` : ''

    return `  <div class="panel fade-in">
    <div class="dialogue-row ${isRight ? 'rev' : ''}">
      <div class="avatar" style="background:${char.color}">${escHtml(name.slice(-1) || '?')}</div>
      <div class="bwrap">
        <div class="bname">${escHtml(name)}</div>
        <div class="bubble ${isRight ? 'b' : 'a'}" style="background:${char.color}">${nl2br(escHtml(block.text || ''))}${thought}</div>
      </div>
    </div>
  </div>`
  }

  if (block.type === 'phone') {
    const messages = (block.messages || [])
      .map(message => {
        const msgChar = charMap[message.charId] || characters?.[0] || { side: 'left' }
        const isRight = msgChar.side === 'right' || message.side === 'right'
        return `    <div class="msg-row ${isRight ? 'right' : ''}"><div class="msg-bubble ${isRight ? 'right' : 'left'}">${nl2br(escHtml(message.text || ''))}</div></div>`
      })
      .join('\n')

    return `  <div class="panel fade-in">
    <div class="phone-chat">
      <div class="phone-header">${escHtml(block.header || '-- 微信消息 --')}</div>
${messages}
    </div>
  </div>`
  }

  if (block.type === 'timestamp') {
    const text = [block.time, block.place].filter(Boolean).join(' · ')
    return `  <div class="timestamp-bar fade-in"><span class="ts-dot">●</span><span class="ts-text">${escHtml(text)}</span></div>`
  }

  if (block.type === 'illustration') {
    if (!block.svg) return ''
    return `  <div class="illus-block fade-in">${block.svg}</div>`
  }

  return ''
}

export function generateHTML(story) {
  const {
    title = '',
    subtitle = '',
    tag = '',
    ending = '',
    characters = [],
    accent = '#C07858',
    bg = '#F7F3EE',
    chapters = [],
  } = story

  const accentSoft = hexToRgba(accent, 0.15)
  const charColorVars = characters.map((char, index) => `  --char-color-${index}: ${char.color};`).join('\n')

  const chaptersHTML = chapters
    .map((chapter, chapterIndex) => {
      const number = chapter.numeral || NUMERALS[chapterIndex] || String(chapterIndex + 1)
      const blocksHTML = (chapter.blocks || []).map(block => renderBlockHTML(block, characters, accent)).join('\n')

      return `
  <div class="chapter fade-in" id="ch${chapterIndex}">
    <div class="chapter-num">${escHtml(number)}</div>
    <div class="chapter-line"></div>
    <div class="chapter-title">${escHtml(chapter.title)}</div>
  </div>
  ${blocksHTML}`
    })
    .join('\n')

  const tocItems = chapters
    .map((chapter, chapterIndex) => {
      const number = chapter.numeral || NUMERALS[chapterIndex] || String(chapterIndex + 1)
      return `<li class="toc-item${chapterIndex === 0 ? ' active' : ''}"><a href="#ch${chapterIndex}"><span class="toc-num">${escHtml(number)}</span><span class="toc-label">${escHtml(chapter.title)}</span></a></li>`
    })
    .join('\n      ')

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escHtml(title)}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=ZCOOL+KuaiLe&family=Noto+Sans+SC:wght@300;400;500;700&display=swap');
  :root {
    --bg: ${bg};
    --accent: ${accent};
    --accent-soft: ${accentSoft};
    --a-color: ${(characters[0] || { color: '#E0F0E4' }).color};
    --b-color: ${(characters[1] || characters[0] || { color: '#FFF0E8' }).color};
${charColorVars}
    --ink: #2D2B2A;
    --ink-2: #6B6460;
    --border: #3D3A38;
    --panel-bg: #FFFFFF;
  }
  * { margin:0; padding:0; box-sizing:border-box; }
  html { scroll-behavior:smooth; }
  body { background:var(--bg); font-family:'Noto Sans SC',sans-serif; color:var(--ink); overflow-x:hidden; -webkit-user-select:none; user-select:none; }
  .wrap { max-width:480px; margin:0 auto; padding:0 14px 80px; }
  .header { text-align:center; padding:48px 20px 36px; }
  .header-tag { display:inline-block; font-family:'ZCOOL KuaiLe',cursive; font-size:11px; letter-spacing:3px; color:var(--accent); border:1.5px solid var(--accent); padding:3px 12px; border-radius:20px; margin-bottom:16px; opacity:0.8; }
  .header h1 { font-family:'Ma Shan Zheng',cursive; font-size:40px; color:var(--ink); letter-spacing:6px; margin-bottom:10px; }
  .header h1 span { color:var(--accent); }
  .header .sub { font-family:'ZCOOL KuaiLe',cursive; font-size:13px; color:var(--ink-2); letter-spacing:2px; margin-bottom:14px; }
  .deco { width:50px; height:3px; background:var(--accent); margin:0 auto; border-radius:2px; opacity:0.6; }
  .chapter { display:flex; align-items:center; gap:12px; margin:36px 0 18px; }
  .chapter-num { font-family:'Ma Shan Zheng',cursive; font-size:30px; color:var(--accent); flex-shrink:0; line-height:1; }
  .chapter-line { flex:1; height:1.5px; background:linear-gradient(90deg,var(--accent),transparent); opacity:0.4; }
  .chapter-title { font-family:'ZCOOL KuaiLe',cursive; font-size:15px; color:var(--ink-2); letter-spacing:2px; flex-shrink:0; }
  .panel { background:var(--panel-bg); border:2px solid var(--border); border-radius:8px; margin-bottom:14px; overflow:hidden; box-shadow:3px 3px 0 rgba(0,0,0,0.07); }
  .narrator { padding:14px 16px; font-size:13px; line-height:1.95; color:var(--ink-2); font-style:italic; background:linear-gradient(135deg,#FAFAF8,#F5F2EE); white-space:normal; }
  .monologue { padding:16px 18px; border-left:3px solid var(--accent); background:linear-gradient(135deg,rgba(255,255,255,0.8),var(--bg)); font-size:13px; line-height:1.9; font-style:italic; }
  .dialogue-row { display:flex; gap:10px; padding:14px; align-items:flex-start; }
  .dialogue-row.rev { flex-direction:row-reverse; }
  .avatar { width:38px; height:38px; border-radius:50%; flex-shrink:0; border:2px solid var(--border); display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:var(--ink-2); }
  .bwrap { max-width:75%; }
  .bname { font-size:11px; font-weight:700; color:var(--ink-2); margin-bottom:4px; }
  .bubble { padding:10px 14px; border-radius:16px; font-size:13.5px; line-height:1.75; word-break:break-word; }
  .bubble.a { border:1.5px solid rgba(0,0,0,0.08); border-bottom-left-radius:4px; }
  .bubble.b { border:1.5px solid rgba(0,0,0,0.08); border-bottom-right-radius:4px; }
  .thought { font-size:11px; color:var(--ink-2); font-style:italic; display:block; margin-top:6px; border-top:1px dashed rgba(0,0,0,0.1); padding-top:6px; }
  .phone-chat { padding:14px; background:#EDEDED; }
  .phone-header { text-align:center; font-size:11px; color:#888; margin-bottom:12px; font-family:'ZCOOL KuaiLe',cursive; }
  .msg-row { display:flex; margin-bottom:8px; }
  .msg-row.right { justify-content:flex-end; }
  .msg-bubble { max-width:72%; padding:8px 12px; font-size:13px; line-height:1.65; word-break:break-word; }
  .msg-bubble.left { background:#fff; border-radius:4px 12px 12px 12px; }
  .msg-bubble.right { background:#9FD280; border-radius:12px 4px 12px 12px; color:#1a3d0a; }
  .timestamp-bar { display:flex; align-items:center; justify-content:center; gap:7px; margin:18px 0 10px; }
  .ts-dot { font-size:7px; color:#F5C842; line-height:1; flex-shrink:0; text-shadow:0 0 4px rgba(245,200,66,0.5); }
  .ts-text { display:inline-block; background:#FFFBEC; border:1px solid #F0E0A0; border-radius:20px; padding:4px 14px; font-size:11.5px; color:#7A6020; letter-spacing:0.5px; }
  .illus-block { margin-bottom:14px; border-radius:10px; overflow:hidden; border:2px solid var(--border); box-shadow:3px 3px 0 rgba(0,0,0,0.07); background:var(--panel-bg); line-height:0; }
  .illus-block svg, .illus-block img { width:100%; height:auto; display:block; }
  .quote-card { background:var(--ink); border-radius:8px; padding:24px 20px; margin-bottom:14px; box-shadow:3px 3px 0 rgba(0,0,0,0.15); position:relative; overflow:hidden; }
  .quote-card::before { content:'"'; position:absolute; top:-10px; left:10px; font-family:'Ma Shan Zheng',cursive; font-size:100px; color:rgba(255,255,255,0.06); line-height:1; }
  .quote-card p { font-size:13.5px; line-height:1.9; color:#EEE8E0; position:relative; z-index:1; white-space:pre-line; }
  .end-card { text-align:center; padding:40px 20px; background:var(--panel-bg); border:2px solid var(--border); border-radius:8px; margin-top:32px; box-shadow:3px 3px 0 rgba(0,0,0,0.07); }
  .end-hearts { font-size:20px; letter-spacing:6px; margin-bottom:12px; color:var(--accent); }
  .end-sub { font-size:12px; color:var(--ink-2); line-height:2; }
  .fade-in { opacity:0; transform:translateY(14px); transition:opacity 0.6s ease,transform 0.6s ease; }
  .fade-in.visible { opacity:1; transform:translateY(0); }
  .toc { display:none; position:fixed; right:24px; top:50%; transform:translateY(-50%); z-index:200; }
  @media(min-width:900px){ .toc{display:block;} }
  .toc-inner { background:var(--panel-bg); border:1.5px solid var(--border); border-radius:8px; padding:14px 10px; box-shadow:3px 3px 0 rgba(0,0,0,0.07); min-width:110px; }
  .toc-head { font-family:'ZCOOL KuaiLe',cursive; font-size:11px; letter-spacing:3px; color:var(--ink-2); text-align:center; margin-bottom:10px; padding-bottom:8px; border-bottom:1px solid #eee; }
  .toc-list { list-style:none; }
  .toc-item { margin-bottom:2px; }
  .toc-item a { display:flex; align-items:center; gap:6px; padding:5px 8px; border-radius:6px; text-decoration:none; transition:background 0.2s; }
  .toc-item a:hover { background:#F5F0EA; }
  .toc-item.active a { background:rgba(192,120,88,0.12); }
  .toc-num { font-family:'Ma Shan Zheng',cursive; font-size:14px; color:var(--accent); flex-shrink:0; line-height:1; }
  .toc-label { font-size:11px; color:var(--ink-2); letter-spacing:1px; }
  #sto { position:fixed; right:20px; bottom:58px; width:36px; height:36px; border-radius:50%; background:var(--accent); color:#fff; border:none; font-size:16px; cursor:pointer; display:none; align-items:center; justify-content:center; box-shadow:0 2px 8px rgba(0,0,0,0.15); z-index:150; }
  #sto.show { display:flex; }
  @media(min-width:900px){ #sto{right:155px;} }
</style>
</head>
<body>
<div class="wrap">
  <div class="header fade-in">
    <div class="header-tag">${escHtml(tag)}</div>
    <h1><span>${escHtml(title)}</span></h1>
    <div class="sub">${escHtml(subtitle)}</div>
    <div class="deco"></div>
  </div>

${chaptersHTML}

  <div class="end-card fade-in">
    <div class="end-hearts">♥ ♥ ♥</div>
    <div class="end-sub">${nl2br(escHtml(ending))}</div>
  </div>
</div>

<nav class="toc">
  <div class="toc-inner">
    <div class="toc-head">目录</div>
    <ul class="toc-list">
      ${tocItems}
    </ul>
  </div>
</nav>

<button id="sto" title="回到顶部">↑</button>

<script>
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible')
  }), { threshold: 0.1 });
  document.querySelectorAll('.fade-in').forEach(element => observer.observe(element));

  const scrollTopButton = document.getElementById('sto');
  window.addEventListener('scroll', () => scrollTopButton.classList.toggle('show', scrollY > 300));
  scrollTopButton.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

  const tocItems = document.querySelectorAll('.toc-item');
  const chapters = document.querySelectorAll('[id^="ch"].chapter');
  let suppressAutoToc = null;
  const chapterObserver = new IntersectionObserver(entries => {
    if (suppressAutoToc) return;
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        tocItems.forEach(item => item.classList.toggle('active', item.querySelector('a').getAttribute('href') === '#' + entry.target.id));
      }
    });
  }, { threshold: 0.1, rootMargin: '-10% 0px -70% 0px' });
  chapters.forEach(chapter => chapterObserver.observe(chapter));
  document.querySelectorAll('.toc-item a').forEach(anchor => {
    anchor.addEventListener('click', () => {
      tocItems.forEach(item => item.classList.toggle('active', item.querySelector('a') === anchor));
      clearTimeout(suppressAutoToc);
      suppressAutoToc = setTimeout(() => suppressAutoToc = null, 900);
    });
  });
  document.addEventListener('contextmenu', event => event.preventDefault());
<\/script>
</body>
</html>`
}

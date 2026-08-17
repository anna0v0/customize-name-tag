const styles={
  playful:{name:'Playful Maker Studio',tag:'01',sub:'Bright, tactile and friendly.',classes:'playful'},
  clean:{name:'Clean Product Configurator',tag:'02',sub:'Quiet, precise and conversion-focused.',classes:'clean'},
  bold:{name:'Bold Creative Workshop',tag:'03',sub:'Graphic, expressive and unmistakable.',classes:'bold'},
  pastel:{name:'Soft Pastel Toy Shop',tag:'04',sub:'Sweet, collectible and character-led.',classes:'pastel'},
  dark:{name:'Dark 3D Lab',tag:'05',sub:'Technical, focused and production-ready.',classes:'dark'}
};
const icons=['flower','cat','paw','cloud','heart','star','bow-tie','crown'];
const fonts=['Sour Gummy','Gochi Hand','Cherry Bomb','Darumadrop','Permanent Marker','Jua','Jaro','Poppins'];
const colors=['#20211f','#f7f3ea','#ef6254','#8ca88f','#83acd0','#f2b334'];
function render(){
 const key=document.body.dataset.style||'playful',s=styles[key];
 document.title=`${s.name} — UI Demo`;
 document.body.className=s.classes;
 document.querySelector('#app').innerHTML=`
 <header><a class="brand" href="./">FORM <i>&</i> FABLE</a><nav><a href="#design">DESIGN</a><a href="#how">HOW IT WORKS</a></nav><button class="nav-cta">BESPOKE 3D PRINTS</button></header>
 <main><section class="intro"><div><span class="kicker">STYLE ${s.tag} · UI CONCEPT</span><h1>${s.name}</h1><p>${s.sub}</p></div><a class="switch" href="./">VIEW ALL STYLES ↗</a></section>
 <section class="builder" id="design">
  <aside class="controls">
   <div class="control"><label><b>1</b> YOUR NAME</label><div class="name-input"><input id="name" maxlength="10" value="Milo"><span id="count">4/10</span></div><small>Letters and numbers only</small></div>
   <div class="control"><label><b>2</b> TYPEFACE</label><div class="font-grid">${fonts.map((f,i)=>`<button class="font ${i===0?'active':''}" data-font="${i}"><strong>Aa</strong><span>${f}</span></button>`).join('')}</div></div>
   <div class="control"><label><b>3</b> COLOURS</label><div class="colour-row"><span>BASE</span>${colors.map((c,i)=>`<button class="swatch ${i===1?'active':''}" data-base="${c}" style="--c:${c}" aria-label="${c}"></button>`).join('')}</div><div class="colour-row"><span>FACE</span>${colors.map((c,i)=>`<button class="swatch ${i===0?'active':''}" data-face="${c}" style="--c:${c}" aria-label="${c}"></button>`).join('')}</div></div>
   <div class="control"><label><b>4</b> ICON</label><small>Choose a preset icon or create your own avatar.</small><div class="icon-grid">${icons.map((i,n)=>`<button class="icon ${n===0?'active':''}" data-icon="${i}"><img src="/icon/presets/${i}.svg" alt="${i}"></button>`).join('')}<button class="avatar"><strong>＋</strong><span>CREATE YOUR AVATAR</span></button></div><div class="range"><span>ICON SIZE</span><strong id="range-value">100%</strong><input id="range" type="range" min="70" max="150" value="100"></div></div>
  </aside>
  <article class="preview-panel"><div class="preview-head"><span>LIVE 3D PREVIEW</span><strong>68 × 23 × 5 mm</strong></div><div class="stage"><div class="tag"><span class="ring"></span><span class="icon-preview"><img id="preview-icon" src="/icon/presets/flower.svg" alt=""></span><strong id="preview-name">Milo</strong></div><span class="ground"></span></div><div class="hint">Drag to rotate · Right-drag to pan · Scroll to zoom</div><button class="continue"><span>CONTINUE TO ORDER REQUEST</span><b>→</b></button></article>
 </section>
 <section class="how" id="how"><span>HOW IT WORKS</span><div><article><b>01</b><h2>Design</h2><p>Choose your name, typeface, colours and icon.</p></article><article><b>02</b><h2>Review</h2><p>We check your production model before confirming.</p></article><article><b>03</b><h2>Print</h2><p>Your one-of-one tag is printed and finished by hand.</p></article></div></section>
 </main>`;
 bind();
}
function bind(){
 const input=document.querySelector('#name'),preview=document.querySelector('#preview-name'),count=document.querySelector('#count');
 input.addEventListener('input',()=>{input.value=input.value.replace(/[^a-z0-9]/gi,'');preview.textContent=input.value||'NAME';count.textContent=`${input.value.length}/10`});
 document.querySelectorAll('.font').forEach(b=>b.onclick=()=>{document.querySelectorAll('.font').forEach(x=>x.classList.remove('active'));b.classList.add('active');preview.dataset.font=b.dataset.font});
 document.querySelectorAll('.icon').forEach(b=>b.onclick=()=>{document.querySelectorAll('.icon').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.querySelector('#preview-icon').src=`/icon/presets/${b.dataset.icon}.svg`});
 document.querySelectorAll('[data-base]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-base]').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.documentElement.style.setProperty('--base',b.dataset.base)});
 document.querySelectorAll('[data-face]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-face]').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.documentElement.style.setProperty('--face',b.dataset.face)});
 const range=document.querySelector('#range');range.oninput=()=>{document.querySelector('#range-value').textContent=`${range.value}%`;document.querySelector('.icon-preview').style.transform=`scale(${range.value/100})`};
}
render();

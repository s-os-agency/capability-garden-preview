// S/ Capability Garden prototype — progressive enhancement only.
(function(){
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  // Mobile menu
  const mb=$('.menu-btn'), nav=$('#site-nav');
  if(mb&&nav){mb.addEventListener('click',()=>{const o=nav.classList.toggle('open');mb.setAttribute('aria-expanded',o)})}

  // Tree tooltips (hover/focus for all nodes; click on locked nodes)
  $$('.tree-full').forEach(tree=>{
    const tip=document.createElement('div');tip.className='tip';tip.setAttribute('role','status');tree.appendChild(tip);
    const show=(n)=>{tip.innerHTML='<strong>'+n.dataset.title+'</strong>'+n.dataset.tip;
      const r=n.getBoundingClientRect(),t=tree.getBoundingClientRect();
      tip.style.left=((r.left+r.width/2)-t.left)+'px';tip.style.top=(r.top-t.top)+'px';tip.classList.add('show')};
    const hide=()=>tip.classList.remove('show');
    $$('.node',tree).forEach(n=>{
      n.addEventListener('mouseenter',()=>show(n));n.addEventListener('mouseleave',hide);
      n.addEventListener('focus',()=>show(n));n.addEventListener('blur',hide);
      if(n.classList.contains('locked')) n.addEventListener('click',e=>{e.preventDefault();show(n);setTimeout(hide,2600)});
    });
  });

  // Capability filters
  $$('[data-filter-group]').forEach(g=>{
    const target=$(g.dataset.filterGroup);
    $$('.chip',g).forEach(c=>c.addEventListener('click',()=>{
      $$('.chip',g).forEach(x=>x.setAttribute('aria-pressed',x===c));
      const f=c.dataset.filter;
      $$('[data-tags]',target).forEach(el=>{el.hidden=!(f==='all'||el.dataset.tags.split(' ').includes(f))});
    }));
  });

  // Growth paths
  const pl=$('.path-list');
  if(pl){
    const data=JSON.parse($('#path-data').textContent);
    const panel=$('.path-panel');
    const render=(id)=>{const d=data[id];
      $('[data-p=title]',panel).textContent=d.title;$('[data-p=desc]',panel).textContent=d.desc;
      $('[data-p=level]',panel).textContent=d.level;
      const steps=$('[data-p=steps]',panel);steps.innerHTML='';
      d.steps.forEach((s,i)=>{const li=document.createElement('li');
        li.innerHTML='<span class="k">0'+(i+1)+'</span><div><small>'+s[0]+'</small><b>'+s[1]+'</b><p>'+s[2]+'</p></div>';steps.appendChild(li)});
      const a=$('[data-p=link]',panel);a.href=d.href;a.querySelector('span').textContent='Open '+d.title;
    };
    $$('button[data-path]',pl).forEach(b=>b.addEventListener('click',()=>{
      $$('button[data-path]',pl).forEach(x=>x.setAttribute('aria-selected',x===b));render(b.dataset.path)}));
  }

  // Notify form (prototype: stored on this device only)
  $$('form.notify').forEach(f=>f.addEventListener('submit',e=>{e.preventDefault();
    const v=f.querySelector('input').value.trim();if(!v)return;
    try{localStorage.setItem('garden-notify',v)}catch(_){}
    f.innerHTML='<p class="muted">Saved on this device. This prototype does not send anything yet.</p>'}));

  // ---- Six Level 1 working tools ----
  const out=(el,html)=>{el.innerHTML=html};
  const esc=s=>s.replace(/[&<"]/g,c=>({'&':'&','<':'<','>':'>','"':'"'}[c]));
  const tools={
    goal(b){const [base,cur,tgt]=['base','cur','tgt'].map(k=>parseFloat($('[name='+k+']',b).value));
      if([base,cur,tgt].some(isNaN)||tgt===base)return 'Enter a baseline, current value and a different target.';
      const p=(cur-base)/(tgt-base)*100;return `Progress: <b>${p.toFixed(1)}%</b> of the way from ${base} to ${tgt}.\nRemaining gap: <b>${(tgt-cur).toFixed(2)}</b>.`},
    sources(b){const lines=$('textarea',b).value.split(/\s+/).filter(x=>/^https?:\/\//i.test(x));
      if(!lines.length)return 'Paste one or more links that start with http:// or https://';
      const seen=new Set();let n=0;return lines.filter(u=>!seen.has(u)&&seen.add(u)).map(u=>{let h='';try{h=new URL(u).hostname.replace(/^www\./,'')}catch(_){h='invalid link'}return `[${++n}] ${esc(h)} — ${esc(u)}`}).join('\n')+(seen.size<lines.length?`\n\n${lines.length-seen.size} duplicate link(s) removed`:'')},
    contrast(b){const hex=h=>{h=h.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');return [0,2,4].map(i=>parseInt(h.substr(i,2),16)/255)};
      const lum=c=>{const [r,g,bb]=c.map(v=>v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4));return .2126*r+.7152*g+.0722*bb};
      const a=lum(hex($('[name=fg]',b).value)),c=lum(hex($('[name=bg]',b).value));const r=(Math.max(a,c)+.05)/(Math.min(a,c)+.05);
      const ok=(t)=>r>=t?'passes':'fails';return `Contrast ratio: <b>${r.toFixed(2)}:1</b>\nNormal text AA (4.5): ${ok(4.5)} · AAA (7): ${ok(7)}\nLarge text AA (3): ${ok(3)}`},
    csv(b){const rows=$('textarea',b).value.trim().split(/\r?\n/).filter(Boolean).map(r=>r.split(','));
      if(rows.length<2)return 'Paste a header row and at least one data row.';
      const w=rows[0].length;const bad=rows.map((r,i)=>r.length!==w?i+1:0).filter(Boolean);
      let empty=0;rows.slice(1).forEach(r=>r.forEach(c=>{if(!c.trim())empty++}));
      const keys=rows.slice(1).map(r=>r.join(',').trim());const dup=keys.length-new Set(keys).size;
      return `Rows: <b>${rows.length-1}</b> · Columns: <b>${w}</b>\nEmpty cells: <b>${empty}</b>\nDuplicate records: <b>${dup}</b>\nRows with a different width: <b>${bad.length?bad.join(', '):'none'}</b>`},
    schedule(b){const topics=$('textarea',b).value.split(/\n/).map(s=>s.trim()).filter(Boolean);const start=new Date($('[name=start]',b).value);const every=parseInt($('[name=every]',b).value)||7;
      if(!topics.length||isNaN(start))return 'Add at least one topic and a start date.';
      return '<table><tr><th>#</th><th>Date</th><th>Topic</th></tr>'+topics.map((t,i)=>{const d=new Date(start);d.setDate(d.getDate()+i*every);return `<tr><td>${i+1}</td><td>${d.toDateString().slice(4)}</td><td>${esc(t)}</td></tr>`}).join('')+'</table>`},
    lyrics(b){const lines=$('textarea',b).value.split(/\n/);const secs=[];let cur=null;
      lines.forEach(l=>{const m=l.trim().match(/^\[(.+?)\]$/);if(m){cur={tag:m[1],lines:[]};secs.push(cur)}else if(l.trim()){if(!cur){cur={tag:'(untagged)',lines:[]};secs.push(cur)}cur.lines.push(l.trim())}});
      if(!secs.length)return 'Paste lyrics with section tags like [Verse 1] or [Chorus].';
      const bodies=secs.map(s=>s.lines.join('|'));const rep=secs.filter((s,i)=>bodies.indexOf(bodies[i])!==i).map(s=>s.tag);
      return secs.map(s=>`${esc(s.tag)}: ${s.lines.length} line(s)`).join('\n')+`\n\nRepeated sections: <b>${rep.length?esc(rep.join(', ')):'none'}</b>`},
  };
  $$('[data-tool]').forEach(b=>{const o=$('.tool-out',b);const run=()=>out(o,tools[b.dataset.tool](b));
    $('button.run',b).addEventListener('click',run)});
})();

(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))t(e);new MutationObserver(e=>{for(const o of e)if(o.type==="childList")for(const l of o.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&t(l)}).observe(document,{childList:!0,subtree:!0});function r(e){const o={};return e.integrity&&(o.integrity=e.integrity),e.referrerPolicy&&(o.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?o.credentials="include":e.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function t(e){if(e.ep)return;e.ep=!0;const o=r(e);fetch(e.href,o)}})();function g(c){const n=["#F5B041","#E6A32E","#D4941F","#F0C050"],r=["#A0522D","#8B4513","#7B3F00"],t=["#4CAF50","#66BB6A","#43A047"],e=["#E53935","#EF5350","#D32F2F"],o=n[Math.floor(Math.random()*n.length)],l=r[Math.floor(Math.random()*r.length)],i=t[Math.floor(Math.random()*t.length)],s=e[Math.floor(Math.random()*e.length)];return`<svg width="${c}" height="${c}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 22C4 22 6 10 16 10C26 10 28 22 28 22" stroke="${o}" stroke-width="3" stroke-linecap="round" fill="${o}" fill-opacity="0.3"/>
    <path d="M6 20C8 16 12 13 16 13C20 13 24 16 26 20" fill="${l}" opacity="0.9"/>
    <path d="M7 18C7 18 10 15 16 15C22 15 25 18 25 18" fill="${i}" opacity="0.85"/>
    <circle cx="11" cy="17" r="1.5" fill="${s}"/>
    <circle cx="17" cy="16" r="1.2" fill="${s}"/>
    <circle cx="22" cy="17.5" r="1.3" fill="${s}"/>
    <path d="M5 21C5 21 7 11 16 11C25 11 27 21 27 21" stroke="${o}" stroke-width="2.5" stroke-linecap="round" fill="none"/>
  </svg>`}const y=`<svg width="22" height="22" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M4 22C4 22 6 10 16 10C26 10 28 22 28 22" stroke="#F5B041" stroke-width="2.5" stroke-linecap="round" fill="#F5B041" fill-opacity="0.2"/>
  <path d="M6 20C8 16 12 13 16 13C20 13 24 16 26 20" fill="#A0522D" opacity="0.8"/>
  <path d="M7 18C7 18 10 15 16 15C22 15 25 18 25 18" fill="#4CAF50" opacity="0.8"/>
  <circle cx="11" cy="17" r="1.5" fill="#E53935"/>
  <circle cx="17" cy="16" r="1.2" fill="#E53935"/>
  <circle cx="22" cy="17.5" r="1.3" fill="#E53935"/>
  <path d="M5 21C5 21 7 11 16 11C25 11 27 21 27 21" stroke="#F5B041" stroke-width="2" stroke-linecap="round" fill="none"/>
</svg>`,M=document.getElementById("confetti-layer");let a=[],d=!1;function C(c,n){const r=25+Math.floor(Math.random()*15);for(let t=0;t<r;t++){const e=18+Math.floor(Math.random()*18),o=document.createElement("div");o.className="taco-particle",o.innerHTML=g(e);const l=-Math.PI/2+(Math.random()-.5)*Math.PI*1.4,i=6+Math.random()*10,s={el:o,x:c-e/2,y:n-e/2,vx:Math.cos(l)*i,vy:Math.sin(l)*i,rotation:Math.random()*360,rotationSpeed:(Math.random()-.5)*12,scale:.5+Math.random()*.6,life:0,maxLife:80+Math.floor(Math.random()*50)};M.appendChild(o),a.push(s)}d||(d=!0,requestAnimationFrame(u))}function u(){for(let r=a.length-1;r>=0;r--){const t=a[r];if(t.life++,t.life>=t.maxLife){t.el.remove(),a.splice(r,1);continue}t.vy+=.18,t.vx*=.985,t.vy*=.985,t.x+=t.vx,t.y+=t.vy,t.rotation+=t.rotationSpeed;const e=t.life/t.maxLife,o=e>.75?1-(e-.75)/.25:1;t.el.style.transform=`translate(${t.x}px, ${t.y}px) rotate(${t.rotation}deg) scale(${t.scale})`,t.el.style.opacity=String(o)}a.length>0?requestAnimationFrame(u):d=!1}let f=0;const m=document.getElementById("app");m.innerHTML=`
  <h1 class="title">Hello, World</h1>
  <p class="subtitle">Press the button. Receive tacos.</p>
  <button class="hello-btn" aria-label="Press for taco confetti">
    ${y}
    <span>Press Me</span>
  </button>
  <p class="press-count" id="press-count">0 tacos launched</p>
`;const h=m.querySelector(".hello-btn"),p=document.getElementById("press-count");h.addEventListener("click",c=>{const n=h.getBoundingClientRect(),r=n.left+n.width/2,t=n.top+n.height/2;C(r,t),f++;const e=f*32;p.textContent=`${e.toLocaleString()} tacos launched`,p.classList.add("visible")});

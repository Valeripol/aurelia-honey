gsap.registerPlugin(ScrollTrigger);
const mobileQuery = window.matchMedia('(max-width:760px)');
const mobile = mobileQuery.matches;
mobileQuery.addEventListener('change', () => window.location.reload());
const STEP = 1; // Preserve every available scroll frame on both screen sizes.
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const lenis = new Lenis();
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
/* кадры на canvas */
const cv = document.getElementById('canvas'), ctx = cv.getContext('2d');
const frames = [];
for (let n = 1; n <= TOTAL; n += STEP) {
  const im = new Image(); im.src = `${mobile ? 'mobile-frames/m_' : 'frames/f_'}${String(n).padStart(3,'0')}.webp`; frames.push(im);
}
const last = frames.length - 1; let cur = -1;
function draw(i, force) {
  const im = frames[i];
  if (!im || !im.naturalWidth || (i === cur && !force)) return;
  cur = i;
  const W = cv.width, H = cv.height;
  ctx.clearRect(0, 0, W, H);
  if (mobile) {
    // Fill the screen softly, then draw ALL of the portrait video without cropping.
    const cover = Math.max(W / im.naturalWidth, H / im.naturalHeight);
    const bw = im.naturalWidth * cover, bh = im.naturalHeight * cover;
    ctx.save();
    ctx.filter = 'blur(22px) brightness(.85)';
    ctx.drawImage(im, (W - bw) / 2, (H - bh) / 2, bw, bh);
    ctx.restore();
    const fit = Math.min(W / im.naturalWidth, H / im.naturalHeight);
    const fw = im.naturalWidth * fit, fh = im.naturalHeight * fit;
    ctx.drawImage(im, (W - fw) / 2, (H - fh) / 2, fw, fh);
  } else {
    const scale = Math.max(W / im.naturalWidth, H / im.naturalHeight);
    const fw = im.naturalWidth * scale, fh = im.naturalHeight * scale;
    ctx.drawImage(im, (W - fw) / 2, (H - fh) / 2, fw, fh);
  }
}
function resize() {
  const d = Math.min(devicePixelRatio || 1, 2);
  cv.width = cv.clientWidth * d; cv.height = cv.clientHeight * d; draw(Math.max(cur, 0), true);
}
let entryPlayed = false;
function launchEntrance(){
 if (entryPlayed) return;
 entryPlayed = true;
 resize();
 const loader = document.getElementById('loader');
 if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
   loader.classList.add('hide'); return;
 }
 gsap.timeline({defaults:{ease:'power2.out'}})
   .to('.loader-logo',{scale:1.03,opacity:1,duration:.45},0)
   .to(loader,{autoAlpha:0,duration:.8,ease:'power2.inOut'},.45)
   .fromTo('.nav',{autoAlpha:0,y:-15},{autoAlpha:1,y:0,duration:.65},.77)
   .fromTo('.c1',{y:28,opacity:0},{y:0,opacity:1,duration:.8,onComplete:()=>gsap.set('.c1',{clearProps:'opacity,transform'})},.88)
   .set(loader,{display:'none'});
}
frames[0].onload = launchEntrance;
if(frames[0].complete && frames[0].naturalWidth) launchEntrance();
frames[0].onerror = () => {
  console.warn('AURELIA: frame not found', frames[0].src);
  launchEntrance();
};
setTimeout(() => {
  if (!entryPlayed) launchEntrance();
  const loader = document.getElementById('loader');
  if (loader && getComputedStyle(loader).display !== 'none') {
    gsap.to(loader, { autoAlpha: 0, duration: .45, onComplete: () => { loader.style.display='none'; } });
  }
}, 3500);
addEventListener('resize', resize);
/* тексты и кадры по прокрутке */
const copies = gsap.utils.toArray('.copy');
ScrollTrigger.create({
  trigger: '#hero', start: 'top top', end: 'bottom bottom', scrub: true,
  onUpdate: s => {
    draw(Math.round(s.progress * last));
    const k = s.progress < .3 ? 0 : s.progress < .62 ? 1 : 2;
    copies.forEach((c, j) => c.classList.toggle('on', j === k));
  }
});
/* пчела летит по пунктирной тропе между банками */
const path = document.getElementById('trail'), bee = document.getElementById('bee');
if (path && !mobile) {
  const L = path.getTotalLength(), box = document.querySelector('.trail');
  ScrollTrigger.create({
    trigger: '.cards', start: 'top 85%', end: 'bottom 35%', scrub: .6,
    onUpdate: s => {
      const p = path.getPointAtLength(s.progress * L), r = box.getBoundingClientRect();
      bee.style.left = (p.x / 1000 * r.width) + 'px';
      bee.style.top = (box.offsetTop + p.y / 500 * r.height) + 'px';
    }
  });
}
/* мягкое появление */
gsap.utils.toArray('.reveal').forEach(el => gsap.from(el, {
  y: 40, opacity: 0, duration: 1, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 88%' }
}));


/* Staggered, scroll-controlled entrance of the three honey jars. */
const products = gsap.utils.toArray('.flavors .card');
if (products.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  gsap.set(products, {autoAlpha:0, y:160, scale:.78, rotation:(i)=>[-9,0,9][i], filter:'blur(9px)', transformOrigin:'50% 90%'});
  gsap.timeline({scrollTrigger:{trigger:'.flavors',start:'top 72%',end:'top 4%',scrub:1.1,invalidateOnRefresh:true}})
    .to(products,{autoAlpha:1,y:0,scale:1,rotation:0,filter:'blur(0px)',duration:1.7,stagger:{each:.38},ease:'power2.out'},0);
} else {
  gsap.set(products,{clearProps:'all'});
}
/* Cinematic swarm in footer. SVGs intentionally created locally (no image requests). */
const swarm = document.querySelector('.footer-bees');
if (swarm && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const beeArt = `<svg viewBox="0 0 72 56" xmlns="http://www.w3.org/2000/svg"><ellipse class="wing" cx="28" cy="19" rx="16" ry="10" transform="rotate(-22 28 19)" fill="#f5f4dc" opacity=".82"/><ellipse class="wing" cx="44" cy="17" rx="16" ry="10" transform="rotate(22 44 17)" fill="#f5f4dc" opacity=".82"/><ellipse cx="32" cy="34" rx="23" ry="14" fill="#e6a52d"/><path d="M21 22 Q16 34 21 46 M34 20 Q29 34 34 48 M45 23 Q41 34 46 44" fill="none" stroke="#39251b" stroke-width="6"/><circle cx="54" cy="33" r="10" fill="#e7ac38"/><circle cx="57" cy="30" r="2.1" fill="#24180f"/><path d="M60 25 Q62 18 68 17" stroke="#3e2a19" stroke-width="2" fill="none"/></svg>`;
  for(let i=0;i<11;i++){
    const b=document.createElement('span');b.className='footer-bee';b.innerHTML=beeArt;
    const direction=i%3===0?-1:1;
    b.style.setProperty('--size',`${18+(i*13)%31}px`);
    b.style.setProperty('--top',`${9+(i*37)%82}%`);
    b.style.setProperty('--duration',`${10+(i*7)%13}s`);
    b.style.setProperty('--delay',`${-(i*3.7)%22}s`);
    b.style.setProperty('--from', direction===1?'-85px':'calc(100vw + 85px)');
    b.style.setProperty('--to',direction===1?'calc(100vw + 85px)':'-85px');
    b.style.setProperty('--rise',`${-90+(i*37)%160}px`);
    b.style.setProperty('--rotate',direction===1?'-5deg':'175deg');
    swarm.appendChild(b);
  }
}

/* Mobile burger menu — independent of the existing scroll and product animations. */
const menuButton=document.querySelector('.menu-toggle');
const mobileNav=document.getElementById('mobile-nav');
if(menuButton && mobileNav){
 const closeMenu=()=>{menuButton.classList.remove('active');menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Open navigation');mobileNav.classList.remove('open');};
 menuButton.addEventListener('click',()=>{const opened=menuButton.getAttribute('aria-expanded')!=='true';menuButton.classList.toggle('active',opened);mobileNav.classList.toggle('open',opened);menuButton.setAttribute('aria-expanded',String(opened));menuButton.setAttribute('aria-label',opened?'Close navigation':'Open navigation');});
 mobileNav.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
 window.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
 window.addEventListener('resize',()=>{if(window.innerWidth>760)closeMenu();});
}

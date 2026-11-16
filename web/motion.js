// Scroll reveals share easing and small, predictable stagger intervals.
(()=>{
const root=document.documentElement,reduced=matchMedia('(prefers-reduced-motion: reduce)');
let paused=false;try{paused=localStorage.getItem('m4h-motion')==='paused'}catch{}
const toggle=document.createElement('button');toggle.className='motion-toggle';toggle.type='button';document.querySelector('.copyright').append(toggle);
function update(){root.toggleAttribute('data-motion-paused',paused||reduced.matches);toggle.textContent=reduced.matches?'Motion reduced':paused?'Resume motion':'Pause motion';toggle.disabled=reduced.matches;toggle.setAttribute('aria-pressed',String(paused||reduced.matches));if(paused||reduced.matches)document.getAnimations().forEach(a=>{if(a.effect?.getTiming().iterations!==Infinity){try{a.finish()}catch{}}})}
toggle.addEventListener('click',()=>{paused=!paused;try{localStorage.setItem('m4h-motion',paused?'paused':'playing')}catch{}update()});reduced.addEventListener('change',update);update();
const io='IntersectionObserver' in window?new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('is-visible');io.unobserve(entry.target)}},{threshold:.06,rootMargin:'0px 0px 18px 0px'}):null;
function reveal(scope){const items=scope.querySelectorAll('.hero-copy>* ,.hero-image,.ribbon-item,.section-head,.intro>div,.card,.gallery-tile,.volunteer-band .wrap>*,.article>*,.panel,.filter-tabs,.admin-tabs,.page-top .wrap>*,.footer-grid>*,.footer-signup>*,.newsletter-empty,.values .tag');items.forEach((el,i)=>{if(el.classList.contains('reveal'))return;el.style.setProperty('--stagger',Math.min(i%4*65,195)+'ms');el.classList.add('reveal');if(io&&!paused&&!reduced.matches)io.observe(el);else el.classList.add('is-visible')})}
root.classList.add('motion-ready');reveal(document);
new MutationObserver(()=>{reveal(document.querySelector('main'));if(!paused&&!reduced.matches)document.querySelector('main').animate([{opacity:.65},{opacity:1}],{duration:380,easing:'ease-out'})}).observe(document.querySelector('main'),{childList:true});
let scheduled=false;const scroll=()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{document.body.classList.toggle('scrolled',scrollY>16);scheduled=false})};addEventListener('scroll',scroll,{passive:true});scroll();
})();

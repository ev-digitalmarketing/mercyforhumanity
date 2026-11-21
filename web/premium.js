(()=>{
const root=document.documentElement,main=document.querySelector('main'),reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover: hover) and (pointer: fine)');
let active=null,magnetic=null,frame=0,pointer;
const enabled=()=>fine.matches&&!reduced.matches&&!root.hasAttribute('data-motion-paused')&&!document.hidden;
function resetTilt(){if(active){active.classList.remove('premium-active');for(const key of ['--tilt-x','--tilt-y','--light-x','--light-y'])active.style.removeProperty(key);active=null}}
function resetMagnet(){if(magnetic){magnetic.style.removeProperty('--magnetic-x');magnetic.style.removeProperty('--magnetic-y');magnetic=null}}
function reset(){resetTilt();resetMagnet();if(frame)cancelAnimationFrame(frame);frame=0}
const ambientObserver='IntersectionObserver'in window?new IntersectionObserver(entries=>{for(const entry of entries)entry.target.classList.toggle('premium-offscreen',!entry.isIntersecting)},{rootMargin:'60px'}):null;
function mount(){
 reset();ambientObserver?.disconnect();
 document.querySelectorAll('.hero,.page-top,.volunteer-band,.newsletter-highlights,.footer').forEach(section=>{
  section.classList.add('premium-ambient');
  if(!section.querySelector('.premium-scene')){const scene=document.createElement('div');scene.className='premium-scene';scene.setAttribute('aria-hidden','true');scene.innerHTML='<i class="premium-object premium-sphere"></i><i class="premium-object premium-ring"></i><i class="premium-object premium-pearl"></i>';section.prepend(scene)}
  ambientObserver?.observe(section);
 });
 main.querySelectorAll('.card,.gallery-tile,.feature-photo').forEach(card=>card.classList.add('premium-tilt'));
 document.querySelectorAll('.hero-copy .btn,.volunteer-band .btn,.header>.btn,.signup-fields .btn').forEach(button=>button.classList.add('premium-magnetic'));
}
document.addEventListener('pointermove',event=>{
 if(!enabled())return;
 pointer={target:event.target,x:event.clientX,y:event.clientY};if(frame)return;
 frame=requestAnimationFrame(()=>{frame=0;if(!enabled())return;const {target,x,y}=pointer;
  const card=target.closest('.premium-tilt');if(card!==active)resetTilt();
  if(card&&card.isConnected){active=card;const bounds=card.getBoundingClientRect(),px=Math.max(0,Math.min(1,(x-bounds.left)/bounds.width)),py=Math.max(0,Math.min(1,(y-bounds.top)/bounds.height));card.style.setProperty('--tilt-x',((.5-py)*6).toFixed(2)+'deg');card.style.setProperty('--tilt-y',((px-.5)*7).toFixed(2)+'deg');card.style.setProperty('--light-x',(px*100)+'%');card.style.setProperty('--light-y',(py*100)+'%');card.classList.add('premium-active')}
  const button=target.closest('.premium-magnetic');if(button!==magnetic)resetMagnet();if(button&&button.isConnected&&!button.disabled){magnetic=button;const bounds=button.getBoundingClientRect();button.style.setProperty('--magnetic-x',Math.max(-3,Math.min(3,(x-bounds.left-bounds.width/2)*.06))+'px');button.style.setProperty('--magnetic-y',Math.max(-2,Math.min(2,(y-bounds.top-bounds.height/2)*.08))+'px')}
 });
},{passive:true});
document.addEventListener('pointerout',event=>{if(active&&!active.contains(event.relatedTarget))resetTilt();if(magnetic&&!magnetic.contains(event.relatedTarget))resetMagnet()},{passive:true});
document.addEventListener('visibilitychange',()=>{root.classList.toggle('premium-hidden',document.hidden);if(document.hidden)reset()});
reduced.addEventListener('change',reset);fine.addEventListener('change',reset);new MutationObserver(()=>{if(!enabled())reset()}).observe(root,{attributes:true,attributeFilter:['data-motion-paused']});
mount();new MutationObserver(mount).observe(main,{childList:true});
})();

(()=>{
const main=document.querySelector('main');let dispose=()=>{},mounted;
function mount(){
 const carousel=document.querySelector('[data-hero-carousel]');if(carousel===mounted)return;
 dispose();dispose=()=>{};mounted=carousel;if(!carousel)return;
 const slides=[...carousel.querySelectorAll('.hero-slide')],dots=[...carousel.querySelectorAll('[data-hero-slide]')],pause=carousel.querySelector('[data-hero-pause]'),counter=carousel.querySelector('[data-hero-counter]');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let current=0,timer,paused=false,hovered=false,focused=false,inView=true;
 const globallyPaused=()=>reduced.matches||document.documentElement.hasAttribute('data-motion-paused');
 function schedule(){
  clearInterval(timer);timer=undefined;
  pause.disabled=globallyPaused();pause.textContent=paused||globallyPaused()?'▶':'Ⅱ';pause.setAttribute('aria-label',paused||globallyPaused()?'Play slideshow':'Pause slideshow');pause.setAttribute('aria-pressed',String(paused||globallyPaused()));
  pause.title=globallyPaused()?'Automatic playback is off while motion is reduced':paused?'Play slideshow':'Pause slideshow';
  if(!paused&&!globallyPaused()&&!hovered&&!focused&&!document.hidden&&inView&&slides.length>1)timer=setInterval(()=>show(current+1),6000);
 }
 function show(index){
  current=((index%slides.length)+slides.length)%slides.length;
  slides.forEach((slide,i)=>{slide.classList.toggle('is-active',i===current);slide.setAttribute('aria-hidden',String(i!==current))});
  dots.forEach((dot,i)=>dot.setAttribute('aria-pressed',String(i===current)));counter.textContent=(current+1)+' / '+slides.length;
 }
 carousel.addEventListener('click',event=>{const button=event.target.closest('button');if(!button)return;if(button.hasAttribute('data-hero-pause')){paused=!paused;schedule();return}if(button.dataset.heroStep)show(current+Number(button.dataset.heroStep));if(button.dataset.heroSlide!==undefined)show(Number(button.dataset.heroSlide));schedule()});
 carousel.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();show(current+(event.key==='ArrowRight'?1:-1));schedule()}});
 carousel.addEventListener('mouseenter',()=>{hovered=true;schedule()});carousel.addEventListener('mouseleave',()=>{hovered=false;schedule()});
 carousel.addEventListener('focusin',()=>{focused=true;schedule()});carousel.addEventListener('focusout',event=>{focused=carousel.contains(event.relatedTarget);schedule()});
 const motionObserver=new MutationObserver(schedule);motionObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-motion-paused']});
 const visibility=()=>schedule();document.addEventListener('visibilitychange',visibility);reduced.addEventListener('change',schedule);
 let viewportObserver;if('IntersectionObserver' in window){viewportObserver=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;schedule()},{threshold:.05});viewportObserver.observe(carousel)}
 show(0);schedule();dispose=()=>{clearInterval(timer);motionObserver.disconnect();viewportObserver?.disconnect();document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',schedule)};
}
mount();new MutationObserver(mount).observe(main,{childList:true});
})();

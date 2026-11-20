(()=>{
let mounted,dispose=()=>{};const main=document.querySelector('main');
function mount(){const slider=document.querySelector('[data-run-slider]');if(slider===mounted)return;dispose();dispose=()=>{};mounted=slider;if(!slider)return;
 const track=slider.querySelector('[data-run-track]'),cards=[...track.children],pause=slider.querySelector('[data-run-pause]'),count=slider.querySelector('[data-run-count]'),reduced=matchMedia('(prefers-reduced-motion: reduce)');let timer,paused=false,hover=false,focus=false,inView=true;
 const stopped=()=>reduced.matches||document.documentElement.hasAttribute('data-motion-paused');
 const step=()=>cards.length>1?cards[1].offsetLeft-cards[0].offsetLeft:285;
 function update(){const index=Math.min(cards.length-1,Math.max(0,Math.round(track.scrollLeft/step())));count.textContent=(index+1)+' / '+cards.length}
 function move(direction){const end=track.scrollWidth-track.clientWidth,next=track.scrollLeft+direction*step();track.scrollTo({left:direction>0&&track.scrollLeft>=end-3?0:direction<0&&track.scrollLeft<=3?end:Math.max(0,Math.min(end,next)),behavior:stopped()?'instant':'smooth'})}
 function schedule(){clearInterval(timer);pause.disabled=stopped();pause.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(paused||stopped()?'<path d="m9 5 10 7-10 7Z"/>':'<path d="M8 5v14M16 5v14"/>')+'</svg>';pause.setAttribute('aria-label',paused||stopped()?'Play run slider':'Pause run slider');pause.setAttribute('aria-pressed',String(paused||stopped()));if(!paused&&!stopped()&&!hover&&!focus&&inView&&!document.hidden&&track.scrollWidth>track.clientWidth+3)timer=setInterval(()=>move(1),5000)}
 slider.querySelector('[data-run-next]').onclick=()=>{move(1);schedule()};slider.querySelector('[data-run-prev]').onclick=()=>{move(-1);schedule()};pause.onclick=()=>{paused=!paused;schedule()};
 track.addEventListener('scroll',update,{passive:true});track.addEventListener('keydown',event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();move(event.key==='ArrowRight'?1:-1);schedule()}});
 slider.addEventListener('mouseenter',()=>{hover=true;schedule()});slider.addEventListener('mouseleave',()=>{hover=false;schedule()});slider.addEventListener('focusin',()=>{focus=true;schedule()});slider.addEventListener('focusout',event=>{focus=slider.contains(event.relatedTarget);schedule()});track.addEventListener('touchstart',()=>{hover=true;schedule()},{passive:true});track.addEventListener('touchend',()=>{hover=false;schedule()},{passive:true});track.addEventListener('touchcancel',()=>{hover=false;schedule()},{passive:true});
 const settings=new MutationObserver(schedule);settings.observe(document.documentElement,{attributes:true,attributeFilter:['data-motion-paused']});let viewport;
 if('IntersectionObserver'in window){viewport=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;schedule()},{threshold:.05});viewport.observe(slider)}
 const resize=()=>{update();schedule()};window.addEventListener('resize',resize,{passive:true});document.addEventListener('visibilitychange',schedule);reduced.addEventListener('change',schedule);update();schedule();
 dispose=()=>{clearInterval(timer);settings.disconnect();viewport?.disconnect();window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',schedule);reduced.removeEventListener('change',schedule)};
}
mount();new MutationObserver(mount).observe(main,{childList:true});
})();

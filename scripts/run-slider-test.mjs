import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const timers=new Map(),observers=[],events={},docEvents={},media={matches:false,addEventListener(){},removeEventListener(){}};let id=0,globalPause=false;
const control=()=>({disabled:false,setAttribute(){}}),next=control(),prev=control(),pause=control(),counter={},trackEvents={};
const track={children:Array.from({length:7},(_,i)=>({offsetLeft:i*305})),scrollLeft:0,scrollWidth:2115,clientWidth:900,addEventListener(k,f){trackEvents[k]=f},scrollTo({left}){this.scrollLeft=left;trackEvents.scroll()}};
let slider={querySelector:s=>({'[data-run-track]':track,'[data-run-next]':next,'[data-run-prev]':prev,'[data-run-pause]':pause,'[data-run-count]':counter}[s]),addEventListener(k,f){events[k]=f},contains:()=>false};
const document={hidden:false,documentElement:{hasAttribute:()=>globalPause},querySelector:s=>s==='main'?{}:slider,addEventListener(k,f){docEvents[k]=f},removeEventListener(k){delete docEvents[k]}};
class Observer{constructor(fn){this.fn=fn;observers.push(this)}observe(){}disconnect(){}}
const context={document,window:{addEventListener(){},removeEventListener(){}},MutationObserver:Observer,matchMedia:()=>media,setInterval(fn,ms){assert.equal(ms,5000);timers.set(++id,fn);return id},clearInterval(n){timers.delete(n)}};
vm.createContext(context);vm.runInContext(fs.readFileSync('web/run-slider.js','utf8'),context);
assert.equal(timers.size,1);next.onclick();assert.equal(track.scrollLeft,305);prev.onclick();assert.equal(track.scrollLeft,0);prev.onclick();assert.equal(track.scrollLeft,1215);next.onclick();assert.equal(track.scrollLeft,0);
[...timers.values()][0]();assert.equal(track.scrollLeft,305);assert.equal(counter.textContent,'2 / 7');
pause.onclick();assert.equal(timers.size,0);pause.onclick();assert.equal(timers.size,1);events.mouseenter();assert.equal(timers.size,0);events.mouseleave();assert.equal(timers.size,1);
globalPause=true;observers[0].fn();assert.equal(timers.size,0);next.onclick();assert.equal(track.scrollLeft,610);
slider=null;observers.at(-1).fn();assert.equal(timers.size,0);
console.log('Passed regional slider navigation, wrapping, autoplay, pause/hover/global-motion handling, and navigation cleanup.');

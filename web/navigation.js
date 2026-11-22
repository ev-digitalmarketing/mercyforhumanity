const projectLinks=[['Model Village','/model-village'],['Water for Life','/water-for-life']];
function renderNavigation(path){return navs.map(([name,url])=>url?`<a href="${url}" data-link class="${path===url?'active':''}" ${path===url?'aria-current="page"':''}>${name}</a>`:`<div class="nav-projects"><button type="button" id="projects-toggle" class="${projectLinks.some(([,link])=>link===path)?'active':''}" aria-expanded="false" aria-controls="projects-menu">Humanitarian Projects <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m5 8 5 5 5-5"/></svg></button><div id="projects-menu" class="projects-menu" hidden>${projectLinks.map(([label,link])=>`<a href="${link}" data-link ${path===link?'aria-current="page"':''}>${label}</a>`).join('')}</div></div>`).join('')}
function closeProjects(){const toggle=document.querySelector('#projects-toggle'),menu=document.querySelector('#projects-menu');if(toggle)toggle.setAttribute('aria-expanded','false');if(menu)menu.hidden=true}
function bindNavigation(){
 const toggle=document.querySelector('#projects-toggle'),menu=document.querySelector('#projects-menu');if(!toggle||!menu)return;
 const group=toggle.closest('.nav-projects');
 const open=()=>{toggle.setAttribute('aria-expanded','true');menu.hidden=false};
 group.onpointerenter=event=>{if(event.pointerType==='mouse')open()};
 group.onpointerleave=event=>{if(event.pointerType==='mouse'&&!group.contains(document.activeElement))closeProjects()};
 group.onfocusout=event=>{if(!group.contains(event.relatedTarget))closeProjects()};
 toggle.onclick=(event={detail:0})=>{if(event.detail>0&&matchMedia('(hover: hover) and (pointer: fine)').matches){open();return}if(toggle.getAttribute('aria-expanded')==='true')closeProjects();else open()};
 toggle.onkeydown=event=>{if(event.key==='ArrowDown'){event.preventDefault();open();menu.querySelector('a')?.focus()}};
}
document.addEventListener('click',event=>{if(!event.target.closest('.nav-projects'))closeProjects()});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){const toggle=document.querySelector('#projects-toggle');if(toggle?.getAttribute('aria-expanded')==='true'){closeProjects();toggle.focus()}}});

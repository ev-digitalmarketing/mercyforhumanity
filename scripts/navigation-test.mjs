import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const html=fs.readFileSync('web/index.html','utf8'),nav=html.split('\n').find(line=>line.startsWith('const navs=')),events={};let expanded='false',focused=false;
const menu={hidden:true},toggle={setAttribute(k,v){expanded=v},getAttribute(){return expanded},focus(){focused=true}};
const document={querySelector:s=>s==='#projects-toggle'?toggle:menu,addEventListener(k,f){events[k]=f}};
const context={document};vm.createContext(context);vm.runInContext(nav+'\n'+fs.readFileSync('web/navigation.js','utf8'),context);
const output=vm.runInContext("renderNavigation('/model-village')",context);
let previous=-1;for(const label of ['>About<','>Charity Runs<','Humanitarian Projects','>Our Impact<','>Volunteer<','>Newsletters<','>Gallery<','>Contact<']){const position=output.indexOf(label);assert(position>previous,label);previous=position}
assert.match(output,/href="\/model-village"/);assert.match(output,/href="\/water-for-life"/);assert.doesNotMatch(output,/href="\/humanitarian-projects"|>Home</);
vm.runInContext('bindNavigation()',context);toggle.onclick();assert.equal(expanded,'true');assert.equal(menu.hidden,false);events.keydown({key:'Escape'});assert.equal(expanded,'false');assert.equal(menu.hidden,true);assert.equal(focused,true);
toggle.onclick();events.click({target:{closest:()=>null}});assert.equal(menu.hidden,true);
const compiled=fs.readFileSync('outputs/hostinger-package/app/site.html','utf8');assert.match(compiled,/\/logo\.png/);assert.doesNotMatch(compiled,/\/logo\.jpg/);
console.log('Passed navigation order, dropdown-only parent, project links, keyboard/outside dismissal, and updated PNG logo references.');

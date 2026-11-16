import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
await import('./build-hostinger.mjs');
const html=fs.readFileSync('outputs/hostinger-package/app/site.html','utf8');
for(const script of html.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(script[1]);
assert.doesNotMatch(html,/signin-with-chatgpt|signout-with-chatgpt|Continue with ChatGPT|me=\{signedIn:true/);
assert.match(html,/api\/setup/);assert.match(html,/X-CSRF-Token/);assert.match(html,/data-inbox-page/);
assert.match(html,/name="contact"/);assert.match(html,/name="location"/);assert.match(html,/name="subject"/);
const context={location:{origin:'https://mercy.test'},URL,Headers,me:{},window:{},Promise};let calls=[];
context.window.fetch=async(url,options)=>{calls.push({url,options});return new Response(JSON.stringify({csrf:'session-token',installed:true,signedIn:false}))};
vm.createContext(context);vm.runInContext(fs.readFileSync('web/hostinger.js','utf8'),context);
await vm.runInContext("siteFetch('/api/subscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})",context);
assert.equal(calls.length,2);assert.equal(calls[1].options.headers.get('X-CSRF-Token'),'session-token');assert.match(calls[1].url,/route=%2Fapi%2Fsubscribe/);
await vm.runInContext("siteFetch('/api/subscribers?page=2')",context);assert.match(calls.at(-1).url,/page=2/);
const nodes={},posted=[],navigated=[];
const fakeForm=(values,dataset={})=>({values,dataset,status:{textContent:''},button:{disabled:false},querySelector(s){return s==='button'?this.button:this.status},reset(){this.resetDone=true}});
context.$=s=>nodes[s]||null;context.location.protocol='https:';context.navigate=p=>navigated.push(p);context.render=()=>{};context.FormData=class extends Map{constructor(form){super(Object.entries(form.values))}};
context.siteFetch=async(path,options={})=>{posted.push({path,options});return {ok:true,json:async()=>path==='/api/me'?{signedIn:true,email:'owner@example.com',csrf:'next-token'}:{ok:true,message:'Submission received.'}}};
nodes['#auth-form']=fakeForm({email:'owner@example.com',password:'A test passphrase',confirm:'A test passphrase',key:'test-key'},{setup:'true'});
vm.runInContext('bindHostingerForms()',context);await nodes['#auth-form'].onsubmit({preventDefault(){}});assert.equal(posted[0].path,'/api/setup');assert.equal(navigated[0],'/admin');
delete nodes['#auth-form'];nodes['#volunteer-form']=fakeForm({name:'Test',contact:'519-555-0123',location:'Windsor, Ontario',message:'Weekend availability'});nodes['#contact-form']=fakeForm({name:'Test',email:'test@example.com',subject:'Community run',message:'How can I help?'});
vm.runInContext('bindHostingerForms()',context);await nodes['#volunteer-form'].onsubmit({preventDefault(){}});await nodes['#contact-form'].onsubmit({preventDefault(){}});
assert.ok(posted.find(x=>x.path==='/api/volunteer'));assert.ok(posted.find(x=>x.path==='/api/contact'));assert.equal(nodes['#volunteer-form'].resetDone,true);assert.equal(nodes['#contact-form'].resetDone,true);
const config=fs.readFileSync('outputs/hostinger-package/config.php','utf8');assert.match(config,/'installation_key' => '[a-f0-9]{64}'/);assert.match(config,/dirname\(__DIR__\)/);
console.log('Passed Hostinger frontend syntax, PHP API routing, CSRF/session handoff, public form fields, inbox UI, and deployment structure checks.');
const php=spawnSync('php',['-v'],{encoding:'utf8'});
if(php.error?.code==='ENOENT'){console.log('NOT RUN: native PHP checks — this machine has no PHP executable. The PHP backend must be runtime-verified on the host.');}
else{
 for(const file of ['index.php','api.php','config.php','app/core.php']){const check=spawnSync('php',['-l','outputs/hostinger-package/'+file],{encoding:'utf8'});assert.equal(check.status,0,check.stdout+check.stderr)}
 const native=spawnSync('php',['scripts/test-hostinger.php'],{encoding:'utf8'});assert.equal(native.status,0,native.stdout+native.stderr);console.log(native.stdout.trim());
}

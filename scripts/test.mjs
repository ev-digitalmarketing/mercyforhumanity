import assert from 'node:assert/strict';
import worker from '../dist/server/index.js';
const objects=new Map();
const BUCKET={async put(k,v,opts){const bytes=typeof v==='string'?new TextEncoder().encode(v):new Uint8Array(await new Response(v).arrayBuffer());objects.set(k,{bytes,opts})},async get(k){const o=objects.get(k);return o?{body:o.bytes,httpMetadata:o.opts?.httpMetadata,json:async()=>JSON.parse(new TextDecoder().decode(o.bytes))}:null},async list({prefix}){return {objects:[...objects.keys()].filter(k=>k.startsWith(prefix)).map(key=>({key})),truncated:false}},async delete(k){objects.delete(k)}};
const origin='https://mercy.test';
const call=(p,options={})=>worker.fetch(new Request(origin+p,options),{BUCKET});
const headers={'oai-authenticated-user-id':'owner',origin};
assert.equal((await call('/')).status,200);
assert.equal((await call('/logo.jpg')).headers.get('content-type'),'image/jpeg');
assert.equal((await call('/api/gallery',{method:'POST'})).status,401);
assert.equal((await call('/api/gallery',{method:'POST',headers:{...headers,origin:'https://wrong.test'}})).status,403);
function form(news=false,type='image/png'){const d=new FormData();if(news)d.set('title','Test <story>');d.set('photo',new Blob(['image bytes'],{type}),'photo.png');if(news)d.set('body','A story\n\nWith paragraphs.');return d}
assert.equal((await call('/api/gallery',{method:'POST',headers,body:form(false,'text/html')})).status,400);
for(const path of ['gallery','newsletters']){
 const r=await call('/api/'+path,{method:'POST',headers,body:form(path==='newsletters')});assert.equal(r.status,201);const item=await r.json();assert.ok(item.id);
 assert.equal((await call(item.image)).status,200);
 const list=await(await call('/api/content')).json();assert.equal(list[path].length,1);
 assert.equal((await call('/api/'+path+'/'+item.id,{method:'DELETE',headers})).status,200);
 assert.equal((await call(item.image)).status,404);
 const after=(await(await call('/api/content')).json())[path];
 if(path==='newsletters'){assert.equal(after.length,1);assert.equal(after[0].example,true)}else assert.equal(after.length,0);
}
console.log('Passed: routes, logo, authentication, origin checks, upload validation, gallery/newsletter persistence, media retrieval, deletion.');

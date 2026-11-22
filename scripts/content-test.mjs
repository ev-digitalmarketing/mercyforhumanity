import assert from 'node:assert/strict';import fs from 'node:fs';import worker from '../dist/server/index.js';
const BUCKET={async list(){return {objects:[],truncated:false}}};
for(const name of ['community-run-start.jpg','community-run-awards.jpg','community-run-group.jpg','water-project.png']){
 const response=await worker.fetch(new Request('https://mercy.test/assets/'+name),{BUCKET});
 assert.equal(response.status,200);assert.equal(response.headers.get('content-type'),name.endsWith('.png')?'image/png':'image/jpeg');
 assert.deepEqual(Buffer.from(await response.arrayBuffer()),fs.readFileSync('web/images/'+name));
}
assert.equal((await worker.fetch(new Request('https://mercy.test/assets/missing.jpg'),{BUCKET})).status,404);
const data=await(await worker.fetch(new Request('https://mercy.test/api/content'),{BUCKET})).json();
assert.equal(data.newsletters.length,1);assert.equal(data.newsletters[0].example,true);assert.match(data.newsletters[0].body,/not a report of completed events/);
const html=fs.readFileSync('dist/preview.html','utf8');assert.doesNotMatch(html,/images\.unsplash\.com/);assert.doesNotMatch(html,/\/assets\/community-run-/);assert.match(html,/data:image\/jpeg;base64,/);
console.log('Passed: all three supplied photos served intact, unknown assets rejected, example newsletter available, and standalone preview images embedded.');

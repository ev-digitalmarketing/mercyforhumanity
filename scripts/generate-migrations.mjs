import fs from 'node:fs';
const sql=fs.readFileSync('db/schema.sql','utf8');
const tag='0000_newsletter_subscribers',path='drizzle/'+tag+'.sql';
if(fs.existsSync(path)){
 if(fs.readFileSync(path,'utf8')!==sql)throw Error('Existing migrations are immutable. Add a new numbered migration for schema changes.');
 console.log('Subscriber migration is current.');
}else{
 fs.mkdirSync('drizzle/meta',{recursive:true});
 fs.writeFileSync(path,sql);
 fs.writeFileSync('drizzle/meta/_journal.json',JSON.stringify({version:'7',dialect:'sqlite',entries:[{idx:0,version:'6',when:Date.now(),tag,breakpoints:true}]},null,2)+'\n');
 console.log('Generated '+path);
}

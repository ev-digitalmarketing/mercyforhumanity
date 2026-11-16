// Node-only D1 adapter for local previews and integration tests. Not deployed.
import {DatabaseSync} from 'node:sqlite';import fs from 'node:fs';
export function localD1(filename=':memory:'){
 const db=new DatabaseSync(filename);
 db.exec('CREATE TABLE IF NOT EXISTS local_migrations (tag TEXT PRIMARY KEY)');
 const journal=JSON.parse(fs.readFileSync(new URL('../drizzle/meta/_journal.json',import.meta.url),'utf8'));
 for(const {tag} of journal.entries){
  if(db.prepare('SELECT tag FROM local_migrations WHERE tag = ?').get(tag))continue;
  db.exec('BEGIN');
  try{db.exec(fs.readFileSync(new URL('../drizzle/'+tag+'.sql',import.meta.url),'utf8'));db.prepare('INSERT INTO local_migrations (tag) VALUES (?)').run(tag);db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}
 }
 return {prepare(sql){let args=[];return {bind(...values){args=values;return this},async first(){return db.prepare(sql).get(...args)||null},async all(){return {results:db.prepare(sql).all(...args)}},async run(){const result=db.prepare(sql).run(...args);return {success:true,meta:{changes:Number(result.changes)}}}}},close(){db.close()}};
}

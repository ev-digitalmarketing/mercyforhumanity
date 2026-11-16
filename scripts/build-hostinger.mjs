import fs from 'node:fs';import crypto from 'node:crypto';import path from 'node:path';
await import('./build.mjs');
const directory='outputs/hostinger-package';
fs.mkdirSync('.local-data',{recursive:true});
const keyPath='.local-data/hostinger-installation-key';
const key=fs.existsSync(keyPath)?fs.readFileSync(keyPath,'utf8').trim():crypto.randomBytes(32).toString('hex');
if(!/^[a-f0-9]{64}$/.test(key))throw Error('Invalid cached installation key.');
fs.writeFileSync(keyPath,key,{mode:0o600});
fs.rmSync(directory,{recursive:true,force:true});fs.mkdirSync(directory+'/app',{recursive:true});
for(const file of ['index.php','api.php','.htaccess','.user.ini'])fs.copyFileSync('hostinger/'+file,directory+'/'+file);
for(const file of ['core.php','.htaccess'])fs.copyFileSync('hostinger/app/'+file,directory+'/app/'+file);
fs.writeFileSync(directory+'/config.php',fs.readFileSync('hostinger/config.example.php','utf8').replace('__INSTALLATION_KEY__',key));
fs.copyFileSync('web/example-newsletter.json',directory+'/app/example-newsletter.json');
fs.mkdirSync(directory+'/assets',{recursive:true});for(const file of fs.readdirSync('web/images'))fs.copyFileSync('web/images/'+file,directory+'/assets/'+file);
fs.copyFileSync('web/logo.jpg',directory+'/logo.jpg');
let html=fs.readFileSync('web/index.html','utf8')
 .replace('/* EXAMPLE_NEWSLETTER */',fs.readFileSync('web/example-newsletter.json','utf8').trim())
 .replace('</style>',['web/motion.css','web/home.css','web/hero-slideshow.css'].map(file=>fs.readFileSync(file,'utf8')).join('\n')+'\n</style>')
 .replace('render();Promise.allSettled',fs.readFileSync('web/subscribers.js','utf8')+'\n'+fs.readFileSync('web/hostinger.js','utf8')+'\nrender();Promise.allSettled')
 .replace('</body>',['web/motion.js','web/hero-slideshow.js'].map(file=>'<script>'+fs.readFileSync(file,'utf8')+'</script>').join('')+'</body>');
fs.writeFileSync(directory+'/app/site.html',html);
fs.copyFileSync('hostinger/UPLOAD-INSTRUCTIONS.txt',directory+'/UPLOAD-INSTRUCTIONS.txt');
console.log('Built Hostinger PHP package in '+path.resolve(directory));

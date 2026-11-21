import {readFileSync,writeFileSync,mkdirSync,readdirSync} from 'node:fs';
const example=JSON.parse(readFileSync('web/example-newsletter.json','utf8'));
const assets=Object.fromEntries(readdirSync('web/images').filter(name=>name.endsWith('.jpg')).map(name=>['/assets/'+name,readFileSync('web/images/'+name).toString('base64')]));
const html=readFileSync('web/index.html','utf8')
 .replace('/* EXAMPLE_NEWSLETTER */',JSON.stringify(example))
 .replace('</style>',readFileSync('web/motion.css','utf8')+'\n'+readFileSync('web/home.css','utf8')+'\n'+readFileSync('web/hero-slideshow.css','utf8')+'\n'+readFileSync('web/run-slider.css','utf8')+'\n'+readFileSync('web/premium.css','utf8')+'\n'+readFileSync('web/navigation.css','utf8')+'\n'+readFileSync('web/flow.css','utf8')+'\n</style>')
 .replace('render();Promise.allSettled',readFileSync('web/subscribers.js','utf8')+'\n'+readFileSync('web/hostinger.js','utf8')+'\n'+readFileSync('web/navigation.js','utf8')+'\nrender();Promise.allSettled')
 .replace('</body>','<script>'+readFileSync('web/motion.js','utf8')+'</script><script>'+readFileSync('web/hero-slideshow.js','utf8')+'</script><script>'+readFileSync('web/run-slider.js','utf8')+'</script><script>'+readFileSync('web/premium.js','utf8')+'</script></body>');
const logo=readFileSync('web/logo.png').toString('base64');
const worker=readFileSync('worker/index.js','utf8');
mkdirSync('dist/server',{recursive:true});
writeFileSync('dist/server/index.js',`const HTML=${JSON.stringify(html)};\nconst LOGO=${JSON.stringify(logo)};\nconst ASSETS=${JSON.stringify(assets)};\nconst EXAMPLE_NEWSLETTER=${JSON.stringify(example)};\n${worker}`);
// Portable design review only; real content management runs on the hosted Worker.
let preview=html.replaceAll('/logo.png','data:image/png;base64,'+logo)
 .replace('const path=location.pathname;','const path=(location.hash.slice(1)||"/").split("?")[0];')
 .replaceAll('new URLSearchParams(location.search)','new URLSearchParams(location.hash.split("?")[1]||"")')
 .replace("history.pushState({},'',href)","history.pushState({},'','#'+href)")
 .replace(/render\(\);Promise\.allSettled\([^\n]+/, 'render();')
 .replace("me={signedIn:false}","me={signedIn:true,email:'Design preview'}")
 .replace('href="/signin-with-chatgpt?return_to=%2Fadmin" target="_top"','href="/admin" data-link')
 .replace('Continue with ChatGPT ↗','Open admin preview ↗')
 .replace('f.onsubmit=async e=>{e.preventDefault();','f.onsubmit=async e=>{e.preventDefault();f.querySelector(".status").textContent="Design preview only. Publishing requires the hosted Site.";return;')
 .replace('<body>','<body><div style="padding:7px 16px;background:#fff3d7;color:#64490a;text-align:center;font-size:11px">Design preview · Login, uploads, and publishing require the hosted Site.</div>');
for(const [path,base64] of Object.entries(assets))preview=preview.replaceAll(path,'data:image/jpeg;base64,'+base64);
writeFileSync('dist/preview.html',preview);
writeFileSync('preview.html',preview);

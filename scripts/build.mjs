import {readFileSync,writeFileSync,mkdirSync,copyFileSync} from 'node:fs';
const html=readFileSync('web/index.html','utf8')
 .replace('</style>',readFileSync('web/motion.css','utf8')+'\n'+readFileSync('web/home.css','utf8')+'\n</style>')
 .replace('render();Promise.allSettled',readFileSync('web/subscribers.js','utf8')+'\nrender();Promise.allSettled')
 .replace('</body>','<script>'+readFileSync('web/motion.js','utf8')+'</script></body>');
const logo=readFileSync('web/logo.jpg').toString('base64');
const worker=readFileSync('worker/index.js','utf8');
mkdirSync('dist/server',{recursive:true});
writeFileSync('dist/server/index.js',`const HTML=${JSON.stringify(html)};\nconst LOGO=${JSON.stringify(logo)};\n${worker}`);
// Portable design review only; real content management runs on the hosted Worker.
const preview=html.replaceAll('/logo.jpg','data:image/jpeg;base64,'+logo)
 .replace('const path=location.pathname;','const path=(location.hash.slice(1)||"/").split("?")[0];')
 .replace("history.pushState({},'',href)","history.pushState({},'','#'+href)")
 .replace(/render\(\);Promise\.allSettled\([^\n]+/, 'render();')
 .replace("me={signedIn:false}","me={signedIn:true,email:'Design preview'}")
 .replace('href="/signin-with-chatgpt?return_to=%2Fadmin" target="_top"','href="/admin" data-link')
 .replace('Continue with ChatGPT ↗','Open admin preview ↗')
 .replace('f.onsubmit=async e=>{e.preventDefault();','f.onsubmit=async e=>{e.preventDefault();f.querySelector(".status").textContent="Design preview only. Publishing requires the hosted Site.";return;')
 .replace('<body>','<body><div style="padding:7px 16px;background:#fff3d7;color:#64490a;text-align:center;font-size:11px">Design preview · Login, uploads, and publishing require the hosted Site.</div>');
writeFileSync('dist/preview.html',preview);
writeFileSync('preview.html',preview);

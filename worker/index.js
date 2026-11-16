const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export default {async fetch(req,env){
 try {
 const url=new URL(req.url),p=url.pathname;
 if(p==='/logo.jpg')return new Response(Uint8Array.from(atob(LOGO),c=>c.charCodeAt(0)),{headers:{'Content-Type':'image/jpeg','Cache-Control':'public,max-age=86400'}});
 const user=req.headers.get('oai-authenticated-user-id');
 if(p==='/api/me')return json({signedIn:!!user,email:req.headers.get('oai-authenticated-user-email')||''});
 if(p.startsWith('/media/')){
  const key=p.slice(7);if(!/^[a-zA-Z0-9-]+$/.test(key))return new Response('Not found',{status:404});
  const obj=await env.BUCKET.get('media/'+key);if(!obj)return new Response('Not found',{status:404});
  return new Response(obj.body,{headers:{'Content-Type':obj.httpMetadata?.contentType||'application/octet-stream','Cache-Control':'public,max-age=3600','X-Content-Type-Options':'nosniff'}});
 }
 if(p==='/api/content'&&req.method==='GET'){
  const result={gallery:[],newsletters:[]};
  for(const type of Object.keys(result)){
   let cursor;do{const list=await env.BUCKET.list({prefix:type+'/',cursor});const records=await Promise.all(list.objects.map(async o=>{const value=await env.BUCKET.get(o.key);return value?value.json():null}));result[type].push(...records.filter(Boolean));cursor=list.truncated?list.cursor:undefined}while(cursor);
   result[type].sort((a,b)=>b.created.localeCompare(a.created));
  }return json(result);
 }
 if(p.startsWith('/api/')){
  if(!user)return json({error:'Please sign in to manage content.'},401);
  // Writes rely on the Site's owner-only platform access policy.
  if(req.headers.get('origin')!==url.origin)return json({error:'Invalid request origin.'},403);
  if(req.method==='POST'&&(p==='/api/gallery'||p==='/api/newsletters')){
   if(Number(req.headers.get('content-length')||0)>10*1024*1024)return json({error:'Maximum upload is 10 MB.'},413);
   const form=await req.formData(),file=form.get('photo'),title=String(form.get('title')||'').trim(),body=String(form.get('body')||'').trim();
   if((p==='/api/newsletters'&&!title)||title.length>180)return json({error:'Enter a title of up to 180 characters.'},400);
   if(p==='/api/newsletters'&&(!body||body.length>100000))return json({error:'Enter newsletter content (up to 100,000 characters).'},400);
   if(!file||typeof file==='string'||!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>8*1024*1024||!file.size)return json({error:'Choose a JPG, PNG, or WebP image under 8 MB.'},400);
   const id=crypto.randomUUID(),media=crypto.randomUUID();
   await env.BUCKET.put('media/'+media,file.stream(),{httpMetadata:{contentType:file.type}});
   const item={id,title:p==='/api/gallery'?'Gallery photo':title,body,image:'/media/'+media,created:new Date().toISOString()};
   await env.BUCKET.put((p==='/api/gallery'?'gallery/':'newsletters/')+id,JSON.stringify(item));return json(item,201);
  }
  if(req.method==='DELETE'&&/^\/api\/(gallery|newsletters)\/[a-zA-Z0-9-]+$/.test(p)){
   const key=p.slice(5),obj=await env.BUCKET.get(key);if(obj){const item=await obj.json();await env.BUCKET.delete(item.image.slice(1));await env.BUCKET.delete(key)}return json({ok:true});
  }
  return json({error:'Not found'},404);
 }
 return new Response(HTML,{headers:{'Content-Type':'text/html;charset=utf-8','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'}});
 }catch(e){return json({error:'Unable to complete this request. Please try again.'},500)}
}};

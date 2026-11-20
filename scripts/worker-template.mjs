// The build prefixes the immutable asset and locale tables.
const headers={
  'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin',
  'X-Frame-Options':'DENY','X-Robots-Tag':'noindex, nofollow',
  'Permissions-Policy':'camera=(), microphone=(), geolocation=()','Cache-Control':'no-cache',
  'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"
};
const mime={html:'text/html; charset=utf-8',css:'text/css; charset=utf-8',js:'text/javascript; charset=utf-8',svg:'image/svg+xml',webp:'image/webp'};
export default {fetch(request){
  const url=new URL(request.url),lang=url.searchParams.get('lang')==='en'?'en':'de';
  const path=url.pathname==='/'?'/index.html':url.pathname;
  if(!['GET','HEAD'].includes(request.method))return new Response(labels[lang].method,{status:405,headers});
  if(path==='/api/health')return Response.json({status:'ok',version:'0.4.0',preview:true,levels:72});
  if(!Object.hasOwn(assets,path))return new Response(labels[lang].notFound,{status:404,headers});
  const ext=path.split('.').pop();
  let body=assets[path];
  if(request.method==='HEAD')body=null;
  else if(ext==='webp')body=Uint8Array.from(atob(body),ch=>ch.charCodeAt(0));
  else if(ext==='html'&&lang==='en'){
    body=body.replace('lang="de-DE"','lang="en"').replace(labels.de.description,labels.en.description).replace(labels.de.title,labels.en.title);
  }
  return new Response(body,{headers:{...headers,'Content-Type':mime[ext]}});
}};

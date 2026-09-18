const CACHE='ipanel-textures-v1';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  if(u.pathname.indexOf('/wp-content/uploads/ipanel-ar/textures/')!==0)return;
  e.respondWith(caches.open(CACHE).then(async c=>{
    const hit=await c.match(e.request); if(hit)return hit;
    const res=await fetch(e.request); if(res&&res.ok)c.put(e.request,res.clone()); return res;
  }));
});

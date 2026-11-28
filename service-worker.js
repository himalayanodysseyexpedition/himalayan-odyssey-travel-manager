/* Minimal offline shell cache. Never cache API, Supabase, booking or enquiry responses. */
const CACHE='himalayan-odyssey-shell-v29';
const SHELL=['/','/manifest.webmanifest','/logo.webp','/favicon.svg','/mobile-app-experience.css','/mobile-app-experience.js','/himalayan-bottom-navigation.css','/himalayan-bottom-navigation-blue-glass.css','/mobile-app-experience-v5.css','/mobile-app-experience-v13.js','/mobile-app-experience-v14.js','/mobile-app-experience-v15.js','/mobile-app-experience-v16.js','/mobile-app-experience-v18.js','/himalayan-bottom-navigation-v6.css','/arctic-prestige-motion.css','/arctic-prestige-motion.js'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>Promise.all(SHELL.map(url=>cache.add(url).catch(()=>null)))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('himalayan-odyssey-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/rest/')||url.pathname.includes('supabase'))return;
 if(req.mode==='navigate'){
  // Only the canonical homepage may populate or use the homepage offline cache.
  if(url.pathname!=='/'||url.search)return;
  event.respondWith(fetch(req).then(response=>{if(response.ok&&new URL(response.url).pathname==='/'&&!new URL(response.url).search){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put('/',copy)).catch(()=>null))}return response}).catch(async()=> (await caches.match('/'))||new Response('Offline. Please reconnect to view the website.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}})));return
 }
 if(['/mobile-app-experience-v18.js','/himalayan-bottom-navigation-blue-glass.css'].includes(url.pathname)){
  event.respondWith(fetch(req,{cache:'no-cache'}).then(response=>{if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(req,copy)).catch(()=>null))}return response}).catch(async()=> (await caches.match(req))||(await caches.match(url.pathname))||new Response('',{status:503})));return;
 }
 if(SHELL.includes(url.pathname)){event.respondWith(fetch(req,{cache:'no-cache'}).then(response=>{if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(req,copy)).catch(()=>null))}return response}).catch(async()=> (await caches.match(req))||(await caches.match(url.pathname))||new Response('',{status:503})));return;}
});

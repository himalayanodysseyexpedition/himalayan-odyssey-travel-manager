/* Calling Desk Web Push. No private-data caching or offline contact storage. */
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('push',event=>{
 event.waitUntil((async()=>{
  let p={};try{p=event.data?.json()||{}}catch(_){}
  const title=typeof p.title==='string'?p.title:'Himalayan Odyssey • Calling Desk';
  const body=typeof p.body==='string'?p.body:'Calling Desk has an update.';
  await self.registration.showNotification(title,{body,tag:typeof p.tag==='string'?p.tag:'calling-desk-update',icon:'/calling-desk-icon-192.svg',badge:'/calling-desk-icon-192.svg',data:{url:'/calling-staff'}});
 })());
});
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil((async()=>{
 const url=new URL('/calling-staff',self.location.origin);
 const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
 for(const client of windows){const u=new URL(client.url);if(u.origin===url.origin&&['/calling-staff','/calling-staff.html'].includes(u.pathname)){await client.focus();return}}
 await self.clients.openWindow(url.href);
})())});

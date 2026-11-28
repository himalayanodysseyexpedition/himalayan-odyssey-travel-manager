/* Only displays notifications requested by the signed-in Calling Desk page. No caching or background push. */
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil((async()=>{const url=new URL('/calling-staff.html',self.location.origin);const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});for(const client of windows){if(new URL(client.url).pathname===url.pathname){await client.focus();return}}await self.clients.openWindow(url.href)})())});

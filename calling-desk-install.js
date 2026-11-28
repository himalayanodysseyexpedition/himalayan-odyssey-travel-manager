/* Native install prompt when supported; native details disclosure is the no-JS fallback. */
(() => {
  const button=document.getElementById('installDesk');
  const panel=document.getElementById('installHelp');
  const instructions=document.getElementById('installInstructions');
  if(!button||!panel||!instructions)return;
  let promptEvent=null;
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();promptEvent=event});
  window.addEventListener('appinstalled',()=>{promptEvent=null;instructions.textContent='Calling Desk is installed. Open it from your home screen.';panel.open=true});
  button.addEventListener('click',async event=>{
    if(!promptEvent)return; // native details toggles, even in browsers without install support
    event.preventDefault();
    const pending=promptEvent;promptEvent=null;
    try{await pending.prompt();const choice=await pending.userChoice;if(choice?.outcome==='accepted')instructions.textContent='Installation requested. Check your home screen for Calling Desk.';panel.open=true}catch(_){panel.open=true}
  });
  if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('/calling-desk-alert-worker.js',{scope:'/calling-staff.html'}).catch(()=>{});
})();

/* Calling Desk only: install prompt, platform guidance, and scoped worker registration. */
(() => {
  const button=document.getElementById('installDesk');
  const panel=document.getElementById('installHelp');
  const instructions=document.getElementById('installInstructions');
  const mode=window.matchMedia('(display-mode: standalone)');
  const installed=()=>mode.matches||navigator.standalone===true;
  let promptEvent=null, installedHere=false;
  const render=()=>{button.hidden=installed()||installedHere;if(button.hidden)panel.hidden=true};
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();promptEvent=event;render()});
  window.addEventListener('appinstalled',()=>{installedHere=true;promptEvent=null;render()});
  if(mode.addEventListener)mode.addEventListener('change',render);
  else if(mode.addListener)mode.addListener(render);
  document.getElementById('closeInstallHelp').addEventListener('click',()=>{panel.hidden=true;button.focus()});
  const showHelp=()=>{
    const ios=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
    const android=/Android/i.test(navigator.userAgent);
    instructions.textContent=ios?'Open this page in Safari, tap Share, choose Add to Home Screen, then tap Add. If available, keep Open as Web App enabled.':android?'Open this page in Chrome. Tap the three-dot menu, then Install app or Add to Home screen. If you are in WhatsApp or another in-app browser, use Open in Chrome first.':'In Chrome or Edge, use the browser menu or address-bar install icon and select Install this site as an app. If your browser does not offer installation, use a supported browser.';
    panel.hidden=false;panel.scrollIntoView({block:'nearest',behavior:'smooth'});
  };
  button.addEventListener('click',async()=>{
    if(!promptEvent){showHelp();return}
    const pending=promptEvent;promptEvent=null;button.disabled=true;
    try{await pending.prompt();const choice=await pending.userChoice;if(choice?.outcome==='accepted'){installedHere=true;render()}else showHelp()}catch(_){showHelp()}finally{button.disabled=false}
  });
  render();
  if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('/calling-desk-alert-worker.js',{scope:'/calling-staff.html'}).catch(()=>{});
})();

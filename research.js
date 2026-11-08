"use strict";
const SUPABASE_URL = "https://ynkoiuyjevclypumnyes.supabase.co";
const SUPABASE_KEY = "sb_publishable_Y4JRhHCbljrd5catiUimJw_tr10Qvk-";
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const $ = id => document.getElementById(id);
let user = null, projects = [], current = null;
const templates = {
  seo: [
    "What exact phrases do travellers use when searching for this trip?",
    "What are the main search intents (price, itinerary, route, season, safety, booking)?",
    "Which destination and package pages currently rank for these searches?",
    "What questions and FAQs are missing from our website?",
    "What local, seasonal and long-tail keywords should the page target?",
    "What internal links should connect this page to destinations and packages?",
    "What trustworthy sources support the facts and travel advice?"
  ],
  destination: [
    "What are the main attractions and experiences in this destination?",
    "What is the best season to visit, and what changes month by month?",
    "What is the practical route, distance, travel time and road condition?",
    "What permits, restrictions, acclimatisation or safety considerations apply?",
    "What accommodation, food and transport options are available?",
    "What do first-time visitors most often ask before booking?",
    "What nearby places can be combined into a realistic itinerary?",
    "Which facts need confirmation from official or local sources?"
  ],
  competitor: [
    "Which competing operators target this destination and audience?",
    "What packages, durations, inclusions and published prices do they offer?",
    "What does each competitor explain well on their website?",
    "What customer questions, reviews or objections appear repeatedly?",
    "Which keywords and destination pages appear to be their strongest?",
    "What genuine service differences can Himalayan Odyssey communicate?",
    "What opportunities can we pursue without copying competitor content?"
  ],
  package: [
    "What traveller segment is this package designed for?",
    "What route and day-wise itinerary are realistic for the season?",
    "What are the major attractions and meaningful experiences?",
    "What vehicle, stay, meals and operational costs need confirmation?",
    "What is included, excluded and subject to weather or road conditions?",
    "What safety, permit, altitude and cancellation information is needed?",
    "What price positioning and clear booking call-to-action should be used?"
  ]
};
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const say = value => { $("appMsg").textContent = value || ""; };
const typeLabel = value => ({seo:"SEO research",destination:"Destination research",competitor:"Competitor analysis",package:"Package research"}[value] || "Research");
const statusLabel = value => ({planning:"Planning",researching:"Researching",ready:"Ready for review",archived:"Archived"}[value] || value);
function defaultOutline(type) { return (templates[type] || templates.seo).map(question => ({question, answer:"", done:false})); }
function authView(signedIn) {
  $("auth").hidden = signedIn;
  $("app").hidden = !signedIn;
  $("logout").hidden = !signedIn;
}
async function loadProjects() {
  const {data,error} = await db.from("research_projects").select("*").order("updated_at",{ascending:false});
  if (error) throw error;
  projects = data || [];
  renderProjectList();
}
function renderProjectList() {
  $("projectList").innerHTML = projects.length ? projects.map(p => `
    <button class="project-item ${current?.id === p.id ? "active" : ""}" data-project="${escapeHtml(p.id)}">
      <strong>${escapeHtml(p.title)}</strong>
      <small>${escapeHtml(typeLabel(p.research_type))} · ${escapeHtml(statusLabel(p.status))}</small>
    </button>`).join("") : '<div class="empty">No projects yet. Create your first research project.</div>';
}
function renderEditor() {
  const has = !!current;
  $("editor").hidden = !has;
  $("emptyState").hidden = has;
  if (!has) return;
  $("editorHeading").textContent = current.title || "Untitled research";
  $("statusLabel").textContent = statusLabel(current.status);
  $("title").value = current.title || "";
  $("type").value = current.research_type || "seo";
  $("topic").value = current.topic || "";
  $("market").value = current.market || "";
  $("status").value = current.status || "planning";
  $("findings").value = current.findings || "";
  $("report").value = current.report || "";
  renderOutline();
  renderSources();
  renderProjectList();
}
function renderOutline() {
  const rows = Array.isArray(current.outline) ? current.outline : [];
  $("outlineList").innerHTML = rows.length ? rows.map((item,i) => `
    <div class="outline-row" data-outline-index="${i}">
      <input type="checkbox" class="done" aria-label="Mark question complete" ${item.done ? "checked" : ""}>
      <textarea class="question" aria-label="Research question">${escapeHtml(item.question)}</textarea>
      <textarea class="answer" aria-label="Research answer / notes" placeholder="Record the answer and evidence…">${escapeHtml(item.answer)}</textarea>
      <button class="btn soft search" type="button" data-search-index="${i}">Search web ↗</button>
    </div>`).join("") : '<div class="empty">No questions yet. Add a question or create a checklist.</div>';
}
function renderSources() {
  const sources = Array.isArray(current.sources) ? current.sources : [];
  $("sourceList").innerHTML = sources.length ? sources.map((s,i) => `
    <article class="source-row"><b>${escapeHtml(s.title || s.url || "Source")}</b>
      <div><a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.url)}</a></div>
      <p>${escapeHtml(s.notes || "No notes added.")}</p>
      <button class="btn danger" type="button" data-remove-source="${i}">Remove source</button>
    </article>`).join("") : '<div class="empty">No sources saved yet. Add official, local or first-hand sources as you research.</div>';
}
function collectEditor() {
  if (!current) return;
  current.title = $("title").value.trim();
  current.research_type = $("type").value;
  current.topic = $("topic").value.trim();
  current.market = $("market").value.trim();
  current.status = $("status").value;
  current.findings = $("findings").value;
  current.report = $("report").value;
  current.outline = [...$("outlineList").querySelectorAll(".outline-row")].map(row => ({
    question: row.querySelector(".question").value.trim(),
    answer: row.querySelector(".answer").value.trim(),
    done: row.querySelector(".done").checked
  })).filter(item => item.question);
}
async function saveCurrent() {
  if (!current) return;
  collectEditor();
  if (!current.title || !current.topic) { say("Add a project name and topic before saving."); return; }
  const payload = {
    owner_id:user.id, title:current.title, research_type:current.research_type,
    topic:current.topic, market:current.market || null, status:current.status,
    outline:current.outline, sources:current.sources || [], findings:current.findings,
    report:current.report, updated_at:new Date().toISOString()
  };
  say("Saving securely…");
  const result = current.id
    ? await db.from("research_projects").update(payload).eq("id",current.id).select("*").single()
    : await db.from("research_projects").insert(payload).select("*").single();
  if (result.error) { say("Save failed: " + result.error.message); return; }
  current = result.data;
  await loadProjects();
  renderEditor();
  say("Saved to your private Supabase workspace.");
}
async function createProject() {
  const type = "seo";
  current = {id:null,title:"New research project",research_type:type,topic:"",market:"",status:"planning",outline:defaultOutline(type),sources:[],findings:"",report:""};
  renderEditor();
  $("title").focus();
}
function openSearch(query) {
  const url = "https://www.google.com/search?q=" + encodeURIComponent(query);
  window.open(url,"_blank","noopener,noreferrer");
}
function buildBrief() {
  collectEditor();
  return [
    "Act as a careful travel-market and SEO researcher for Himalayan Odyssey Expedition, a local tour operator based in Narkanda, Himachal Pradesh.",
    "Research type: " + typeLabel(current.research_type),
    "Topic: " + current.topic,
    "Target market: " + (current.market || "India-wide travellers"),
    "Research questions:",
    ...current.outline.map((x,i) => (i+1)+". "+x.question),
    "",
    "Requirements: use current and credible sources; distinguish verified facts from estimates; include source URLs and access dates; flag anything uncertain; do not invent prices, permits, road conditions or travel times. Return practical recommendations for the website and genuine customer enquiries."
  ].join("\n");
}
function buildReport() {
  collectEditor();
  const date = new Date().toLocaleDateString("en-IN");
  const lines = ["# " + current.title,"", "**Research type:** " + typeLabel(current.research_type),"**Topic:** " + current.topic,"**Target market:** " + (current.market || "Not specified"),"**Updated:** " + date,"","## Research questions and findings"];
  current.outline.forEach((item,i) => lines.push("", "### " + (i+1) + ". " + item.question, item.answer || "_Research pending._", "**Status:** " + (item.done ? "Reviewed" : "Pending")));
  lines.push("","## Key observations",current.findings || "_No observations recorded yet._","", "## Sources");
  (current.sources || []).forEach((s,i) => lines.push("", (i+1)+". ["+(s.title || s.url)+"]("+s.url+")", s.notes || ""));
  lines.push("","## Review before publishing","- Verify time-sensitive details such as prices, road status, permits and opening dates.","- Confirm claims with official or first-hand sources.","- Rewrite content in the brand's own voice; do not copy competitor text.","");
  $("report").value = lines.join("\n");
  current.report = $("report").value;
  say("Report draft created. Review it, then save.");
}
function downloadReport() {
  collectEditor();
  const content = current.report || buildBrief();
  const blob = new Blob([content],{type:"text/markdown;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = (current.title || "himalayan-research").toLowerCase().replace(/[^a-z0-9]+/g,"-") + ".md";
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}
async function boot() {
  try {
    const {data,error} = await db.auth.getSession();
    if (error) throw error;
    user = data.session?.user || null;
    authView(!!user);
    if (user) await loadProjects();
  } catch (error) { $("authMsg").textContent = error.message; }
}
$("loginForm").addEventListener("submit",async event=>{
  event.preventDefault(); $("loginBtn").disabled=true; $("authMsg").textContent="Signing in…";
  const {data,error}=await db.auth.signInWithPassword({email:$("email").value.trim(),password:$("password").value});
  $("loginBtn").disabled=false;
  if(error){$("authMsg").textContent=error.message;return;}
  user=data.user; authView(true); $("authMsg").textContent="";
  try{await loadProjects();}catch(err){say(err.message);}
});
$("logout").addEventListener("click",async()=>{await db.auth.signOut();user=null;current=null;authView(false);});
$("newProject").addEventListener("click",createProject);
$("emptyNew").addEventListener("click",createProject);
$("projectList").addEventListener("click",event=>{
  const btn=event.target.closest("[data-project]"); if(!btn)return;
  collectEditor(); current=projects.find(p=>p.id===btn.dataset.project)||null; renderEditor();
});
$("makeOutline").addEventListener("click",()=>{
  if(!current)return;
  if(current.outline?.length && !confirm("Replace the current checklist? Existing answers will be lost."))return;
  current.outline=defaultOutline($("type").value); renderOutline(); say("Checklist created. Add answers as you research.");
});
$("addQuestion").addEventListener("click",()=>{
  if(!current)return; collectEditor(); current.outline.push({question:"New research question",answer:"",done:false}); renderOutline();
});
$("outlineList").addEventListener("click",event=>{
  const btn=event.target.closest("[data-search-index]"); if(!btn)return;
  collectEditor(); const item=current.outline[Number(btn.dataset.searchIndex)];
  openSearch((current.topic||"Himachal Pradesh travel")+" "+item.question);
});
$("addSource").addEventListener("click",()=>{
  if(!current)return;
  const url=$("sourceUrl").value.trim();
  if(!url || !/^https?:\/\//i.test(url)){say("Enter a valid http or https source URL.");return;}
  collectEditor(); current.sources=current.sources||[];
  current.sources.push({title:$("sourceTitle").value.trim()||url,url,notes:$("sourceNotes").value.trim(),added_at:new Date().toISOString()});
  $("sourceTitle").value="";$("sourceUrl").value="";$("sourceNotes").value="";
  renderSources(); say("Source added. Save all changes to keep it.");
});
$("sourceList").addEventListener("click",event=>{
  const btn=event.target.closest("[data-remove-source]"); if(!btn)return;
  collectEditor(); current.sources.splice(Number(btn.dataset.removeSource),1); renderSources();
});
$("projectForm").addEventListener("submit",async event=>{
  event.preventDefault(); collectEditor(); await saveCurrent();
});
$("saveAll").addEventListener("click",saveCurrent);
$("buildReport").addEventListener("click",buildReport);
$("copyBrief").addEventListener("click",async()=>{
  const brief=buildBrief();
  try{await navigator.clipboard.writeText(brief);say("Research brief copied. Paste it into your preferred AI research assistant.");}
  catch{say("Clipboard unavailable in this browser. Select and copy the brief from your browser's address-safe clipboard interface.");}
});
$("exportReport").addEventListener("click",downloadReport);
$("deleteProject").addEventListener("click",async()=>{
  if(!current?.id)return;
  if(!confirm("Permanently delete this research project and its notes?"))return;
  const {error}=await db.from("research_projects").delete().eq("id",current.id);
  if(error){say("Delete failed: "+error.message);return;}
  current=null;await loadProjects();renderEditor();say("Project deleted.");
});
db.auth.onAuthStateChange((_event,session)=>{
  const next=session?.user||null;
  if(next?.id!==user?.id){user=next;authView(!!user);if(user)loadProjects().catch(e=>say(e.message));else{current=null;projects=[];}}
});
boot();

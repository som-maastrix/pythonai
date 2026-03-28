let currentSession = null;
let currentPhone = null;


// LOAD ALL CHAT SESSIONS
async function loadSessions(){

let res = await fetch("/wa/api/sessions");
let sessions = await res.json();

let html="";

sessions.forEach(s=>{

let phone = s.wa_from || "Unknown";

html += `
<div class="chatItem" onclick="openChat(${s.id},'${phone}')">
${phone}
</div>
`;

});

document.getElementById("chatList").innerHTML = html;

}



// OPEN CHAT
async function openChat(id,phone){

currentSession=id;
currentPhone=phone;

// show phone
document.getElementById("userPhone").innerText = phone;

let res = await fetch(`/wa/api/sessions/${id}`);
let data = await res.json();

let html="";

data.messages.forEach(m=>{

let cls = m.direction==="inbound" ? "user" : "bot";

html+=`
<div class="message ${cls}">
${m.body}
</div>
`;

});

document.getElementById("messages").innerHTML=html;


// =========================
// 🔥 AI BASED ISSUE DETECTION
// =========================

let issue = "General Issue";
let flat = "-";

// find AI response OR latest inbound
for(let i = data.messages.length - 1; i >= 0; i--){

let msg = data.messages[i];

// check if AI formatted response exists
if(msg.body && msg.body.includes("Issue:")){

let text = msg.body;

// extract Issue
let issueMatch = text.match(/Issue:\s*(.*)/i);
if(issueMatch){
issue = issueMatch[1];
}

// extract Flat
let flatMatch = text.match(/Flat:\s*(.*)/i);
if(flatMatch){
flat = flatMatch[1];
}

break;
}

}

// fallback if AI not found
if(issue === "General Issue"){

for(let i = data.messages.length - 1; i >= 0; i--){

if(data.messages[i].direction === "inbound"){

let text = data.messages[i].body.toLowerCase();

// fallback flat
let match = text.match(/flat\s*(\d+)/i);
if(match){
flat = match[1];
}

issue = "User Reported Issue";

break;
}

}

}


// update UI
document.getElementById("ticketIssue").innerText = issue;
document.getElementById("ticketFlat").innerText = flat;

scrollToBottom();

}



// SEND MESSAGE
async function sendMsg(){

if(!currentSession) return;

let input=document.getElementById("msgInput");

let text=input.value.trim();

if(!text) return;


// show instantly
let html=`
<div class="message bot">
${text}
</div>
`;

document.getElementById("messages").innerHTML+=html;

input.value="";

scrollToBottom();


// send to backend
await fetch(`/wa/api/sessions/${currentSession}/reply`,{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
message:text
})

});

}



// ENTER KEY SEND
document.getElementById("msgInput").addEventListener("keypress",function(e){

if(e.key==="Enter"){
sendMsg();
}

});



// SCROLL
function scrollToBottom(){

let box=document.getElementById("messages");

box.scrollTop=box.scrollHeight;

}



// AUTO REFRESH
setInterval(()=>{

loadSessions();

if(currentSession){
openChat(currentSession,currentPhone);
}

},3000);



// INITIAL LOAD
loadSessions();
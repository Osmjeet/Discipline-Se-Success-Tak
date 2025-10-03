const WEB_APP_URL = "YOUR_DEPLOYED_SCRIPT_URL"; // Google Apps Script URL

document.getElementById("quizForm")?.addEventListener("submit", function(e){
  e.preventDefault();

  let name = document.getElementById("name").value.trim();
  let email = document.getElementById("email").value.trim();
  let phone = document.getElementById("phone").value.trim();
  let city = document.getElementById("city").value.trim();

  // Validate
  if(!/^\d{10}$/.test(phone)){ alert("Phone must be 10 digits"); return; }
  if(!email.match(/@(gmail|yahoo)\.com$/)){ alert("Use gmail.com or yahoo.com email"); return; }

  let answers = {};
  let correctCount = 0;

  document.querySelectorAll(".qa").forEach((q, i)=>{
    let selected = q.querySelector("input[type=radio]:checked");
    if(selected){
      answers[`q${i+1}`] = selected.value || "wrong";
      if(selected.value === "correct") correctCount++;
    } else {
      answers[`q${i+1}`] = "not_attempted";
    }
  });

  let submission = {
    name, email, phone, city,
    score: correctCount,
    total: 25,
    answers: JSON.stringify(answers)
  };

  // Save to Google Sheets backend
  fetch(WEB_APP_URL, {
    method:"POST",
    body: JSON.stringify(submission)
  }).then(r=>r.json()).then(res=>{
    window.location.href = "results.html?score=" + correctCount;
  }).catch(err=>{
    console.error(err);
    alert("Error saving response");
  });
});

// Leaderboard init
function initLeaderboard(id, limit=20){
  fetch(WEB_APP_URL+"?leaderboard=1").then(r=>r.json()).then(data=>{
    let html = "<ol>";
    data.slice(0,limit).forEach(u=>{
      html += `<li>${u.name} - ${u.score}/25 (${u.city})</li>`;
    });
    html += "</ol>";
    document.getElementById(id).innerHTML = html;
  });
}

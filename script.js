// ===== Config =====
const GOAL = 50;

const TEAMS = {
  water: { name: "Team Water Wise", emoji: "🌊", countEl: "waterCount" },
  zero:  { name: "Team Net Zero",   emoji: "🌿", countEl: "zeroCount" },
  power: { name: "Team Renewables", emoji: "⚡", countEl: "powerCount" },
};

// ===== State (single source of truth) =====
let attendees = loadAttendees(); // array of { name, team }

// ===== Element references =====
const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const greeting = document.getElementById("greeting");
const attendeeCount = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");

// ===== Build the celebration banner (top of container) =====
const celebration = document.createElement("div");
celebration.id = "celebration";
celebration.className = "celebration-message";
celebration.style.display = "none";
document.querySelector(".container").prepend(celebration);

// ===== Build the attendee list section (under the team counters) =====
const attendeeSection = document.createElement("div");
attendeeSection.className = "attendee-list-section";
attendeeSection.innerHTML = `
  <h3>Checked-In Attendees</h3>
  <ul class="attendee-list" id="attendeeList"></ul>
`;
document.querySelector(".team-stats").appendChild(attendeeSection);
const attendeeList = document.getElementById("attendeeList");

// ===== Handle check-ins =====
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = nameInput.value.trim();
  const team = teamSelect.value;
  if (!name || !team) return;

  attendees.push({ name, team });
  saveAttendees();

  showGreeting(name, team);
  render();

  form.reset();
  nameInput.focus();
});

// ===== Render everything from the attendees array =====
function render() {
  const total = attendees.length;
  attendeeCount.textContent = total;

  // Team counts
  const counts = { water: 0, zero: 0, power: 0 };
  attendees.forEach((a) => counts[a.team]++);
  for (const key in TEAMS) {
    document.getElementById(TEAMS[key].countEl).textContent = counts[key];
  }

  // Progress bar (capped at 100%)
  const percent = Math.min((total / GOAL) * 100, 100);
  progressBar.style.width = percent + "%";

  // Attendee list
  renderList();

  // Celebration when the goal is reached
  if (total >= GOAL) {
    showCelebration(counts);
  } else {
    celebration.style.display = "none";
  }
}

// ===== Personalized greeting =====
function showGreeting(name, team) {
  greeting.textContent = `Welcome, ${name}! You're checked in with ${TEAMS[team].name}. 🎉`;
  greeting.classList.add("success-message");
  greeting.style.display = "block";
}

// ===== Attendee list =====
function renderList() {
  attendeeList.innerHTML = "";
  attendees.forEach((a) => {
    const team = TEAMS[a.team];
    const li = document.createElement("li");
    li.className = "attendee-item " + a.team;
    li.innerHTML = `
      <span class="attendee-name">${escapeHtml(a.name)}</span>
      <span class="attendee-team">${team.emoji} ${team.name}</span>
    `;
    attendeeList.appendChild(li);
  });
}

// ===== Celebration message (highlights the winning team) =====
function showCelebration(counts) {
  let winner = null;
  let max = -1;
  for (const key in TEAMS) {
    if (counts[key] > max) {
      max = counts[key];
      winner = key;
    }
  }
  celebration.innerHTML =
    `🎉 We hit ${GOAL} check-ins! Congratulations to ` +
    `<strong>${TEAMS[winner].name}</strong> with ${max} attendees! 🏆`;
  celebration.style.display = "block";
}

// ===== localStorage helpers =====
function loadAttendees() {
  try {
    return JSON.parse(localStorage.getItem("intelAttendees")) || [];
  } catch {
    return [];
  }
}

function saveAttendees() {
  localStorage.setItem("intelAttendees", JSON.stringify(attendees));
}

// ===== Small helper to keep names safe in the HTML =====
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ===== Restore saved state on page load =====
render();
let selectedConsoleIndex = null;
let selectedEndIndex = null;

let consoles = [
  { id: 1, status: "vacant", session: null, timer: 0, intervalId: null },
  { id: 2, status: "vacant", session: null, timer: 0, intervalId: null },
  { id: 3, status: "vacant", session: null, timer: 0, intervalId: null },
];

let history = [];

function renderConsoles(data = consoles) {
  const container = document.getElementById("consoleList");
  container.innerHTML = "";

  data.forEach((console, i) => {
    const div = document.createElement("div");
    div.className = "console";
    div.innerHTML = `
      <h3>PS - ${console.id}</h3>
      <p>Status: <b>${console.status}</b></p>
      <p>Name: <b>${console.session ? console.session.name : "-"}</b></p>
      <p>Start Time: <b>${console.session?.startTime || "-"}</b></p>
      <p>Timer: <span id="timer-${console.id}">${formatTime(console.timer)}</span></p>
      ${
        console.status === "vacant"
          ? `<button class="btn start-btn" onclick="openStartModal(${i})">Start Session</button>`
          : `<button class="btn end-btn" onclick="openEndModal(${i})">End Session</button>`
      }
    `;
    container.appendChild(div);
  });
}

function formatTime(sec) {
  const minutes = Math.floor(sec / 60);
  const seconds = sec % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function openStartModal(index) {
  selectedConsoleIndex = index;
  document.getElementById("modalNameInput").value = "";
  document.getElementById("startModal").style.display = "block";
}

function closeModal() {
  document.getElementById("startModal").style.display = "none";
  selectedConsoleIndex = null;
}

function confirmStart() {
  const name = document.getElementById("modalNameInput").value.trim();
  if (!name) {
    alert("Please enter a name.");
    return;
  }

  const index = selectedConsoleIndex;
  consoles[index].status = "occupied";
  consoles[index].session = {
    name: name,
    startTime: new Date().toLocaleTimeString(),
  };
  consoles[index].timer = 0;

  // Clear any existing timer before starting a new one
  clearInterval(consoles[index].intervalId);

  consoles[index].intervalId = setInterval(() => {
    consoles[index].timer++;
    document.getElementById("timer-" + consoles[index].id).innerText = formatTime(
      consoles[index].timer
    );
  }, 1000);

  closeModal();
  renderConsoles();
}

function openEndModal(index) {
  selectedEndIndex = index;
  const c = consoles[index];
  const duration = formatTime(c.timer);

  document.getElementById("endModalInfo").innerText =
    `End session for ${c.session.name}? Duration: ${duration}`;

  document.getElementById("endModal").style.display = "block";
}

function closeEndModal() {
  document.getElementById("endModal").style.display = "none";
  selectedEndIndex = null;
}

function confirmEnd() {
  const index = selectedEndIndex;
  clearInterval(consoles[index].intervalId);

  const sessionData = consoles[index].session;
  const timePlayed = formatTime(consoles[index].timer);

  history.push({
    consoleId: consoles[index].id,
    name: sessionData.name,
    duration: timePlayed,
    startTime: sessionData.startTime,
  });

  consoles[index].status = "vacant";
  consoles[index].session = null;
  consoles[index].timer = 0;
  consoles[index].intervalId = null;

  closeEndModal();
  renderConsoles();
  renderHistory();
}

function renderHistory() {
  const historyContainer = document.getElementById("history");
  historyContainer.innerHTML = "";

  if (history.length === 0) {
    historyContainer.innerHTML = "<p>No session history yet.</p>";
    return;
  }

  const table = document.createElement("table");
  table.innerHTML = `
    <tr>
      <th>Console</th>
      <th>Name</th>
      <th>Start Time</th>
      <th>Duration</th>
    </tr>
  `;

  history.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>PS-${item.consoleId}</td>
      <td>${item.name}</td>
      <td>${item.startTime}</td>
      <td>${item.duration}</td>
    `;
    table.appendChild(row);
  });

  historyContainer.appendChild(table);
}





function exportToExcel() {
  if (history.length === 0) {
    alert("No history to export.");
    return;
  }

  const data = history.map(item => ({
    Console: "PS-" + item.consoleId,
    Name: item.name,
    "Start Time": item.startTime,
    Duration: item.duration
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Session History");

  XLSX.writeFile(workbook, "session_history.xlsx");
}





function filterConsoles(type) {
  if (type === "all") return renderConsoles();
  const filtered = consoles.filter((c) => c.status === type);
  renderConsoles(filtered);
}

// Call on load
renderConsoles();

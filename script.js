// Datos de ejemplo (puedes reemplazar por tu API o JSON)
const MOVIES = [
  { id: 1, title: "Crónicas del Amanecer", year: 2024, rating: 8.4, genre: ["Acción", "Aventura"], duration: 128, synopsis: "Héroes improbables deben unir fuerzas para detener una amenaza antigua.", times: ["14:00", "17:45", "20:10"] },
  { id: 2, title: "Sombras en el Agua", year: 2023, rating: 7.7, genre: ["Suspenso"], duration: 102, synopsis: "Un misterio emerge en un pueblo costero tras la desaparición de un pescador.", times: ["13:20", "16:00", "21:00"] },
  { id: 3, title: "Risas de Media Noche", year: 2022, rating: 6.9, genre: ["Comedia"], duration: 96, synopsis: "Un grupo de amigos abre un club de stand‑up con resultados hilarantes.", times: ["12:00", "15:10", "19:30"] },
  { id: 4, title: "Constelaciones", year: 2024, rating: 8.9, genre: ["Drama", "Ciencia Ficción"], duration: 118, synopsis: "Una astrónoma busca señales de vida y descubre algo personal en el proceso.", times: ["11:30", "18:20", "22:00"] },
];

const PRICE = 16000; // COP por asiento

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// Navegación
$$(".nav-btn").forEach(b => b.addEventListener("click", e => {
  const id = b.dataset.section;
  $$(".section").forEach(s => s.classList.remove("active"));
  $("#" + id).classList.add("active");
}));

// Pinta cartelera
const moviesWrap = $("#movies");
const search = $("#search");
const order = $("#order");
const genre = $("#genre");
const yearSpan = $("#year");
yearSpan.textContent = new Date().getFullYear();

const allGenres = [...new Set(MOVIES.flatMap(m => m.genre))];
allGenres.forEach(g => {
  const o = document.createElement("option");
  o.value = g; o.textContent = g; genre.appendChild(o);
});

function renderMovies() {
  const text = search.value.toLowerCase();
  const g = genre.value;
  let list = MOVIES.filter(m => m.title.toLowerCase().includes(text) && (!g || m.genre.includes(g)));
  const key = order.value;
  list = list.sort((a, b) => (a[key] > b[key] ? 1 : -1));
  moviesWrap.innerHTML = "";
  list.forEach(m => moviesWrap.appendChild(movieCard(m)));
}

function movieCard(m) {
  const el = document.createElement("article");
  el.className = "card";
  el.innerHTML = `
    <div class="poster" aria-hidden="true"></div>
    <div class="card-body">
      <div class="meta"><span>${m.year}</span><span>★ ${m.rating}</span></div>
      <div class="title">${m.title}</div>
      <p style="opacity:.9; font-size:.92rem;">${m.synopsis}</p>
      <div class="tags">${m.genre.map(g => `<span class="tag">${g}</span>`).join("")}</div>
      <div class="actions">
        <button class="btn ghost" data-info="${m.id}">Detalles</button>
        <button class="btn primary" data-reserva="${m.id}">Reservar</button>
      </div>
    </div>
  `;
  el.querySelector('[data-reserva]').addEventListener('click', () => openReservation(m));
  el.querySelector('[data-info]').addEventListener('click', () => alert(`${m.title}\n\nDuración: ${m.duration} min\nGéneros: ${m.genre.join(", ")}`));
  return el;
}

search.addEventListener("input", renderMovies);
order.addEventListener("change", renderMovies);
genre.addEventListener("change", renderMovies);
renderMovies();

// ----- Reserva -----
const modal = $("#reservationModal");
const seatGrid = $("#seatGrid");
const movieBrief = $("#movieBrief");
const timeInput = $("#timeInput");
const dateInput = $("#dateInput");
const roomInput = $("#roomInput");
const buyerName = $("#buyerName");
const buyerEmail = $("#buyerEmail");
const summary = $("#summary");
const closeModal = $("#closeModal");
const confirmReservation = $("#confirmReservation");
const reservationsList = $("#reservationsList");

let currentMovie = null;
let selectedSeats = new Set();
let occupiedSeats = new Set();

closeModal.addEventListener("click", () => modal.close());

function openReservation(m) {
  currentMovie = m;
  selectedSeats.clear();
  occupiedSeats = createRandomOccupied(12); // simula asientos ya ocupados
  movieBrief.innerHTML = `
    <div class="poster"></div>
    <div>
      <h4>${m.title}</h4>
      <div style="opacity:.85">Duración: ${m.duration} min • Géneros: ${m.genre.join(", ")}</div>
      <p style="margin:.4rem 0 0">${m.synopsis}</p>
    </div>
  `;
  timeInput.innerHTML = m.times.map(t => `<option value="${t}">${t}</option>`).join("");
  dateInput.valueAsDate = new Date();
  drawSeatGrid();
  updateSummary();
  modal.showModal();
}

function createRandomOccupied(n = 10) {
  const set = new Set();
  while (set.size < n) {
    const r = Math.floor(Math.random() * 80); // 10x8 por defecto en CSS (modifica si cambias)
    set.add(r);
  }
  return set;
}

function drawSeatGrid(rows = 8, cols = 10) {
  seatGrid.innerHTML = "";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "seat";
      btn.textContent = String.fromCharCode(65 + r) + (c + 1);
      if (occupiedSeats.has(idx)) {
        btn.classList.add("occupied");
        btn.disabled = true;
      }
      btn.addEventListener("click", () => {
        if (btn.classList.contains("selected")) {
          btn.classList.remove("selected"); selectedSeats.delete(idx);
        } else {
          btn.classList.add("selected"); selectedSeats.add(idx);
        }
        updateSummary();
      });
      seatGrid.appendChild(btn);
    }
  }
}

function updateSummary() {
  const q = selectedSeats.size;
  const total = q * PRICE;
  const seatsLabels = [...selectedSeats].sort((a, b) => a - b).map(idx => {
    const cols = 10; const r = Math.floor(idx / cols); const c = idx % cols;
    return String.fromCharCode(65 + r) + (c + 1);
  });
  summary.innerHTML = `
    <div><strong>Asientos:</strong> ${seatsLabels.join(", ") || "—"}</div>
    <div><strong>Cantidad:</strong> ${q}</div>
    <div><strong>Total:</strong> $${total.toLocaleString("es-CO")}</div>
  `;
}

confirmReservation.addEventListener("click", (e) => {
  e.preventDefault();
  const q = selectedSeats.size;
  if (!currentMovie) { alert("Selecciona una película."); return; }
  if (q === 0) { alert("Elige al menos un asiento."); return; }
  if (!buyerName.value.trim() || !buyerEmail.value.trim()) { alert("Completa tus datos."); return; }
  const data = {
    id: crypto.randomUUID(),
    movieId: currentMovie.id,
    title: currentMovie.title,
    date: dateInput.value,
    time: timeInput.value,
    room: roomInput.value,
    buyer: { name: buyerName.value.trim(), email: buyerEmail.value.trim() },
    seats: [...selectedSeats],
    amount: q * PRICE
  };
  saveReservation(data);
  modal.close();
  renderReservations();
  $("#reservas").classList.add("active");
  $("#cartelera").classList.remove("active");
});

function saveReservation(data) {
  const key = "cnv_reservas";
  const list = JSON.parse(localStorage.getItem(key) || "[]");
  list.push(data);
  localStorage.setItem(key, JSON.stringify(list));
}

function getReservations() {
  const key = "cnv_reservas";
  return JSON.parse(localStorage.getItem(key) || "[]");
}

function renderReservations() {
  const list = getReservations();
  if (list.length === 0) { reservationsList.innerHTML = `<p style="opacity:.8">Aún no tienes reservas.</p>`; return; }
  reservationsList.innerHTML = "";
  list.forEach(r => {
    const el = document.createElement("article");
    el.className = "ticket";
    const seatLabels = r.seats.map(idx => {
      const cols = 10; const row = Math.floor(idx / cols); const col = idx % cols;
      return String.fromCharCode(65 + row) + (col + 1);
    });
    el.innerHTML = `
      <div class="row"><strong>${r.title}</strong> · ${r.room}</div>
      <div class="row">📅 ${r.date} · 🕒 ${r.time}</div>
      <div class="row">🎟️ Asientos: ${seatLabels.join(", ")}</div>
      <div class="row"><strong>Total:</strong> $${r.amount.toLocaleString("es-CO")}</div>
      <div class="row" style="opacity:.85">👤 ${r.buyer.name} · ${r.buyer.email}</div>
      <div class="row">
        <button class="btn ghost" data-del="${r.id}">Eliminar</button>
      </div>
    `;
    el.querySelector("[data-del]").addEventListener("click", () => {
      const ok = confirm("¿Eliminar esta reserva?");
      if (!ok) return;
      const list = getReservations().filter(x => x.id !== r.id);
      localStorage.setItem("cnv_reservas", JSON.stringify(list));
      renderReservations();
    });
    reservationsList.appendChild(el);
  });
}
renderReservations();

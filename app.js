const stock = [
  { item: "Leite integral", donor: "Mercado Bom Pão", quantity: "36 L", expiry: "2026-05-22", status: "critico", action: "Distribuir primeiro" },
  { item: "Pães embalados", donor: "Padaria Central", quantity: "80 un.", expiry: "2026-05-23", status: "critico", action: "Avisar beneficiários" },
  { item: "Feijão carioca", donor: "Família Oliveira", quantity: "42 kg", expiry: "2026-05-29", status: "atencao", action: "Reservar para cestas" },
  { item: "Arroz tipo 1", donor: "Grupo São José", quantity: "120 kg", expiry: "2026-06-16", status: "ok", action: "Manter estoque" },
  { item: "Óleo de soja", donor: "Campanha mensal", quantity: "24 un.", expiry: "2026-06-03", status: "atencao", action: "Priorizar próxima saída" },
  { item: "Macarrão", donor: "Doador anônimo", quantity: "58 pct.", expiry: "2026-07-08", status: "ok", action: "Manter estoque" }
];

const beneficiaries = [
  { name: "Maria Aparecida Santos", phone: "(11) 99999-1010", address: "Rua das Flores, 120 - Centro", area: "Centro", status: "Ativo", visit: "Visita vence em 12 dias", tag: "yellow" },
  { name: "José Carlos Lima", phone: "(11) 98888-2020", address: "Av. Norte, 45 - Zona Norte", area: "Zona Norte", status: "Em análise", visit: "Documentos pendentes", tag: "blue" },
  { name: "Ana Paula Ribeiro", phone: "(11) 97777-3030", address: "Rua Esperança, 86 - Vila Nova", area: "Vila Nova", status: "Ativo", visit: "Sem visita há 7 meses", tag: "red" },
  { name: "Rosa Ferreira", phone: "(11) 96666-4040", address: "Rua São Bento, 210 - Jardim São Bento", area: "Jardim São Bento", status: "Ativo", visit: "Verificado em maio", tag: "green" }
];

const visits = [
  { date: "2026-05-21", hour: "14:30", person: "Ana Paula Ribeiro", volunteer: "Cláudia", status: "Pendente", tag: "red", result: "" },
  { date: "2026-05-22", hour: "09:00", person: "José Carlos Lima", volunteer: "Marcos", status: "Agendada", tag: "blue", result: "" },
  { date: "2026-05-24", hour: "15:00", person: "Maria Aparecida Santos", volunteer: "Elisa", status: "Confirmada", tag: "green", result: "" },
  { date: "2026-05-27", hour: "10:00", person: "Rosa Ferreira", volunteer: "Paulo", status: "Retorno", tag: "yellow", result: "" }
];

const donors = [
  { name: "Mercado Bom Pão", frequency: "Semanal", contact: "WhatsApp validado", type: "Leite e perecíveis", tag: "green" },
  { name: "Grupo São José", frequency: "Mensal", contact: "Recebe resumo mensal", type: "Cestas básicas", tag: "blue" },
  { name: "Família Oliveira", frequency: "Quinzenal", contact: "Prefere e-mail", type: "Feijão e arroz", tag: "green" },
  { name: "Padaria Central", frequency: "Eventual", contact: "Confirmar próxima coleta", type: "Pães embalados", tag: "yellow" }
];

const movements = [
  { item: "Leite integral", quantity: "12 L", destination: "Famílias atendidas", date: "2026-05-20", note: "Distribuição emergencial" },
  { item: "Arroz tipo 1", quantity: "30 kg", destination: "Cestas mensais", date: "2026-05-18", note: "Montagem de cestas" }
];

const labels = {
  critico: ["Crítico", "red"],
  atencao: ["Atenção", "yellow"],
  ok: ["Seguro", "green"]
};

const titles = new Map([...document.querySelectorAll(".view")].map((view) => [view.id, view.dataset.title]));
const title = document.querySelector("#page-title");
const toast = document.querySelector("#toast");
let currentFilter = "todos";

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2800);
}

function switchView(viewId) {
  document.querySelectorAll(".view").forEach((view) => view.classList.toggle("active", view.id === viewId));
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === viewId));
  title.textContent = titles.get(viewId) || "Pastoral";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderPriorityList() {
  const container = document.querySelector("#priority-list");
  container.innerHTML = stock
    .slice()
    .sort((a, b) => new Date(a.expiry) - new Date(b.expiry))
    .slice(0, 4)
    .map((entry) => {
      const [label, color] = labels[entry.status];
      return `
        <article class="expiry-item no-action">
          <div>
            <div class="item-title">${entry.item} <span class="pill ${color}">${label}</span></div>
            <div class="meta">${entry.quantity} - validade ${formatDate(entry.expiry)} - ${entry.donor}</div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderStock(filter = currentFilter) {
  currentFilter = filter;
  const tbody = document.querySelector("#stock-table");
  tbody.innerHTML = stock
    .filter((entry) => filter === "todos" || entry.status === filter)
    .map((entry) => {
      const [label, color] = labels[entry.status];
      return `
        <tr>
          <td><strong>${entry.item}</strong></td>
          <td>${entry.donor}</td>
          <td>${entry.quantity}</td>
          <td>${formatDate(entry.expiry)}</td>
          <td><span class="pill ${color}">${label}</span></td>
          <td>${entry.action}</td>
        </tr>
      `;
    })
    .join("");
  fillStockSelect();
}

function renderMovements() {
  const list = document.querySelector("#movement-list");
  list.innerHTML = movements
    .map((movement) => `
      <article class="movement-item">
        <div>
          <div class="item-title">${movement.item}</div>
          <div class="meta">${movement.quantity} - ${movement.destination} - ${formatDate(movement.date)}</div>
        </div>
        <span class="pill blue">${movement.note || "Saída cadastrada"}</span>
      </article>
    `)
    .join("");
}

function renderBeneficiaries() {
  document.querySelector("#beneficiary-list").innerHTML = beneficiaries
    .map((person) => `
      <article class="beneficiary-item no-action">
        <div>
          <div class="item-title">${person.name} <span class="pill ${person.tag}">${person.status}</span></div>
          <div class="meta">${person.address}</div>
          <div class="meta">${person.phone} - ${person.visit}</div>
        </div>
      </article>
    `)
    .join("");
  fillBeneficiarySelects();
}

function renderVisits() {
  document.querySelector("#visit-list").innerHTML = visits
    .map((visit, index) => `
      <article class="visit-item">
        <div class="visit-date">
          <span>${formatShortDate(visit.date)}</span>
          <span>${visit.hour}</span>
        </div>
        <div>
          <strong>${visit.person}</strong>
          <div class="meta">Voluntário: ${visit.volunteer}</div>
          ${visit.result ? `<div class="meta">Resultado: ${visit.result}</div>` : ""}
        </div>
        <span class="pill ${visit.tag}">${visit.status}</span>
        <button class="secondary-action" type="button" data-field-form="${index}">Abrir formulário de campo</button>
      </article>
    `)
    .join("");
}

function renderDonors() {
  document.querySelector("#donor-list").innerHTML = donors
    .map((donor) => `
      <article class="donor-item no-action">
        <div>
          <div class="item-title">${donor.name} <span class="pill ${donor.tag}">${donor.frequency}</span></div>
          <div class="meta">${donor.contact}</div>
          <div class="meta">Doação habitual: ${donor.type || "Não informado"}</div>
        </div>
      </article>
    `)
    .join("");
}

function fillStockSelect() {
  const select = document.querySelector("#stock-output-item");
  if (!select) return;
  select.innerHTML = stock.map((entry) => `<option value="${entry.item}">${entry.item} (${entry.quantity})</option>`).join("");
}

function fillBeneficiarySelects() {
  const options = beneficiaries.map((person) => `<option value="${person.name}">${person.name}</option>`).join("");
  const visitSelect = document.querySelector("#visit-beneficiary");
  const destinationSelect = document.querySelector("#stock-output-destination");
  if (visitSelect) visitSelect.innerHTML = options;
  if (destinationSelect) destinationSelect.innerHTML = `<option value="Famílias atendidas">Famílias atendidas</option><option value="Cestas mensais">Cestas mensais</option><option value="Organização parceira">Organização parceira</option>${options}`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" }).format(new Date(value));
}

function formatShortDate(value) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "UTC" }).format(new Date(value));
}

function openModal(id) {
  document.querySelector(`#${id}`).showModal();
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => switchView(button.dataset.view));
});

document.querySelectorAll(".segment").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".segment").forEach((segment) => segment.classList.remove("active"));
    button.classList.add("active");
    renderStock(button.dataset.filter);
  });
});

document.querySelectorAll("[data-action='open-stock-output']").forEach((button) => {
  button.addEventListener("click", () => openModal("stock-output-modal"));
});

document.querySelectorAll("[data-action='open-beneficiary']").forEach((button) => {
  button.addEventListener("click", () => openModal("beneficiary-modal"));
});

document.querySelectorAll("[data-action='open-visit-schedule']").forEach((button) => {
  button.addEventListener("click", () => openModal("visit-schedule-modal"));
});

document.querySelectorAll("[data-action='open-donor']").forEach((button) => {
  button.addEventListener("click", () => openModal("donor-modal"));
});

document.querySelectorAll("[data-close]").forEach((button) => {
  button.addEventListener("click", () => document.querySelector(`#${button.dataset.close}`).close());
});

document.querySelector("#stock-output-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  movements.unshift({
    item: data.item,
    quantity: data.quantidade,
    destination: data.destino,
    date: data.data,
    note: data.observacao || "Saída cadastrada"
  });
  const stockItem = stock.find((entry) => entry.item === data.item);
  if (stockItem) stockItem.action = `Última saída: ${data.quantidade}`;
  renderStock();
  renderPriorityList();
  renderMovements();
  event.currentTarget.reset();
  document.querySelector("#stock-output-modal").close();
  showToast("Saída de estoque cadastrada.");
});

document.querySelector("#beneficiary-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  beneficiaries.unshift({
    name: data.nome,
    phone: data.telefone,
    address: data.endereco,
    area: data.endereco,
    status: "Em análise",
    visit: "Visita domiciliar pendente",
    tag: "blue"
  });
  renderBeneficiaries();
  event.currentTarget.reset();
  document.querySelector("#beneficiary-modal").close();
  showToast("Beneficiário cadastrado com status em análise.");
});

document.querySelector("#visit-schedule-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  visits.unshift({
    date: data.data,
    hour: data.hora,
    person: data.beneficiario,
    volunteer: data.voluntario,
    status: "Agendada",
    tag: "blue",
    result: ""
  });
  renderVisits();
  event.currentTarget.reset();
  document.querySelector("#visit-schedule-modal").close();
  showToast("Visita agendada.");
});

document.querySelector("#field-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  const visit = visits[Number(data.visitIndex)];
  if (visit) {
    visit.status = data.resultado;
    visit.result = data.situacao;
    visit.tag = data.resultado === "Realizada" ? "green" : data.resultado === "Reagendar" ? "yellow" : "red";
  }
  renderVisits();
  event.currentTarget.reset();
  document.querySelector("#field-form-modal").close();
  showToast("Formulário de campo salvo.");
});

document.querySelector("#donor-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  donors.unshift({
    name: data.nome,
    frequency: data.frequencia,
    contact: `${data.whatsapp}${data.email ? ` - ${data.email}` : ""}`,
    type: data.tipo,
    tag: "green"
  });
  renderDonors();
  event.currentTarget.reset();
  document.querySelector("#donor-modal").close();
  showToast("Doador cadastrado.");
});

document.querySelector("#export-report").addEventListener("click", () => {
  showToast("Relatório exportado para PDF.");
});

document.body.addEventListener("click", (event) => {
  const fieldButton = event.target.closest("[data-field-form]");
  if (!fieldButton) return;
  const index = Number(fieldButton.dataset.fieldForm);
  const visit = visits[index];
  document.querySelector("#field-visit-index").value = index;
  document.querySelector("#field-beneficiary").value = visit.person;
  openModal("field-form-modal");
});

renderPriorityList();
renderStock();
renderMovements();
renderBeneficiaries();
renderVisits();
renderDonors();

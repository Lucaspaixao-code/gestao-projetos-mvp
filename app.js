const stock = [
  { item: "Leite integral", donor: "Mercado Bom Pão", quantity: "36 L", expiry: "2026-05-22", status: "critico", action: "Distribuir primeiro" },
  { item: "Pães embalados", donor: "Padaria Central", quantity: "80 un.", expiry: "2026-05-23", status: "critico", action: "Avisar beneficiários" },
  { item: "Feijão carioca", donor: "Família Oliveira", quantity: "42 kg", expiry: "2026-05-29", status: "atencao", action: "Reservar para cestas" },
  { item: "Arroz tipo 1", donor: "Grupo São José", quantity: "120 kg", expiry: "2026-06-16", status: "ok", action: "Manter estoque" },
  { item: "Óleo de soja", donor: "Campanha mensal", quantity: "24 un.", expiry: "2026-06-03", status: "atencao", action: "Priorizar próxima saída" },
  { item: "Macarrão", donor: "Doador anônimo", quantity: "58 pct.", expiry: "2026-07-08", status: "ok", action: "Manter estoque" }
];

const beneficiaries = [
  { name: "Maria Aparecida Santos", area: "Centro", status: "Ativo", visit: "Visita vence em 12 dias", tag: "yellow" },
  { name: "José Carlos Lima", area: "Zona Norte", status: "Em análise", visit: "Documentos pendentes", tag: "blue" },
  { name: "Ana Paula Ribeiro", area: "Vila Nova", status: "Ativo", visit: "Sem visita há 7 meses", tag: "red" },
  { name: "Rosa Ferreira", area: "Jardim São Bento", status: "Ativo", visit: "Verificado em maio", tag: "green" }
];

const visits = [
  { date: "21/05", hour: "14h30", person: "Ana Paula Ribeiro", volunteer: "Cláudia", status: "Pendente", tag: "red" },
  { date: "22/05", hour: "09h00", person: "José Carlos Lima", volunteer: "Marcos", status: "Agendada", tag: "blue" },
  { date: "24/05", hour: "15h00", person: "Maria Aparecida Santos", volunteer: "Elisa", status: "Confirmada", tag: "green" },
  { date: "27/05", hour: "10h00", person: "Rosa Ferreira", volunteer: "Paulo", status: "Retorno", tag: "yellow" },
  { date: "29/05", hour: "08h30", person: "Cadastro novo", volunteer: "Equipe 2", status: "Triagem", tag: "blue" },
  { date: "31/05", hour: "16h00", person: "Revisão mensal", volunteer: "Coordenação", status: "Planejada", tag: "green" }
];

const donors = [
  { name: "Mercado Bom Pão", frequency: "Semanal", contact: "WhatsApp validado", tag: "green" },
  { name: "Grupo São José", frequency: "Mensal", contact: "Recebe resumo mensal", tag: "blue" },
  { name: "Família Oliveira", frequency: "Quinzenal", contact: "Prefere e-mail", tag: "green" },
  { name: "Padaria Central", frequency: "Eventual", contact: "Confirmar próxima coleta", tag: "yellow" }
];

const labels = {
  critico: ["Crítico", "red"],
  atencao: ["Atenção", "yellow"],
  ok: ["Seguro", "green"]
};

const titles = new Map([...document.querySelectorAll(".view")].map((view) => [view.id, view.dataset.title]));
const title = document.querySelector("#page-title");
const toast = document.querySelector("#toast");

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
        <article class="expiry-item">
          <div>
            <div class="item-title">${entry.item} <span class="pill ${color}">${label}</span></div>
            <div class="meta">${entry.quantity} - validade ${formatDate(entry.expiry)} - ${entry.donor}</div>
          </div>
          <button class="ghost-action" type="button" data-stock-action="${entry.item}">Planejar saída</button>
        </article>
      `;
    })
    .join("");
}

function renderStock(filter = "todos") {
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
}

function renderBeneficiaries() {
  document.querySelector("#beneficiary-list").innerHTML = beneficiaries
    .map((person) => `
      <article class="beneficiary-item">
        <div>
          <div class="item-title">${person.name} <span class="pill ${person.tag}">${person.status}</span></div>
          <div class="meta">${person.area} - ${person.visit}</div>
        </div>
        <button class="ghost-action" type="button" data-schedule="${person.name}">Agendar visita</button>
      </article>
    `)
    .join("");
}

function renderVisits() {
  document.querySelector("#visit-list").innerHTML = visits
    .map((visit) => `
      <article class="visit-item">
        <div class="visit-date">
          <span>${visit.date}</span>
          <span>${visit.hour}</span>
        </div>
        <div>
          <strong>${visit.person}</strong>
          <div class="meta">Voluntário: ${visit.volunteer}</div>
        </div>
        <span class="pill ${visit.tag}">${visit.status}</span>
        <button class="secondary-action" type="button" data-visit="${visit.person}">Abrir formulário de campo</button>
      </article>
    `)
    .join("");
}

function renderDonors() {
  document.querySelector("#donor-list").innerHTML = donors
    .map((donor) => `
      <article class="donor-item">
        <div>
          <div class="item-title">${donor.name} <span class="pill ${donor.tag}">${donor.frequency}</span></div>
          <div class="meta">${donor.contact}</div>
        </div>
        <button class="ghost-action" type="button" data-donor="${donor.name}">Enviar resumo</button>
      </article>
    `)
    .join("");
}

function formatDate(value) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" }).format(new Date(value));
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => switchView(button.dataset.view));
});

document.querySelectorAll("[data-view-link]").forEach((button) => {
  button.addEventListener("click", () => switchView(button.dataset.viewLink));
});

document.querySelectorAll(".segment").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".segment").forEach((segment) => segment.classList.remove("active"));
    button.classList.add("active");
    renderStock(button.dataset.filter);
  });
});

document.querySelectorAll("[data-action='open-donation']").forEach((button) => {
  button.addEventListener("click", () => document.querySelector("#donation-modal").showModal());
});

document.querySelectorAll("[data-action='open-public-form']").forEach((button) => {
  button.addEventListener("click", () => document.querySelector("#public-form-modal").showModal());
});

document.querySelectorAll("[data-close]").forEach((button) => {
  button.addEventListener("click", () => document.querySelector(`#${button.dataset.close}`).close());
});

document.querySelector("#donation-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  stock.unshift({
    item: data.item,
    donor: data.doador,
    quantity: data.quantidade,
    expiry: data.validade,
    status: "ok",
    action: "Conferir validade"
  });
  renderStock();
  renderPriorityList();
  event.currentTarget.reset();
  document.querySelector("#donation-modal").close();
  showToast("Entrada registrada e comprovante preparado para o doador.");
});

document.querySelector("#public-donor-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  donors.unshift({ name: data.nome, frequency: data.frequencia, contact: "Boas-vindas automática enviada", tag: "green" });
  renderDonors();
  event.currentTarget.reset();
  document.querySelector("#public-form-modal").close();
  showToast("Doador cadastrado e mensagem de boas-vindas enviada.");
});

document.querySelector("#beneficiary-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  beneficiaries.unshift({ name: data.nome, area: "Sem região definida", status: "Em análise", visit: "Visita domiciliar pendente", tag: "blue" });
  renderBeneficiaries();
  event.currentTarget.reset();
  showToast("Cadastro salvo com status em análise.");
});

document.querySelector("#export-report").addEventListener("click", () => {
  showToast("Protótipo: relatório PDF gerado para prestação de contas.");
});

document.body.addEventListener("click", (event) => {
  const action = event.target.closest("[data-stock-action], [data-schedule], [data-visit], [data-donor]");
  if (!action) return;
  if (action.dataset.stockAction) showToast(`Saída planejada para ${action.dataset.stockAction}.`);
  if (action.dataset.schedule) showToast(`Visita criada para ${action.dataset.schedule}.`);
  if (action.dataset.visit) showToast(`Formulário de campo aberto para ${action.dataset.visit}.`);
  if (action.dataset.donor) showToast(`Resumo mensal preparado para ${action.dataset.donor}.`);
});

renderPriorityList();
renderStock();
renderBeneficiaries();
renderVisits();
renderDonors();

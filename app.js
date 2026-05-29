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
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => filter === "todos" || entry.status === filter)
    .map(({ entry, index }) => {
      const [label, color] = labels[entry.status];
      return `
        <tr>
          <td><strong>${entry.item}</strong></td>
          <td>${entry.donor}</td>
          <td>${entry.quantity}</td>
          <td>${formatDate(entry.expiry)}</td>
          <td><span class="pill ${color}">${label}</span></td>
          <td>${entry.action}</td>
          <td><button class="ghost-action compact-action" type="button" data-edit-stock="${index}">Editar</button></td>
        </tr>
      `;
    })
    .join("");
  fillStockSelect();
}

function renderMovements() {
  const list = document.querySelector("#movement-list");
  list.innerHTML = movements
    .map((movement, index) => `
      <article class="movement-item editable-item">
        <div>
          <div class="item-title">${movement.item}</div>
          <div class="meta">${movement.quantity} - ${movement.destination} - ${formatDate(movement.date)}</div>
        </div>
        <div class="record-actions">
          <span class="pill blue">${movement.note || "Saída cadastrada"}</span>
          <button class="ghost-action compact-action" type="button" data-edit-movement="${index}">Editar</button>
        </div>
      </article>
    `)
    .join("");
}

function renderBeneficiaries() {
  document.querySelector("#beneficiary-list").innerHTML = beneficiaries
    .map((person, index) => `
      <article class="beneficiary-item editable-item">
        <div>
          <div class="item-title">${person.name} <span class="pill ${person.tag}">${person.status}</span></div>
          <div class="meta">${person.address}</div>
          <div class="meta">${person.phone} - ${person.visit}</div>
        </div>
        <button class="ghost-action compact-action" type="button" data-edit-beneficiary="${index}">Editar</button>
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
        <div class="record-actions">
          <button class="secondary-action" type="button" data-field-form="${index}">Abrir formulário de campo</button>
          <button class="ghost-action compact-action" type="button" data-edit-visit="${index}">Editar</button>
        </div>
      </article>
    `)
    .join("");
}

function renderDonors() {
  document.querySelector("#donor-list").innerHTML = donors
    .map((donor, index) => `
      <article class="donor-item editable-item">
        <div>
          <div class="item-title">${donor.name} <span class="pill ${donor.tag}">${donor.frequency}</span></div>
          <div class="meta">${donor.contact}</div>
          <div class="meta">Doação habitual: ${donor.type || "Não informado"}</div>
        </div>
        <button class="ghost-action compact-action" type="button" data-edit-donor="${index}">Editar</button>
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

function getStockStatus(expiry) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiryDate = new Date(`${expiry}T00:00:00`);
  const days = Math.ceil((expiryDate - today) / 86400000);
  if (days <= 3) return "critico";
  if (days <= 14) return "atencao";
  return "ok";
}

function splitQuantity(value) {
  const match = String(value).trim().match(/^([\d.,]+)\s*(.*)$/);
  return {
    amount: match ? match[1].replace(",", ".") : "",
    unit: match && match[2] ? match[2] : "kg"
  };
}

function resetForm(form, titleId, titleText, submitId, submitText) {
  form.reset();
  form.elements.editIndex.value = "";
  document.querySelector(`#${titleId}`).textContent = titleText;
  document.querySelector(`#${submitId}`).textContent = submitText;
}

function openModal(id) {
  document.querySelector(`#${id}`).showModal();
}

function openStockInput(index = null) {
  const form = document.querySelector("#stock-input-form");
  resetForm(form, "stock-input-title", "Cadastrar entrada de doação", "stock-input-submit", "Salvar entrada");
  if (index !== null) {
    const entry = stock[index];
    const quantity = splitQuantity(entry.quantity);
    form.elements.editIndex.value = index;
    form.elements.doador.value = entry.donor;
    form.elements.item.value = entry.item;
    form.elements.quantidade.value = quantity.amount;
    form.elements.unidade.value = [...form.elements.unidade.options].some((option) => option.value === quantity.unit) ? quantity.unit : "kg";
    form.elements.validade.value = entry.expiry;
    document.querySelector("#stock-input-title").textContent = "Editar entrada de doação";
    document.querySelector("#stock-input-submit").textContent = "Salvar alterações";
  }
  openModal("stock-input-modal");
}

function openStockOutput(index = null) {
  const form = document.querySelector("#stock-output-form");
  resetForm(form, "stock-output-title", "Cadastrar saída de estoque", "stock-output-submit", "Salvar saída");
  fillStockSelect();
  fillBeneficiarySelects();
  if (index !== null) {
    const movement = movements[index];
    form.elements.editIndex.value = index;
    form.elements.item.value = movement.item;
    form.elements.quantidade.value = movement.quantity;
    form.elements.destino.value = movement.destination;
    form.elements.data.value = movement.date;
    form.elements.observacao.value = movement.note || "";
    document.querySelector("#stock-output-title").textContent = "Editar saída de estoque";
    document.querySelector("#stock-output-submit").textContent = "Salvar alterações";
  }
  openModal("stock-output-modal");
}

function openBeneficiary(index = null) {
  const form = document.querySelector("#beneficiary-form");
  resetForm(form, "beneficiary-title", "Cadastrar beneficiário", "beneficiary-submit", "Salvar beneficiário");
  if (index !== null) {
    const person = beneficiaries[index];
    form.elements.editIndex.value = index;
    form.elements.nome.value = person.name;
    form.elements.telefone.value = person.phone;
    form.elements.endereco.value = person.address;
    form.elements.renda.value = person.renda || "";
    form.elements.familia.value = person.familia || "";
    document.querySelector("#beneficiary-title").textContent = "Editar beneficiário";
    document.querySelector("#beneficiary-submit").textContent = "Salvar alterações";
  }
  openModal("beneficiary-modal");
}

function openVisitSchedule(index = null) {
  const form = document.querySelector("#visit-schedule-form");
  resetForm(form, "visit-schedule-title", "Agendar visita", "visit-schedule-submit", "Agendar");
  fillBeneficiarySelects();
  if (index !== null) {
    const visit = visits[index];
    form.elements.editIndex.value = index;
    form.elements.beneficiario.value = visit.person;
    form.elements.voluntario.value = visit.volunteer;
    form.elements.data.value = visit.date;
    form.elements.hora.value = visit.hour;
    document.querySelector("#visit-schedule-title").textContent = "Editar visita";
    document.querySelector("#visit-schedule-submit").textContent = "Salvar alterações";
  }
  openModal("visit-schedule-modal");
}

function openDonor(index = null) {
  const form = document.querySelector("#donor-form");
  resetForm(form, "donor-title", "Cadastrar doador", "donor-submit", "Salvar doador");
  if (index !== null) {
    const donor = donors[index];
    const [whatsapp, email = ""] = donor.contact.split(" - ");
    form.elements.editIndex.value = index;
    form.elements.nome.value = donor.name;
    form.elements.whatsapp.value = whatsapp;
    form.elements.email.value = email;
    form.elements.frequencia.value = donor.frequency;
    form.elements.tipo.value = donor.type || "";
    document.querySelector("#donor-title").textContent = "Editar doador";
    document.querySelector("#donor-submit").textContent = "Salvar alterações";
  }
  openModal("donor-modal");
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
  button.addEventListener("click", () => openStockOutput());
});

document.querySelectorAll("[data-action='open-stock-input']").forEach((button) => {
  button.addEventListener("click", () => openStockInput());
});

document.querySelectorAll("[data-action='open-beneficiary']").forEach((button) => {
  button.addEventListener("click", () => openBeneficiary());
});

document.querySelectorAll("[data-action='open-visit-schedule']").forEach((button) => {
  button.addEventListener("click", () => openVisitSchedule());
});

document.querySelectorAll("[data-action='open-donor']").forEach((button) => {
  button.addEventListener("click", () => openDonor());
});

document.querySelectorAll("[data-close]").forEach((button) => {
  button.addEventListener("click", () => document.querySelector(`#${button.dataset.close}`).close());
});

document.querySelector("#stock-output-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  const nextMovement = {
    item: data.item,
    quantity: data.quantidade,
    destination: data.destino,
    date: data.data,
    note: data.observacao || "Saída cadastrada"
  };
  if (data.editIndex !== "") {
    movements[Number(data.editIndex)] = nextMovement;
  } else {
    movements.unshift(nextMovement);
  }
  const stockItem = stock.find((entry) => entry.item === data.item);
  if (stockItem) stockItem.action = `Última saída: ${data.quantidade}`;
  renderStock();
  renderPriorityList();
  renderMovements();
  resetForm(event.currentTarget, "stock-output-title", "Cadastrar saída de estoque", "stock-output-submit", "Salvar saída");
  document.querySelector("#stock-output-modal").close();
  showToast(data.editIndex !== "" ? "Saída de estoque atualizada." : "Saída de estoque cadastrada.");
});

document.querySelector("#stock-input-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  const nextEntry = {
    item: data.item,
    donor: data.doador,
    quantity: `${data.quantidade} ${data.unidade}`,
    expiry: data.validade,
    status: getStockStatus(data.validade),
    action: data.editIndex !== "" ? "Entrada atualizada" : "Entrada cadastrada"
  };
  if (data.editIndex !== "") {
    stock[Number(data.editIndex)] = nextEntry;
  } else {
    stock.unshift(nextEntry);
  }
  renderStock("todos");
  document.querySelectorAll(".segment").forEach((segment) => segment.classList.toggle("active", segment.dataset.filter === "todos"));
  renderPriorityList();
  resetForm(event.currentTarget, "stock-input-title", "Cadastrar entrada de doação", "stock-input-submit", "Salvar entrada");
  document.querySelector("#stock-input-modal").close();
  showToast(data.editIndex !== "" ? "Entrada de doação atualizada." : "Entrada de doação cadastrada.");
});

document.querySelector("#beneficiary-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  const current = data.editIndex !== "" ? beneficiaries[Number(data.editIndex)] : {};
  const nextPerson = {
    name: data.nome,
    phone: data.telefone,
    address: data.endereco,
    area: data.endereco,
    renda: data.renda,
    familia: data.familia,
    status: current.status || "Em análise",
    visit: current.visit || "Visita domiciliar pendente",
    tag: current.tag || "blue"
  };
  if (data.editIndex !== "") {
    beneficiaries[Number(data.editIndex)] = nextPerson;
  } else {
    beneficiaries.unshift(nextPerson);
  }
  renderBeneficiaries();
  renderVisits();
  resetForm(event.currentTarget, "beneficiary-title", "Cadastrar beneficiário", "beneficiary-submit", "Salvar beneficiário");
  document.querySelector("#beneficiary-modal").close();
  showToast(data.editIndex !== "" ? "Beneficiário atualizado." : "Beneficiário cadastrado com status em análise.");
});

document.querySelector("#visit-schedule-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  const current = data.editIndex !== "" ? visits[Number(data.editIndex)] : {};
  const nextVisit = {
    date: data.data,
    hour: data.hora,
    person: data.beneficiario,
    volunteer: data.voluntario,
    status: current.status || "Agendada",
    tag: current.tag || "blue",
    result: current.result || ""
  };
  if (data.editIndex !== "") {
    visits[Number(data.editIndex)] = nextVisit;
  } else {
    visits.unshift(nextVisit);
  }
  renderVisits();
  resetForm(event.currentTarget, "visit-schedule-title", "Agendar visita", "visit-schedule-submit", "Agendar");
  document.querySelector("#visit-schedule-modal").close();
  showToast(data.editIndex !== "" ? "Visita atualizada." : "Visita agendada.");
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
  const nextDonor = {
    name: data.nome,
    frequency: data.frequencia,
    contact: `${data.whatsapp}${data.email ? ` - ${data.email}` : ""}`,
    type: data.tipo,
    tag: "green"
  };
  if (data.editIndex !== "") {
    donors[Number(data.editIndex)] = nextDonor;
  } else {
    donors.unshift(nextDonor);
  }
  renderDonors();
  resetForm(event.currentTarget, "donor-title", "Cadastrar doador", "donor-submit", "Salvar doador");
  document.querySelector("#donor-modal").close();
  showToast(data.editIndex !== "" ? "Doador atualizado." : "Doador cadastrado.");
});

document.querySelector("#export-report").addEventListener("click", () => {
  showToast("Relatório exportado para PDF.");
});

document.body.addEventListener("click", (event) => {
  const fieldButton = event.target.closest("[data-field-form]");
  const stockButton = event.target.closest("[data-edit-stock]");
  const movementButton = event.target.closest("[data-edit-movement]");
  const beneficiaryButton = event.target.closest("[data-edit-beneficiary]");
  const visitButton = event.target.closest("[data-edit-visit]");
  const donorButton = event.target.closest("[data-edit-donor]");

  if (fieldButton) {
    const index = Number(fieldButton.dataset.fieldForm);
    const visit = visits[index];
    document.querySelector("#field-visit-index").value = index;
    document.querySelector("#field-beneficiary").value = visit.person;
    openModal("field-form-modal");
  }
  if (stockButton) openStockInput(Number(stockButton.dataset.editStock));
  if (movementButton) openStockOutput(Number(movementButton.dataset.editMovement));
  if (beneficiaryButton) openBeneficiary(Number(beneficiaryButton.dataset.editBeneficiary));
  if (visitButton) openVisitSchedule(Number(visitButton.dataset.editVisit));
  if (donorButton) openDonor(Number(donorButton.dataset.editDonor));
});

renderPriorityList();
renderStock();
renderMovements();
renderBeneficiaries();
renderVisits();
renderDonors();

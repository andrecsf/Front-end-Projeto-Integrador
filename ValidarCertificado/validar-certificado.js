const sidebar = document.getElementById('sidebar');
const main = document.querySelector('.main');

// Toggle sidebar
document.querySelector('.sidebar-header').addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
  main.classList.toggle('expanded');
});

// ELEMENTOS
const avatar = document.getElementById('avatar');
const profileName = document.getElementById('profile-name');
const infoNome = document.getElementById('info-nome');
const infoAtiv = document.getElementById('info-atividade');
const infoCategoria = document.getElementById('info-categoria');
const infoData = document.getElementById('info-data');
const infoCarga = document.getElementById('info-carga');
const docName = document.getElementById('doc-name');

const btnVer = document.getElementById('btnVer');
const justificativa = document.getElementById('justificativa');
const btnApprove = document.getElementById('btn-approve');
const btnReject = document.getElementById('btn-reject');

const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalSub = document.getElementById('modal-sub');
const modalCancel = document.getElementById('modal-cancel');
const modalConfirm = document.getElementById('modal-confirm');

const toast = document.getElementById('toast');

let pendingAction = null;
let dataGlobal = null;

// URL
const urlParams = new URLSearchParams(window.location.search);
const submissaoId = urlParams.get('id');

// Toast
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

// Modal
function abrirModal() { modal.style.display = "flex"; }
function fecharModal() { modal.style.display = "none"; }

// API
async function getData() {
  const res = await fetch(`http://localhost:8080/submissoes/${submissaoId}`);
  return res.json();
}

// Preencher
async function preencherDados() {
  const data = await getData();
  dataGlobal = data;

  avatar.textContent = data.nomeAluno?.substring(0, 2).toUpperCase();
  profileName.textContent = data.nomeAluno;
  infoNome.textContent = data.nomeAluno;
  infoAtiv.textContent = data.nomeCategoria;
  infoCategoria.textContent = data.nomeCategoria;
  infoData.textContent = new Date(data.dataEnvio).toLocaleDateString('pt-BR');
  infoCarga.textContent = data.horasAproveitadas + "h";
  docName.textContent = data.urlCertificado ? "Certificado anexado" : "—";
}

// Ver PDF
btnVer.addEventListener("click", () => {
  if (dataGlobal?.urlCertificado) {
    window.open(dataGlobal.urlCertificado, "_blank");
  }
});

// Aprovar
btnApprove.addEventListener("click", () => {
  pendingAction = "approve";
  modalTitle.textContent = "Aprovar?";
  modalSub.textContent = "Deseja aprovar?";
  abrirModal();
});

// Reprovar
btnReject.addEventListener("click", () => {
  justificativa.disabled = false;
  pendingAction = "reject";
  modalTitle.textContent = "Reprovar?";
  modalSub.textContent = "Deseja reprovar?";
  abrirModal();
});

modalCancel.addEventListener("click", fecharModal);

// Confirmar ação
modalConfirm.addEventListener("click", async () => {
  if (pendingAction === "reject" && !justificativa.value.trim()) {
    showToast("Informe a justificativa!");
    return;
  }

  fecharModal();

  const endpoint = pendingAction === "approve" ? "aprovar" : "rejeitar";

  await fetch(`http://localhost:8080/submissoes/${submissaoId}/${endpoint}`, {
    method: "PUT",
    body: pendingAction === "reject" ? justificativa.value : null
  });

  showToast("Atualizado!");
});

preencherDados();

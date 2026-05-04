/* ============================================================
   JS ATUALIZADO PARA DOWNLOAD DO BANCO DE DADOS
============================================================ */

const sidebar = document.getElementById('sidebar');
const btnOpenSidebar = document.getElementById('openMenu');
const btnCloseSidebar = document.getElementById('closeMenu');

const avatar = document.getElementById('avatar');
const profileName = document.getElementById('profile-name');
const profileSub = document.getElementById('profile-sub');
const progressFill = document.getElementById('progress-fill');
const progressPct = document.getElementById('progress-pct');

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

// Captura o ID da submissão na URL
const urlParams = new URLSearchParams(window.location.search);
const submissaoId = urlParams.get('id');

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => { toast.classList.remove("show"); }, 3000);
}

function abrirModal() { modal.style.display = "flex"; }
function fecharModal() { modal.style.display = "none"; }

function desabilitarBotoes() {
  btnApprove.disabled = true;
  btnReject.disabled = true;
  btnApprove.style.opacity = "0.5";
  btnReject.style.opacity = "0.5";
}

// Sidebars
btnOpenSidebar.addEventListener('click', (e) => {
  e.stopPropagation();
  sidebar.classList.add('active');
});

btnCloseSidebar.addEventListener('click', () => { sidebar.classList.remove('active'); });

document.addEventListener('click', (event) => {
  if (!sidebar.contains(event.target) && !btnOpenSidebar.contains(event.target)) {
    sidebar.classList.remove('active');
  }
});

// API Get
async function getData() {
  try {
    if (!submissaoId) throw new Error("ID não informado");
    const response = await fetch(`http://localhost:8080/submissoes/${submissaoId}`);
    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(error);
    showToast("❌ Erro ao carregar dados");
    return null;
  }
}

// Preenche a tela
async function preencherDados() {
  if (!submissaoId) { showToast("⚠️ URL sem ID."); return; }
  const data = await getData();
  if (!data) return;
  dataGlobal = data;

  avatar.textContent = data.nomeAluno ? data.nomeAluno.substring(0, 2).toUpperCase() : "--";
  profileName.textContent = data.nomeAluno || "—";
  profileSub.textContent = "Horas complementares";
  infoNome.textContent = data.nomeAluno || "—";
  infoAtiv.textContent = data.nomeCategoria || "—";
  infoCategoria.textContent = data.nomeCategoria || "—";
  infoData.textContent = data.dataEnvio ? new Date(data.dataEnvio).toLocaleDateString('pt-BR') : "—";
  infoCarga.textContent = data.horasAproveitadas ? data.horasAproveitadas + "h" : "—";
  docName.textContent = data.urlCertificado ? "Certificado Anexado" : "—";

  if (data.status && data.status !== "PENDENTE") desabilitarBotoes();
}

// BOTÃO VER: Abre a URL de download gerada pelo Backend no MySQL
btnVer.addEventListener("click", () => {
  const urlDownload = dataGlobal?.urlCertificado;
  if (urlDownload) {
      window.open(urlDownload, '_blank');
  } else {
      showToast("⚠️ Nenhum arquivo anexado.");
  }
});

// Modal de ações
btnApprove.addEventListener("click", () => {
  pendingAction = "approve";
  modalTitle.textContent = "Confirmar Aprovação";
  modalSub.textContent = "Deseja aprovar este certificado?";
  abrirModal();
});

btnReject.addEventListener("click", () => {
  justificativa.disabled = false;
  justificativa.focus();
  pendingAction = "reject";
  modalTitle.textContent = "Confirmar Reprovação";
  modalSub.textContent = "Deseja reprovar este certificado?";
  abrirModal();
});

modalCancel.addEventListener("click", fecharModal);

modalConfirm.addEventListener("click", async () => {
  if (pendingAction === "reject" && !justificativa.value.trim()) {
    showToast("⚠️ Informe a justificativa!");
    return;
  }
  fecharModal();
  try {
    const endpoint = pendingAction === "approve" ? "aprovar" : "rejeitar";
    const url = `http://localhost:8080/submissoes/${submissaoId}/${endpoint}`;
    const config = { method: "PUT", headers: {} };
    if (pendingAction === "reject") {
      config.headers["Content-Type"] = "text/plain";
      config.body = justificativa.value.trim();
    }
    const response = await fetch(url, config);
    if (!response.ok) throw new Error("Erro ao atualizar");
    showToast(pendingAction === "approve" ? "✅ Aprovado!" : "❌ Reprovado!");
    desabilitarBotoes();
  } catch (error) {
    console.error(error);
    showToast("❌ Erro ao enviar status");
  }
});

// Inicia
preencherDados();
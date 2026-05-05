// =========================
// SIDEBAR
// =========================
const sidebar = document.getElementById('sidebar');
const main = document.querySelector('.main');

document.querySelector('.sidebar-header').addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
  main.classList.toggle('expanded');
});

// =========================
// ELEMENTOS
// =========================
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

// =========================
// PDF MODAL
// =========================
const pdfModal = document.getElementById('pdfModal');
const pdfFrame = document.getElementById('pdfFrame');
const closePdfModal = document.getElementById('closePdfModal');

// =========================
// ESTADO
// =========================
let pendingAction = null;
let dataGlobal = null;

// =========================
// URL PARAM
// =========================
const urlParams = new URLSearchParams(window.location.search);
const submissaoId = urlParams.get('id');

// =========================
// AUTH FETCH (COM MELHORIAS)
// =========================
function getToken() {
  return localStorage.getItem('token');
}

async function authFetch(url, options = {}) {
  const token = getToken();

  if (!token) {
    window.location.href = "/login.html";
    throw new Error("Sem token");
  }

  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      ...(options.body && { 'Content-Type': 'application/json' }),
      ...(options.headers || {})
    }
  });

  // 🔥 tratamento automático de erro
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('token');
    window.location.href = "/login.html";
    throw new Error("Sessão expirada");
  }

  return res;
}

// =========================
// TOAST
// =========================
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

// =========================
// MODAL CONFIRMAÇÃO
// =========================
function abrirModal() {
  modal.style.display = "flex";
}

function fecharModal() {
  modal.style.display = "none";
}

// =========================
// PDF MODAL
// =========================
function abrirPdfModal(url) {
  pdfFrame.src = url;
  pdfModal.style.display = "flex";
}

function fecharPdfModal() {
  pdfModal.style.display = "none";
  pdfFrame.src = "";
}

closePdfModal.addEventListener('click', fecharPdfModal);

pdfModal.addEventListener('click', (e) => {
  if (e.target === pdfModal) {
    fecharPdfModal();
  }
});

// =========================
// 🔥 NOVA FUNÇÃO (CORRETA)
// =========================
async function abrirPdfSeguro(url) {
  try {
    showToast("Carregando PDF...");

    const res = await authFetch(url);

    if (!res.ok) {
      throw new Error("Erro ao carregar certificado");
    }

    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);

    abrirPdfModal(blobUrl);

  } catch (error) {
    console.error(error);
    showToast(error.message);
  }
}

// =========================
// API
// =========================
async function getData() {
  const res = await authFetch(
    `http://localhost:8080/submissoes/${submissaoId}`
  );

  if (!res.ok) {
    throw new Error("Erro ao buscar submissão");
  }

  return res.json();
}

// =========================
// PREENCHER DADOS
// =========================
async function preencherDados() {
  try {
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

  } catch (error) {
    console.error(error);
    showToast(error.message);
  }
}

// =========================
// BOTÃO VER (CORRIGIDO)
// =========================
btnVer.addEventListener("click", () => {
  if (dataGlobal?.urlCertificado) {
    abrirPdfSeguro(dataGlobal.urlCertificado); // 🔥 corrigido
  } else {
    showToast("Nenhum certificado encontrado");
  }
});

// =========================
// APROVAR
// =========================
btnApprove.addEventListener("click", () => {
  pendingAction = "approve";
  modalTitle.textContent = "Aprovar?";
  modalSub.textContent = "Deseja aprovar esta submissão?";
  abrirModal();
});

// =========================
// REPROVAR
// =========================
btnReject.addEventListener("click", () => {
  justificativa.disabled = false;
  pendingAction = "reject";
  modalTitle.textContent = "Reprovar?";
  modalSub.textContent = "Deseja reprovar esta submissão?";
  abrirModal();
});

// =========================
// CANCELAR MODAL
// =========================
modalCancel.addEventListener("click", fecharModal);

// =========================
// CONFIRMAR AÇÃO
// =========================
modalConfirm.addEventListener("click", async () => {
  try {
    if (pendingAction === "reject" && !justificativa.value.trim()) {
      showToast("Informe a justificativa!");
      return;
    }

    fecharModal();

    const endpoint =
      pendingAction === "approve" ? "aprovar" : "rejeitar";

    const body =
      pendingAction === "reject"
        ? JSON.stringify({ justificativa: justificativa.value })
        : null;

    const res = await authFetch(
      `http://localhost:8080/submissoes/${submissaoId}/${endpoint}`,
      {
        method: "PUT",
        body: body
      }
    );

    if (!res.ok) {
      throw new Error("Erro ao atualizar submissão");
    }

    showToast("Atualizado com sucesso!");

  } catch (error) {
    console.error(error);
    showToast(error.message);
  }
});

// =========================
// INIT
// =========================
preencherDados();
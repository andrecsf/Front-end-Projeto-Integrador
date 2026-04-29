/* ============================================================
   1. SELEÇÃO DE ELEMENTOS
============================================================ */
// Sidebar
const sidebar = document.getElementById('sidebar');
const btnOpenSidebar = document.getElementById('openMenu');
const btnCloseSidebar = document.getElementById('closeMenu');

// Elementos de Perfil e Dados
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

// Botão ver
const btnVer = document.getElementById('btnVer');

// Justificativa e Botões Principais
const justificativa = document.getElementById('justificativa');
const btnApprove = document.getElementById('btn-approve');
const btnReject = document.getElementById('btn-reject');

// Modal
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalSub = document.getElementById('modal-sub');
const modalCancel = document.getElementById('modal-cancel');
const modalConfirm = document.getElementById('modal-confirm');

// Toast
const toast = document.getElementById('toast');

// Estado da ação (aprovar/reprovar)
let pendingAction = null;

// 🔥 Armazena os dados vindos da API (cache local)
let dataGlobal = null;


/* ============================================================
   2. FUNÇÕES DE SUPORTE
============================================================ */

/**
 * Exibe mensagem temporária (toast)
 */
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

/**
 * Abre modal de confirmação
 */
function abrirModal() {
  modal.style.display = "flex";
}

/**
 * Fecha modal
 */
function fecharModal() {
  modal.style.display = "none";
}


/* ============================================================
   3. CONTROLE DA SIDEBAR
============================================================ */

// Abre sidebar
btnOpenSidebar.addEventListener('click', (e) => {
  e.stopPropagation();
  sidebar.classList.add('active');
});

// Fecha pelo botão
btnCloseSidebar.addEventListener('click', () => {
  sidebar.classList.remove('active');
});

// Fecha clicando fora
document.addEventListener('click', (event) => {
  if (!sidebar.contains(event.target) && !btnOpenSidebar.contains(event.target)) {
    sidebar.classList.remove('active');
  }
});


/* ============================================================
   4. REQUISIÇÃO AO BACKEND (GET)
============================================================ */

/**
 * Busca dados do certificado no backend
 */
async function getData() {
  try {
    const response = await fetch("http://localhost:8080/certificados/1");

    if (!response.ok) {
      throw new Error("Erro HTTP");
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error("Erro ao buscar API:", error);

    // ⚠️ Não trava a aplicação, apenas alerta
    showToast("⚠️ Não foi possível carregar dados do servidor");

    return null;
  }
}


/* ============================================================
   5. PREENCHIMENTO DA TELA
============================================================ */

/**
 * Preenche os dados na interface
 */
async function preencherDados() {
  const data = await getData();

  // 🔥 Se falhar, não quebra a tela
  if (!data) return;

  // Salva globalmente (usado no botão "Ver")
  dataGlobal = data;

  // Avatar com iniciais
  avatar.textContent = data.alunoNome?.substring(0, 2).toUpperCase() || "--";

  // Nome e infos
  profileName.textContent = data.alunoNome || "—";
  profileSub.textContent = "Horas complementares";

  // (Caso não tenha no DTO ainda)
  progressFill.style.width = "0%";
  progressPct.textContent = "0%";

  // Dados principais
  infoNome.textContent = data.alunoNome;
  infoAtiv.textContent = data.atividade;
  infoCategoria.textContent = data.categoria;
  infoData.textContent = data.data;
  infoCarga.textContent = data.cargaHoraria + "h";

  // Documento
  docName.textContent = data.arquivo;
}


/* ============================================================
   6. BOTÃO "VER CERTIFICADO"
============================================================ */

/**
 * Navega para tela de visualização
 * ✔ Funciona com API
 * ✔ Funciona mesmo sem API (fallback)
 */
btnVer.addEventListener("click", () => {

  let arquivo;

  // 🔥 Usa API se disponível
  if (dataGlobal && dataGlobal.arquivo) {
    arquivo = dataGlobal.arquivo;
  } else {
    // 🔥 Fallback (evita travar navegação)
    arquivo = "certificado_exemplo.pdf";
  }

  const url = `../VisualizarCertificado/visualizar-certificado.html?arquivo=${encodeURIComponent(arquivo)}`;

  console.log("Redirecionando para:", url);

  window.location.href = url;
});


/* ============================================================
   7. APROVAÇÃO / REPROVAÇÃO
============================================================ */

// Aprovar
btnApprove.addEventListener("click", () => {
  pendingAction = "approve";
  modalTitle.textContent = "Confirmar Aprovação";
  modalSub.textContent = "Deseja aprovar este certificado e somar as horas?";
  abrirModal();
});

// Reprovar
btnReject.addEventListener("click", () => {
  justificativa.disabled = false;
  justificativa.focus();

  pendingAction = "reject";
  modalTitle.textContent = "Confirmar Reprovação";
  modalSub.textContent = "Tem certeza que deseja reprovar este certificado?";
  abrirModal();
});

// Cancelar modal
modalCancel.addEventListener("click", fecharModal);

// Confirmar ação
modalConfirm.addEventListener("click", () => {

  // Validação obrigatória na reprovação
  if (pendingAction === "reject" && !justificativa.value.trim()) {
    showToast("⚠️ Informe o motivo da reprovação!");
    return;
  }

  fecharModal();

  if (pendingAction === "approve") {
    showToast("✅ Certificado aprovado com sucesso!");
  } else {
    showToast("❌ Certificado reprovado.");
    justificativa.disabled = true;
  }
});


/* ============================================================
   8. INICIALIZAÇÃO
============================================================ */

// Carrega dados ao abrir página
preencherDados();
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
const infoData = document.getElementById('info-data');
const infoCarga = document.getElementById('info-carga');
const docName = document.getElementById('doc-name');

// 🔥 ADICIONADO AQUI
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

// Toast (Notificação)
const toast = document.getElementById('toast');

// Estado da ação (Aprovar ou Reprovar)
let pendingAction = null;

/* ============================================================
   2. FUNÇÕES DE SUPORTE (NOTIFICAÇÃO E MODAL)
============================================================ */

// Função para mostrar o Toast
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  
  // Remove a notificação após 3 segundos
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

function abrirModal() {
  modal.style.display = "flex";
}

function fecharModal() {
  modal.style.display = "none";
}

/* ============================================================
   3. CONTROLE DA SIDEBAR (DIREITA)
============================================================ */

// Abre a sidebar
btnOpenSidebar.addEventListener('click', (e) => {
  e.stopPropagation();
  sidebar.classList.add('active');
});

// Fecha no botão X
btnCloseSidebar.addEventListener('click', () => {
  sidebar.classList.remove('active');
});

// Fecha ao clicar fora da sidebar
document.addEventListener('click', (event) => {
  if (!sidebar.contains(event.target) && !btnOpenSidebar.contains(event.target)) {
    sidebar.classList.remove('active');
  }
});

/* ============================================================
   4. LÓGICA DE DADOS (MOCK) E PREENCHIMENTO
============================================================ */

function getData() {
  return {
    aluno: {
      nome: "João Silva",
      iniciais: "JS",
      horasCumpridas: 120,
      horasTotal: 200
    },
    certificado: {
      atividade: "Hackathon 2026",
      data: "14/03/2026",
      cargaHoraria: "20h",
      arquivo: "certificado_final.pdf"
    }
  };
}

function preencherDados() {
  const data = getData();

  avatar.textContent = data.aluno.iniciais;
  profileName.textContent = data.aluno.nome;
  profileSub.textContent = `${data.aluno.horasCumpridas}h / ${data.aluno.horasTotal}h obrigatórias`;

  const pct = Math.round((data.aluno.horasCumpridas / data.aluno.horasTotal) * 100);
  progressFill.style.width = pct + "%";
  progressPct.textContent = pct + "%";

  infoNome.textContent = data.aluno.nome;
  infoAtiv.textContent = data.certificado.atividade;
  infoData.textContent = data.certificado.data;
  infoCarga.textContent = data.certificado.cargaHoraria;
  docName.textContent = data.certificado.arquivo;
}

/* ============================================================
   🔥 4.1 EVENTO DO BOTÃO "VER" (ADICIONADO)
============================================================ */

btnVer.addEventListener("click", () => {
  const data = getData();
  const arquivo = data.certificado.arquivo;

  window.location.href = `../VisualizarCertificado/visualizar-certificado.html?arquivo=${arquivo}`;
});

/* ============================================================
   5. EVENTOS DE APROVAÇÃO / REPROVAÇÃO
============================================================ */

btnApprove.addEventListener("click", () => {
  pendingAction = "approve";
  modalTitle.textContent = "Confirmar Aprovação";
  modalSub.textContent = "Deseja aprovar este certificado e somar as horas?";
  abrirModal();
});

btnReject.addEventListener("click", () => {
  // Libera a escrita na justificativa
  justificativa.disabled = false;
  justificativa.focus();

  pendingAction = "reject";
  modalTitle.textContent = "Confirmar Reprovação";
  modalSub.textContent = "Tem certeza que deseja reprovar este certificado?";
  abrirModal();
});

modalCancel.addEventListener("click", fecharModal);

modalConfirm.addEventListener("click", () => {
  // Validação: se for reprova, precisa de texto na justificativa
  if (pendingAction === "reject" && !justificativa.value.trim()) {
    showToast("⚠️ Erro: Informe o motivo da reprovação!");
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
   6. INICIALIZAÇÃO
============================================================ */
preencherDados();
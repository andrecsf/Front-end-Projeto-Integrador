/* ============================================================
   1. SELEÇÃO DE ELEMENTOS
============================================================ */

// Sidebar (menu lateral)
const sidebar = document.getElementById('sidebar');
const btnOpenSidebar = document.getElementById('openMenu');
const btnCloseSidebar = document.getElementById('closeMenu');

// Perfil do aluno (topo)
const avatar = document.getElementById('avatar');
const profileName = document.getElementById('profile-name');
const profileSub = document.getElementById('profile-sub');
const progressFill = document.getElementById('progress-fill');
const progressPct = document.getElementById('progress-pct');

// Informações do certificado
const infoNome = document.getElementById('info-nome');
const infoAtiv = document.getElementById('info-atividade');
const infoCategoria = document.getElementById('info-categoria');
const infoData = document.getElementById('info-data');
const infoCarga = document.getElementById('info-carga');
const docName = document.getElementById('doc-name');

// Botão para visualizar o certificado
const btnVer = document.getElementById('btnVer');

// Ações principais (aprovar/reprovar)
const justificativa = document.getElementById('justificativa');
const btnApprove = document.getElementById('btn-approve');
const btnReject = document.getElementById('btn-reject');

// Elementos do modal de confirmação
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalSub = document.getElementById('modal-sub');
const modalCancel = document.getElementById('modal-cancel');
const modalConfirm = document.getElementById('modal-confirm');

// Toast (mensagens rápidas na tela)
const toast = document.getElementById('toast');

// Estado da ação atual (approve/reject)
let pendingAction = null;

// Armazena os dados retornados da API (cache local)
let dataGlobal = null;

// Captura o ID da submissão via query string (?id=1)
const urlParams = new URLSearchParams(window.location.search);
const submissaoId = urlParams.get('id');


/* ============================================================
   2. FUNÇÕES DE SUPORTE
============================================================ */

/**
 * Exibe uma notificação temporária (toast)
 */
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");

  // Remove automaticamente após 3 segundos
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

/**
 * Abre o modal de confirmação
 */
function abrirModal() {
  modal.style.display = "flex";
}

/**
 * Fecha o modal
 */
function fecharModal() {
  modal.style.display = "none";
}

/**
 * Desabilita os botões após ação concluída
 * Evita múltiplos envios
 */
function desabilitarBotoes() {
  btnApprove.disabled = true;
  btnReject.disabled = true;
  btnApprove.style.opacity = "0.5";
  btnReject.style.opacity = "0.5";
}


/* ============================================================
   3. CONTROLE DA SIDEBAR
============================================================ */

// Abre a sidebar
btnOpenSidebar.addEventListener('click', (e) => {
  e.stopPropagation(); // evita conflito com clique global
  sidebar.classList.add('active');
});

// Fecha pelo botão X
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
   4. REQUISIÇÃO AO BACKEND (GET)
============================================================ */

/**
 * Busca os dados da submissão no backend via API REST
 */
async function getData() {
  try {
    // Validação: precisa ter ID na URL
    if (!submissaoId) {
      throw new Error("ID não informado na URL");
    }

    // Requisição GET para o backend Spring
    const response = await fetch(`http://localhost:8080/submissoes/${submissaoId}`);

    // Validação de erro HTTP
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    // Retorna o JSON da API
    return await response.json();

  } catch (error) {
    console.error("Erro ao buscar API:", error);
    showToast("❌ Erro ao carregar dados");
    return null;
  }
}


/* ============================================================
   5. PREENCHIMENTO DA INTERFACE
============================================================ */

/**
 * Preenche os dados na tela com base no retorno da API
 */
async function preencherDados() {

  // Valida se o ID existe
  if (!submissaoId) {
    showToast("⚠️ URL sem ID. Use: ?id=1");
    return;
  }

  // Busca dados
  const data = await getData();
  if (!data) return;

  // Salva globalmente
  dataGlobal = data;

  // Gera iniciais do avatar
  avatar.textContent = data.nomeAluno
    ? data.nomeAluno.substring(0, 2).toUpperCase()
    : "--";

  // Dados do perfil
  profileName.textContent = data.nomeAluno || "—";
  profileSub.textContent = "Horas complementares";

  // Barra de progresso (não implementada ainda)
  progressFill.style.width = "0%";
  progressPct.textContent = "0%";

  // Dados principais
  infoNome.textContent = data.nomeAluno || "—";
  infoAtiv.textContent = data.nomeCategoria || "—";
  infoCategoria.textContent = data.nomeCategoria || "—";

  // Formatação da data (ISO → BR)
  infoData.textContent = data.dataEnvio
    ? new Date(data.dataEnvio).toLocaleDateString('pt-BR')
    : "—";

  // Carga horária
  infoCarga.textContent = data.horasAproveitadas
    ? data.horasAproveitadas + "h"
    : "—";

  // Nome/URL do documento
  docName.textContent = data.urlCertificado || "—";

  // Se já foi aprovado/rejeitado → bloqueia ações
  if (data.status && data.status !== "PENDENTE") {
    desabilitarBotoes();
  }
}


/* ============================================================
   6. BOTÃO "VER CERTIFICADO"
============================================================ */

/**
 * Redireciona para a tela de visualização do certificado
 */
btnVer.addEventListener("click", () => {

  // Usa arquivo da API ou fallback
  const arquivo = dataGlobal?.urlCertificado || "certificado_exemplo.pdf";

  // Monta URL da outra tela
  const url = `../VisualizarCertificado/visualizar-certificado.html?arquivo=${encodeURIComponent(arquivo)}`;

  console.log("Redirecionando para:", url);

  // Navegação
  window.location.href = url;
});


/* ============================================================
   7. APROVAÇÃO / REPROVAÇÃO
============================================================ */

// Clique em Aprovar
btnApprove.addEventListener("click", () => {
  pendingAction = "approve";
  modalTitle.textContent = "Confirmar Aprovação";
  modalSub.textContent = "Deseja aprovar este certificado?";
  abrirModal();
});

// Clique em Reprovar
btnReject.addEventListener("click", () => {
  justificativa.disabled = false;
  justificativa.focus();

  pendingAction = "reject";
  modalTitle.textContent = "Confirmar Reprovação";
  modalSub.textContent = "Deseja reprovar este certificado?";
  abrirModal();
});

// Cancelar ação
modalCancel.addEventListener("click", fecharModal);

// Confirmar ação → envia para o backend
modalConfirm.addEventListener("click", async () => {

  // Validação obrigatória
  if (pendingAction === "reject" && !justificativa.value.trim()) {
    showToast("⚠️ Informe a justificativa!");
    return;
  }

  fecharModal();

  try {

    // Monta payload conforme ação
    const body = pendingAction === "approve"
      ? { status: "APROVADO" }
      : {
          status: "REJEITADO",
          observacaoCoordenador: justificativa.value.trim()
        };

    // Requisição PUT para atualizar status
    const response = await fetch(
      `http://localhost:8080/submissoes/${submissaoId}/status`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }
    );

    if (!response.ok) throw new Error("Erro ao atualizar");

    // Feedback visual
    showToast(
      pendingAction === "approve"
        ? "✅ Aprovado com sucesso!"
        : "❌ Reprovado com sucesso!"
    );

    // Bloqueia ações após envio
    desabilitarBotoes();

  } catch (error) {
    console.error(error);
    showToast("❌ Erro ao enviar status");
  }
});


/* ============================================================
   8. INICIALIZAÇÃO
============================================================ */

// Dispara carregamento inicial da tela
preencherDados();
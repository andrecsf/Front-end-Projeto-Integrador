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
const avatar          = document.getElementById('avatar');
const profileName     = document.getElementById('profile-name');
const statusBadge     = document.getElementById('status-badge');
const progressFill    = document.getElementById('progress-fill');
const progressPct     = document.getElementById('progress-pct');

const infoNome        = document.getElementById('info-nome');
const infoCategoria   = document.getElementById('info-categoria');
const infoData        = document.getElementById('info-data');
const infoCarga       = document.getElementById('info-carga');
const infoStatus      = document.getElementById('info-status');

const docName         = document.getElementById('doc-name');
const btnVer          = document.getElementById('btnVer');
const justificativa   = document.getElementById('justificativa');

const btnApprove      = document.getElementById('btn-approve');
const btnReject       = document.getElementById('btn-reject');
const actionsContainer    = document.getElementById('actions-container');
const alreadyProcessed    = document.getElementById('already-processed');
const obsCard         = document.getElementById('obs-card');
const obsTexto        = document.getElementById('obs-texto');

const modal           = document.getElementById('modal');
const modalTitle      = document.getElementById('modal-title');
const modalSub        = document.getElementById('modal-sub');
const modalCancel     = document.getElementById('modal-cancel');
const modalConfirm    = document.getElementById('modal-confirm');
const toast           = document.getElementById('toast');

const pdfModal        = document.getElementById('pdfModal');
const pdfFrame        = document.getElementById('pdfFrame');
const pdfLoading      = document.getElementById('pdf-loading');
const closePdfModal   = document.getElementById('closePdfModal');

// =========================
// ESTADO
// =========================
let pendingAction = null;
let dataGlobal    = null;
let currentBlobUrl = null; // para liberar memória do blob anterior

// =========================
// URL PARAM
// =========================
const urlParams    = new URLSearchParams(window.location.search);
const submissaoId  = urlParams.get('id');

// =========================
// AUTH
// =========================
function getToken() {
  return localStorage.getItem('token');
}

async function authFetch(url, options = {}) {
  const token = getToken();

  if (!token) {
    window.location.href = '/login.html';
    throw new Error('Sem token de autenticação');
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    ...(options.headers || {})
  };

  // Só adiciona Content-Type: application/json quando body for string JSON
  if (options.body && typeof options.body === 'string') {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  return res;
}

// =========================
// TOAST
// =========================
let toastTimer = null;

function showToast(msg, type = '') {
  toast.textContent = msg;
  toast.className   = 'toast show ' + type;
  
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// =========================
// MODAL DE CONFIRMAÇÃO
// =========================
function abrirModal() {
  modal.style.display = 'flex';
}

function fecharModal() {
  modal.style.display = 'none';
}

modalCancel.addEventListener('click', fecharModal);

modal.addEventListener('click', (e) => {
  if (e.target === modal) fecharModal();
});

// =========================
// MODAL PDF
// =========================
function abrirPdfModal() {
  pdfModal.style.display = 'flex';
}

function fecharPdfModal() {
  pdfModal.style.display = 'none';
  pdfFrame.style.display = 'none';
  pdfFrame.src           = '';
  pdfLoading.style.display = 'flex';

  // Libera a URL do blob para evitar leak de memória
  if (currentBlobUrl) {
    URL.revokeObjectURL(currentBlobUrl);
    currentBlobUrl = null;
  }
}

closePdfModal.addEventListener('click', fecharPdfModal);

pdfModal.addEventListener('click', (e) => {
  if (e.target === pdfModal) fecharPdfModal();
});

// =========================
// ABRIR PDF COM AUTH
// =========================
/**
 * O endpoint /submissoes/{id}/arquivo retorna os bytes do PDF.
 * Fazemos o fetch com o token Bearer, criamos um Blob e exibimos no iframe.
 * Isso evita que o browser tente abrir a URL diretamente (sem o header de auth).
 */
async function abrirPdfSeguro(urlArquivo) {
  if (!urlArquivo) {
    showToast('Nenhum certificado encontrado.', 'error');
    return;
  }

  abrirPdfModal();
  pdfLoading.style.display = 'flex';
  pdfFrame.style.display   = 'none';

  try {
    const res = await authFetch(urlArquivo);

    if (!res.ok) {
      throw new Error(`Erro ao buscar o arquivo: ${res.status}`);
    }

    const blob = await res.blob();

    // Libera blob anterior se existir
    if (currentBlobUrl) {
      URL.revokeObjectURL(currentBlobUrl);
    }

    currentBlobUrl = URL.createObjectURL(blob);

    pdfFrame.onload = () => {
      pdfLoading.style.display = 'none';
      pdfFrame.style.display   = 'block';
    };

    pdfFrame.src = currentBlobUrl;

  } catch (error) {
    console.error('[PDF]', error);
    fecharPdfModal();
    showToast(error.message || 'Erro ao carregar o certificado.', 'error');
  }
}

// =========================
// HELPERS DE STATUS
// =========================
function statusLabel(status) {
  const map = {
    PENDENTE : 'Pendente',
    APROVADO : 'Aprovado',
    REJEITADO: 'Rejeitado'
  };
  return map[status] || status || '—';
}

function aplicarStatusBadge(status) {
  statusBadge.textContent = statusLabel(status);
  statusBadge.className   = 'status-badge ' + (status || '').toLowerCase();
}

// =========================
// BUSCAR DADOS DA API
// =========================
async function getData() {
  if (!submissaoId) throw new Error('ID da submissão não informado na URL.');
  
  const res = await authFetch(`http://localhost:8080/submissoes/${submissaoId}`);

  if (!res.ok) {
    throw new Error(`Erro ao buscar submissão (HTTP ${res.status})`);
  }

  return res.json();
}

// =========================
// PREENCHER TELA
// =========================
async function preencherDados() {
  try {
    const data = await getData();
    dataGlobal = data;

    // Perfil
    const iniciais  = (data.nomeAluno || '??').substring(0, 2).toUpperCase();
    avatar.textContent    = iniciais;
    profileName.textContent = data.nomeAluno || '—';
    aplicarStatusBadge(data.status);

    // Barra de progresso: considera 200h como meta total
    // (ajuste conforme a regra de negócio do seu sistema)
    const META_HORAS = 200;
    const horasAcum  = data.horasAproveitadas || 0;
    const pct        = Math.min(Math.round((horasAcum / META_HORAS) * 100), 100);
    progressFill.style.width = pct + '%';
    progressPct.textContent  = pct + '%';

    // Informações
    infoNome.textContent      = data.nomeAluno      || '—';
    infoCategoria.textContent = data.nomeCategoria  || '—';
    infoData.textContent      = data.dataEnvio
      ? new Date(data.dataEnvio).toLocaleDateString('pt-BR', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        })
      : '—';
    infoCarga.textContent   = (data.horasAproveitadas != null) ? data.horasAproveitadas + 'h' : '—';
    infoStatus.textContent  = statusLabel(data.status);

    // Documento
    docName.textContent = data.urlCertificado ? 'Certificado anexado' : 'Nenhum arquivo';
    btnVer.disabled     = !data.urlCertificado;

    // Observação do coordenador (se houver)
    if (data.observacaoCoordenador) {
      obsCard.style.display  = 'block';
      obsTexto.textContent   = data.observacaoCoordenador;
    }

    // Exibe ou oculta botões de ação conforme o status
    if (data.status === 'PENDENTE') {
      actionsContainer.style.display = 'flex';
      alreadyProcessed.style.display = 'none';
    } else {
      actionsContainer.style.display = 'none';
      alreadyProcessed.style.display = 'flex';
    }

  } catch (error) {
    console.error('[DADOS]', error);
    showToast(error.message, 'error');
  }
}



btnVer.addEventListener('click', () => {
  if (dataGlobal?.urlCertificado) {
    // Redireciona para a página de visualização passando todos os dados via query string
    const params = new URLSearchParams({
      id               : submissaoId || '',
      urlArquivo       : dataGlobal.urlCertificado,
      nomeAluno        : dataGlobal.nomeAluno        || '',
      dataEnvio        : dataGlobal.dataEnvio        || '',
      horasAproveitadas: dataGlobal.horasAproveitadas || '',
      nomeCategoria    : dataGlobal.nomeCategoria    || ''
    });
    window.location.href = `../VisualizarCertificado/visualizar-certificado.html?${params.toString()}`;
  } else {
    showToast('Nenhum certificado encontrado.', 'error');
  }
});


btnApprove.addEventListener('click', () => {
  pendingAction         = 'approve';
  modalTitle.textContent = 'Aprovar submissão?';
  modalSub.textContent   = `Deseja aprovar o certificado de "${dataGlobal?.nomeAluno || 'este aluno'}"?`;
  abrirModal();
});


btnReject.addEventListener('click', () => {
  justificativa.disabled = false;
  justificativa.focus();
  pendingAction          = 'reject';
  modalTitle.textContent = 'Reprovar submissão?';
  modalSub.textContent   = `Deseja reprovar o certificado de "${dataGlobal?.nomeAluno || 'este aluno'}"?`;
  abrirModal();
});


modalConfirm.addEventListener('click', async () => {
  try {
    if (pendingAction === 'reject' && !justificativa.value.trim()) {
      showToast('Informe a justificativa antes de reprovar!', 'error');
      fecharModal();
      justificativa.focus();
      return;
    }

    fecharModal();

    const endpoint = pendingAction === 'approve' ? 'aprovar' : 'rejeitar';

    // O backend no método rejeitar() espera @RequestBody String (texto simples)
    // NÃO enviar como JSON. Se for aprovar, sem body.
    const options = pendingAction === 'reject'
      ? {
          method : 'PUT',
          body   : justificativa.value.trim(),
          headers: { 'Content-Type': 'text/plain' }
        }
      : { method: 'PUT' };

    const res = await authFetch(
      `http://localhost:8080/submissoes/${submissaoId}/${endpoint}`,
      options
    );

    if (!res.ok) {
      const msg = await res.text().catch(() => '');
      throw new Error(msg || `Erro ao ${endpoint} (HTTP ${res.status})`);
    }

    const tipo = pendingAction === 'approve' ? 'success' : 'error';
    showToast(
      pendingAction === 'approve' ? 'Submissão aprovada com sucesso!' : 'Submissão reprovada.',
      tipo
    );

    // Atualiza a tela após a ação
    setTimeout(() => preencherDados(), 800);

  } catch (error) {
    console.error('[AÇÃO]', error);
    showToast(error.message || 'Erro ao processar a ação.', 'error');
  }
});


preencherDados();
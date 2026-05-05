/* 
   RELATÓRIOS DE ALUNOS - SCRIPT
*/

// =========================
// CONFIGURAÇÕES
// =========================
const API_BASE_URL = "http://localhost:8080";
const HORAS_OBRIGATORIAS = 200;

// =========================
// ESTADO
// =========================
let todosAlunos = [];

// =========================
// TOKEN / FETCH PROTEGIDO
// =========================
async function fetchProtegido(url, options = {}) {
    const token = localStorage.getItem('token');

    if (!token) {
        alert("Sessão expirada. Faça login novamente.");
        window.location.href = "../Login/index.html";
        return null;
    }

    const response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (response.status === 403) {
        alert("Sem permissão ou token expirado.");
        localStorage.removeItem('token');
        window.location.href = "../Login/index.html";
        return null;
    }

    return response;
}

// =========================
// HELPERS
// =========================
function getIniciais(nome) {
    if (!nome) return '?';
    return nome.trim().split(' ').filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('');
}

function classificarAluno(horas) {
    const pct = (horas / HORAS_OBRIGATORIAS) * 100;
    if (pct >= 100) return 'completo';
    if (pct >= 30)  return 'progresso';
    return 'atrasado';
}

function getCorProgresso(horas) {
    const pct = (horas / HORAS_OBRIGATORIAS) * 100;
    if (pct >= 100) return 'fill-green';
    if (pct >= 50)  return 'fill-blue';
    return 'fill-orange';
}

function getIconeTrend(horas) {
    const pct = (horas / HORAS_OBRIGATORIAS) * 100;
    if (pct >= 100) return '<i class="fa-solid fa-check trend-check"></i>';
    if (pct >= 50)  return '<i class="fa-solid fa-arrow-trend-up trend-up"></i>';
    return '<i class="fa-solid fa-arrow-trend-down trend-down"></i>';
}

// =========================
// CONTADORES
// =========================
function atualizarContadores(lista) {
    document.querySelector('.count-green').textContent  = lista.filter(a => classificarAluno(a.horasAcumuladas) === 'completo').length;
    document.querySelector('.count-blue').textContent   = lista.filter(a => classificarAluno(a.horasAcumuladas) === 'progresso').length;
    document.querySelector('.count-orange').textContent = lista.filter(a => classificarAluno(a.horasAcumuladas) === 'atrasado').length;
}

// =========================
// RENDERIZAR CARDS
// =========================
function renderCards(lista) {
    const studentsGrid = document.getElementById('studentsGrid');

    if (lista.length === 0) {
        studentsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-users-slash"></i>
                <p>Nenhum aluno encontrado.</p>
            </div>`;
        return;
    }

    studentsGrid.innerHTML = lista.map(aluno => {
        const horas    = aluno.horasAcumuladas ?? 0;
        const pct      = Math.min(Math.round((horas / HORAS_OBRIGATORIAS) * 100), 100);
        const corBarra = getCorProgresso(horas);
        const icone    = getIconeTrend(horas);
        const iniciais = getIniciais(aluno.name);

        return `
        <div class="student-card" data-id="${aluno.id}">
            <div class="card-header">
                <div class="avatar avatar-blue">${iniciais}</div>
                <div class="student-info">
                    <h3>${aluno.name}</h3>
                    <p>${horas}h / ${HORAS_OBRIGATORIAS}h obrigatórias</p>
                    ${aluno.turma ? `<small class="turma-badge">${aluno.turma}</small>` : ''}
                </div>
                ${icone}
            </div>
            <div class="progress-section">
                <div class="progress-labels">
                    <span>Progresso</span>
                    <span>${pct}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ${corBarra}" style="width: ${pct}%;"></div>
                </div>
            </div>
        </div>`;
    }).join('');

    // Clique nos cards (mantido)
    document.querySelectorAll('.student-card').forEach(card => {
        card.addEventListener('click', () => {
            const name = card.querySelector('h3').innerText;
            console.log(`Visualizando detalhes de: ${name}`);
        });
    });
}

// =========================
// FILTRO DE BUSCA
// =========================
function filtrarAlunos() {
    const termo = document.getElementById('searchInput').value.toLowerCase().trim();
    const filtrados = todosAlunos.filter(a =>
        a.name.toLowerCase().includes(termo) ||
        (a.turma     && a.turma.toLowerCase().includes(termo)) ||
        (a.matricula && a.matricula.toLowerCase().includes(termo))
    );
    atualizarContadores(filtrados);
    renderCards(filtrados);
}

// =========================
// CARREGAR ALUNOS DO BACKEND
// =========================
async function carregarAlunos() {
    const studentsGrid = document.getElementById('studentsGrid');

    studentsGrid.innerHTML = `
        <div class="loading-state">
            <i class="fa-solid fa-spinner fa-spin"></i>
            <p>Carregando alunos...</p>
        </div>`;

    try {
        const response = await fetchProtegido(`${API_BASE_URL}/alunos`);
        if (!response) return;

        if (!response.ok) throw new Error(`Erro ${response.status}`);

        todosAlunos = await response.json();
        atualizarContadores(todosAlunos);
        renderCards(todosAlunos);
    } catch (error) {
        console.error("Erro ao carregar alunos:", error);
        studentsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <p>Erro ao conectar com o servidor.</p>
            </div>`;
    }
}

// =========================
// INICIALIZAÇÃO
// =========================
document.addEventListener('DOMContentLoaded', () => {

    // --- Sidebar colapsável ---
    const sidebar       = document.getElementById('sidebar');
    const mainContent   = document.getElementById('mainContent');
    const sidebarToggle = document.getElementById('sidebarToggle');

    function toggleMenu() {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
        const isCollapsed = sidebar.classList.contains('collapsed');
        localStorage.setItem('relatorios_sidebarCollapsed', isCollapsed);
    }

    function restoreMenuState() {
        const isCollapsed = localStorage.getItem('relatorios_sidebarCollapsed') === 'true';
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
            mainContent.classList.add('expanded');
        }
    }

    if (sidebarToggle) sidebarToggle.addEventListener('click', toggleMenu);
    restoreMenuState();

    // --- Menu overlay (mantido para não quebrar nada) ---
    const openMenuBtn  = document.getElementById('openMenu');
    const closeMenuBtn = document.getElementById('closeMenu');
    const menuOverlay  = document.getElementById('menuOverlay');

    const openMenu  = () => { if (menuOverlay) { menuOverlay.classList.add('active'); document.body.style.overflow = 'hidden'; } };
    const closeMenu = () => { if (menuOverlay) { menuOverlay.classList.remove('active'); document.body.style.overflow = 'auto'; } };

    if (openMenuBtn)  openMenuBtn.addEventListener('click', openMenu);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);
    if (menuOverlay)  menuOverlay.addEventListener('click', closeMenu);

    // --- Busca ---
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.addEventListener('input', filtrarAlunos);

    // --- Carrega dados do backend ---
    carregarAlunos();
});
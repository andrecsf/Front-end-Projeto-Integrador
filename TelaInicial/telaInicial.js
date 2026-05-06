
const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('mainContent');
const sidebarToggle = document.getElementById('sidebarToggle');
const menuOverlay = document.getElementById('menuOverlay');


function toggleMenu() {
    sidebar.classList.toggle('collapsed');
    const isCollapsed = sidebar.classList.contains('collapsed');
    localStorage.setItem('sidebarCollapsed', isCollapsed);
    if (mainContent) mainContent.classList.toggle('expanded');
}

function restoreMenuState() {
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed) {
        sidebar.classList.add('collapsed');
        if (mainContent) mainContent.classList.add('expanded');
    } else {
        sidebar.classList.remove('collapsed');
        if (mainContent) mainContent.classList.remove('expanded');
    }
}


function getToken() {
    return localStorage.getItem('token');
}

function authFetch(url, options = {}) {
    const token = getToken();

    if (!token) {
        console.warn("Token não encontrado. Redirecionando...");
        window.location.href = "/login.html";
        return Promise.reject("Sem token");
    }

    return fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...(options.headers || {})
        }
    });
}


async function descobrirCursoId() {
    const coordIdLogado = localStorage.getItem('usuarioIdLogado');
    if (!coordIdLogado) return 1;

    try {
        const resCursos = await authFetch('https://back-end-projeto-integrador.onrender.com/cursos');

        if (!resCursos.ok) {
            throw new Error(`Erro ao buscar cursos (${resCursos.status})`);
        }

        const cursos = await resCursos.json();

        const cursoEncontrado = cursos.find(curso =>
            curso.coordenador && curso.coordenador.id == coordIdLogado
        );

        return cursoEncontrado ? cursoEncontrado.id : 1;

    } catch (error) {
        console.error("Erro ao buscar cursos:", error);
        return 1;
    }
}


async function carregarDashboard() {
    try {
        const cursoId = await descobrirCursoId();

        // LINKS DINÂMICOS
        const linkCard = document.getElementById('linkRelatorioCard');
        const linkMenu = document.getElementById('linkRelatorioMenu');
        const linkAtividades = document.getElementById('linkAtividadesPendentes');

        if (linkCard) {
            linkCard.href = `../RelatoriosDosAlunos/relatoriosDosAlunos.html?cursoId=${cursoId}`;
        }

        if (linkMenu) {
            linkMenu.href = `../RelatoriosDosAlunos/relatoriosDosAlunos.html?cursoId=${cursoId}`;
        }

        // link do card amarelo
        if (linkAtividades) {
            linkAtividades.href = `../AtividadesPendentes/atividadesPendentes.html?cursoId=${cursoId}`;
        }

        // URLs API
        const API_URL_SUBMISSOES = 'https://back-end-projeto-integrador.onrender.com/submissoes';
        const API_URL_ALUNOS = `https://back-end-projeto-integrador.onrender.com/alunos/curso/${cursoId}`;

        const [resSubmissoes, resAlunos] = await Promise.all([
            authFetch(API_URL_SUBMISSOES),
            authFetch(API_URL_ALUNOS)
        ]);

        // Tratamento de erro
        if (resSubmissoes.status === 403 || resAlunos.status === 403) {
            throw new Error("Acesso negado (403)");
        }

        if (!resSubmissoes.ok || !resAlunos.ok) {
            throw new Error(`Erro API (${resSubmissoes.status} / ${resAlunos.status})`);
        }

        const submissoes = await resSubmissoes.json();
        const listaAlunos = await resAlunos.json();

        atualizarCardsEstatisticos(submissoes, listaAlunos.length);
        renderizarSubmissoesRecentes(submissoes);

    } catch (error) {
        console.error("Erro ao carregar Dashboard:", error);

        document.getElementById('submissionsContainer').innerHTML =
            `<p style="color: red; padding: 20px;">
                Falha ao carregar dados: ${error.message}
            </p>`;
    }
}


function atualizarCardsEstatisticos(submissoes, totalAlunos) {
    let pendentes = 0;
    let aprovadas = 0;
    let rejeitadas = 0;

    submissoes.forEach(sub => {
        if (sub.status === 'PENDENTE') pendentes++;
        else if (sub.status === 'APROVADO') aprovadas++;
        else if (sub.status === 'REJEITADO') rejeitadas++;
    });

    document.getElementById('pendentes').innerText = pendentes;
    document.getElementById('aprovadas').innerText = aprovadas;
    document.getElementById('rejeitadas').innerText = rejeitadas;
    document.getElementById('alunos').innerText = totalAlunos;

    const bannerText = document.querySelector('.promo-banner p');
    if (bannerText) {
        bannerText.innerHTML = `Você tem <strong>${pendentes} atividades</strong> para revisar`;
    }

    const actionText = document.querySelector('.card-yellow .action-text span');
    if (actionText) {
        actionText.innerText = `${pendentes} pendentes`;
    }
}


function renderizarSubmissoesRecentes(submissoes) {
    const container = document.getElementById('submissionsContainer');
    container.innerHTML = '';

    const submissoesOrdenadas = [...submissoes].sort((a, b) =>
        new Date(b.dataEnvio) - new Date(a.dataEnvio)
    );

    const recentes = submissoesOrdenadas.slice(0, 3);

    if (recentes.length === 0) {
        container.innerHTML = '<p style="color: #6B7280;">Nenhuma submissão recente encontrada.</p>';
        return;
    }

    recentes.forEach(sub => {
        const dataFormatada = new Date(sub.dataEnvio).toLocaleDateString('pt-BR');

        let iconeStatus = 'fa-clock';
        let textoStatus = 'Em Análise';
        let corStatus = 'var(--primary-blue)';
        let bgStatus = '#EFF6FF';

        if (sub.status === 'APROVADO') {
            iconeStatus = 'fa-check';
            textoStatus = 'Aprovado';
            corStatus = 'var(--green)';
            bgStatus = '#F0FDF4';
        } else if (sub.status === 'REJEITADO') {
            iconeStatus = 'fa-xmark';
            textoStatus = 'Rejeitado';
            corStatus = 'var(--red)';
            bgStatus = '#FEF2F2';
        }

        const cardHTML = `
            <div class="submission-card">
                <div class="card-top">
                    <h3>${sub.nomeAluno}</h3>
                    <span class="status-badge" style="color: ${corStatus}; background-color: ${bgStatus}">
                        <i class="fa-solid ${iconeStatus}"></i> ${textoStatus}
                    </span>
                </div>
                <p class="category">${sub.nomeCategoria}</p>
                <div class="card-bottom">
                    <span>${sub.horasAproveitadas}h complementares</span>
                    <span>${dataFormatada}</span>
                </div>
            </div>
        `;

        container.innerHTML += cardHTML;
    });
}


if (sidebarToggle) sidebarToggle.addEventListener('click', toggleMenu);

const btnOpenMenu = document.getElementById('openMenu');
if (btnOpenMenu) btnOpenMenu.addEventListener('click', toggleMenu);

if (menuOverlay) menuOverlay.addEventListener('click', toggleMenu);

document.addEventListener('DOMContentLoaded', () => {
    restoreMenuState();
    carregarDashboard();
});
/**
 * ELEMENTOS DO DOM
 */
const sidebar = document.getElementById('sidebar');
const mainContent = document.querySelector('.main-content');
const API_BASE_URL = 'http://localhost:8080'; 

/**
 * INICIALIZAÇÃO
 */
document.addEventListener('DOMContentLoaded', () => {
    // Verificações de segurança
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');

    if (!token || role !== 'ADMIN') {
        window.location.href = '../Login/index.html';
        return;
    }

    // Inicializa funções de interface
    if (sidebar) restoreMenuState();
    updateCurrentDate();
    configurarLogout();
    configurarAcoesRapidas();
    loadSystemData();

    setInterval(loadSystemData, 5 * 60 * 1000);
});

/**
 * AÇÕES RÁPIDAS - MÉTODO SEGURO
 * Altera apenas o texto (textContent) para não apagar as tags <i> dos ícones.
 */
function configurarAcoesRapidas() {
    const botoesAcao = document.querySelectorAll('.action-btn');

    if (botoesAcao.length >= 2) {
        // Botão 0: Novo Curso
        botoesAcao[0].onclick = (e) => {
            e.preventDefault();
            window.location.href = '../CadastrarCurso/cadastroCurso.html';
        };

        // Botão 1: Novo Coordenador
        // Procuramos o SPAN dentro do botão para mudar o texto sem deletar o <i>
        const label = botoesAcao[1].querySelector('span');
        if (label) label.textContent = 'Novo Coordenador';
        
        // Se o ícone estiver errado, mudamos apenas a classe dele
        const icone = botoesAcao[1].querySelector('i');
        if (icone) icone.className = 'fas fa-user-tie';

        botoesAcao[1].onclick = (e) => {
            e.preventDefault();
            window.location.href = '../CadastrarCoordenador/cadastro-Coordenador.html';
        };
        
        // Botão 2: Gerenciar Cursos
        if (botoesAcao[2]) {
            botoesAcao[2].onclick = (e) => {
                e.preventDefault();
                window.location.href = '../GerenciarCurso/gerenciarCursos.html';
            };
        }
    }
}

/**
 * BUSCA DE DADOS
 */
async function loadSystemData() {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
        const [resAlunos, resCursos, resCoords] = await Promise.all([
            fetch(`${API_BASE_URL}/alunos`, { headers }),
            fetch(`${API_BASE_URL}/cursos`, { headers }),
            fetch(`${API_BASE_URL}/coordenadores`, { headers })
        ]);

        if (resAlunos.ok && resCursos.ok && resCoords.ok) {
            const alunos = await resAlunos.json();
            const cursos = await resCursos.json();
            const coordenadores = await resCoords.json();

            // Atualiza os cards numéricos
            document.getElementById('total-courses').textContent = cursos.length;
            document.getElementById('total-students').textContent = alunos.length;
            document.getElementById('total-coordinators').textContent = coordenadores.length;
            
            const totalHoras = alunos.reduce((acc, a) => acc + (a.horasAcumuladas || 0), 0);
            document.getElementById('total-hours').textContent = totalHoras.toLocaleString('pt-BR');
        }
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

/**
 * MENU E UI
 */
function toggleMenu() {
    if (sidebar && mainContent) {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    }
}

function restoreMenuState() {
    if (localStorage.getItem('sidebarCollapsed') === 'true') {
        sidebar.classList.add('collapsed');
        mainContent.classList.add('expanded');
    }
}

function updateCurrentDate() {
    const el = document.getElementById('current-date');
    if (el) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        el.textContent = new Date().toLocaleDateString('pt-BR', options);
    }
}

function configurarLogout() {
    const btn = document.querySelector('.user-text a');
    if (btn) {
        btn.onclick = (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = '../Login/index.html';
        };
    }
}

// Ativa o clique no ícone de barras (sidebar-header)
const menuTrigger = document.querySelector('.sidebar-header');
if (menuTrigger) menuTrigger.onclick = toggleMenu;
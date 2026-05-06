const BASE_URL = "https://back-end-projeto-integrador.onrender.com";
const token = localStorage.getItem('token');

const sidebar = document.getElementById('sidebar');
const mainContent = document.querySelector('.main-content');

let currentCoordinator = null;
let coordinatorCourses = [];

// ── Sidebar ──────────────────────────────────────────────
function toggleMenu() {
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded');
    localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
}

function restoreMenuState() {
    if (localStorage.getItem('sidebarCollapsed') === 'true') {
        sidebar.classList.add('collapsed');
        mainContent.classList.add('expanded');
    }
}

document.querySelector('.sidebar-header').addEventListener('click', toggleMenu);

// ── Utilitários ───────────────────────────────────────────
function getCoordinatorIdFromURL() {
    return new URLSearchParams(window.location.search).get('id');
}

function getInitials(name) {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 1);
}

function authHeaders() {
    return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
}

// ── Carrega dados do backend ──────────────────────────────
async function loadCoordinatorData(coordinatorId) {
    try {
        const res = await fetch(`${BASE_URL}/coordenadores/${coordinatorId}`, {
            headers: authHeaders()
        });

        if (!res.ok) throw new Error(`Erro ${res.status}`);

        // Os cursos já vêm dentro do DTO do coordenador
        const data = await res.json();
        currentCoordinator = data;
        coordinatorCourses = data.cursos || data.courses || [];

        renderCoordinatorData();

    } catch (error) {
        console.error('Erro ao carregar dados do coordenador:', error);
        alert('Erro ao carregar os dados do coordenador. Verifique sua conexão.');
    }
}

// ── Renderização ──────────────────────────────────────────
function renderCoordinatorData() {
    if (!currentCoordinator) return;

    document.getElementById('coordinator-name').textContent = currentCoordinator.name || currentCoordinator.nome || '—';
    document.getElementById('coordinator-email').textContent = currentCoordinator.email || '—';
    document.getElementById('coordinator-department').textContent = '—';
    document.getElementById('registration-date').textContent = '—';
    document.getElementById('coordinator-avatar').textContent =
        getInitials(currentCoordinator.name || currentCoordinator.nome || 'C');

    document.getElementById('courses-count').textContent = coordinatorCourses.length;
    document.getElementById('students-count').textContent = '—';

    renderCourses();
}

function renderCourses() {
    const coursesList = document.getElementById('courses-list');

    if (!coordinatorCourses.length) {
        coursesList.innerHTML = '<div class="empty-message">Nenhum curso vinculado.</div>';
        return;
    }

    coursesList.innerHTML = coordinatorCourses.map(course => {
        const nome = course.name || course.nome || '—';
        const descricao = course.description || course.descricao || '';

        return `
            <div class="course-item">
                <div class="course-info">
                    <div class="course-name">${nome}</div>
                    <div class="course-code">${descricao}</div>
                </div>
                <span class="course-status active">Ativo</span>
            </div>
        `;
    }).join('');
}

// ── Ações ─────────────────────────────────────────────────
document.getElementById('btn-edit').addEventListener('click', () => {
    const id = getCoordinatorIdFromURL();
    window.location.href = `../EditarCoordenador/editarCoordenador.html?id=${id}`;
});

document.getElementById('btn-delete').addEventListener('click', async () => {
    if (!confirm('Tem certeza que deseja remover este coordenador?')) return;

    try {
        const id = getCoordinatorIdFromURL();
        const res = await fetch(`${BASE_URL}/coordenadores/${id}`, {
            method: 'DELETE',
            headers: authHeaders()
        });

        if (res.ok) {
            alert('Coordenador removido com sucesso!');
            window.history.back();
        } else {
            const erro = await res.json().catch(() => ({}));
            alert('Erro ao remover: ' + (erro.message || res.status));
        }
    } catch (error) {
        console.error('Erro ao remover coordenador:', error);
        alert('Erro de conexão ao tentar remover o coordenador.');
    }
});

// ── Init ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    restoreMenuState();
    const coordinatorId = getCoordinatorIdFromURL();
    if (!coordinatorId) {
        alert('ID do coordenador não encontrado na URL.');
        window.history.back();
        return;
    }
    loadCoordinatorData(coordinatorId);
});
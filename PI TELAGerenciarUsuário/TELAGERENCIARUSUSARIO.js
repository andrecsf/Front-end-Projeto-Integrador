// =========================
// SIDEBAR TOGGLE
// =========================
document.addEventListener('DOMContentLoaded', () => {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
        });
    }

    const sidebarColapsada = localStorage.getItem('sidebarCollapsed') === 'true';
    if (sidebarColapsada && sidebar) {
        sidebar.classList.add('collapsed');
        if (mainContent) mainContent.classList.add('expanded');
    }
});

// =========================
// CONFIGURAÇÕES DE API
// =========================
const API_BASE_URL = "http://localhost:8080"; 

// =========================
// ELEMENTOS DO DOM
// =========================
const userList      = document.getElementById('user-list');
const searchInput   = document.getElementById('search-input');
const filterBtns    = document.querySelectorAll('.filter-btn');
const modalOverlay  = document.getElementById('modalOverlay');
const btnConfirmar  = document.getElementById('btnConfirmar');
const btnCancelar   = document.getElementById('btnCancelar');
const modalMessage  = document.getElementById('modal-message');

// Stats
const statTotal  = document.getElementById('stat-total');
const statAlunos = document.getElementById('stat-alunos');
const statCoords = document.getElementById('stat-coords');

// =========================
// ESTADO GLOBAL E TOKEN
// =========================
let usuarios = [];
let filtroAtivo  = "todos";
let idParaExcluir = null;
let tipoParaExcluir = null;

/**
 * Função auxiliar para centralizar as chamadas de API com Token
 */
async function fetchProtegido(url, options = {}) {
    // Recupera o token salvo no login
    const token = localStorage.getItem('token');

    if (!token) {
        alert("Sessão expirada. Por favor, faça login novamente.");
        window.location.href = "login.html"; // Redireciona para sua tela de login
        return null;
    }

    // Mescla as opções com os headers de autorização
    const defaultOptions = {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`, // Padrão JWT
            'Content-Type': 'application/json'
        }
    };

    const response = await fetch(url, defaultOptions);

    if (response.status === 403) {
        alert("Você não tem permissão para esta ação ou o token expirou.");
        localStorage.removeItem('token');
        window.location.href = "login.html";
        return null;
    }

    return response;
}

// =========================
// BUSCA DE DADOS (BACKEND)
// =========================
async function carregarUsuarios() {
    try {
        // Busca simultânea usando a função protegida
        const [resAlunos, resCoords] = await Promise.all([
            fetchProtegido(`${API_BASE_URL}/alunos`),
            fetchProtegido(`${API_BASE_URL}/coordenadores`)
        ]);

        if (!resAlunos || !resCoords) return;

        const alunos = await resAlunos.json();
        const coordenadores = await resCoords.json();

        // Mapeamento: Backend 'name' -> Frontend 'nome'
        const listaAlunos = alunos.map(a => ({ 
            id: a.id, 
            nome: a.name, 
            email: a.email, 
            tipo: 'aluno' 
        }));

        const listaCoords = coordenadores.map(c => ({ 
            id: c.id, 
            nome: c.name, 
            email: c.email, 
            tipo: 'coordenador' 
        }));

        usuarios = [...listaAlunos, ...listaCoords];
        
        updateStats();
        aplicarFiltros();
    } catch (error) {
        console.error("Erro na carga de usuários:", error);
        userList.innerHTML = `<p class="error-msg">Erro ao conectar com o servidor.</p>`;
    }
}

// =========================
// EXCLUSÃO (BACKEND)
// =========================
async function excluirUsuarioNoBackend() {
    if (!idParaExcluir || !tipoParaExcluir) return;

    const rota = tipoParaExcluir === 'aluno' ? 'alunos' : 'coordenadores';

    try {
        const response = await fetchProtegido(`${API_BASE_URL}/${rota}/${idParaExcluir}`, {
            method: 'DELETE' // Chama @DeleteMapping("/{id}") no Java
        });

        if (response && response.ok) {
            fecharModal();
            carregarUsuarios(); // Recarrega a lista após exclusão
        }
    } catch (error) {
        console.error("Erro ao deletar:", error);
    }
}

// =========================
// RENDERIZAÇÃO E FILTROS
// =========================
function renderUsuarios(lista) {
    if (lista.length === 0) {
        userList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users-slash"></i>
                <p>Nenhum usuário encontrado.</p>
            </div>`;
        return;
    }

    userList.innerHTML = lista.map(user => `
        <div class="user-card">
            <div class="user-avatar ${user.tipo}">${getIniciais(user.nome)}</div>
            <div class="user-info">
                <div class="user-name-row">
                    <h3>${user.nome}</h3>
                    <span class="badge badge-${user.tipo}">
                        ${user.tipo === 'aluno' ? 'Aluno' : 'Coordenador'}
                    </span>
                </div>
                <span class="user-email">${user.email}</span>
            </div>
            <div class="user-actions">
                <button class="btn-delete" title="Excluir" 
                    onclick="confirmarExclusao(${user.id}, '${user.nome}', '${user.tipo}')">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function aplicarFiltros() {
    const termo = searchInput.value.toLowerCase().trim();

    let resultado = usuarios.filter(u =>
        u.nome.toLowerCase().includes(termo) ||
        u.email.toLowerCase().includes(termo)
    );

    if (filtroAtivo !== 'todos') {
        resultado = resultado.filter(u => u.tipo === filtroAtivo);
    }

    renderUsuarios(resultado);
}

function updateStats() {
    statTotal.textContent  = usuarios.length;
    statAlunos.textContent = usuarios.filter(u => u.tipo === 'aluno').length;
    statCoords.textContent = usuarios.filter(u => u.tipo === 'coordenador').length;
}

// =========================
// LÓGICA DO MODAL
// =========================
function confirmarExclusao(id, nome, tipo) {
    idParaExcluir = id;
    tipoParaExcluir = tipo;
    modalMessage.textContent = `Deseja realmente excluir o ${tipo} "${nome}"?`;
    modalOverlay.classList.add('active');
}

function fecharModal() {
    modalOverlay.classList.remove('active');
    idParaExcluir = null;
    tipoParaExcluir = null;
}

// =========================
// EVENT LISTENERS
// =========================
btnConfirmar.addEventListener('click', excluirUsuarioNoBackend);
btnCancelar.addEventListener('click', fecharModal);
searchInput.addEventListener('input', aplicarFiltros);

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filtroAtivo = btn.dataset.filter;
        aplicarFiltros();
    });
});

function getIniciais(nome) {
    if (!nome) return "?";
    return nome.trim().split(' ').filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('');
}

// Inicializa a tela
document.addEventListener('DOMContentLoaded', carregarUsuarios);
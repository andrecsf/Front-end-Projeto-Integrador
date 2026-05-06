const BASE_URL = "https://back-end-projeto-integrador.onrender.com/";

// --- CONFIGURAÇÃO INICIAL ---
const urlParams = new URLSearchParams(window.location.search);
const cursoId = urlParams.get('cursoId') || urlParams.get('id');
const token = localStorage.getItem('token'); 

// --- ELEMENTOS DO DOM ---
const form = document.getElementById('categoriaForm');
const listaCategorias = document.getElementById('listaCategorias');
const sidebar = document.getElementById('sidebar');
const mainContent = document.querySelector('.main-content');

// --- SIDEBAR ---
function toggleMenu() {
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded');
    const isCollapsed = sidebar.classList.contains('collapsed');
    localStorage.setItem('sidebarCollapsed', isCollapsed);
}

function restoreMenuState() {
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed) {
        sidebar.classList.add('collapsed');
        mainContent.classList.add('expanded');
    }
}

function setupSidebar() {
    const sidebarHeader = document.getElementById('sidebar-header');
    sidebarHeader.addEventListener('click', toggleMenu);
    restoreMenuState();
}

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    setupSidebar();

    if (!cursoId) {
        alert("Erro: ID do curso não identificado na URL.");
        window.history.back();
        return;
    }
    carregarCategorias();
    setupSidebar();
});

// --- 1. CARREGAR CATEGORIAS DO CURSO ---
async function carregarCategorias() {
    try {
        const response = await fetch(`${BASE_URL}/categorias`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const todasCategorias = await response.json();
            // Filtra para mostrar apenas as deste curso
            const filtradas = todasCategorias.filter(cat => cat.cursoId == cursoId);
            renderizarLista(filtradas);
        } else if (response.status === 403) {
            alert("Sessão expirada ou sem permissão. Faça login novamente.");
        }
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
    }
}

// --- 2. RENDERIZAR LISTA ---
function renderizarLista(categorias) {
    listaCategorias.innerHTML = '';

    if (categorias.length === 0) {
        listaCategorias.innerHTML = '<p class="empty-msg">Nenhuma categoria cadastrada para este curso.</p>';
        return;
    }

    categorias.forEach(cat => {
        const div = document.createElement('div');
        div.className = 'categoria-card'; 
        div.style = "background: #fff; margin-bottom: 10px; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);";
        
        div.innerHTML = `
            <div>
                <strong style="color: #333;">${cat.area}</strong>
                <p style="margin: 5px 0 0; font-size: 0.85rem; color: #666;">
                    ${cat.horasPorCertificado}h/certificado | Limite: ${cat.limiteSubmissoesSemestre} por semestre
                </p>
            </div>
            <button onclick="excluirCategoria(${cat.id})" style="background: none; border: none; color: #e74c3c; cursor: pointer; font-size: 1.1rem;">
                <i class="fas fa-trash"></i>
            </button>
        `;
        listaCategorias.appendChild(div);
    });
}

// --- 3. SALVAR CATEGORIA (POST) ---
form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const novaCategoria = {
        area: document.getElementById('area').value,
        limiteSubmissoesSemestre: parseInt(document.getElementById('limiteSubmissoesSemestre').value),
        horasPorCertificado: parseInt(document.getElementById('horasPorCertificado').value),
        exigeComprovante: true
    };

    try {
        const response = await fetch(`${BASE_URL}/categorias/curso/${cursoId}`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(novaCategoria)
        });

        if (response.ok) {
            alert('Categoria salva com sucesso!');
            form.reset();
            carregarCategorias(); // Recarrega a lista
        } else {
            const erro = await response.json();
            alert("Erro ao salvar: " + (erro.message || "Verifique os dados."));
        }
    } catch (error) {
        alert("Erro de conexão com o servidor.");
    }
});

// --- 4. EXCLUIR CATEGORIA (DELETE) ---
window.excluirCategoria = async function(id) {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;

    try {
        const response = await fetch(`${BASE_URL}/categorias/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            carregarCategorias();
        } else {
            alert("Não foi possível excluir. A categoria pode estar em uso.");
        }
    } catch (error) {
        console.error('Erro ao excluir:', error);
    }
};

// --- UTILITÁRIOS ---
window.limparFormulario = function() {
    form.reset();
};

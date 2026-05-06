// --- CONFIGURAÇÃO ---
const urlParams = new URLSearchParams(window.location.search);
const cursoId = urlParams.get('cursoId');
const token = localStorage.getItem('token');

// --- SIDEBAR TOGGLE (padrão superadmin) ---
const sidebar     = document.getElementById('sidebar');
const mainContent = document.getElementById('mainContent');
const sidebarToggle = document.getElementById('sidebarToggle');

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

if (sidebarToggle) sidebarToggle.addEventListener('click', toggleMenu);
restoreMenuState();

// --- BOTÃO VOLTAR ---
const btnVoltar = document.getElementById('btnVoltar');
if (btnVoltar) {
    btnVoltar.style.cursor = 'pointer';
    btnVoltar.addEventListener('click', () => window.history.back());
}

// --- VÍNCULO ---
window.confirmarVinculo = async function(coordId, nomeCoord) {
    if (!confirm(`Deseja definir ${nomeCoord} como coordenador?`)) return;

    const url = `https://back-end-projeto-integrador.onrender.com/coordenadores/${coordId}/cursos/${cursoId}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok || response.status === 204) {
            alert("Vínculo realizado com sucesso!");
            //  Nome do arquivo correto
            window.location.href = `../PerfilCurso/perfil-curso.html?id=${cursoId}`;
        } else {
            alert("Erro ao vincular: status " + response.status);
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
        alert("Erro de conexão com o servidor.");
    }
};

// --- BUSCAR COORDENADORES ---
async function loadCoordinators() {
    try {
        const response = await fetch('https://back-end-projeto-integrador.onrender.com/coordenadores', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            renderList(data);
        }
    } catch (error) {
        console.error("Erro ao carregar coordenadores:", error);
        document.getElementById('coordinators-list').innerHTML =
            '<div class="empty-message">Erro ao conectar com o servidor.</div>';
    }
}

// --- RENDERIZAR LISTA ---
function renderList(list) {
    const container = document.getElementById('coordinators-list');

    if (!list || list.length === 0) {
        container.innerHTML = '<div class="empty-message">Nenhum coordenador encontrado.</div>';
        return;
    }

    container.innerHTML = list.map(coord => `
        <div class="item-card">
            <div class="item-info">
                <i class="fas fa-user-tie"></i>
                <div>
                    <strong>${coord.name || coord.nome}</strong>
                    <p>${coord.email}</p>
                </div>
            </div>
            <div class="item-actions">
                <button class="btn-add-item" onclick="confirmarVinculo(${coord.id}, '${coord.name || coord.nome}')">
                    <i class="fas fa-link"></i> Vincular
                </button>
            </div>
        </div>
    `).join('');
}

// --- FILTRO DE BUSCA ---
document.addEventListener('DOMContentLoaded', () => {
    if (!cursoId) {
        alert("ID do curso não encontrado na URL!");
        return;
    }

    loadCoordinators();

    const searchInput = document.getElementById('search-coord');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const termo = searchInput.value.toLowerCase();
            document.querySelectorAll('.item-card').forEach(card => {
                const nome = card.querySelector('strong')?.textContent.toLowerCase() || '';
                card.style.display = nome.includes(termo) ? '' : 'none';
            });
        });
    }
});
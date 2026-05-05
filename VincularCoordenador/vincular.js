// --- CONFIGURAÇÃO ---
const urlParams = new URLSearchParams(window.location.search);
const cursoId = urlParams.get('cursoId');
const token = localStorage.getItem('token');

console.log("Parâmetros carregados:", { cursoId, token: token ? "Presente" : "Ausente" });

// --- FUNÇÃO GLOBAL DE VÍNCULO ---
// Definimos como window. para o HTML encontrar com certeza
window.confirmarVinculo = async function(coordId, nomeCoord) {
    console.log(`Botão acionado: Coordenador ${coordId}`);
    
    if (!confirm(`Deseja definir ${nomeCoord} como coordenador?`)) return;

    const url = `http://localhost:8080/coordenadores/${coordId}/cursos/${cursoId}`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log("Resposta do servidor:", response.status);

        if (response.ok || response.status === 204) {
            alert("Vínculo realizado com sucesso!");
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
        console.log("Buscando coordenadores...");
        const response = await fetch('http://localhost:8080/coordenadores', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            renderList(data);
        }
    } catch (error) {
        console.error("Erro ao carregar:", error);
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

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    if (!cursoId) {
        alert("ID do curso não encontrado na URL!");
        return;
    }
    loadCoordinators();
});
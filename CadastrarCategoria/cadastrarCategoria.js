const form = document.getElementById('categoriaForm');
const listaCategorias = document.getElementById('listaCategorias');

// 1. Captura o ID do curso vindo da URL (?cursoId=1)
const urlParams = new URLSearchParams(window.location.search);
const cursoId = urlParams.get('cursoId');

console.log("ID do curso identificado:", cursoId);

// --- SALVAR CATEGORIA (POST) ---
form.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Verificação de segurança: Se não houver ID na URL, nem tenta o POST
    if (!cursoId) {
        alert("Erro: O ID do curso não foi identificado na URL. Volte ao perfil do curso.");
        return;
    }

    // O JSON agora só precisa dos dados da categoria. 
    // O vínculo com o curso será feito pelo Java através da URL.
    const novaCategoria = {
        area: document.getElementById('area').value,
        limiteSubmissoesSemestre: parseInt(document.getElementById('limiteSubmissoesSemestre').value),
        horasPorCertificado: parseInt(document.getElementById('horasPorCertificado').value),
        exigeComprovante: true
    };

    console.log("Enviando dados:", novaCategoria);

    try {
        // A URL agora inclui /curso/{id} conforme criamos no Backend
        const response = await fetch(`http://localhost:8080/categorias/curso/${cursoId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(novaCategoria)
        });

        if (response.ok) {
            alert('Categoria cadastrada com sucesso!');
            form.reset();
            carregarCategorias(); // Atualiza a lista visual
        } else {
            const erroData = await response.json();
            
            // Tratamento para o erro 409 (Conflito/Duplicidade) que definimos no Java
            if (response.status === 409) {
                alert(`⚠️ Atenção: ${erroData.message || "Esta categoria já existe para este curso."}`);
            } else {
                alert("Erro ao cadastrar: " + (erroData.message || "Erro no servidor."));
            }
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        alert('Não foi possível conectar ao servidor. Verifique se o Backend está rodando.');
    }
});

// --- CARREGAR LISTA DE CATEGORIAS (GET) ---
async function carregarCategorias() {
    try {
        const response = await fetch('http://localhost:8080/categorias');
        if (response.ok) {
            const categorias = await response.json();
            
            // Filtramos no front para garantir que só apareçam categorias desse curso
            // O campo 'cursoId' deve estar presente no seu CategoriaDTO.java
            const categoriasDoCurso = categorias.filter(cat => cat.cursoId == cursoId);
            
            renderizarLista(categoriasDoCurso);
        }
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
    }
}

// --- RENDERIZAR NA TELA ---
function renderizarLista(categorias) {
    listaCategorias.innerHTML = '';

    if (categorias.length === 0) {
        listaCategorias.innerHTML = '<p style="padding: 10px;">Nenhuma categoria vinculada a este curso.</p>';
        return;
    }

    categorias.forEach(cat => {
        const div = document.createElement('div');
        div.className = 'card-item';
        div.innerHTML = `
            <div class="info">
                <h4>${cat.area}</h4>
                <p><small>Máx: ${cat.horasPorCertificado}h | Limite: ${cat.limiteSubmissoesSemestre}</small></p>
            </div>
            <div class="actions">
                <i class="fas fa-trash" onclick="excluirCategoria(${cat.id})" style="color:red; cursor:pointer;"></i>
            </div>
        `;
        listaCategorias.appendChild(div);
    });
}

// --- EXCLUIR CATEGORIA (DELETE) ---
async function excluirCategoria(id) {
    if (!confirm("Deseja realmente excluir esta categoria?")) return;

    try {
        const response = await fetch(`http://localhost:8080/categorias/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            carregarCategorias();
        } else {
            alert("Não foi possível excluir.");
        }
    } catch (error) {
        console.error('Erro ao excluir:', error);
    }
}

// Inicia a lista ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    if (cursoId) {
        carregarCategorias();
    }
});
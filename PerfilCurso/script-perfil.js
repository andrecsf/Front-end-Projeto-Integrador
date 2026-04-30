// --- CONFIGURAÇÃO INICIAL ---
const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get('id');
const token = localStorage.getItem('token'); 

let currentCourse = null;
let allStudents = [];

// --- ELEMENTOS DO DOM ---
const coordinatorDisplay = document.getElementById('coordinator-display');
const categoriesList = document.getElementById('categories-list');
const studentsList = document.getElementById('students-list'); 
const studentsCount = document.getElementById('students-count');
const searchInput = document.getElementById('search-student');

// Botões
const btnAddCategory = document.getElementById('btn-add-category');
const btnAddStudent = document.getElementById('btn-add-student');
const btnManageCoordinator = document.getElementById('btn-manage-coordinator');
const btnDelete = document.getElementById('btn-delete');

const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
};

// --- INICIALIZAÇÃO ---
async function init() {
    if (!courseId) {
        console.error("ID do curso não encontrado na URL!");
        alert("ID do curso não encontrado!");
        window.location.href = '../GerenciarCurso/gerenciaCursos.html';
        return;
    }

    if (!token) {
        console.warn("Token de autenticação não encontrado!");
    }

    await loadCourseDetails();
    await loadCategories();
    await loadStudents();
}

// 1. Carrega os dados básicos do curso e Coordenador
async function loadCourseDetails() {
    try {
        console.log(`Buscando curso ID: ${courseId}...`);
        const response = await fetch(`http://localhost:8080/cursos/${courseId}`, { headers });
        
        if (response.ok) {
            currentCourse = await response.json();
            console.log("Dados do curso carregados:", currentCourse);
            
            // Atualização dos textos da página
            document.getElementById('course-name-display').innerText = currentCourse.nome || "N/A";
            document.getElementById('course-id-display').innerText = currentCourse.id || "---";
            document.getElementById('course-workload-display').innerText = currentCourse.cargaHorariaMax || "0";
            document.getElementById('course-description-display').innerText = currentCourse.descricao || "Sem descrição disponível.";
            document.getElementById('course-title').innerText = `Perfil: ${currentCourse.nome}`;

            // Renderiza o coordenador
            renderCoordinator(currentCourse.coordenador);
        } else {
            console.error("Erro ao buscar curso:", response.status);
        }
    } catch (error) {
        console.error("Erro na requisição de detalhes do curso:", error);
    }
}

// 2. Renderiza Card do Coordenador (CORRIGIDO)
function renderCoordinator(coord) {
    if (!coord) {
        console.log("Nenhum coordenador encontrado no objeto curso.");
        coordinatorDisplay.innerHTML = `
            <div class="empty-message">
                <i class="fas fa-exclamation-circle"></i> Nenhum coordenador vinculado a este curso.
            </div>`;
        return;
    }

    // Mapeia propriedades para aceitar diferentes padrões (nome/name)
    const nome = coord.nome || coord.name || "Coordenador sem nome";
    const email = coord.email || "E-mail não informado";
    const matricula = coord.matricula || coord.id || "---";

    coordinatorDisplay.innerHTML = `
        <div class="item-card highlight-card">
            <div class="item-info">
                <i class="fas fa-user-tie" style="font-size: 2rem; color: #2563eb;"></i>
                <div>
                    <strong style="color: #1e293b; font-size: 1.1rem;">${nome}</strong>
                    <p style="color: #64748b; margin-top: 4px;">
                        <i class="fas fa-envelope"></i> ${email} | 
                        <i class="fas fa-id-card"></i> Matrícula: ${matricula}
                    </p>
                </div>
            </div>
        </div>
    `;
}

// 3. Carrega as Categorias
async function loadCategories() {
    try {
        const response = await fetch(`http://localhost:8080/categorias`, { headers });
        if (response.ok) {
            const allCategories = await response.json();
            const filtered = allCategories.filter(cat => cat.cursoId == courseId);
            renderCategories(filtered);
        }
    } catch (error) {
        console.error("Erro ao carregar categorias:", error);
    }
}

function renderCategories(list) {
    if (list.length === 0) {
        categoriesList.innerHTML = '<div class="empty-message">Nenhuma categoria vinculada.</div>';
        return;
    }

    categoriesList.innerHTML = list.map(cat => `
        <div class="item-card">
            <div class="item-info">
                <i class="fas fa-tag"></i>
                <div>
                    <strong>${cat.nome}</strong>
                    <p>Máximo: ${cat.cargaHorariaMax}h</p>
                </div>
            </div>
            <div class="item-actions">
                <button class="btn-icon-delete" onclick="deleteCategory(${cat.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// 4. Carrega os Alunos
async function loadStudents() {
    try {
        const response = await fetch(`http://localhost:8080/alunos/curso/${courseId}`, { headers });
        if (response.ok) {
            allStudents = await response.json();
            renderStudents(allStudents);
        }
    } catch (error) {
        console.error("Erro ao carregar alunos:", error);
    }
}

// 5. Renderiza Alunos
function renderStudents(list) {
    if (studentsCount) studentsCount.innerText = list.length;

    if (list.length === 0) {
        studentsList.innerHTML = '<div class="empty-message">Nenhum aluno vinculado.</div>';
        return;
    }

    studentsList.innerHTML = list.map(aluno => `
        <div class="item-card">
            <div class="item-info">
                <i class="fas fa-user-graduate"></i>
                <div>
                    <strong>${aluno.nome}</strong>
                    <p>Matrícula: ${aluno.matricula} | Turma: ${aluno.turma || 'N/A'}</p>
                </div>
            </div>
            <div class="item-actions">
                <button class="btn-icon-delete" onclick="removeStudent(${aluno.id})">
                    <i class="fas fa-user-minus"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// --- LÓGICA DE BUSCA ---
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allStudents.filter(aluno => 
            aluno.nome.toLowerCase().includes(term) || 
            aluno.matricula.toString().includes(term)
        );
        renderStudents(filtered);
    });
}

// --- FUNÇÕES GLOBAIS ---
window.deleteCategory = async function(id) {
    if (!confirm("Excluir esta categoria?")) return;
    try {
        const res = await fetch(`http://localhost:8080/categorias/${id}`, { method: 'DELETE', headers });
        if (res.ok) loadCategories();
    } catch (err) { console.error("Erro ao deletar categoria:", err); }
};

window.removeStudent = async function(id) {
    if (!confirm("Remover aluno do curso?")) return;
    alert("Funcionalidade de remoção sendo processada pelo servidor...");
};

// --- EVENTOS DE NAVEGAÇÃO ---
btnManageCoordinator?.addEventListener('click', () => {
    window.location.href = `../VincularCoordenador/vincular.html?cursoId=${courseId}`;
});

btnAddStudent?.addEventListener('click', () => {
    window.location.href = `../CadastrarAluno/cadastrarAluno.html?cursoId=${courseId}`;
});

btnAddCategory?.addEventListener('click', () => {
    window.location.href = `../CadastrarCategoria/cadastrarCategoria.html?cursoId=${courseId}`;
});

// Inicializa o script
document.addEventListener('DOMContentLoaded', init);
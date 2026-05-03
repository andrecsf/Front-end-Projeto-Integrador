// --- CONFIGURAÇÃO INICIAL ---
const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get('id');
const token = localStorage.getItem('token');

let currentCourse = null;
let allStudents = []; 

const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
};

// --- ELEMENTOS DO DOM ---
const coordinatorDisplay = document.getElementById('coordinator-display');
const categoriesList = document.getElementById('categories-list');
const studentsList = document.getElementById('students-list');
const studentsCount = document.getElementById('students-count');
const searchInput = document.getElementById('search-student');

const modalVincular = document.getElementById('modal-vincular');
const btnCreateNewStudent = document.getElementById('btn-create-new-student');
const btnLinkExistingStudent = document.getElementById('btn-link-existing-student');
const closeModal = document.getElementById('close-modal');
const inputSearchAll = document.getElementById('input-search-all-students');
const resultsSearchAll = document.getElementById('results-search-all-students');

const btnManageCoordinator = document.getElementById('btn-manage-coordinator');
const btnAddCategory = document.getElementById('btn-add-category');

// --- INICIALIZAÇÃO ---
async function init() {
    if (!courseId) {
        window.location.href = '../GerenciarCurso/gerenciaCursos.html';
        return;
    }
    await loadCourseDetails();
    await loadCategories();
    await loadStudents();
}

// --- CARREGAMENTO DE DADOS ---

async function loadCourseDetails() {
    try {
        const response = await fetch(`http://localhost:8080/cursos/${courseId}`, { headers });
        if (response.ok) {
            currentCourse = await response.json();
            document.getElementById('course-name-display').innerText = currentCourse.nome || "N/A";
            document.getElementById('course-id-display').innerText = currentCourse.id || "---";
            document.getElementById('course-workload-display').innerText = currentCourse.cargaHorariaMax || "0";
            document.getElementById('course-description-display').innerText = currentCourse.descricao || "Sem descrição.";
            renderCoordinator(currentCourse.coordenador);
        }
    } catch (error) {
        console.error("Erro ao carregar detalhes do curso:", error);
    }
}

async function loadCategories() {
    try {
        const response = await fetch(`http://localhost:8080/categorias`, { headers });
        if (response.ok) {
            const allCategories = await response.json();
            const filtered = allCategories.filter(cat => cat.cursoId === Number(courseId));
            renderCategories(filtered);
        }
    } catch (error) {
        console.error("Erro ao carregar categorias:", error);
    }
}

async function loadStudents() {
    try {
        // Busca os alunos vinculados a este curso específico
        const response = await fetch(`http://localhost:8080/alunos/curso/${courseId}`, { headers });
        if (response.ok) {
            allStudents = await response.json();
            renderStudents(allStudents);
        }
    } catch (error) {
        console.error("Erro ao carregar alunos:", error);
    }
}

// --- RENDERIZAÇÃO DE COMPONENTES ---

function renderCoordinator(coord) {
    if (!coord) {
        coordinatorDisplay.innerHTML = `<div class="empty-message">Nenhum coordenador vinculado.</div>`;
        return;
    }
    coordinatorDisplay.innerHTML = `
        <div class="item-card highlight-card">
            <div class="item-info">
                <i class="fas fa-user-tie" style="font-size: 2rem; color: #2563eb;"></i>
                <div>
                    <strong>${coord.nome || coord.name}</strong>
                    <p>${coord.email} | Matrícula: ${coord.matricula || coord.id}</p>
                </div>
            </div>
            <div class="item-actions">
                <button class="btn-icon-delete" title="Remover Coordenador" onclick="removeCoordinator(${coord.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>`;
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
                    <strong>${cat.area}</strong> 
                    <p>Horas/Certificado: ${cat.horasPorCertificado}h</p>
                </div>
            </div>
            <div class="item-actions">
                <button class="btn-icon-delete" title="Excluir Categoria" onclick="deleteCategory(${cat.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>`).join('');
}

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
                    <!-- CORREÇÃO: Usando aluno.name conforme AlunoDTO -->
                    <strong>${aluno.name}</strong>
                    <p>Matrícula: ${aluno.matricula} | Turma: ${aluno.turma || 'N/A'}</p>
                </div>
            </div>
            <div class="item-actions">
                <!-- Chamar função de desvincular -->
                <button class="btn-icon-delete" title="Desvincular Aluno" onclick="removeStudent(${aluno.id})">
                    <i class="fas fa-user-minus"></i>
                </button>
            </div>
        </div>`).join('');
}

// --- FUNÇÕES DE REMOÇÃO (API) ---

async function removeCoordinator(coordId) {
    if (!coordId) return;
    if (!confirm("Tem certeza que deseja desvincular o coordenador deste curso?")) return;
    
    try {
        const response = await fetch(`http://localhost:8080/coordenadores/${coordId}/cursos/${courseId}`, {
            method: 'DELETE',
            headers: headers
        });
        if (response.ok) {
            await loadCourseDetails();
        }
    } catch (error) {
        console.error("Erro ao remover coordenador:", error);
    }
}

async function removeStudent(alunoId) {
    if (!confirm("Deseja desvincular este aluno do curso?")) return;
    try {
        // Chamando o endpoint que configuramos no AlunoResource
        const response = await fetch(`http://localhost:8080/alunos/${alunoId}/cursos/${courseId}`, {
            method: 'DELETE',
            headers: headers
        });
        if (response.ok) {
            alert("Aluno desvinculado com sucesso!");
            await loadStudents();
        } else {
            alert("Erro ao desvincular aluno.");
        }
    } catch (error) {
        console.error("Erro ao desvincular aluno:", error);
    }
}

// --- LÓGICA DO MODAL DE VINCULAÇÃO ---

btnLinkExistingStudent?.addEventListener('click', () => {
    modalVincular.style.display = 'block';
    searchGlobalStudents(""); 
});

closeModal?.addEventListener('click', () => {
    modalVincular.style.display = 'none';
});

inputSearchAll?.addEventListener('input', (e) => {
    searchGlobalStudents(e.target.value);
});

async function searchGlobalStudents(term) {
    try {
        const response = await fetch(`http://localhost:8080/alunos`, { headers });
        if (response.ok) {
            const list = await response.json();
            const filtered = list.filter(aluno => 
                aluno.name.toLowerCase().includes(term.toLowerCase()) && // CORREÇÃO: aluno.name
                !allStudents.some(s => s.id === aluno.id)
            );
            renderGlobalResults(filtered);
        }
    } catch (error) {
        console.error("Erro na busca global:", error);
    }
}

function renderGlobalResults(list) {
    if (list.length === 0) {
        resultsSearchAll.innerHTML = '<p class="empty-message">Nenhum aluno disponível.</p>';
        return;
    }
    resultsSearchAll.innerHTML = list.map(aluno => `
        <div class="item-card">
            <div class="item-info">
                <strong>${aluno.name}</strong> <!-- CORREÇÃO: aluno.name -->
                <p>Matrícula: ${aluno.matricula}</p>
            </div>
            <button class="btn-add-item" onclick="vincularAluno(${aluno.id})">
                <i class="fas fa-link"></i> Vincular
            </button>
        </div>`).join('');
}

window.vincularAluno = async function(alunoId) {
    try {
        const response = await fetch(`http://localhost:8080/alunos/${alunoId}/cursos/${courseId}`, {
            method: 'POST',
            headers: headers
        });
        if (response.ok) {
            modalVincular.style.display = 'none';
            await loadStudents();
        } else {
            alert("Erro ao vincular aluno.");
        }
    } catch (error) {
        console.error("Erro ao vincular:", error);
    }
};

// --- NAVEGAÇÃO E FILTROS ---

btnCreateNewStudent?.addEventListener('click', () => {
    window.location.href = `../CadastrarAluno/cadastrarAluno.html?cursoId=${courseId}`;
});

btnManageCoordinator?.addEventListener('click', () => {
    window.location.href = `../VincularCoordenador/vincular.html?cursoId=${courseId}`;
});

btnAddCategory?.addEventListener('click', () => {
    window.location.href = `../CadastrarCategoria/cadastrarCategoria.html?cursoId=${courseId}`;
});

searchInput?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allStudents.filter(aluno => 
        aluno.name.toLowerCase().includes(term) || aluno.matricula.toString().includes(term)
    );
    renderStudents(filtered);
});

document.addEventListener('DOMContentLoaded', init);
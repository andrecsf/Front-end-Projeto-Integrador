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

// Elementos de Edição e Exclusão de Curso
const btnEdit = document.getElementById('btn-edit');
const btnDelete = document.getElementById('btn-delete');
const modalEditar = document.getElementById('modal-editar-curso');
const closeModalEditar = document.getElementById('close-modal-editar');
const btnSalvarEdicao = document.getElementById('btn-salvar-edicao');
const editNome = document.getElementById('edit-nome');
const editDescricao = document.getElementById('edit-descricao');
const editCarga = document.getElementById('edit-carga');

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
                    <strong>${aluno.name}</strong>
                    <p>Matrícula: ${aluno.matricula} | Turma: ${aluno.turma || 'N/A'}</p>
                </div>
            </div>
            <div class="item-actions">
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
                aluno.name.toLowerCase().includes(term.toLowerCase()) && 
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
                <strong>${aluno.name}</strong> 
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

// --- LÓGICA DE EXCLUSÃO DE CURSO ---
btnDelete?.addEventListener('click', async () => {
    if (confirm(`Atenção: Tem certeza que deseja excluir permanentemente o curso "${currentCourse.nome}"? Esta ação não pode ser desfeita.`)) {
        try {
            const response = await fetch(`http://localhost:8080/cursos/${courseId}`, {
                method: 'DELETE',
                headers: headers
            });

            if (response.ok || response.status === 204) {
                alert('Curso excluído com sucesso!');
                window.location.href = '../GerenciarCurso/gerenciaCursos.html';
            } else {
                alert('Erro ao excluir o curso. Verifique se existem dependências (como alunos matriculados) impedindo a exclusão.');
            }
        } catch (error) {
            console.error("Erro ao excluir curso:", error);
            alert("Erro de conexão ao tentar excluir.");
        }
    }
});

// --- LÓGICA DE EDIÇÃO DE CURSO ---
// 1. Abrir Modal com os dados atuais
btnEdit?.addEventListener('click', () => {
    if (currentCourse) {
        editNome.value = currentCourse.nome || '';
        editDescricao.value = currentCourse.descricao || '';
        editCarga.value = currentCourse.cargaHorariaMax || '';
        modalEditar.style.display = 'block';
    }
});

// 2. Fechar modal de edição
closeModalEditar?.addEventListener('click', () => {
    modalEditar.style.display = 'none';
});

// 3. Salvar as edições disparando PUT para a API
btnSalvarEdicao?.addEventListener('click', async () => {
    const bodyData = {
        nome: editNome.value,
        descricao: editDescricao.value,
        cargaHorariaMax: Number(editCarga.value)
    };

    try {
        const response = await fetch(`http://localhost:8080/cursos/${courseId}`, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(bodyData)
        });

        if (response.ok) {
            alert('Curso atualizado com sucesso!');
            modalEditar.style.display = 'none';
            await loadCourseDetails(); // Recarrega instantaneamente na tela os novos dados
        } else {
            // Se cair na validação do Service onde o nome já existe
            const errorText = await response.text();
            alert(`Erro ao atualizar curso.\nDetalhes: ${errorText}`);
        }
    } catch (error) {
        console.error("Erro ao atualizar curso:", error);
        alert("Erro de conexão ao tentar atualizar o curso.");
    }
});

document.addEventListener('DOMContentLoaded', init);
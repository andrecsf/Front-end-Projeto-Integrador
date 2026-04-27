// --- CONFIGURAÇÃO INICIAL ---
const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get('id'); // Pega o ID do curso da URL (?id=1)

let currentCourse = null;

// --- ELEMENTOS DA PÁGINA ---
const categoriesList = document.getElementById('categories-list');
const studentsList = document.getElementById('students-list'); 
const studentsCount = document.getElementById('students-count');
const btnAddCategory = document.getElementById('btn-add-category');
const btnAddStudent = document.getElementById('btn-add-student');

// --- CARREGAMENTO DE DADOS ---
async function init() {
    if (!courseId) {
        alert("ID do curso não encontrado!");
        window.location.href = 'index.html';
        return;
    }

    await loadCourseDetails();
    await loadCategories();
    await loadStudents(); // Carrega os alunos vinculados
}

// 1. Carrega os dados básicos do curso
async function loadCourseDetails() {
    try {
        const response = await fetch(`http://localhost:8080/cursos/${courseId}`);
        if (response.ok) {
            currentCourse = await response.json();
            
            // Preenche o HTML
            document.getElementById('course-name-display').innerText = currentCourse.nome;
            document.getElementById('course-id-display').innerText = currentCourse.id;
            document.getElementById('course-workload-display').innerText = currentCourse.cargaHorariaMax;
            document.getElementById('course-description-display').innerText = currentCourse.descricao || "Sem descrição disponível.";
            document.getElementById('course-title').innerText = `Perfil: ${currentCourse.nome}`;
        }
    } catch (error) {
        console.error("Erro ao carregar detalhes do curso:", error);
    }
}

// 2. Carrega e Filtra as Categorias (Mantendo lógica de filtro manual)
async function loadCategories() {
    try {
        const response = await fetch('http://localhost:8080/categorias');
        if (response.ok) {
            const allCategories = await response.json();
            const filteredCategories = allCategories.filter(cat => cat.cursoId == courseId);
            renderCategories(filteredCategories);
        }
    } catch (error) {
        console.error("Erro ao carregar categorias:", error);
        categoriesList.innerHTML = '<div class="empty-message">Erro ao conectar com o servidor.</div>';
    }
}

// 3. ATUALIZADO: Carrega os Alunos usando o novo endpoint de filtro do Backend
async function loadStudents() {
    try {
        // Chamada ao endpoint que criamos no AlunoResource
        const response = await fetch(`http://localhost:8080/alunos/curso/${courseId}`);
        
        if (response.ok) {
            const students = await response.json();
            renderStudents(students);
        } else {
            console.error("Erro ao buscar alunos do curso");
            studentsList.innerHTML = '<div class="empty-message">Erro ao processar alunos.</div>';
        }
    } catch (error) {
        console.error("Erro de conexão ao carregar alunos:", error);
        studentsList.innerHTML = '<div class="empty-message">Servidor offline.</div>';
    }
}

// 4. Renderiza as categorias na tela
function renderCategories(list) {
    if (list.length === 0) {
        categoriesList.innerHTML = '<div class="empty-message">Nenhuma categoria vinculada a este curso.</div>';
        return;
    }

    categoriesList.innerHTML = list.map(cat => `
        <div class="item-card">
            <div class="item-info">
                <i class="fas fa-tags"></i>
                <div>
                    <strong>${cat.area}</strong>
                    <p>${cat.horasPorCertificado}h por certificado | Limite: ${cat.limiteSubmissoesSemestre}/sem</p>
                </div>
            </div>
            <div class="item-actions">
                <button title="Excluir" onclick="deleteCategory(${cat.id})"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

// 5. ATUALIZADO: Renderiza os alunos na tela
function renderStudents(list) {
    // Atualiza o número no contador (ex: Alunos (5))
    if (studentsCount) {
        studentsCount.innerText = list.length;
    }

    if (list.length === 0) {
        studentsList.innerHTML = '<div class="empty-message">Nenhum aluno matriculado neste curso.</div>';
        return;
    }

    studentsList.innerHTML = list.map(aluno => `
        <div class="item-card">
            <div class="item-info">
                <i class="fas fa-user-graduate"></i>
                <div>
                    <strong>${aluno.name}</strong>
                    <p>Matrícula: ${aluno.matricula} | Turma: ${aluno.turma}</p>
                    <small>${aluno.horasAcumuladas || 0}h acumuladas</small>
                </div>
            </div>
            <div class="item-actions">
                <button title="Remover do Curso" onclick="removeStudent(${aluno.id})">
                    <i class="fas fa-user-minus"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// --- BOTÕES DE AÇÃO ---

btnAddStudent.addEventListener('click', () => {
    window.location.href = `../CadastrarAluno/cadastrarAluno.html?cursoId=${courseId}`;
});

btnAddCategory.addEventListener('click', () => {
    window.location.href = `../CadastrarCategoria/cadastrarCategoria.html?cursoId=${courseId}`;
});

async function deleteCategory(id) {
    if (!confirm("Deseja realmente excluir esta categoria?")) return;
    try {
        const response = await fetch(`http://localhost:8080/categorias/${id}`, { method: 'DELETE' });
        if (response.ok) loadCategories();
    } catch (error) { alert("Erro ao excluir categoria."); }
}

async function removeStudent(id) {
    if (!confirm("Deseja desvincular este aluno do curso?")) return;
    // Implementação futura: Endpoint para remover da tabela de associação
    alert("Funcionalidade de desvínculo em desenvolvimento.");
}

// Iniciar ao carregar a página
document.addEventListener('DOMContentLoaded', init);
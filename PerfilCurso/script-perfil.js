// Elementos do DOM
const toggleMenuBtn = document.getElementById('toggle-menu');
const sidebar = document.getElementById('sidebar');
const mainContent = document.querySelector('.main-content');

// Dados do curso (será preenchido dinamicamente)
let currentCourse = null;
let courseStudents = [];
let courseCoordinators = [];
let courseCategories = [];

// Função para alternar o menu
function toggleMenu() {
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded');
    
    // Salvar estado do menu no localStorage
    const isCollapsed = sidebar.classList.contains('collapsed');
    localStorage.setItem('sidebarCollapsed', isCollapsed);
}

// Restaurar estado do menu ao carregar a página
function restoreMenuState() {
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed) {
        sidebar.classList.add('collapsed');
        mainContent.classList.add('expanded');
    }
}

// Função para obter o ID do curso da URL
function getCourseIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Função para carregar dados do curso (exemplo com dados mockados)
async function loadCourseData(courseId) {
    try {
        // Aqui você faria uma chamada ao backend
        // const response = await fetch(`/api/courses/${courseId}`);
        // const data = await response.json();
        
        // Por enquanto, usando dados mockados
        currentCourse = {
            id: courseId || '1',
            name: 'Engenharia de Software',
            code: 'ENG-SW-001',
            status: 'Ativo',
            date: '14/01/2026',
            institution: 'Universidade Federal',
            description: 'Curso completo sobre engenharia de software, abrangendo desde os princípios fundamentais até as práticas mais modernas de desenvolvimento.'
        };

        courseStudents = [
            { id: '1', name: 'João Silva', email: 'joao@example.com', matricula: '2021001' },
            { id: '2', name: 'Maria Santos', email: 'maria@example.com', matricula: '2021002' },
            { id: '3', name: 'Pedro Costa', email: 'pedro@example.com', matricula: '2021003' }
        ];

        courseCoordinators = [
            { id: '1', name: 'Prof. Dr. Carlos Mendes', email: 'carlos@example.com', departamento: 'Engenharia' },
            { id: '2', name: 'Prof. Dra. Ana Paula', email: 'ana@example.com', departamento: 'Tecnologia' }
        ];

        courseCategories = [
            { id: '1', name: 'Desenvolvimento Web', descricao: 'Atividades relacionadas a desenvolvimento web' },
            { id: '2', name: 'Banco de Dados', descricao: 'Atividades relacionadas a banco de dados' }
        ];

        renderCourseData();
    } catch (error) {
        console.error('Erro ao carregar dados do curso:', error);
        alert('Erro ao carregar os dados do curso. Tente novamente.');
    }
}

// Função para renderizar os dados do curso
function renderCourseData() {
    if (!currentCourse) return;

    // Atualizar cabeçalho
    document.getElementById('course-title').textContent = currentCourse.name;
    document.getElementById('course-name').textContent = currentCourse.name;
    document.getElementById('course-code').textContent = `Código: ${currentCourse.code}`;
    document.getElementById('course-date').textContent = currentCourse.date;
    document.getElementById('course-institution').textContent = currentCourse.institution;
    document.getElementById('course-description').textContent = currentCourse.description;

    // Atualizar status
    const statusBadge = document.querySelector('.badge');
    if (currentCourse.status === 'Ativo') {
        statusBadge.classList.remove('badge-inactive');
        statusBadge.classList.add('badge-active');
        statusBadge.textContent = 'Ativo';
    } else {
        statusBadge.classList.remove('badge-active');
        statusBadge.classList.add('badge-inactive');
        statusBadge.textContent = 'Inativo';
    }

    // Renderizar categorias
    renderCategories();

    // Renderizar alunos
    renderStudents();

    // Renderizar coordenadores
    renderCoordinators();
}

// Função para renderizar categorias
function renderCategories() {
    const categoriesList = document.getElementById('categories-list');
    
    if (courseCategories.length === 0) {
        categoriesList.innerHTML = '<div class="empty-message">Nenhuma categoria vinculada.</div>';
        return;
    }

    categoriesList.innerHTML = courseCategories.map(category => `
        <div class="item-card">
            <div class="item-info">
                <div class="item-name">${category.name}</div>
                <div class="item-detail">${category.descricao}</div>
            </div>
            <div class="item-actions">
                <button class="btn-item-edit" title="Editar" onclick="editCategory('${category.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-item-delete" title="Excluir" onclick="deleteCategory('${category.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Função para renderizar alunos
function renderStudents() {
    const studentsList = document.getElementById('students-list');
    const studentsCount = document.getElementById('students-count');
    
    studentsCount.textContent = courseStudents.length;

    if (courseStudents.length === 0) {
        studentsList.innerHTML = '<div class="empty-message">Nenhum aluno vinculado.</div>';
        return;
    }

    studentsList.innerHTML = courseStudents.map(student => `
        <div class="item-card">
            <div class="item-info">
                <div class="item-name">${student.name}</div>
                <div class="item-detail">Matrícula: ${student.matricula} | Email: ${student.email}</div>
            </div>
            <div class="item-actions">
                <button class="btn-item-edit" title="Editar" onclick="editStudent('${student.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-item-delete" title="Remover" onclick="removeStudent('${student.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Função para renderizar coordenadores
function renderCoordinators() {
    const coordinatorsList = document.getElementById('coordinators-list');
    const coordinatorsCount = document.getElementById('coordinators-count');
    
    coordinatorsCount.textContent = courseCoordinators.length;

    if (courseCoordinators.length === 0) {
        coordinatorsList.innerHTML = '<div class="empty-message">Nenhum coordenador vinculado.</div>';
        return;
    }

    coordinatorsList.innerHTML = courseCoordinators.map(coordinator => `
        <div class="item-card">
            <div class="item-info">
                <div class="item-name">${coordinator.name}</div>
                <div class="item-detail">Departamento: ${coordinator.departamento} | Email: ${coordinator.email}</div>
            </div>
            <div class="item-actions">
                <button class="btn-item-edit" title="Editar" onclick="editCoordinator('${coordinator.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-item-delete" title="Remover" onclick="removeCoordinator('${coordinator.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Funções de edição e exclusão (placeholder)
function editCategory(categoryId) {
    console.log('Editar categoria:', categoryId);
    alert('Funcionalidade de edição de categoria em desenvolvimento.');
}

function deleteCategory(categoryId) {
    if (confirm('Tem certeza que deseja remover esta categoria?')) {
        courseCategories = courseCategories.filter(c => c.id !== categoryId);
        renderCategories();
    }
}

function editStudent(studentId) {
    console.log('Editar aluno:', studentId);
    alert('Funcionalidade de edição de aluno em desenvolvimento.');
}

function removeStudent(studentId) {
    if (confirm('Tem certeza que deseja remover este aluno?')) {
        courseStudents = courseStudents.filter(s => s.id !== studentId);
        renderStudents();
    }
}

function editCoordinator(coordinatorId) {
    console.log('Editar coordenador:', coordinatorId);
    alert('Funcionalidade de edição de coordenador em desenvolvimento.');
}

function removeCoordinator(coordinatorId) {
    if (confirm('Tem certeza que deseja remover este coordenador?')) {
        courseCoordinators = courseCoordinators.filter(c => c.id !== coordinatorId);
        renderCoordinators();
    }
}

document.querySelector('.sidebar-header').addEventListener('click', toggleMenu);

document.getElementById('btn-add-student').addEventListener('click', () => {
    alert('Funcionalidade de adicionar aluno em desenvolvimento.');
});

document.getElementById('btn-add-coordinator').addEventListener('click', () => {
    alert('Funcionalidade de adicionar coordenador em desenvolvimento.');
});

document.getElementById('btn-edit').addEventListener('click', () => {
    console.log('Editar curso:', currentCourse.id);
    alert('Funcionalidade de edição de curso em desenvolvimento.');
});

document.getElementById('btn-delete').addEventListener('click', () => {
    if (confirm('Tem certeza que deseja excluir este curso?')) {
        alert('Curso excluído com sucesso!');
        window.location.href = 'index.html';
    }
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    restoreMenuState();
    const courseId = getCourseIdFromURL();
    loadCourseData(courseId);
});

/**
 * Exemplo de função para integração com backend
 * Descomente e adapte conforme sua API
 */
async function fetchCourseFromBackend(courseId) {
    try {
        const response = await fetch(`/api/courses/${courseId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao buscar curso do backend:', error);
        throw error;
    }
}

async function fetchCourseStudents(courseId) {
    try {
        const response = await fetch(`/api/courses/${courseId}/students`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao buscar alunos do backend:', error);
        throw error;
    }
}

async function fetchCourseCoordinators(courseId) {
    try {
        const response = await fetch(`/api/courses/${courseId}/coordinators`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao buscar coordenadores do backend:', error);
        throw error;
    }
}

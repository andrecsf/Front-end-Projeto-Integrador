// Elementos do DOM
const toggleMenuBtn = document.getElementById('toggle-menu');
const sidebar = document.getElementById('sidebar');
const mainContent = document.querySelector('.main-content');

// Dados do coordenador (será preenchido dinamicamente)
let currentCoordinator = null;
let coordinatorCourses = [];

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

// Função para obter o ID do coordenador da URL
function getCoordinatorIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Função para calcular a inicial do nome
function getInitials(name) {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 1);
}

// Função para carregar dados do coordenador (exemplo com dados mockados)
async function loadCoordinatorData(coordinatorId) {
    try {
        // Aqui você faria uma chamada ao backend
        // const response = await fetch(`/api/coordinators/${coordinatorId}`);
        // const data = await response.json();
        
        // Por enquanto, usando dados mockados
        currentCoordinator = {
            id: coordinatorId || '1',
            name: 'Prof. Dr. Carlos Mendes',
            email: 'carlos@example.com',
            department: 'Departamento de Engenharia',
            registrationDate: '15/01/2024'
        };

        coordinatorCourses = [
            {
                id: '1',
                name: 'Engenharia de Software',
                code: 'ENG-SW-001',
                status: 'Ativo',
                studentsCount: 156
            },
            {
                id: '2',
                name: 'Ciência da Computação',
                code: 'CC-001',
                status: 'Ativo',
                studentsCount: 234
            },
            {
                id: '3',
                name: 'Análise e Desenvolvimento',
                code: 'ADS-001',
                status: 'Ativo',
                studentsCount: 189
            }
        ];

        renderCoordinatorData();
    } catch (error) {
        console.error('Erro ao carregar dados do coordenador:', error);
        alert('Erro ao carregar os dados do coordenador. Tente novamente.');
    }
}

// Função para renderizar os dados do coordenador
function renderCoordinatorData() {
    if (!currentCoordinator) return;

    // Atualizar informações do coordenador
    document.getElementById('coordinator-name').textContent = currentCoordinator.name;
    document.getElementById('coordinator-email').textContent = currentCoordinator.email;
    document.getElementById('coordinator-department').textContent = currentCoordinator.department;
    document.getElementById('registration-date').textContent = currentCoordinator.registrationDate;

    // Atualizar avatar
    const avatar = document.getElementById('coordinator-avatar');
    avatar.textContent = getInitials(currentCoordinator.name);

    // Calcular estatísticas
    const totalStudents = coordinatorCourses.reduce((sum, course) => sum + course.studentsCount, 0);
    document.getElementById('courses-count').textContent = coordinatorCourses.length;
    document.getElementById('students-count').textContent = totalStudents;

    // Renderizar cursos
    renderCourses();
}

// Função para renderizar cursos
function renderCourses() {
    const coursesList = document.getElementById('courses-list');
    
    if (coordinatorCourses.length === 0) {
        coursesList.innerHTML = '<div class="empty-message">Nenhum curso vinculado.</div>';
        return;
    }

    coursesList.innerHTML = coordinatorCourses.map(course => {
        const statusClass = course.status === 'Ativo' ? 'active' : 'inactive';
        return `
            <div class="course-item">
                <div class="course-info">
                    <div class="course-name">${course.name}</div>
                    <div class="course-code">Código: ${course.code} • ${course.studentsCount} alunos</div>
                </div>
                <span class="course-status ${statusClass}">${course.status}</span>
            </div>
        `;
    }).join('');
}

// Event Listeners
document.querySelector('.sidebar-header').addEventListener('click', toggleMenu);

document.getElementById('btn-edit').addEventListener('click', () => {
    console.log('Editar coordenador:', currentCoordinator.id);
    alert('Funcionalidade de edição de coordenador em desenvolvimento.');
});

document.getElementById('btn-delete').addEventListener('click', () => {
    if (confirm('Tem certeza que deseja remover este coordenador?')) {
        alert('Coordenador removido com sucesso!');
        window.history.back();
    }
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    restoreMenuState();
    const coordinatorId = getCoordinatorIdFromURL();
    loadCoordinatorData(coordinatorId);
});

/**
 * Exemplo de função para integração com backend
 * Descomente e adapte conforme sua API
 */
async function fetchCoordinatorFromBackend(coordinatorId) {
    try {
        const response = await fetch(`/api/coordinators/${coordinatorId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao buscar coordenador do backend:', error);
        throw error;
    }
}

async function fetchCoordinatorCourses(coordinatorId) {
    try {
        const response = await fetch(`/api/coordinators/${coordinatorId}/courses`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao buscar cursos do coordenador do backend:', error);
        throw error;
    }
}

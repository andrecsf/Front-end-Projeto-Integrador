// Elementos do DOM
const toggleMenuBtn = document.getElementById('toggle-menu');
const sidebar = document.getElementById('sidebar');
const mainContent = document.querySelector('.main-content');

// Dados do aluno (será preenchido dinamicamente)
let currentStudent = null;
let studentActivities = [];

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

// Função para obter o ID do aluno da URL
function getStudentIdFromURL() {
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

// Função para carregar dados do aluno (exemplo com dados mockados)
async function loadStudentData(studentId) {
    try {
        // Aqui você faria uma chamada ao backend
        // const response = await fetch(`/api/students/${studentId}`);
        // const data = await response.json();
        
        // Por enquanto, usando dados mockados
        currentStudent = {
            id: studentId || '1',
            name: 'João Silva',
            hoursCompleted: 120,
            hoursRequired: 200,
            progress: 60
        };

        studentActivities = [
            {
                id: '1',
                title: 'Participação em Hackathon',
                date: '14/03/2026',
                hours: 20,
                category: 'Eventos Acadêmicos'
            },
            {
                id: '2',
                title: 'Participação em Hackathon',
                date: '14/03/2026',
                hours: 20,
                category: 'Eventos Acadêmicos'
            },
            {
                id: '3',
                title: 'Workshop de Desenvolvimento Web',
                date: '10/03/2026',
                hours: 30,
                category: 'Workshops'
            },
            {
                id: '4',
                title: 'Palestra sobre Inovação',
                date: '05/03/2026',
                hours: 50,
                category: 'Palestras'
            }
        ];

        renderStudentData();
    } catch (error) {
        console.error('Erro ao carregar dados do aluno:', error);
        alert('Erro ao carregar os dados do aluno. Tente novamente.');
    }
}

// Função para renderizar os dados do aluno
function renderStudentData() {
    if (!currentStudent) return;

    // Atualizar informações do aluno
    document.getElementById('student-name').textContent = currentStudent.name;
    document.getElementById('student-hours').textContent = `${currentStudent.hoursCompleted}h / ${currentStudent.hoursRequired}h obrigatórias`;
    document.getElementById('progress-percentage').textContent = `${currentStudent.progress}%`;
    
    const progressFill = document.getElementById('progress-fill');
    progressFill.style.width = `${currentStudent.progress}%`;

    // Atualizar avatar
    const avatar = document.getElementById('student-avatar');
    avatar.textContent = getInitials(currentStudent.name);

    // Renderizar atividades
    renderActivities();
}

// Função para renderizar atividades
function renderActivities() {
    const activitiesList = document.getElementById('activities-list');
    
    if (studentActivities.length === 0) {
        activitiesList.innerHTML = '<div class="empty-message">Nenhuma atividade registrada.</div>';
        return;
    }

    activitiesList.innerHTML = studentActivities.map(activity => `
        <div class="activity-card">
            <div class="activity-icon">
                <i class="fas fa-file-alt"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-meta">
                    <span><i class="fas fa-user"></i> ${currentStudent.name}</span>
                    <span><i class="fas fa-calendar-alt"></i> ${activity.date} • ${activity.hours}h</span>
                </div>
                <span class="activity-category">${activity.category}</span>
            </div>
        </div>
    `).join('');
}

document.querySelector('.sidebar-header').addEventListener('click', toggleMenu);

document.getElementById('btn-edit').addEventListener('click', () => {
    console.log('Editar aluno:', currentStudent.id);
    alert('Funcionalidade de edição de aluno em desenvolvimento.');
});

document.getElementById('btn-delete').addEventListener('click', () => {
    if (confirm('Tem certeza que deseja remover este aluno?')) {
        alert('Aluno removido com sucesso!');
        window.history.back();
    }
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    restoreMenuState();
    const studentId = getStudentIdFromURL();
    loadStudentData(studentId);
});

/**
 * Exemplo de função para integração com backend
 * Descomente e adapte conforme sua API
 */
async function fetchStudentFromBackend(studentId) {
    try {
        const response = await fetch(`/api/students/${studentId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao buscar aluno do backend:', error);
        throw error;
    }
}

async function fetchStudentActivities(studentId) {
    try {
        const response = await fetch(`/api/students/${studentId}/activities`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao buscar atividades do aluno do backend:', error);
        throw error;
    }
}

// Elementos do DOM
const toggleMenuBtn = document.getElementById('toggle-menu');
const sidebar = document.getElementById('sidebar');
const mainContent = document.querySelector('.main-content');

// Dados globais do sistema (será preenchido dinamicamente)
let systemData = {
    totalCourses: 0,
    totalStudents: 0,
    totalCoordinators: 0,
    totalHours: 0,
    engagement: {
        active: 0,
        completing: 0,
        inactive: 0
    },
    recentActivities: []
};

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

// Função para formatar data
function formatDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('pt-BR', options);
}

// Função para atualizar a data atual
function updateCurrentDate() {
    const dateElement = document.getElementById('current-date');
    const today = new Date();
    const formattedDate = formatDate(today);
    dateElement.textContent = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
}

// Função para carregar dados do sistema (exemplo com dados mockados)
async function loadSystemData() {
    try {
        // Aqui você faria uma chamada ao backend
        // const response = await fetch('/api/dashboard/metrics');
        // const data = await response.json();
        
        // Por enquanto, usando dados mockados
        systemData = {
            totalCourses: 12,
            totalStudents: 1247,
            totalCoordinators: 8,
            totalHours: 8945,
            engagement: {
                active: 65,
                completing: 25,
                inactive: 10
            },
            recentActivities: [
                {
                    id: '1',
                    type: 'course',
                    title: 'Novo curso criado: Inteligência Artificial',
                    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
                    icon: 'fa-book'
                },
                {
                    id: '2',
                    type: 'student',
                    title: '45 novos alunos cadastrados',
                    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 horas atrás
                    icon: 'fa-user-plus'
                },
                {
                    id: '3',
                    type: 'activity',
                    title: '320 horas de atividades complementares registradas',
                    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 dia atrás
                    icon: 'fa-clock'
                },
                {
                    id: '4',
                    type: 'coordinator',
                    title: 'Prof. Dr. Carlos Mendes vinculado a novo curso',
                    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
                    icon: 'fa-chalkboard-user'
                },
                {
                    id: '5',
                    type: 'course',
                    title: 'Curso "Análise e Desenvolvimento" atualizado',
                    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 dias atrás
                    icon: 'fa-sync'
                }
            ]
        };

        renderSystemData();
    } catch (error) {
        console.error('Erro ao carregar dados do sistema:', error);
        alert('Erro ao carregar os dados do dashboard. Tente novamente.');
    }
}

// Função para renderizar os dados do sistema
function renderSystemData() {
    // Atualizar KPIs
    document.getElementById('total-courses').textContent = systemData.totalCourses;
    document.getElementById('total-students').textContent = systemData.totalStudents;
    document.getElementById('total-coordinators').textContent = systemData.totalCoordinators;
    document.getElementById('total-hours').textContent = systemData.totalHours.toLocaleString('pt-BR');

    // Atualizar engajamento
    const totalEngagement = systemData.engagement.active + systemData.engagement.completing + systemData.engagement.inactive;
    
    const activePercentage = Math.round((systemData.engagement.active / totalEngagement) * 100);
    const completingPercentage = Math.round((systemData.engagement.completing / totalEngagement) * 100);
    const inactivePercentage = Math.round((systemData.engagement.inactive / totalEngagement) * 100);

    document.getElementById('active-percentage').textContent = `${activePercentage}%`;
    document.getElementById('completing-percentage').textContent = `${completingPercentage}%`;
    document.getElementById('inactive-percentage').textContent = `${inactivePercentage}%`;

    document.getElementById('active-bar').style.width = `${activePercentage}%`;
    document.getElementById('completing-bar').style.width = `${completingPercentage}%`;
    document.getElementById('inactive-bar').style.width = `${inactivePercentage}%`;

    // Renderizar atividades recentes
    renderRecentActivities();
}

// Função para renderizar atividades recentes
function renderRecentActivities() {
    const activitiesList = document.getElementById('recent-activities');
    
    if (systemData.recentActivities.length === 0) {
        activitiesList.innerHTML = '<div class="empty-message">Nenhuma atividade registrada.</div>';
        return;
    }

    activitiesList.innerHTML = systemData.recentActivities.map(activity => {
        const timeAgo = getTimeAgo(activity.timestamp);
        return `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas ${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-time">${timeAgo}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Função para calcular tempo decorrido
function getTimeAgo(date) {
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' anos atrás';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' meses atrás';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' dias atrás';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' horas atrás';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutos atrás';
    
    return 'Agora mesmo';
}

// Event Listeners
document.querySelector('.sidebar-header').addEventListener('click', toggleMenu);

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    restoreMenuState();
    updateCurrentDate();
    loadSystemData();
    
    // Atualizar dados a cada 5 minutos
    setInterval(loadSystemData, 5 * 60 * 1000);
});

/**
 * Exemplo de função para integração com backend
 * Descomente e adapte conforme sua API
 */
async function fetchDashboardMetrics() {
    try {
        const response = await fetch('/api/dashboard/metrics');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao buscar métricas do dashboard:', error);
        throw error;
    }
}

async function fetchRecentActivities(limit = 5) {
    try {
        const response = await fetch(`/api/dashboard/activities?limit=${limit}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao buscar atividades recentes:', error);
        throw error;
    }
}

async function fetchSystemHealth() {
    try {
        const response = await fetch('/api/system/health');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao buscar saúde do sistema:', error);
        throw error;
    }
}

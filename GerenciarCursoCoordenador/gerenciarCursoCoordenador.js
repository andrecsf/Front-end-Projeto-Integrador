const API = 'https://back-end-projeto-integrador.onrender.com';

const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('mainContent');
const courseList = document.getElementById('course-list');
const totalCourses = document.getElementById('total-courses');
const searchInput = document.getElementById('search-input');


const ROTAS = {
    inicio: "../Telainicial/telaInicial.html",
    perfil: "#",
    relatorio: "../RelatoriosDosAlunos/relatoriosDosAlunos.html",
    gerenciarCurso: "../GerenciarCursoCoordenador/gerenciarCursoCoordenador.html",
    configuracoes: "../Login/index.html",
    perfilCurso: "../PerfilCursoCoordenador/perfilCursoCoordenador.html"
};

let courses = [];


const sidebarToggle = document.getElementById('sidebarToggle');
if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    });
}

if (localStorage.getItem('sidebarCollapsed') === 'true') {
    sidebar?.classList.add('collapsed');
    mainContent?.classList.add('expanded');
}


const btnVoltar = document.getElementById('btnVoltar');
if (btnVoltar) {
    btnVoltar.style.cursor = 'pointer';
    btnVoltar.addEventListener('click', () => {
        window.location.href = ROTAS.inicio;
    });
}

async function loadCourses() {
    try {
        const token = localStorage.getItem('token');

        const response = await fetch(`${API}/cursos`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 403) throw new Error('Sessão expirada. Faça login novamente.');
            throw new Error('Erro ao carregar cursos');
        }

        courses = await response.json();

        renderCourses(courses);
        updateStats();

    } catch (error) {
        console.error('Erro ao carregar cursos:', error);

        courseList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-circle" style="font-size: 2rem; color: #ff4d4d; margin-bottom: 10px;"></i>
                <p>${error.message}</p>
            </div>
        `;
    }
}


function renderCourses(courseArray) {
    if (courseArray.length === 0) {
        courseList.innerHTML = `
            <div class="empty-state">
                <p>Nenhum curso cadastrado ainda.</p>
            </div>
        `;
        return;
    }

    courseList.innerHTML = courseArray.map(course => `
        <div class="course-card" onclick="openCourseDetails(${course.id})">
            <div class="course-card-icon">
                <i class="fas fa-graduation-cap"></i>
            </div>
            <div class="course-card-content">
                <h3>${course.nome}</h3>
                <p>${course.descricao || 'Nenhuma descrição fornecida.'}</p>
                <div class="course-card-footer">
                    <span><i class="fas fa-clock"></i> ${course.cargaHorariaMax}h</span>
                    <span class="badge-active">Ativo</span>
                </div>
            </div>
        </div>
    `).join('');
}


function updateStats() {
    if (totalCourses) totalCourses.textContent = courses.length;
}


if (searchInput) {
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();

        const filteredCourses = courses.filter(course =>
            course.nome.toLowerCase().includes(searchTerm) ||
            (course.descricao && course.descricao.toLowerCase().includes(searchTerm))
        );

        renderCourses(filteredCourses);
    });
}


function openCourseDetails(courseId) {
    window.location.href = `${ROTAS.perfilCurso}?id=${courseId}`;
}


document.addEventListener('DOMContentLoaded', () => {
    loadCourses();

    // LOGOUT
    const logoutLink = document.querySelector('.sidebar-footer a');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            window.location.href = ROTAS.configuracoes;
        });
    }
});
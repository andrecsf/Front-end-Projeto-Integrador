const API = 'https://back-end-projeto-integrador.onrender.com';

const sidebar = document.getElementById('sidebar');
const mainContent = document.querySelector('.main-content');
const courseList = document.getElementById('course-list');
const totalCourses = document.getElementById('total-courses');
const activeCourses = document.getElementById('active-courses');
const totalStudents = document.getElementById('total-students');
const searchInput = document.getElementById('search-input');


const ROTAS = {
    inicio: "../HomeAdmin/home-super-admin.html",
    perfil: "../PerfilSuperadmin/dashboard-superadmin.html",
    perfilCurso: "../PerfilCurso/perfil-curso.html",
    cursos: "../GerenciarCurso/gerenciarCursos.html",
    usuarios: "../PI TELAGerenciarUsuário/TELAGERENCIARUSUARIO.html",
};

let courses = [];


function toggleMenu() {
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded');

    const isCollapsed = sidebar.classList.contains('collapsed');
    localStorage.setItem('sidebarCollapsed', isCollapsed);
}

function restoreMenuState() {
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';

    if (isCollapsed) {
        sidebar.classList.add('collapsed');
        mainContent.classList.add('expanded');
    }
}


const sidebarHeader = document.querySelector('.sidebar-header');
if (sidebarHeader) {
    sidebarHeader.addEventListener('click', toggleMenu);
}


const menuLinks = document.querySelectorAll(".sidebar-nav ul li a");

const menuKeys = [
    "inicio",
    "perfil",
    "cursos",
    "usuarios",
    "documentos",
    "configuracoes"
];

menuLinks.forEach((link, index) => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        const rota = menuKeys[index];
        if (ROTAS[rota]) {
            window.location.href = ROTAS[rota];
        }
    });
});


const btnVoltar = document.getElementById("btnVoltar");
if (btnVoltar) {
    btnVoltar.style.cursor = "pointer";
    btnVoltar.addEventListener("click", () => {
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
    totalCourses.textContent = courses.length;
    activeCourses.textContent = courses.length;
    totalStudents.textContent = 0;
}


searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();

    const filteredCourses = courses.filter(course =>
        course.nome.toLowerCase().includes(searchTerm) ||
        (course.descricao && course.descricao.toLowerCase().includes(searchTerm))
    );

    renderCourses(filteredCourses);
});


function openCourseDetails(courseId) {
    window.location.href = `${ROTAS.perfilCurso}?id=${courseId}`;
}


document.addEventListener('DOMContentLoaded', () => {
    restoreMenuState();
    loadCourses();
});
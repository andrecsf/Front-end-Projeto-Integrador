// =========================
// ELEMENTOS
// =========================
const sidebar = document.getElementById('sidebar');
const mainContent = document.querySelector('.main-content');
const courseList = document.getElementById('course-list');
const totalCourses = document.getElementById('total-courses');
const activeCourses = document.getElementById('active-courses');
const totalStudents = document.getElementById('total-students');
const searchInput = document.getElementById('search-input');

// =========================
// ROTAS
// =========================
const ROTAS = {
    inicio: "../HomeAdmin/home-super-admin.html",
    perfil: "../PerfilCurso/perfil-curso.html",
    cursos: "../GerenciarCurso/gerenciarCursos.html",
    usuarios: "../PI TELAGerenciarUsuário/TELAGERENCIARUSUARIO.html",
    documentos: "../CadastrarCategoria/cadastrarCategoria.html",
    configuracoes: "../Login/index.html"
};

let courses = [];

// =========================
// SIDEBAR TOGGLE
// =========================
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

// clique no topo da sidebar
const sidebarHeader = document.querySelector('.sidebar-header');
if (sidebarHeader) {
    sidebarHeader.addEventListener('click', toggleMenu);
}

// =========================
// SIDEBAR NAVEGAÇÃO
// =========================
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

// =========================
// BOTÃO VOLTAR
// =========================
const btnVoltar = document.getElementById("btnVoltar");

if (btnVoltar) {
    btnVoltar.style.cursor = "pointer";

    btnVoltar.addEventListener("click", () => {
        window.location.href = ROTAS.inicio;
    });
}

// =========================
// CARREGAR CURSOS
// =========================
async function loadCourses() {
    try {
        const response = await fetch('http://localhost:8080/cursos');

        if (!response.ok) {
            throw new Error('Erro ao carregar cursos');
        }

        courses = await response.json();

        renderCourses(courses);
        updateStats();

    } catch (error) {
        console.error('Erro ao carregar cursos:', error);

        courseList.innerHTML = `
            <div class="empty-state">
                <p>Erro ao carregar cursos.</p>
            </div>
        `;
    }
}

// =========================
// RENDER CURSOS
// =========================
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
        <div class="course-card" data-id="${course.id}">
            <h3>${course.nome}</h3>
            <p>${course.descricao || 'Sem descrição'}</p>
            <span>Carga horária: ${course.cargaHorariaMax}h</span>
        </div>
    `).join('');

    // clique nos cursos
    document.querySelectorAll(".course-card").forEach(card => {
        card.style.cursor = "pointer";

        card.addEventListener("click", () => {
            const id = card.getAttribute("data-id");
            openCourseDetails(id);
        });
    });
}

// =========================
// ESTATÍSTICAS
// =========================
function updateStats() {
    totalCourses.textContent = courses.length;
    activeCourses.textContent = courses.length;
    totalStudents.textContent = 0;
}

// =========================
// BUSCA
// =========================
searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();

    const filteredCourses = courses.filter(course =>
        course.nome.toLowerCase().includes(searchTerm)
    );

    renderCourses(filteredCourses);
});

// =========================
// DETALHES DO CURSO
// =========================
function openCourseDetails(courseId) {
    window.location.href = `../CursoDetalhes/cursoDetalhes.html?id=${courseId}`;
}

// =========================
// INIT
// =========================
document.addEventListener('DOMContentLoaded', () => {
    restoreMenuState();
    loadCourses();
});
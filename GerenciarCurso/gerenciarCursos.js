const sidebar = document.getElementById('sidebar');
const mainContent = document.querySelector('.main-content');
const courseList = document.getElementById('course-list');
const totalCourses = document.getElementById('total-courses');
const activeCourses = document.getElementById('active-courses');
const totalStudents = document.getElementById('total-students');
const searchInput = document.getElementById('search-input');

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

document.querySelector('.sidebar-header').addEventListener('click', toggleMenu);

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
        <div class="course-card" onclick="openCourseDetails(${course.id})" style="cursor: pointer;">
            <h3>${course.nome}</h3>
            <p>${course.descricao || 'Sem descrição'}</p>
            <span>Carga horária: ${course.cargaHorariaMax}h</span>
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
        course.nome.toLowerCase().includes(searchTerm)
    );

    renderCourses(filteredCourses);
});

function openCourseDetails(courseId) {
    window.location.href = `../CursoDetalhes/cursoDetalhes.html?id=${courseId}`;
}

document.addEventListener('DOMContentLoaded', () => {
    restoreMenuState();
    loadCourses();
});
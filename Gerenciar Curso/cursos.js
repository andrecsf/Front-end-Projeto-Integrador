let courses = [];

const courseListContainer = document.getElementById('course-list');
const totalCoursesEl = document.getElementById('total-courses');
const activeCoursesEl = document.getElementById('active-courses');
const totalStudentsEl = document.getElementById('total-students');
const searchInput = document.getElementById('search-input');
const toggleMenuBtn = document.getElementById('toggle-menu');
const sidebar = document.getElementById('sidebar');
const mainContent = document.querySelector('.main-content');

function formatDate(dateString) {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
}

function renderCourses(coursesToRender = courses) {
    courseListContainer.innerHTML = '';

    if (coursesToRender.length === 0) {
        courseListContainer.innerHTML = `
            <div class="empty-state">
                <p>Nenhum curso cadastrado ainda.</p>
            </div>
        `;
        updateStats(0, 0, 0);
        return;
    }

    coursesToRender.forEach(course => {
        const card = document.createElement('div');
        card.className = 'course-card';
        
        const isActive = course.status === 'Ativo';
        const badgeClass = isActive ? 'badge-active' : 'badge-inactive';
        const iconClass = isActive ? '' : 'inactive';

        card.innerHTML = `
            <div class="course-icon ${iconClass}">
                <i class="fas fa-book-open"></i>
            </div>
            <div class="course-info">
                <div class="course-title-row">
                    <h3>${course.name}</h3>
                    <span class="badge ${badgeClass}">${course.status}</span>
                </div>
                <p class="course-code">Código: ${course.code}</p>
                <div class="course-details">
                    <span><i class="fas fa-users"></i> ${course.students} alunos</span>
                    <span><i class="fas fa-calendar-alt"></i> ${course.date}</span>
                </div>
                <p class="course-prof">Prof. ${course.professor}</p>
            </div>
            <div class="course-actions">
                <button class="btn-edit" title="Editar"><i class="fas fa-edit"></i></button>
                <button class="btn-delete" title="Excluir" onclick="deleteCourse('${course.id}')"><i class="fas fa-trash"></i></button>
            </div>
        `;
        courseListContainer.appendChild(card);
    });

    calculateStats();
}

function calculateStats() {
    const total = courses.length;
    const active = courses.filter(c => c.status === 'Ativo').length;
    const students = courses.reduce((sum, c) => sum + c.students, 0);
    
    updateStats(total, active, students);
}

function updateStats(total, active, students) {
    totalCoursesEl.textContent = total;
    activeCoursesEl.textContent = active;
    totalStudentsEl.textContent = students;
}

function deleteCourse(id) {
    if (confirm('Tem certeza que deseja excluir este curso?')) {
        courses = courses.filter(c => c.id !== id);
        renderCourses();
    }
}

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

searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredCourses = courses.filter(course => 
        course.name.toLowerCase().includes(searchTerm) || 
        course.code.toLowerCase().includes(searchTerm) ||
        course.professor.toLowerCase().includes(searchTerm)
    );
    renderCourses(filteredCourses);
});

document.addEventListener('DOMContentLoaded', () => {
    restoreMenuState();

    renderCourses();
});

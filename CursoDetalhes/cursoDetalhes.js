const sidebar = document.getElementById('sidebar');
const mainContent = document.querySelector('.main-content');

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

async function loadCourseDetails() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        alert('Curso não encontrado.');
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/cursos/${id}`);

        if (!response.ok) {
            throw new Error('Erro ao buscar curso');
        }

        const curso = await response.json();

        document.getElementById('course-name').value = curso.nome || '';
        document.getElementById('course-description').value = curso.descricao || '';
        document.getElementById('course-workload').value = curso.cargaHorariaMax || '';

    } catch (error) {
        console.error('Erro ao carregar curso:', error);
        alert('Erro ao carregar os detalhes do curso.');
    }
}

document.getElementById('course-details-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    const updatedCourse = {
        nome: document.getElementById('course-name').value.trim(),
        descricao: document.getElementById('course-description').value.trim(),
        cargaHorariaMax: parseInt(document.getElementById('course-workload').value)
    };

    try {
        const response = await fetch(`http://localhost:8080/cursos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedCourse)
        });

        if (!response.ok) {
            throw new Error('Erro ao atualizar curso');
        }

        alert('Curso atualizado com sucesso!');
        window.location.href = 'cursos.html';

    } catch (error) {
        console.error('Erro ao atualizar curso:', error);
        alert('Erro ao atualizar curso.');
    }
});

async function deleteCourse() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!confirm('Deseja realmente excluir este curso?')) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/cursos/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Erro ao excluir curso');
        }

        alert('Curso excluído com sucesso!');
        window.location.href = 'cursos.html';

    } catch (error) {
        console.error('Erro ao excluir curso:', error);
        alert('Erro ao excluir curso.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    restoreMenuState();
    loadCourseDetails();
});
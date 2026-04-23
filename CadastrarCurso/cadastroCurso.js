const sidebar = document.getElementById('sidebar');
const mainContent = document.querySelector('.main-content');
const courseForm = document.getElementById('course-form');

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

courseForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const courseData = {
        nome: document.getElementById('course-name').value.trim(),
        descricao: document.getElementById('course-description').value.trim(),
        cargaHorariaMax: parseInt(document.getElementById('course-workload').value)
    };

    if (!courseData.nome || !courseData.cargaHorariaMax) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    try {
        const response = await fetch('http://localhost:8080/cursos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(courseData)
        });

        if (!response.ok) {
            throw new Error('Erro ao salvar curso');
        }

        console.log('Curso salvo com sucesso');

        window.location.href = '../GerenciarCurso/gerenciarCursos.html';

    } catch (error) {
        console.error('Erro ao salvar curso:', error);
        alert('Erro ao salvar o curso. Tente novamente.');
    }
});

document.addEventListener('DOMContentLoaded', restoreMenuState);
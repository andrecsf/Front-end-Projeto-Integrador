const API = 'https://back-end-projeto-integrador.onrender.com';

const sidebar = document.getElementById('sidebar');
const mainContent = document.querySelector('.main-content');
const courseForm = document.getElementById('course-form');
const btnSave = document.getElementById('btn-save');

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

    if (!courseData.nome || isNaN(courseData.cargaHorariaMax)) {
        alert('Por favor, preencha todos os campos obrigatórios corretamente.');
        return;
    }

    btnSave.disabled = true;
    btnSave.innerText = 'Salvando...';

    try {
        const token = localStorage.getItem('token');

        const response = await fetch(`${API}/cursos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(courseData)
        });

        if (!response.ok) {
            if (response.status === 409 || response.status === 400 || response.status === 500) {
                throw new Error('Este curso já está cadastrado ou os dados são inválidos.');
            } else {
                throw new Error('Ocorreu um erro inesperado no servidor. Tente novamente mais tarde.');
            }
        }

        console.log('Curso salvo com sucesso');
        alert('Curso cadastrado com sucesso!');

        window.location.href = '../GerenciarCurso/gerenciarCursos.html';

    } catch (error) {
        console.error('Erro na requisição:', error);
        alert(error.message);
    } finally {
        btnSave.disabled = false;
        btnSave.innerText = 'Salvar';
    }
});

document.addEventListener('DOMContentLoaded', restoreMenuState);
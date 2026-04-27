const sidebar = document.getElementById('sidebar');
const mainContent = document.querySelector('.main-content');
const courseForm = document.getElementById('course-form');
const btnSave = document.getElementById('btn-save'); // Selecionando o botão de salvar

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

    // Captura os dados do formulário
    const courseData = {
        nome: document.getElementById('course-name').value.trim(),
        descricao: document.getElementById('course-description').value.trim(),
        cargaHorariaMax: parseInt(document.getElementById('course-workload').value)
    };

    // Validação básica no front-end
    if (!courseData.nome || isNaN(courseData.cargaHorariaMax)) {
        alert('Por favor, preencha todos os campos obrigatórios corretamente.');
        return;
    }

    // Desabilita o botão e muda o texto para dar feedback visual
    btnSave.disabled = true;
    btnSave.innerText = 'Salvando...';

    try {
        const response = await fetch('http://localhost:8080/cursos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(courseData)
        });

        // Se a resposta não for OK (status fora de 200-299)
        if (!response.ok) {
            // Se o status for 409 (Conflict) ou 400 (Bad Request), tratamos como duplicidade/erro de validação
            if (response.status === 409 || response.status === 400 ||response.status === 500) {
                throw new Error('Este curso já está cadastrado ou os dados são inválidos.');
            } else {
                throw new Error('Ocorreu um erro inesperado no servidor. Tente novamente mais tarde.');
            }
        }

        console.log('Curso salvo com sucesso');
        alert('Curso cadastrado com sucesso!');
        
        // Redirecionamento
        window.location.href = '../GerenciarCurso/gerenciarCursos.html';

    } catch (error) {
        console.error('Erro na requisição:', error);
        // Exibe a mensagem específica definida no throw new Error
        alert(error.message);
    } finally {
        // Reativa o botão caso ocorra erro ou termine o processo
        btnSave.disabled = false;
        btnSave.innerText = 'Salvar';
    }
});

document.addEventListener('DOMContentLoaded', restoreMenuState);
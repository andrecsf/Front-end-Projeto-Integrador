const sidebar = document.getElementById('sidebar');
const mainContent = document.querySelector('.main-content');
const courseForm = document.getElementById('course-form');
const btnSave = document.getElementById('btn-save');
const btnCancel = document.getElementById('btn-cancel');

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
        name: document.getElementById('course-name').value,
        description: document.getElementById('course-description').value,
        category: document.getElementById('course-category').value,
        institution: document.getElementById('course-institution').value,
        date: document.getElementById('course-date').value
    };

    if (!courseData.name || !courseData.institution || !courseData.date) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    try {
        // Aqui você faria a chamada para o backend
        // Exemplo:
        // const response = await fetch('/api/courses', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(courseData)
        // });
        // if (!response.ok) throw new Error('Erro ao salvar curso');
        // const result = await response.json();
        
        // Por enquanto, apenas exibir uma mensagem de sucesso
        console.log('Dados do curso:', courseData);
        alert('Curso cadastrado com sucesso!');
        
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Erro ao salvar curso:', error);
        alert('Erro ao salvar o curso. Tente novamente.');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    restoreMenuState();
});

function setSelectedCategory(categoryName) {
    document.getElementById('course-category').value = categoryName;
}


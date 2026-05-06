const API = 'https://back-end-projeto-integrador.onrender.com';

const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('mainContent');
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
        window.history.back();
    });
}


const token = localStorage.getItem('token');

if (!token) {
    alert('Sessão expirada. Por favor, faça login novamente.');
    window.location.href = '../Login/index.html';
}


async function loadProfileData() {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userEmail = payload.sub;

        const response = await fetch(`${API}/coordenadores`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Erro ao buscar coordenadores');

        const coordenadores = await response.json();
        const meuPerfil = coordenadores.find(c => c.email === userEmail);

        if (meuPerfil) {
            renderProfile(meuPerfil);
            loadMyCourses(meuPerfil.id);
        } else {
            showError('Perfil não encontrado para este usuário.');
        }

    } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        showError('Erro ao conectar com o servidor.');
    }
}


function renderProfile(data) {
    document.getElementById('profile-name').textContent = data.name;
    document.getElementById('sidebar-user-name').textContent = data.name;
    document.getElementById('profile-email').textContent = data.email;
    document.getElementById('user-id').textContent = `#${data.id}`;
    document.getElementById('profile-avatar').textContent = data.name.charAt(0).toUpperCase();
}


async function loadMyCourses(coordId) {
    try {
        const response = await fetch(`${API}/cursos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Erro ao buscar cursos');

        const todosCursos = await response.json();
        const meusCursos = todosCursos.filter(curso =>
            curso.coordenador && curso.coordenador.id === coordId
        );

        document.getElementById('courses-count').textContent = meusCursos.length;
        renderCourses(meusCursos);

    } catch (error) {
        console.error('Erro ao carregar cursos:', error);
        document.getElementById('courses-list').innerHTML =
            '<div class="empty-state"><p>Erro ao carregar cursos.</p></div>';
    }
}


function renderCourses(cursos) {
    const container = document.getElementById('courses-list');

    if (cursos.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>Você ainda não possui cursos vinculados.</p>
            </div>`;
        return;
    }

    container.innerHTML = cursos.map(curso => `
        <div class="course-card">
            <div class="course-icon">
                <i class="fas fa-book"></i>
            </div>
            <div class="course-info">
                <div class="course-title-row">
                    <h3>${curso.nome}</h3>
                    <span class="badge badge-active">Ativo</span>
                </div>
                <div class="course-details">
                    <span><i class="fas fa-clock"></i> ${curso.cargaHorariaMax}h</span>
                    ${curso.descricao ? `<span><i class="fas fa-info-circle"></i> ${curso.descricao}</span>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}


function showError(msg) {
    document.getElementById('profile-name').textContent = 'Erro';
    document.getElementById('courses-list').innerHTML =
        `<div class="empty-state"><p>${msg}</p></div>`;
}


document.addEventListener('DOMContentLoaded', loadProfileData);
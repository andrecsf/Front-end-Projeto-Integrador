// perfilCursoCoordenador.js

document.addEventListener('DOMContentLoaded', () => {

    // =========================
    // ELEMENTOS
    // =========================
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const searchInput = document.getElementById('search-student');
    const studentsList = document.getElementById('students-list');

    // =========================
    // ROTAS
    // =========================
    const ROTAS = {
        voltar: '../GerenciarCursoCoordenador/gerenciarCursoCoordenador.html',
        login: '../Login/index.html'
    };

    // =========================
    // SIDEBAR TOGGLE
    // =========================
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
        });
    }

    // =========================
    // BOTÃO VOLTAR
    // =========================
    const btnVoltar = document.getElementById('btnVoltar');
    if (btnVoltar) {
        btnVoltar.style.cursor = 'pointer';
        btnVoltar.addEventListener('click', () => {
            window.location.href = ROTAS.voltar;
        });
    }

    // =========================
    // LOGOUT
    // =========================
    const logoutLink = document.querySelector('.sidebar-footer a');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            window.location.href = ROTAS.login;
        });
    }

    // =========================
    // PEGAR ID DO CURSO NA URL
    // =========================
    const params = new URLSearchParams(window.location.search);
    const courseId = params.get('id');

    if (!courseId) {
        mostrarErro('ID do curso não encontrado na URL.');
        return;
    }

    // =========================
    // BUSCAR DADOS DO CURSO
    // =========================
    async function carregarCurso() {
        try {
            const token = localStorage.getItem('token');

            const response = await fetch(`http://localhost:8080/cursos/${courseId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 403) throw new Error('Sessão expirada. Faça login novamente.');
                if (response.status === 404) throw new Error('Curso não encontrado.');
                throw new Error('Erro ao carregar dados do curso.');
            }

            const curso = await response.json();
            preencherDadosCurso(curso);

        } catch (error) {
            console.error('Erro ao carregar curso:', error);
            mostrarErro(error.message);
        }
    }

    // =========================
    // PREENCHER DADOS NA TELA
    // =========================
    function preencherDadosCurso(curso) {
        const nomeCurso = document.getElementById('course-name');
        const descricaoCurso = document.getElementById('course-description');
        const cargaHoraria = document.getElementById('course-workload');
        const contadorAlunos = document.getElementById('students-count');

        if (nomeCurso) nomeCurso.textContent = curso.nome || '—';
        if (descricaoCurso) descricaoCurso.textContent = curso.descricao || 'Nenhuma descrição fornecida.';
        if (cargaHoraria) cargaHoraria.textContent = `${curso.cargaHorariaMax}h` || '—';

        // Se o backend retornar lista de alunos
        if (curso.alunos && studentsList) {
            contadorAlunos && (contadorAlunos.textContent = curso.alunos.length);
            renderizarAlunos(curso.alunos);
        }
    }

    // =========================
    // RENDERIZAR LISTA DE ALUNOS
    // =========================
    function renderizarAlunos(alunos) {
        if (!studentsList) return;

        if (alunos.length === 0) {
            studentsList.innerHTML = `
                <div class="empty-state">
                    <p>Nenhum aluno vinculado a este curso.</p>
                </div>
            `;
            return;
        }

        studentsList.innerHTML = alunos.map(aluno => `
            <div class="student-item">
                <i class="fa-regular fa-user"></i>
                <span>${aluno.nome}</span>
            </div>
        `).join('');
    }

    // =========================
    // BUSCA DE ALUNOS
    // =========================
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const studentItems = studentsList.querySelectorAll('.student-item');
            let foundAny = false;

            studentItems.forEach(item => {
                const name = item.textContent.toLowerCase();
                if (name.includes(searchTerm)) {
                    item.style.display = 'flex';
                    foundAny = true;
                } else {
                    item.style.display = 'none';
                }
            });

            const emptyMsg = studentsList.querySelector('.empty-state');
            if (emptyMsg) {
                emptyMsg.style.display = (!foundAny) ? 'block' : 'none';
            }
        });
    }

    // =========================
    // MOSTRAR ERRO NA TELA
    // =========================
    function mostrarErro(msg) {
        const main = document.querySelector('.content-padding') || document.body;
        main.innerHTML = `
            <div class="empty-state" style="padding: 2rem; text-align: center;">
                <i class="fa-solid fa-circle-exclamation" style="font-size: 2rem; color: #ff4d4d; margin-bottom: 10px;"></i>
                <p>${msg}</p>
            </div>
        `;
    }

    // =========================
    // BOTÕES DE AÇÃO
    // =========================
    document.getElementById('btn-add-category')?.addEventListener('click', () => {
        console.log('Abrir modal de adicionar categoria');
    });

    document.getElementById('btn-add-student')?.addEventListener('click', () => {
        console.log('Abrir modal de vincular aluno');
    });

    // =========================
    // INICIALIZAR
    // =========================
    carregarCurso();
});
// perfilCursoCoordenador.js

const API = 'http://localhost:8080';

// =========================
// TOKEN
// =========================
const token = localStorage.getItem('token');
if (!token) {
    alert('Sessão expirada. Faça login novamente.');
    window.location.href = '../Login/index.html';
}

function authHeaders() {
    return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
}

// =========================
// ID DO CURSO NA URL
// =========================
const params   = new URLSearchParams(window.location.search);
const courseId = params.get('id');

// =========================
// ESTADO
// =========================
let alunosVinculados = [];
let todosAlunos      = [];

// =========================
// UTILS
// =========================
function getIniciais(nome) {
    if (!nome) return '?';
    return nome.trim().split(' ').filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('');
}

// =========================
// CARREGAR CURSO
// =========================
async function carregarCurso() {
    try {
        const res = await fetch(`${API}/cursos/${courseId}`, { headers: authHeaders() });
        if (!res.ok) throw new Error('Erro ao buscar curso');
        const curso = await res.json();

        document.getElementById('course-name').textContent        = curso.nome        || '—';
        document.getElementById('course-description').textContent = curso.descricao   || 'Nenhuma descrição.';
        document.getElementById('course-workload').textContent    = curso.cargaHorariaMax ? `${curso.cargaHorariaMax}h` : '—';
    } catch (e) {
        console.error(e);
        mostrarErro('Erro ao carregar dados do curso.');
    }
}

// =========================
// CARREGAR ALUNOS VINCULADOS
// =========================
async function carregarAlunosVinculados() {
    const lista = document.getElementById('students-list');
    lista.innerHTML = `<div class="empty-state"><i class="fa-solid fa-spinner fa-spin"></i><p>Carregando alunos...</p></div>`;

    try {
        const res = await fetch(`${API}/alunos/curso/${courseId}`, { headers: authHeaders() });
        if (!res.ok) throw new Error('Erro ao buscar alunos');
        alunosVinculados = await res.json();

        document.getElementById('students-count').textContent = alunosVinculados.length;
        renderizarAlunos(alunosVinculados);
    } catch (e) {
        console.error(e);
        lista.innerHTML = `<div class="empty-state"><p>Erro ao carregar alunos.</p></div>`;
    }
}

// =========================
// RENDERIZAR ALUNOS VINCULADOS
// =========================
function renderizarAlunos(lista) {
    const container = document.getElementById('students-list');

    if (lista.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-users-slash"></i>
                <p>Nenhum aluno vinculado a este curso.</p>
            </div>`;
        return;
    }

    container.innerHTML = lista.map(aluno => `
        <div class="student-item" data-id="${aluno.id}">
            <div class="student-avatar">${getIniciais(aluno.name)}</div>
            <div class="student-data">
                <span class="student-name">${aluno.name}</span>
                <span class="student-info">${aluno.matricula || ''} ${aluno.turma ? '· ' + aluno.turma : ''}</span>
            </div>
            <span class="student-horas">${aluno.horasAcumuladas ?? 0}h</span>
            <button class="btn-desvincular" title="Desvincular aluno" onclick="desvincularAluno(${aluno.id}, '${aluno.name}')">
                <i class="fa-solid fa-user-minus"></i>
            </button>
        </div>
    `).join('');
}

// =========================
// DESVINCULAR ALUNO
// =========================
async function desvincularAluno(alunoId, nome) {
    if (!confirm(`Desvincular "${nome}" deste curso?`)) return;

    try {
        const res = await fetch(`${API}/alunos/${alunoId}/cursos/${courseId}`, {
            method: 'DELETE',
            headers: authHeaders()
        });

        if (!res.ok) throw new Error('Erro ao desvincular');
        carregarAlunosVinculados();
    } catch (e) {
        console.error(e);
        alert('Erro ao desvincular aluno.');
    }
}

// =========================
// MODAL VINCULAR ALUNO
// =========================
async function abrirModalVincular() {
    // Remove modal anterior se existir
    document.getElementById('modalVincular')?.remove();

    // Busca todos os alunos
    try {
        const res = await fetch(`${API}/alunos`, { headers: authHeaders() });
        if (!res.ok) throw new Error();
        todosAlunos = await res.json();
    } catch {
        alert('Erro ao buscar alunos.');
        return;
    }

    // IDs já vinculados para não mostrar duplicado
    const idsVinculados = new Set(alunosVinculados.map(a => a.id));
    const disponiveis   = todosAlunos.filter(a => !idsVinculados.has(a.id));

    const overlay = document.createElement('div');
    overlay.id        = 'modalVincular';
    overlay.className = 'modal-overlay active';
    overlay.innerHTML = `
        <div class="modal-vincular">
            <div class="modal-vincular-header">
                <h3><i class="fa-solid fa-user-plus"></i> Vincular Aluno</h3>
                <button class="btn-fechar-modal" id="btnFecharModal"><i class="fa-solid fa-times"></i></button>
            </div>
            <div class="modal-vincular-body">
                <div class="modal-search">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <input type="text" id="modalSearchInput" placeholder="Buscar aluno pelo nome...">
                </div>
                <div id="modalAlunosList" class="modal-alunos-list">
                    ${disponiveis.length === 0
                        ? '<p class="modal-empty">Todos os alunos já estão vinculados.</p>'
                        : disponiveis.map(a => `
                            <div class="modal-aluno-item" data-id="${a.id}" data-nome="${a.name}">
                                <div class="student-avatar">${getIniciais(a.name)}</div>
                                <div class="student-data">
                                    <span class="student-name">${a.name}</span>
                                    <span class="student-info">${a.email}</span>
                                </div>
                                <button class="btn-vincular-item" onclick="vincularAluno(${a.id}, '${a.name}')">
                                    <i class="fa-solid fa-plus"></i> Vincular
                                </button>
                            </div>`).join('')
                    }
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Fechar modal
    document.getElementById('btnFecharModal').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

    // Busca dentro do modal
    document.getElementById('modalSearchInput').addEventListener('input', e => {
        const termo = e.target.value.toLowerCase();
        document.querySelectorAll('.modal-aluno-item').forEach(item => {
            item.style.display = item.dataset.nome.toLowerCase().includes(termo) ? 'flex' : 'none';
        });
    });
}

// =========================
// VINCULAR ALUNO
// =========================
async function vincularAluno(alunoId, nome) {
    try {
        const res = await fetch(`${API}/alunos/${alunoId}/cursos/${courseId}`, {
            method: 'POST',
            headers: authHeaders()
        });

        if (!res.ok) throw new Error('Erro ao vincular');

        document.getElementById('modalVincular')?.remove();
        carregarAlunosVinculados();
    } catch (e) {
        console.error(e);
        alert(`Erro ao vincular "${nome}".`);
    }
}

// =========================
// BUSCA DE ALUNOS VINCULADOS
// =========================
function filtrarAlunosVinculados(termo) {
    termo = termo.toLowerCase();
    const filtrados = alunosVinculados.filter(a =>
        a.name.toLowerCase().includes(termo) ||
        (a.matricula && a.matricula.toLowerCase().includes(termo)) ||
        (a.turma     && a.turma.toLowerCase().includes(termo))
    );
    document.getElementById('students-count').textContent = filtrados.length;
    renderizarAlunos(filtrados);
}

// =========================
// ERRO GENÉRICO
// =========================
function mostrarErro(msg) {
    document.querySelector('.content-padding').innerHTML = `
        <div class="empty-state" style="padding:3rem; text-align:center;">
            <i class="fa-solid fa-circle-exclamation" style="font-size:2rem; color:#ef4444; margin-bottom:10px;"></i>
            <p>${msg}</p>
        </div>`;
}

// =========================
// INICIALIZAÇÃO
// =========================
document.addEventListener('DOMContentLoaded', () => {

    if (!courseId) { mostrarErro('ID do curso não encontrado na URL.'); return; }

    // Sidebar
    const sidebar       = document.getElementById('sidebar');
    const mainContent   = document.getElementById('mainContent');
    const sidebarToggle = document.getElementById('sidebarToggle');

    sidebarToggle?.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
    });

    // Botão voltar
    document.getElementById('btnVoltar')?.addEventListener('click', () => {
        window.location.href = '../GerenciarCursoCoordenador/gerenciarCursoCoordenador.html';
    });

    // Botão vincular aluno
    document.getElementById('btn-add-student')?.addEventListener('click', abrirModalVincular);

    // Busca alunos vinculados
    document.getElementById('search-student')?.addEventListener('input', e => {
        filtrarAlunosVinculados(e.target.value);
    });

    // Carregar dados
    carregarCurso();
    carregarAlunosVinculados();
});
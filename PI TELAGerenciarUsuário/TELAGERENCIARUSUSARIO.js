
const API_BASE_URL = "http://localhost:8080"; 


const userList      = document.getElementById('user-list');
const searchInput   = document.getElementById('search-input');
const filterBtns    = document.querySelectorAll('.filter-btn');
const modalOverlay  = document.getElementById('modalOverlay');
const btnConfirmar  = document.getElementById('btnConfirmar');
const btnCancelar   = document.getElementById('btnCancelar');
const modalMessage  = document.getElementById('modal-message');

// Stats
const statTotal  = document.getElementById('stat-total');
const statAlunos = document.getElementById('stat-alunos');
const statCoords = document.getElementById('stat-coords');

// Botões de cadastro
const btnNovoAluno       = document.getElementById('btnNovoAluno');
const btnNovoCoordenador = document.getElementById('btnNovoCoordenador');


let usuarios = [];
let filtroAtivo   = "todos";
let idParaExcluir = null;
let tipoParaExcluir = null;


function getIniciais(nome) {
    if (!nome) return "?";
    return nome.trim().split(' ').filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('');
}

/**
 * Chamadas de API autenticadas com Bearer token
 */
async function fetchProtegido(url, options = {}) {
    const token = localStorage.getItem('token');

    if (!token) {
        alert("Sessão expirada. Por favor, faça login novamente.");
        window.location.href = "../Login/index.html";
        return null;
    }

    const defaultOptions = {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };

    const response = await fetch(url, defaultOptions);

    if (response.status === 403) {
        alert("Você não tem permissão para esta ação ou o token expirou.");
        localStorage.removeItem('token');
        window.location.href = "../Login/index.html";
        return null;
    }

    return response;
}


async function carregarUsuarios() {
    try {
        const [resAlunos, resCoords] = await Promise.all([
            fetchProtegido(`${API_BASE_URL}/alunos`),
            fetchProtegido(`${API_BASE_URL}/coordenadores`)
        ]);

        if (!resAlunos || !resCoords) return;

        const alunos       = await resAlunos.json();
        const coordenadores = await resCoords.json();

        const listaAlunos = alunos.map(a => ({ 
            id: a.id, nome: a.name, email: a.email, tipo: 'aluno' 
        }));
        const listaCoords = coordenadores.map(c => ({ 
            id: c.id, nome: c.name, email: c.email, tipo: 'coordenador' 
        }));

        usuarios = [...listaAlunos, ...listaCoords];
        updateStats();
        aplicarFiltros();
    } catch (error) {
        console.error("Erro na carga de usuários:", error);
        userList.innerHTML = `<p class="error-msg">Erro ao conectar com o servidor.</p>`;
    }
}


async function excluirUsuarioNoBackend() {
    if (!idParaExcluir || !tipoParaExcluir) return;
    const rota = tipoParaExcluir === 'aluno' ? 'alunos' : 'coordenadores';
    try {
        const response = await fetchProtegido(`${API_BASE_URL}/${rota}/${idParaExcluir}`, { method: 'DELETE' });
        if (response && response.ok) {
            fecharModal();
            carregarUsuarios();
        }
    } catch (error) {
        console.error("Erro ao deletar:", error);
    }
}


function renderUsuarios(lista) {
    if (lista.length === 0) {
        userList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users-slash"></i>
                <p>Nenhum usuário encontrado.</p>
            </div>`;
        return;
    }
    userList.innerHTML = lista.map(user => `
        <div class="user-card">
            <div class="user-avatar ${user.tipo}">${getIniciais(user.nome)}</div>
            <div class="user-info">
                <div class="user-name-row">
                    <h3>${user.nome}</h3>
                    <span class="badge badge-${user.tipo}">
                        ${user.tipo === 'aluno' ? 'Aluno' : 'Coordenador'}
                    </span>
                </div>
                <span class="user-email">${user.email}</span>
            </div>
            <div class="user-actions">
                <button class="btn-delete" title="Excluir" 
                    onclick="confirmarExclusao(${user.id}, '${user.nome}', '${user.tipo}')">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function aplicarFiltros() {
    const termo = searchInput.value.toLowerCase().trim();
    let resultado = usuarios.filter(u =>
        u.nome.toLowerCase().includes(termo) ||
        u.email.toLowerCase().includes(termo)
    );
    if (filtroAtivo !== 'todos') {
        resultado = resultado.filter(u => u.tipo === filtroAtivo);
    }
    renderUsuarios(resultado);
}

function updateStats() {
    statTotal.textContent  = usuarios.length;
    statAlunos.textContent = usuarios.filter(u => u.tipo === 'aluno').length;
    statCoords.textContent = usuarios.filter(u => u.tipo === 'coordenador').length;
}


function confirmarExclusao(id, nome, tipo) {
    idParaExcluir   = id;
    tipoParaExcluir = tipo;
    modalMessage.textContent = `Deseja realmente excluir o ${tipo} "${nome}"?`;
    modalOverlay.classList.add('active');
}

function fecharModal() {
    modalOverlay.classList.remove('active');
    idParaExcluir   = null;
    tipoParaExcluir = null;
}


function criarModalCadastro({ titulo, cor, campos, onSubmit }) {
    // Remove modal anterior se existir
    const existente = document.getElementById('modalCadastroOverlay');
    if (existente) existente.remove();

    const camposHTML = campos.map(c => `
        <div class="form-group">
            <label for="campo-${c.id}">${c.label}${c.required ? ' <span class="obrigatorio">*</span>' : ''}</label>
            <input 
                type="${c.type || 'text'}" 
                id="campo-${c.id}" 
                placeholder="${c.placeholder || ''}"
                ${c.required ? 'required' : ''}
                autocomplete="off"
            >
        </div>
    `).join('');

    const overlay = document.createElement('div');
    overlay.id = 'modalCadastroOverlay';
    overlay.className = 'modal-overlay active';
    overlay.innerHTML = `
        <div class="modal modal-cadastro">
            <div class="modal-cadastro-header" style="background:${cor}">
                <h3>${titulo}</h3>
                <button class="btn-fechar-cadastro" id="btnFecharCadastro">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-cadastro-body">
                <form id="formCadastro" novalidate>
                    ${camposHTML}
                    <div id="cadastro-erro" class="cadastro-erro" style="display:none"></div>
                    <div class="modal-actions modal-actions-cadastro">
                        <button type="button" class="btn-cancel" id="btnCancelarCadastro">Cancelar</button>
                        <button type="submit" class="btn-confirm btn-salvar" style="background:${cor}">
                            <i class="fas fa-save"></i> Salvar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Fechar modal
    const fechar = () => overlay.remove();
    document.getElementById('btnFecharCadastro').addEventListener('click', fechar);
    document.getElementById('btnCancelarCadastro').addEventListener('click', fechar);
    overlay.addEventListener('click', e => { if (e.target === overlay) fechar(); });

    // Submit
    document.getElementById('formCadastro').addEventListener('submit', async (e) => {
        e.preventDefault();
        const erroDiv = document.getElementById('cadastro-erro');
        erroDiv.style.display = 'none';

        const dados = {};
        for (const c of campos) {
            const val = document.getElementById(`campo-${c.id}`).value.trim();
            if (c.required && !val) {
                erroDiv.textContent = `O campo "${c.label}" é obrigatório.`;
                erroDiv.style.display = 'block';
                return;
            }
            dados[c.id] = val || undefined;
        }

        const btnSalvar = overlay.querySelector('.btn-salvar');
        btnSalvar.disabled = true;
        btnSalvar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';

        try {
            await onSubmit(dados);
            fechar();
            carregarUsuarios();
        } catch (err) {
            erroDiv.textContent = err.message || 'Erro ao salvar. Tente novamente.';
            erroDiv.style.display = 'block';
            btnSalvar.disabled = false;
            btnSalvar.innerHTML = '<i class="fas fa-save"></i> Salvar';
        }
    });
}


function abrirModalNovoAluno() {
    criarModalCadastro({
        titulo: '➕ Novo Aluno',
        cor: '#2563eb',
        campos: [
            { id: 'name',      label: 'Nome completo', placeholder: 'Ex: João Silva',        required: true },
            { id: 'email',     label: 'E-mail',        placeholder: 'Ex: joao@email.com',    required: true, type: 'email' },
            { id: 'matricula', label: 'Matrícula',     placeholder: 'Ex: 2024001',            required: true },
            { id: 'turma',     label: 'Turma',         placeholder: 'Ex: TI-2024A',           required: false },
            { id: 'senha',     label: 'Senha',         placeholder: 'Mínimo 6 caracteres',   required: true, type: 'password' },
        ],
        onSubmit: async (dados) => {
            const payload = {
                name:      dados.name,
                email:     dados.email,
                matricula: dados.matricula,
                turma:     dados.turma || null,
                senha:     dados.senha,
                horasAcumuladas: 0
            };
            const response = await fetchProtegido(`${API_BASE_URL}/alunos`, {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            if (!response) throw new Error('Sem resposta do servidor.');
            if (!response.ok) {
                const err = await response.text();
                throw new Error(`Erro ${response.status}: ${err}`);
            }
        }
    });
}


function abrirModalNovoCoordenador() {
    criarModalCadastro({
        titulo: '➕ Novo Coordenador',
        cor: '#7c3aed',
        campos: [
            { id: 'name',     label: 'Nome completo', placeholder: 'Ex: Maria Souza',     required: true },
            { id: 'email',    label: 'E-mail',        placeholder: 'Ex: maria@email.com', required: true, type: 'email' },
            { id: 'password', label: 'Senha',         placeholder: 'Mínimo 6 caracteres', required: true, type: 'password' },
        ],
        onSubmit: async (dados) => {
            const payload = {
                name:     dados.name,
                email:    dados.email,
                password: dados.password
            };
            const response = await fetchProtegido(`${API_BASE_URL}/coordenadores`, {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            if (!response) throw new Error('Sem resposta do servidor.');
            if (!response.ok) {
                const err = await response.text();
                throw new Error(`Erro ${response.status}: ${err}`);
            }
        }
    });
}


btnConfirmar.addEventListener('click', excluirUsuarioNoBackend);
btnCancelar.addEventListener('click', fecharModal);
searchInput.addEventListener('input', aplicarFiltros);

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filtroAtivo = btn.dataset.filter;
        aplicarFiltros();
    });
});

btnNovoAluno.addEventListener('click', abrirModalNovoAluno);
btnNovoCoordenador.addEventListener('click', abrirModalNovoCoordenador);

// Inicializa a tela
document.addEventListener('DOMContentLoaded', () => {
    carregarUsuarios();

    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar       = document.getElementById('sidebar');
    const mainContent   = document.getElementById('mainContent');

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
});
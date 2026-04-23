const form = document.getElementById('categoriaForm');
const listaCategorias = document.getElementById('listaCategorias');
const btnToggle = document.getElementById('btn-toggle');
const sidebar = document.getElementById('sidebar');

// Lógica de abrir/fechar sidebar
btnToggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
});

let categorias = [];

form.addEventListener('submit', function(e) {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const cargaSemestre = document.getElementById('cargaSemestre').value;
    const cargaMaxima = document.getElementById('cargaMaxima').value;

    const novaCategoria = {
        id: Date.now(),
        nome,
        cargaSemestre,
        cargaMaxima
    };

    categorias.push(novaCategoria);
    renderizarLista();
    limparFormulario();
});

function limparFormulario() {
    form.reset();
}

function renderizarLista() {
    listaCategorias.innerHTML = '';

    categorias.forEach(cat => {
        const div = document.createElement('div');
        div.className = 'card-item';
        div.innerHTML = `
            <h4>${cat.nome}</h4>
            <p><small>Carga Horária Semestre: ${cat.cargaSemestre}</small></p>
            <p><small>Carga Horária Máxima: ${cat.cargaMaxima}</small></p>
            <div class="actions">
                <i class="fas fa-trash" onclick="excluirCategoria(${cat.id})"></i>
                <i class="fas fa-edit"></i>
            </div>
        `;
        listaCategorias.appendChild(div);
    });
}

function excluirCategoria(id) {
    categorias = categorias.filter(cat => cat.id !== id);
    renderizarLista();
}

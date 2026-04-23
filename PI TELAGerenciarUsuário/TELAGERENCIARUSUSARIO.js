// ===============================
// 1. DADOS
// ===============================
const usuarios = [
  { nome: "João Silva", tipo: "aluno", email: "joao@email.com" },
  { nome: "Maria Santos", tipo: "coordenador", email: "maria@email.com" },
  { nome: "Pedro Costa", tipo: "aluno", email: "pedro@email.com" },
  { nome: "Ana Lima", tipo: "aluno", email: "ana@email.com" },
  { nome: "Carlos Souza", tipo: "coordenador", email: "carlos@email.com" }
];

// ===============================
// 2. RENDERIZAÇÃO
// ===============================
function render(lista) {
  const container = document.getElementById("lista");
  if (!container) return;

  container.innerHTML = "";

  lista.forEach(user => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div>
        <strong>${user.nome}</strong>
        <span class="tipo ${user.tipo}">${user.tipo}</span>
        <br>
        <small>${user.email}</small>
      </div>
      <button class="editar">Editar</button>
    `;

    container.appendChild(card);
  });
}

// ===============================
// 3. FILTRO
// ===============================
function filtrar(tipo = "todos") {
  const buscaElement = document.getElementById("busca");
  if (!buscaElement) return;

  const busca = buscaElement.value.toLowerCase();

  let filtrados = usuarios.filter(u =>
    u.nome.toLowerCase().includes(busca)
  );

  if (tipo !== "todos") {
    filtrados = filtrados.filter(u => u.tipo === tipo);
  }

  render(filtrados);
}

// ===============================
// 4. CADASTRO GENÉRICO
// ===============================
function cadastrarUsuario(nome, tipo, email) {
  if (!nome.trim() || !tipo || !email.trim()) {
    alert("Preencha todos os campos corretamente!");
    return;
  }

  const existe = usuarios.some(
    u => u.email.toLowerCase() === email.toLowerCase()
  );

  if (existe) {
    alert("Esse e-mail já está cadastrado!");
    return;
  }

  usuarios.push({
    nome: nome.trim(),
    tipo,
    email: email.trim().toLowerCase()
  });

  render(usuarios);

  alert(`${tipo} cadastrado com sucesso!`);
}

// ===============================
// 5. FUNÇÕES ESPECÍFICAS
// ===============================
function cadastrarAluno(nome, email) {
  cadastrarUsuario(nome, "aluno", email);
}

function cadastrarCoordenador(nome, email) {
  cadastrarUsuario(nome, "coordenador", email);
}

// ===============================
// 6. EVENTOS
// ===============================
const campoBusca = document.getElementById("busca");
if (campoBusca) {
  campoBusca.addEventListener("input", () => filtrar("todos"));
}

// ===============================
// 7. INICIALIZAÇÃO
// ===============================
render(usuarios);
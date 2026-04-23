function selectProfile(profile) {
    // Remove a classe 'active' de todos os cards
    const cards = document.querySelectorAll('.profile-card');
    cards.forEach(card => card.classList.remove('active'));

    // Adiciona a classe 'active' ao card clicado
    event.currentTarget.classList.add('active');
    
    console.log("Perfil selecionado:", profile);
}

// Impede o recarregamento da página no submit para fins de teste
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Tentativa de login realizada!');
});
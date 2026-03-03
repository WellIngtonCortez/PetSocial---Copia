// Função para redirecionar para a página de perfil do usuário
function goToProfile() {
    // Verificar se o usuário está logado
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    if (currentUser) {
        // Redirecionar para a página de perfil
        window.location.href = 'petsocial-meu-perfil.html';
    } else {
        // Se não estiver logado, redirecionar para a página de login
        alert('Você precisa estar logado para acessar seu perfil.');
        window.location.href = 'login.html';
    }
}

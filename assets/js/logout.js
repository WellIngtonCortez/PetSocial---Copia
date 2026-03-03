// Função para realizar logout
function logout() {
    // Remover o usuário atual da sessão
    sessionStorage.removeItem('currentUser');
    
    // Redirecionar para a página de login
    window.location.href = 'login.html';
}

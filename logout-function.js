// Função para realizar logout e redirecionar para a página de cadastro
function logout() {
    // Remover dados do usuário da sessão
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUserProfile');
    
    // Redirecionar para a página de cadastro
    window.location.href = 'pet-social-signup.html';
}
<button class="logout-btn" onclick="logout()">Sair</button>

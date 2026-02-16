// Função para carregar os dados do perfil do usuário
function loadUserProfile() {
    // Obter dados do usuário da sessão
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const userProfile = JSON.parse(sessionStorage.getItem('currentUserProfile'));
    
    // Verificar se o usuário está logado
    if (!currentUser) {
        alert('Você precisa estar logado para acessar seu perfil.');
        window.location.href = 'login.html';
        return;
    }
    
    // Se não tiver o perfil na sessão, buscar do localStorage
    if (!userProfile) {
        const profiles = JSON.parse(localStorage.getItem('petSocialProfiles')) || [];
        const profile = profiles.find(p => p.userId === currentUser.id);
        
        if (profile) {
            // Salvar na sessão para acesso mais rápido
            sessionStorage.setItem('currentUserProfile', JSON.stringify(profile));
            displayProfileData(profile);
        } else {
            alert('Erro ao carregar perfil. Por favor, faça login novamente.');
            window.location.href = 'login.html';
        }
    } else {
        // Exibir dados do perfil
        displayProfileData(userProfile);
    }
}

// Função para exibir os dados do perfil na página
function displayProfileData(profile) {
    // Preencher informações básicas
    document.getElementById('profile-name').textContent = profile.fullName;
    document.getElementById('profile-username').textContent = '@' + profile.username;
    document.getElementById('profile-bio').textContent = profile.bio || 'Olá! Sou novo no PetSocial!';
    
    // Preencher estatísticas
    document.getElementById('posts-count').textContent = profile.posts ? profile.posts.length : 0;
    document.getElementById('followers-count').textContent = profile.followers ? profile.followers.length : 0;
    document.getElementById('following-count').textContent = profile.following ? profile.following.length : 0;
    
    // Preencher detalhes
    document.getElementById('profile-email').textContent = profile.email;
    document.getElementById('profile-location').textContent = profile.location || 'Não informado';
    
    // Formatar data de ingresso
    const joinDate = new Date(profile.joinDate);
    const formattedDate = joinDate.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
    });
    document.getElementById('profile-joined').textContent = formattedDate;
    
    // Exibir pets
    const petContainer = document.getElementById('pet-container');
    petContainer.innerHTML = ''; // Limpar conteúdo anterior
    
    if (profile.pets && profile.pets.length > 0) {
        profile.pets.forEach(pet => {
            // Determinar o ícone com base no tipo de pet
            let petIcon = 'fa-paw';
            if (pet.type === 'dog') petIcon = 'fa-dog';
            if (pet.type === 'cat') petIcon = 'fa-cat';
            
            const petCard = document.createElement('div');
            petCard.className = 'pet-card';
            petCard.innerHTML = `
                <div class="pet-icon">
                    <i class="fas ${petIcon}"></i>
                </div>
                <div class="pet-info">
                    <h3 class="pet-name">${pet.name}</h3>
                    <div class="pet-details">
                        <div class="pet-detail"><i class="fas fa-birthday-cake"></i> Idade: ${pet.age}</div>
                        <div class="pet-detail"><i class="fas fa-paw"></i> Raça: ${pet.breed}</div>
                    </div>
                </div>
            `;
            petContainer.appendChild(petCard);
        });
    } else {
        petContainer.innerHTML = '<p>Nenhum pet cadastrado ainda.</p>';
    }
}

// Carregar perfil quando a página for carregada
document.addEventListener('DOMContentLoaded', loadUserProfile);

// Função para realizar logout e redirecionar para a página de cadastro
function logout() {
    // Remover dados do usuário da sessão
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUserProfile');
    
    // Redirecionar para a página de cadastro
    window.location.href = 'pet-social-signup.html';
}

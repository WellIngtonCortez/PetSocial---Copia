// Função para lidar com o envio do formulário
function handleSignup(event) {
    event.preventDefault();
    
    // Coletar dados do formulário
    const userData = {
        fullName: document.getElementById('fullname').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        username: document.getElementById('username').value,
        location: document.getElementById('location').value,
        bio: document.getElementById('bio').value,
        petType: document.querySelector('.pet-option.selected') ? 
                document.querySelector('.pet-option.selected').getAttribute('data-type') : '',
        petName: document.getElementById('pet-name').value,
        petAge: document.getElementById('pet-age').value,
        petBreed: document.getElementById('pet-breed').value
    };
    
    // Verificar se o usuário concordou com os termos
    if (!document.getElementById('terms').checked) {
        alert('Você precisa concordar com os Termos de Uso e Política de Privacidade para continuar.');
        return;
    }
    
    // Enviar dados para o servidor (simulado aqui)
    saveUserToDatabase(userData)
        .then(response => {
            // Redirecionar para a página da rede social após o cadastro bem-sucedido
            window.location.href = 'pet-social-network.html';
        })
        .catch(error => {
            alert('Erro ao criar conta: ' + error.message);
        });
}

// Função simulada para salvar usuário no banco de dados
function saveUserToDatabase(userData) {
    return new Promise((resolve, reject) => {
        // Simulação de uma chamada de API para o backend
        // Em um ambiente real, isso seria uma requisição AJAX/fetch para o servidor
        
        // Simulando armazenamento no localStorage (apenas para demonstração)
        try {
            // Obter usuários existentes ou iniciar um array vazio
            const existingUsers = JSON.parse(localStorage.getItem('petSocialUsers')) || [];
            
            // Verificar se o email ou username já existem
            const emailExists = existingUsers.some(user => user.email === userData.email);
            const usernameExists = existingUsers.some(user => user.username === userData.username);
            
            if (emailExists) {
                reject(new Error('Este email já está cadastrado.'));
                return;
            }
            
            if (usernameExists) {
                reject(new Error('Este nome de usuário já está em uso.'));
                return;
            }
            
            // Criar um ID único para o usuário
            userData.id = Date.now().toString();
            userData.createdAt = new Date().toISOString();
            
            // Criar perfil do usuário automaticamente
            const userProfile = {
                userId: userData.id,
                followers: [],
                following: [],
                posts: [],
                profilePicture: 'default-profile.jpg'
            };
            
            // Adicionar o novo usuário à lista
            existingUsers.push(userData);
            
            // Salvar a lista atualizada no localStorage
            localStorage.setItem('petSocialUsers', JSON.stringify(existingUsers));
            
            // Salvar o perfil do usuário
            const existingProfiles = JSON.parse(localStorage.getItem('petSocialProfiles')) || [];
            existingProfiles.push(userProfile);
            localStorage.setItem('petSocialProfiles', JSON.stringify(existingProfiles));
            
            // Simular um pequeno atraso como em uma chamada de API real
            setTimeout(() => {
                // Salvar o usuário atual na sessão
                sessionStorage.setItem('currentUser', JSON.stringify(userData));
                resolve({ success: true, message: 'Conta criada com sucesso!' });
            }, 1000);
        } catch (error) {
            reject(new Error('Erro ao salvar os dados. Por favor, tente novamente.'));
        }
    });
}

// Função para selecionar tipo de pet (modificada para armazenar o tipo)
function selectPet(element, type) {
    // Remover seleção atual
    document.querySelectorAll('.pet-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Adicionar seleção ao elemento clicado
    element.classList.add('selected');
    element.setAttribute('data-type', type);
}

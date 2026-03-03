// Função para lidar com o envio do formulário de cadastro
function handleSignup(event) {
    if (event) event.preventDefault();
    
    // Verificar se o usuário concordou com os termos
    if (!document.getElementById('terms').checked) {
        alert('Você precisa concordar com os Termos de Uso e Política de Privacidade para continuar.');
        return;
    }
    
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
        petBreed: document.getElementById('pet-breed').value,
        joinDate: new Date().toISOString()
    };
    
    // Enviar dados para o servidor (simulado aqui)
    createUserAndProfile(userData)
        .then(response => {
            alert('Conta criada com sucesso! Redirecionando para a rede social...');
            // Redirecionar para a página da rede social após o cadastro bem-sucedido
            window.location.href = 'pet-social-network.html';
        })
        .catch(error => {
            alert('Erro ao criar conta: ' + error.message);
        });
}

// Função para criar usuário e perfil automaticamente
function createUserAndProfile(userData) {
    return new Promise((resolve, reject) => {
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
            
            // Criar perfil do usuário automaticamente
            const userProfile = {
                userId: userData.id,
                username: userData.username,
                fullName: userData.fullName,
                bio: userData.bio || 'Olá! Sou novo no PetSocial!',
                location: userData.location || 'Não informado',
                email: userData.email,
                joinDate: userData.joinDate,
                profilePicture: 'default-profile.jpg',
                coverPicture: 'default-cover.jpg',
                followers: [],
                following: [],
                posts: [],
                pets: [
                    {
                        name: userData.petName || 'Meu Pet',
                        type: userData.petType || 'other',
                        age: userData.petAge || 'Não informado',
                        breed: userData.petBreed || 'Não informado',
                        photo: 'default-pet.jpg'
                    }
                ]
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
                sessionStorage.setItem('currentUserProfile', JSON.stringify(userProfile));
                resolve({ success: true, message: 'Conta e perfil criados com sucesso!' });
            }, 1000);
        } catch (error) {
            reject(new Error('Erro ao salvar os dados. Por favor, tente novamente.'));
        }
    });
}

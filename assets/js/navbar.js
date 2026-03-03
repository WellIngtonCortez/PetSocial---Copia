// 🧩 COMPONENTE DE NAVEGAÇÃO GLOBAL
// Import: import { Navbar } from './assets/js/navbar.js';

export class Navbar {
    constructor(containerId = 'navbar') {
        this.containerId = containerId;
        this.currentUser = null;
        this.init();
    }

    async init() {
        await this.checkAuthStatus();
        this.render();
        this.setupEventListeners();
    }

    async checkAuthStatus() {
        try {
            // Verificar se há usuário no sessionStorage
            const storedUser = sessionStorage.getItem('currentUser');
            if (storedUser) {
                this.currentUser = JSON.parse(storedUser);
            }

            // Verificar com Supabase (se disponível)
            try {
                const { getCurrentUser } = await import('./supabaseClient.js');
                const supabaseUser = await getCurrentUser();
                if (supabaseUser) {
                    this.currentUser = supabaseUser;
                    sessionStorage.setItem('currentUser', JSON.stringify(supabaseUser));
                }
            } catch (error) {
                console.log('Supabase não disponível, usando sessionStorage');
            }
        } catch (error) {
            console.error('Erro ao verificar status de autenticação:', error);
        }
    }

    render() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`Container #${this.containerId} não encontrado`);
            return;
        }

        const isLoggedIn = !!this.currentUser;
        
        container.innerHTML = `
            <nav>
                <a href="pet-social-signup.html" class="logo">
                    <i class="fas fa-paw"></i>
                    PetSocial
                </a>
                <div class="nav-links">
                    ${isLoggedIn ? this.renderLoggedInLinks() : this.renderLoggedOutLinks()}
                </div>
            </nav>
        `;
    }

    renderLoggedOutLinks() {
        return `
            <a href="#" onclick="showPageUnderDevelopment('Sobre nós')">Sobre nós</a>
            <a href="#" onclick="showPageUnderDevelopment('Contato')">Contato</a>
            <a href="login.html" class="btn-primary">Entrar</a>
        `;
    }

    renderLoggedInLinks() {
        const username = this.currentUser?.user_metadata?.username || 
                        this.currentUser?.username || 
                        this.currentUser?.email?.split('@')[0] || 
                        'Usuário';

        return `
            <a href="pet-social-network.html">Feed</a>
            <a href="pet-social-network.html" onclick="showAdoption()">Adoção</a>
            <a href="petsocial-meu-perfil.html">Perfil</a>
            <a href="#" onclick="showPageUnderDevelopment('Mensagens')">Mensagens</a>
            <div class="user-menu">
                <span class="username">@${username}</span>
                <button class="btn-secondary" onclick="navbar.logout()">Sair</button>
            </div>
        `;
    }

    setupEventListeners() {
        // Adicionar listeners para links dinâmicos
        document.addEventListener('click', (e) => {
            if (e.target.closest('a')) {
                const link = e.target.closest('a');
                const href = link.getAttribute('href');
                
                // Prevenir navegação se já estiver na página atual
                if (href === window.location.pathname) {
                    e.preventDefault();
                    return;
                }
            }
        });
    }

    async logout() {
        try {
            // Limpar Supabase (se disponível)
            try {
                const { signOut } = await import('./supabaseClient.js');
                await signOut();
            } catch (error) {
                console.log('Supabase não disponível, limpando apenas sessionStorage');
            }

            // Limpar estado local
            sessionStorage.removeItem('currentUser');
            localStorage.removeItem('supabase.auth.token');
            localStorage.removeItem('supabase.auth.refreshToken');
            
            // Atualizar estado
            this.currentUser = null;
            
            // Mostrar mensagem e redirecionar
            this.showLogoutMessage();
            
            setTimeout(() => {
                window.location.href = 'pet-social-signup.html';
            }, 1500);
            
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            // Forçar logout mesmo com erro
            sessionStorage.clear();
            window.location.href = 'pet-social-signup.html';
        }
    }

    showLogoutMessage() {
        // Criar toast de logout
        const toast = document.createElement('div');
        toast.className = 'toast logout-toast';
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-check-circle"></i>
                <span>Logout realizado com sucesso!</span>
            </div>
        `;
        
        // Adicionar estilos
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--gradient-primary);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: var(--shadow-lg);
            z-index: 3000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        // Remover após 2 segundos
        setTimeout(() => {
            toast.remove();
        }, 2000);
    }

    updateAuthStatus(user) {
        this.currentUser = user;
        this.render();
    }

    // Método para atualizar links ativos
    setActiveLink(pageName) {
        const links = document.querySelectorAll('.nav-links a');
        links.forEach(link => {
            link.classList.remove('active');
            
            const href = link.getAttribute('href');
            const text = link.textContent.toLowerCase();
            
            if (href === pageName || text.includes(pageName.toLowerCase())) {
                link.classList.add('active');
            }
        });
    }
}

// Funções globais para uso no HTML
window.showPageUnderDevelopment = function(pageName) {
    const message = `🚧 ${pageName} em desenvolvimento!`;
    
    // Criar modal bonito
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>🚧 Em Desenvolvimento</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <p>${pageName} ainda está sendo desenvolvido.</p>
                <p>Em breve você poderá aproveitar esta funcionalidade! 🐾</p>
                <div class="modal-actions">
                    <button class="btn-primary" onclick="this.closest('.modal').remove()">Entendido</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
};

window.showAdoption = function() {
    // Redirecionar para aba de adoção se estiver no feed
    if (typeof showAdoptionSection === 'function') {
        showAdoptionSection();
    } else {
        window.location.hash = '#adoption';
    }
};

// Instância global do navbar
window.navbar = new Navbar();

// Exportar para uso em módulos
export default Navbar;

// 💬 COMPONENTE DE COMENTÁRIOS
// Sistema completo de comentários com Supabase

export class CommentsModal {
    constructor(postId) {
        this.postId = postId;
        this.modal = null;
        this.comments = [];
        this.currentUser = null;
        this.init();
    }

    async init() {
        await this.getCurrentUser();
        this.createModal();
        this.loadComments();
        this.setupEventListeners();
    }

    async getCurrentUser() {
        try {
            const storedUser = sessionStorage.getItem('currentUser');
            if (storedUser) {
                this.currentUser = JSON.parse(storedUser);
            }
        } catch (error) {
            console.error('Erro ao obter usuário:', error);
        }
    }

    createModal() {
        // Remover modal existente
        const existingModal = document.getElementById('comments-modal');
        if (existingModal) {
            existingModal.remove();
        }

        this.modal = document.createElement('div');
        this.modal.id = 'comments-modal';
        this.modal.className = 'modal active';
        this.modal.innerHTML = `
            <div class="modal-content comments-modal">
                <div class="modal-header">
                    <h3><i class="fas fa-comments"></i> Comentários</h3>
                    <button class="modal-close" onclick="commentsModal.close()">&times;</button>
                </div>
                
                <div class="comments-container">
                    <!-- Formulário de novo comentário -->
                    <div class="new-comment-form" id="new-comment-form">
                        <div class="comment-input-group">
                            <img src="${this.getUserAvatar()}" alt="Avatar" class="comment-avatar">
                            <div class="comment-input-wrapper">
                                <textarea 
                                    id="comment-input" 
                                    placeholder="${this.currentUser ? 'Digite seu comentário...' : 'Faça login para comentar'}"
                                    ${!this.currentUser ? 'disabled' : ''}
                                ></textarea>
                                <button 
                                    class="btn-primary btn-sm" 
                                    id="send-comment"
                                    ${!this.currentUser ? 'disabled' : ''}
                                >
                                    <i class="fas fa-paper-plane"></i>
                                    Enviar
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Lista de comentários -->
                    <div class="comments-list" id="comments-list">
                        <div class="comments-loading">
                            <div class="spinner"></div>
                            <span>Carregando comentários...</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.modal);
    }

    getUserAvatar() {
        if (this.currentUser?.user_metadata?.avatar_url) {
            return this.currentUser.user_metadata.avatar_url;
        }
        return `https://ui-avatars.com/api/?name=${this.currentUser?.user_metadata?.username || 'User'}&background=4a8fe7&color=fff`;
    }

    async loadComments() {
        try {
            const { getComments } = await import('./supabaseClient.js');
            this.comments = await getComments(this.postId);
            this.renderComments();
        } catch (error) {
            console.error('Erro ao carregar comentários:', error);
            this.showError('Erro ao carregar comentários');
        }
    }

    renderComments() {
        const commentsList = document.getElementById('comments-list');
        
        if (this.comments.length === 0) {
            commentsList.innerHTML = `
                <div class="no-comments">
                    <i class="fas fa-comment-slash"></i>
                    <p>Nenhum comentário ainda. Seja o primeiro a comentar!</p>
                </div>
            `;
            return;
        }

        commentsList.innerHTML = this.comments.map(comment => `
            <div class="comment-item" data-comment-id="${comment.id}">
                <img src="${comment.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${comment.profiles?.username || 'User'}&background=4a8fe7&color=fff`}" 
                     alt="Avatar" class="comment-avatar">
                <div class="comment-content">
                    <div class="comment-header">
                        <strong>${comment.profiles?.username || 'Usuário'}</strong>
                        <span class="comment-time">${this.formatTime(comment.created_at)}</span>
                    </div>
                    <p class="comment-text">${comment.content}</p>
                    ${this.canDeleteComment(comment) ? `
                        <div class="comment-actions">
                            <button class="btn-delete-comment" onclick="commentsModal.deleteComment('${comment.id}')">
                                <i class="fas fa-trash"></i>
                                Apagar
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    canDeleteComment(comment) {
        return this.currentUser && comment.user_id === this.currentUser.id;
    }

    formatTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'agora';
        if (minutes < 60) return `há ${minutes} min`;
        if (hours < 24) return `há ${hours} h`;
        if (days < 7) return `há ${days} d`;
        
        return date.toLocaleDateString('pt-BR');
    }

    setupEventListeners() {
        const commentInput = document.getElementById('comment-input');
        const sendButton = document.getElementById('send-comment');

        // Enviar comentário
        sendButton.addEventListener('click', () => this.sendComment());
        
        // Enviar com Ctrl+Enter
        commentInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.sendComment();
            }
        });

        // Auto-resize do textarea
        commentInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });

        // Fechar modal com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal) {
                this.close();
            }
        });

        // Fechar clicando fora
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
    }

    async sendComment() {
        if (!this.currentUser) {
            this.showError('Faça login para comentar');
            return;
        }

        const input = document.getElementById('comment-input');
        const content = input.value.trim();

        if (!content) {
            this.showError('Digite um comentário');
            return;
        }

        const sendButton = document.getElementById('send-comment');
        const originalText = sendButton.innerHTML;
        
        // Loading state
        sendButton.disabled = true;
        sendButton.innerHTML = '<div class="spinner"></div> Enviando...';

        try {
            const { createComment } = await import('./supabaseClient.js');
            
            const newComment = await createComment({
                post_id: this.postId,
                user_id: this.currentUser.id,
                content: content
            });

            // Adicionar comentário à lista
            this.comments.unshift(newComment);
            this.renderComments();

            // Limpar input
            input.value = '';
            input.style.height = 'auto';

            // Feedback de sucesso
            this.showSuccess('Comentário enviado!');

        } catch (error) {
            console.error('Erro ao enviar comentário:', error);
            this.showError('Erro ao enviar comentário. Tente novamente.');
        } finally {
            sendButton.disabled = false;
            sendButton.innerHTML = originalText;
        }
    }

    async deleteComment(commentId) {
        if (!confirm('Tem certeza que deseja apagar este comentário?')) {
            return;
        }

        try {
            // Remover da UI imediatamente
            const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
            if (commentElement) {
                commentElement.style.opacity = '0';
                commentElement.style.transform = 'translateX(-20px)';
                
                setTimeout(() => {
                    commentElement.remove();
                }, 300);
            }

            // Remover do array
            this.comments = this.comments.filter(c => c.id !== commentId);

            // TODO: Implementar deleteComment no supabaseClient.js
            // await deleteComment(commentId);

            this.showSuccess('Comentário apagado!');

        } catch (error) {
            console.error('Erro ao apagar comentário:', error);
            this.showError('Erro ao apagar comentário');
        }
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    showSuccess(message) {
        this.showToast(message, 'success');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        // Estilos
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${type === 'error' ? 'var(--secondary-color)' : type === 'success' ? '#28a745' : 'var(--primary-color)'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: var(--shadow-lg);
            z-index: 3000;
            animation: slideInUp 0.3s ease;
            display: flex;
            align-items: center;
            gap: 10px;
        `;

        document.body.appendChild(toast);

        // Remover após 3 segundos
        setTimeout(() => {
            toast.style.animation = 'slideOutDown 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    close() {
        if (this.modal) {
            this.modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                this.modal.remove();
                this.modal = null;
            }, 300);
        }
    }
}

// Função global para abrir comentários
window.openComments = function(postId) {
    new CommentsModal(postId);
};

// Adicionar estilos CSS para comentários
const commentStyles = `
<style>
.comments-modal {
    max-width: 600px;
    max-height: 80vh;
}

.comments-container {
    max-height: 60vh;
    overflow-y: auto;
}

.new-comment-form {
    padding: var(--spacing-lg);
    border-bottom: 1px solid var(--gray-200);
    margin-bottom: var(--spacing-lg);
}

.comment-input-group {
    display: flex;
    gap: var(--spacing-md);
    align-items: flex-start;
}

.comment-avatar {
    width: 40px;
    height: 40px;
    border-radius: var(--border-radius-full);
    object-fit: cover;
}

.comment-input-wrapper {
    flex: 1;
    position: relative;
}

#comment-input {
    width: 100%;
    min-height: 60px;
    padding: var(--spacing-md);
    border: 2px solid var(--gray-300);
    border-radius: var(--border-radius-lg);
    resize: none;
    font-family: var(--font-family);
    font-size: var(--font-size);
    transition: var(--transition);
}

#comment-input:focus {
    outline: none;
    border-color: var(--primary-color);
}

#comment-input:disabled {
    background: var(--gray-100);
    cursor: not-allowed;
}

.btn-sm {
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: var(--font-size-sm);
}

.comment-item {
    display: flex;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
    border-bottom: 1px solid var(--gray-100);
    transition: var(--transition);
}

.comment-item:hover {
    background: var(--gray-50);
}

.comment-content {
    flex: 1;
}

.comment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-xs);
}

.comment-time {
    font-size: var(--font-size-xs);
    color: var(--gray-500);
}

.comment-text {
    margin-bottom: var(--spacing-sm);
    line-height: 1.5;
}

.comment-actions {
    margin-top: var(--spacing-sm);
}

.btn-delete-comment {
    background: none;
    border: none;
    color: var(--gray-500);
    cursor: pointer;
    font-size: var(--font-size-xs);
    padding: var(--spacing-xs);
    border-radius: var(--border-radius-sm);
    transition: var(--transition);
}

.btn-delete-comment:hover {
    color: var(--secondary-color);
    background: rgba(255, 107, 107, 0.1);
}

.no-comments {
    text-align: center;
    padding: var(--spacing-2xl);
    color: var(--gray-500);
}

.no-comments i {
    font-size: 48px;
    margin-bottom: var(--spacing-md);
    opacity: 0.5;
}

.comments-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-2xl);
    color: var(--gray-500);
}

@keyframes slideInUp {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

@keyframes slideOutDown {
    from { transform: translateY(0); opacity: 1; }
    to { transform: translateY(100%); opacity: 0; }
}

@keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
}
</style>
`;

// Adicionar estilos ao head
document.head.insertAdjacentHTML('beforeend', commentStyles);

export default CommentsModal;

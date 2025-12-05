// Toast Notification System

const Toast = {
    init() {
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(this.container);

        // Add styles if not present
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                .toast {
                    min-width: 250px;
                    padding: 15px 20px;
                    border-radius: 8px;
                    background: white;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    transform: translateX(120%);
                    transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                    font-family: 'Poppins', sans-serif;
                    font-size: 14px;
                    border-left: 4px solid #ccc;
                }
                .toast.show {
                    transform: translateX(0);
                }
                .toast.success { border-color: #2ecc71; }
                .toast.success i { color: #2ecc71; }
                .toast.error { border-color: #e74c3c; }
                .toast.error i { color: #e74c3c; }
                .toast.warning { border-color: #f1c40f; }
                .toast.warning i { color: #f1c40f; }
                .toast.info { border-color: #3498db; }
                .toast.info i { color: #3498db; }
            `;
            document.head.appendChild(style);
        }
    },

    show(message, type = 'info') {
        if (!this.container) this.init();

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        let icon = 'fa-info-circle';
        if (type === 'success') icon = 'fa-check-circle';
        if (type === 'error') icon = 'fa-exclamation-circle';
        if (type === 'warning') icon = 'fa-exclamation-triangle';

        toast.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;

        this.container.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Auto dismiss
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 4000);
    }
};

// Expose globally
window.showToast = (msg, type) => Toast.show(msg, type);

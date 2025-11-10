// Toast Notification System
class NotificationManager {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // Create toast container if it doesn't exist
        if (!document.querySelector('.toast-container')) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.querySelector('.toast-container');
        }

        // Create loading overlay
        if (!document.querySelector('.loading-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'loading-overlay';
            overlay.id = 'loadingOverlay';
            overlay.innerHTML = '<div class="spinner"></div>';
            document.body.appendChild(overlay);
        }
    }

    // Show toast notification
    showToast(message, type = 'info', duration = 5000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: '✓',
            error: '✕',
            info: 'ℹ',
            warning: '⚠'
        };

        toast.innerHTML = `
            <div class="toast-icon">${icons[type] || icons.info}</div>
            <div class="toast-content">
                <div class="toast-message">${this.escapeHtml(message)}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;

        this.container.appendChild(toast);

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                toast.style.animation = 'slideInRight 0.3s ease reverse';
                setTimeout(() => toast.remove(), 300);
            }, duration);
        }

        return toast;
    }

    // Show success toast
    success(message, duration = 5000) {
        return this.showToast(message, 'success', duration);
    }

    // Show error toast
    error(message, duration = 7000) {
        return this.showToast(message, 'error', duration);
    }

    // Show info toast
    info(message, duration = 5000) {
        return this.showToast(message, 'info', duration);
    }

    // Show warning toast
    warning(message, duration = 6000) {
        return this.showToast(message, 'warning', duration);
    }

    // Show loading overlay
    showLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('show');
        }
    }

    // Hide loading overlay
    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('show');
        }
    }

    // Show inline error message
    showError(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            element.classList.add('show');
        }
    }

    // Hide inline error message
    hideError(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.remove('show');
        }
    }

    // Clear all toasts
    clearAll() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Create global instance
const notifications = new NotificationManager();

// Helper functions for easy access
function showLoading() {
    notifications.showLoading();
}

function hideLoading() {
    notifications.hideLoading();
}

function showSuccess(message) {
    notifications.success(message);
}

function showError(message) {
    notifications.error(message);
}

function showInfo(message) {
    notifications.info(message);
}

function showWarning(message) {
    notifications.warning(message);
}

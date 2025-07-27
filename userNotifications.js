/**
 * User-friendly notification system to replace alert() calls
 * Provides better UX with styled notifications
 */

// Create notification system if it doesn't exist
function initNotificationSystem() {
    if (document.getElementById('notification-container')) {
        return; // Already initialized
    }

    const notificationContainer = document.createElement('div');
    notificationContainer.id = 'notification-container';
    notificationContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        width: 350px;
        max-width: calc(100vw - 40px);
        pointer-events: none;
    `;
    document.body.appendChild(notificationContainer);

    // Add styles if not present
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 12px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                transform: translateX(100%);
                transition: all 0.3s ease-in-out;
                pointer-events: auto;
                font-family: 'Inter', sans-serif;
                font-size: 14px;
                line-height: 1.4;
                max-width: 350px;
                word-wrap: break-word;
            }
            .notification.show {
                transform: translateX(0);
            }
            .notification.success {
                border-left: 4px solid #059669;
                background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
            }
            .notification.error {
                border-left: 4px solid #dc2626;
                background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%);
            }
            .notification.warning {
                border-left: 4px solid #d97706;
                background: linear-gradient(135deg, #fffbeb 0%, #ffffff 100%);
            }
            .notification.info {
                border-left: 4px solid #2563eb;
                background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
            }
            .notification-header {
                display: flex;
                align-items: center;
                margin-bottom: 8px;
                font-weight: 600;
            }
            .notification-icon {
                margin-right: 8px;
                font-size: 16px;
            }
            .notification-close {
                margin-left: auto;
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                color: #6b7280;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .notification-close:hover {
                color: #374151;
            }
            .notification-body {
                color: #374151;
            }
        `;
        document.head.appendChild(style);
    }
}

// Show notification function
function showNotification(message, type = 'info', duration = 5000) {
    initNotificationSystem();
    
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    const titles = {
        success: 'Sukces',
        error: 'Błąd',
        warning: 'Ostrzeżenie',
        info: 'Informacja'
    };

    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-header">
            <span class="notification-icon">${icons[type] || 'ℹ️'}</span>
            <span>${titles[type] || 'Informacja'}</span>
            <button class="notification-close">&times;</button>
        </div>
        <div class="notification-body">${message}</div>
    `;

    // Add to container
    container.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // Auto remove after duration
    if (duration > 0) {
        setTimeout(() => {
            removeNotification(notification);
        }, duration);
    }

    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        removeNotification(notification);
    });

    return notification;
}

// Remove notification function
function removeNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// Enhanced alert replacement
window.userAlert = function(message, type = 'info') {
    return showNotification(message, type);
};

// Enhanced confirm replacement
window.userConfirm = function(message, onConfirm, onCancel) {
    initNotificationSystem();
    
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    
    notification.className = 'notification warning';
    notification.innerHTML = `
        <div class="notification-header">
            <span class="notification-icon">❓</span>
            <span>Potwierdzenie</span>
        </div>
        <div class="notification-body">
            <p style="margin-bottom: 12px;">${message}</p>
            <div style="display: flex; gap: 8px; justify-content: flex-end;">
                <button class="confirm-btn" style="background: #059669; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 13px;">Tak</button>
                <button class="cancel-btn" style="background: #6b7280; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 13px;">Nie</button>
            </div>
        </div>
    `;

    container.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    const confirmBtn = notification.querySelector('.confirm-btn');
    const cancelBtn = notification.querySelector('.cancel-btn');

    confirmBtn.addEventListener('click', () => {
        removeNotification(notification);
        if (onConfirm) onConfirm();
    });

    cancelBtn.addEventListener('click', () => {
        removeNotification(notification);
        if (onCancel) onCancel();
    });

    return notification;
};

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNotificationSystem);
} else {
    initNotificationSystem();
}

console.log('✅ User Notifications System loaded successfully');
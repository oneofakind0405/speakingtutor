// Configuration
const CONFIG = {
    TEACHER_PASSWORD: "140405", // TODO: Move to server-side
    VIBRATION_PATTERN: [100, 50, 100],
    MODAL_ANIMATION_DURATION: 300
};

// Time Management
class TimeManager {
    constructor() {
        this.timeElement = document.getElementById('currentTime');
        this.updateTime = this.updateTime.bind(this);
    }

    updateTime() {
        try {
            const now = new Date();
            const timeString = now.toLocaleTimeString('ko-KR', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            this.timeElement.textContent = timeString;
        } catch (error) {
            console.error('Error updating time:', error);
        }
    }

    start() {
        this.updateTime();
        setInterval(this.updateTime, 1000);
    }
}

// Modal Management
class ModalManager {
    constructor() {
        this.overlay = document.getElementById('modalOverlay');
        this.passwordInput = document.getElementById('passwordInput');
        this.errorText = document.getElementById('errorText');
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkPassword();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.close();
            }
        });
    }

    show() {
        this.overlay.style.display = 'block';
        setTimeout(() => {
            this.overlay.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            this.passwordInput.focus();
        }, CONFIG.MODAL_ANIMATION_DURATION);
        
        this.reset();
    }

    close(event) {
        if (event && event.target !== event.currentTarget) return;
        
        this.overlay.classList.remove('show');
        
        setTimeout(() => {
            this.overlay.style.display = 'none';
        }, CONFIG.MODAL_ANIMATION_DURATION);
    }

    reset() {
        this.passwordInput.value = '';
        this.passwordInput.classList.remove('error');
        this.errorText.classList.remove('show');
        this.passwordInput.setAttribute('aria-invalid', 'false');
    }

    showError() {
        this.passwordInput.classList.add('error');
        this.errorText.classList.add('show');
        this.passwordInput.setAttribute('aria-invalid', 'true');
        this.passwordInput.value = '';
        
        if (navigator.vibrate) {
            navigator.vibrate(CONFIG.VIBRATION_PATTERN);
        }
        
        setTimeout(() => {
            this.passwordInput.classList.remove('error');
            this.passwordInput.focus();
        }, 2000);
    }

    checkPassword() {
        const inputPassword = this.passwordInput.value;
        
        if (inputPassword === CONFIG.TEACHER_PASSWORD) {
            this.close();
            setTimeout(() => {
                window.location.href = 'teacher.html';
            }, CONFIG.MODAL_ANIMATION_DURATION);
        } else {
            this.showError();
        }
    }
}

// Navigation
class NavigationManager {
    static goToStudentPage() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const sessionId = urlParams.get('session');
            
            if (sessionId) {
                window.location.href = `student.html?session=${sessionId}`;
            } else {
                window.location.href = 'student.html';
            }
        } catch (error) {
            console.error('Error navigating to student page:', error);
        }
    }

    static updateStudentButton() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const sessionId = urlParams.get('session');
            
            if (sessionId) {
                document.getElementById('studentTitle').textContent = '세션 참여';
                document.getElementById('studentDesc').textContent = '생성된 세션에 참여하기';
            }
        } catch (error) {
            console.error('Error updating student button:', error);
        }
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    const timeManager = new TimeManager();
    const modalManager = new ModalManager();

    // Start time updates
    timeManager.start();

    // Update student button if needed
    NavigationManager.updateStudentButton();

    // Make functions globally available
    window.showPasswordModal = () => modalManager.show();
    window.closePasswordModal = (event) => modalManager.close(event);
    window.checkPassword = () => modalManager.checkPassword();
    window.goToStudentPage = () => NavigationManager.goToStudentPage();
}); 

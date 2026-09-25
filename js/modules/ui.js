/* ==========================================================================
   INTERVIEWX — UI ROUTER & INTERACTION CONTROLLER
   ========================================================================== */

const UIManager = {
    currentView: 'landing',

    init() {
        this.bindNavLinks();
        this.bindThemeToggle();
        this.applyTheme(StorageManager.getTheme());
        this.handleHashRouting();
        window.addEventListener('hashchange', () => this.handleHashRouting());
    },

    bindNavLinks() {
        document.querySelectorAll('[data-view]').forEach(link => {
            link.addEventListener('click', (e) => {
                const targetView = link.getAttribute('data-view');
                if (targetView) {
                    this.showView(targetView);
                }
            });
        });
    },

    handleHashRouting() {
        const hash = window.location.hash.replace('#', '');
        if (hash) {
            this.showView(hash);
        } else {
            this.showView('landing');
        }
    },

    showView(viewId) {
        const targetSection = document.getElementById(`view-${viewId}`);
        if (!targetSection) return;

        document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
        targetSection.classList.add('active');

        // Update nav active states
        document.querySelectorAll('.nav-item').forEach(nav => {
            if (nav.getAttribute('data-view') === viewId) {
                nav.classList.add('active');
            } else {
                nav.classList.remove('active');
            }
        });

        this.currentView = viewId;
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Trigger view specific lifecycle events
        if (window.App && typeof window.App.onViewChange === 'function') {
            window.App.onViewChange(viewId);
        }
    },

    bindThemeToggle() {
        const btn = document.getElementById('theme-toggle');
        if (!btn) return;

        btn.addEventListener('click', () => {
            const current = StorageManager.getTheme();
            const next = current === 'dark' ? 'light' : 'dark';
            this.applyTheme(next);
            StorageManager.saveTheme(next);
            this.showToast(`Switched to ${next.toUpperCase()} mode`, 'info');
        });
    },

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    },

    showToast(message, type = 'cyan') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast border-${type}`;
        toast.innerHTML = `<span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3200);
    }
};

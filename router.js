export function navigateTo(screenId) {
    const screens = document.querySelectorAll('.app-screen');
    screens.forEach(screen => screen.classList.remove('active'));
    
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }

    const bottomNav = document.querySelector('.bottom-tab-nav');
    if (bottomNav) {
        if (screenId === 'screen-login' || screenId === 'screen-tracking' || screenId === 'screen-chat') {
            bottomNav.style.display = 'none';
        } else {
            bottomNav.style.display = 'flex';
        }
    }

    document.querySelectorAll('.tab-nav-item').forEach(btn => btn.classList.remove('active'));
    if (screenId === 'screen-home') document.getElementById('tab-home')?.classList.add('active');
    if (screenId === 'screen-alerts') document.getElementById('tab-alerts')?.classList.add('active');
    if (screenId === 'screen-feedback') document.getElementById('tab-feedback')?.classList.add('active');

    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar && overlay) {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    }

    // Recalcula a renderização do mapa Leaflet ao exibir a tela de tracking
    if (screenId === 'screen-tracking' && window.leafletMap) {
        setTimeout(() => {
            window.leafletMap.invalidateSize();
        }, 300);
    }
}

export function initRouter(onSelectRouteCallback) {
    const btnMenu = document.getElementById('btn-trigger-menu');
    const btnCloseMenu = document.getElementById('close-menu');
    const overlay = document.getElementById('sidebar-overlay');
    const sidebar = document.getElementById('sidebar');

    btnMenu?.addEventListener('click', () => {
        sidebar?.classList.add('active');
        overlay?.classList.add('active');
    });

    btnCloseMenu?.addEventListener('click', () => {
        sidebar?.classList.remove('active');
        overlay?.classList.remove('active');
    });

    overlay?.addEventListener('click', () => {
        sidebar?.classList.remove('active');
        overlay?.classList.remove('active');
    });

    // Navegação inferior
    document.getElementById('tab-home')?.addEventListener('click', () => navigateTo('screen-home'));
    document.getElementById('tab-alerts')?.addEventListener('click', () => navigateTo('screen-alerts'));
    document.getElementById('tab-feedback')?.addEventListener('click', () => navigateTo('screen-feedback'));

    // Pesquisa
    document.querySelectorAll('#open-search-trigger').forEach(trigger => {
        trigger.addEventListener('click', () => navigateTo('screen-search'));
    });
    document.getElementById('btn-quick-search')?.addEventListener('click', () => navigateTo('screen-search'));

    // Banners e atalhos
    document.getElementById('card-promo-alerts')?.addEventListener('click', () => navigateTo('screen-alerts'));
    document.getElementById('card-promo-feedback')?.addEventListener('click', () => navigateTo('screen-feedback'));
    document.getElementById('btn-header-alerts')?.addEventListener('click', () => navigateTo('screen-alerts'));

    // Botões de voltar
    document.getElementById('btn-back-search')?.addEventListener('click', () => navigateTo('screen-home'));
    document.getElementById('btn-back-tracking')?.addEventListener('click', () => navigateTo('screen-home'));
    document.getElementById('btn-close-tracking')?.addEventListener('click', () => navigateTo('screen-home'));
    document.getElementById('btn-back-alerts')?.addEventListener('click', () => navigateTo('screen-home'));
    document.getElementById('btn-back-feedback')?.addEventListener('click', () => navigateTo('screen-home'));
    document.getElementById('btn-back-profile')?.addEventListener('click', () => navigateTo('screen-home'));
    document.getElementById('btn-back-favorites')?.addEventListener('click', () => navigateTo('screen-home'));
    document.getElementById('btn-back-history')?.addEventListener('click', () => navigateTo('screen-home'));
    document.getElementById('btn-back-contacts')?.addEventListener('click', () => navigateTo('screen-home'));
    document.getElementById('btn-back-settings')?.addEventListener('click', () => navigateTo('screen-home'));

    // Menu da Sidebar
    document.getElementById('menu-profile')?.addEventListener('click', (e) => { e.preventDefault(); navigateTo('screen-profile'); });
    document.getElementById('menu-favorites')?.addEventListener('click', (e) => { e.preventDefault(); navigateTo('screen-favorites'); });
    document.getElementById('menu-history')?.addEventListener('click', (e) => { e.preventDefault(); navigateTo('screen-history'); });
    document.getElementById('menu-contacts')?.addEventListener('click', (e) => { e.preventDefault(); navigateTo('screen-contacts'); });
    document.getElementById('menu-chat')?.addEventListener('click', (e) => { e.preventDefault(); navigateTo('screen-chat'); });
    document.getElementById('menu-settings')?.addEventListener('click', (e) => { e.preventDefault(); navigateTo('screen-settings'); });

    // Atalhos para a Orion AI
    document.getElementById('btn-header-orion')?.addEventListener('click', () => navigateTo('screen-chat'));
    document.getElementById('btn-back-chat')?.addEventListener('click', () => navigateTo('screen-home'));

    // Clique em item da lista de favoritos (usando delegação de eventos para elementos dinâmicos)
    document.getElementById('favorites-container')?.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-open-fav-route');
        if (btn) {
            const routeId = btn.getAttribute('data-route-id');
            if (routeId && typeof onSelectRouteCallback === 'function') {
                onSelectRouteCallback(routeId);
            }
            navigateTo('screen-tracking');
        }
    });

    // Limpar cache local
    document.getElementById('btn-clear-cache')?.addEventListener('click', () => {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'Limpar dados?',
                text: 'Isso limpará suas preferências salvas localmente.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sim, limpar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    localStorage.clear();
                    Swal.fire('Concluído!', 'Dados limpos com sucesso.', 'success');
                }
            });
        }
    });

    // Logout
    document.getElementById('btn-logout')?.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('trackbus_aluno_nome');
        localStorage.removeItem('trackbus_aluno_matricula');
        navigateTo('screen-login');
    });
}
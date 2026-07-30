import { showSuccess } from './toast.js';
import { db } from './firebase-config.js';
import { navigateTo } from './router.js';
import { initTrackingMap, updateBusOnMap, resetTrackingMarker } from './map.js';

let activeRouteRef = null;

function recordRouteAccess(routeId, routeData) {
    let history = JSON.parse(localStorage.getItem('trackbus_history') || '[]');
    let counts = JSON.parse(localStorage.getItem('trackbus_counts') || '{}');

    counts[routeId] = (counts[routeId] || 0) + 1;
    localStorage.setItem('trackbus_counts', JSON.stringify(counts));

    const name = routeData.nome || routeId;
    const status = routeData.status || 'Fora de Operação';
    const sede = routeData.sede || 'ECIT';
    
    history = history.filter(item => item.id !== routeId);
    history.unshift({ id: routeId, name, status, sede });
    
    if (history.length > 6) history.pop();
    
    localStorage.setItem('trackbus_history', JSON.stringify(history));

    renderHistoryAndFavorite();
}

export function renderHistoryAndFavorite() {
    const historyWrapper = document.getElementById('carousel-history-wrapper');
    if (!historyWrapper) return;

    const history = JSON.parse(localStorage.getItem('trackbus_history') || '[]');
    const counts = JSON.parse(localStorage.getItem('trackbus_counts') || '{}');

    historyWrapper.innerHTML = `
        <div class="carousel-item-node add-node" id="btn-quick-search">
            <div class="node-circle-frame">
                <i class="fa-solid fa-plus"></i>
            </div>
            <span class="node-title">Nova Rota</span>
        </div>
    `;

    document.getElementById('btn-quick-search')?.addEventListener('click', () => navigateTo('screen-search'));

    history.forEach(item => {
        const node = document.createElement('div');
        node.className = 'carousel-item-node';
        
        const isOnline = item.status === 'Em Rota';
        const dotClass = isOnline ? 'dot-online' : 'dot-warning';

        node.innerHTML = `
            <div class="node-circle-frame active-route">
                <i class="fa-solid fa-bus-simple"></i>
                <span class="node-status-dot ${dotClass}"></span>
            </div>
            <span class="node-title">${item.name}</span>
            <span class="node-subtitle">${item.status}</span>
        `;

        node.addEventListener('click', () => {
            openRouteTracking(item.id);
        });

        historyWrapper.appendChild(node);
    });

    let favoriteId = null;
    let maxCount = 0;
    Object.entries(counts).forEach(([id, count]) => {
        if (count > maxCount) {
            maxCount = count;
            favoriteId = id;
        }
    });

    const favTitle = document.getElementById('fav-route-title');
    const favSubtitle = document.getElementById('fav-route-subtitle');
    const favShortcut = document.getElementById('recent-destination-shortcut');

    if (favoriteId && history.length > 0) {
        const favData = history.find(h => h.id === favoriteId) || { name: favoriteId, sede: 'ECIT' };
        if (favTitle) favTitle.innerText = favData.name;
        if (favSubtitle) favSubtitle.innerText = `${favData.sede} • Rota mais frequente`;

        if (favShortcut) {
            favShortcut.onclick = () => openRouteTracking(favoriteId);
        }
    } else {
        if (favTitle) favTitle.innerText = 'Nenhuma rota frequente';
        if (favSubtitle) favSubtitle.innerText = 'Sua rota preferida aparecerá aqui';
        if (favShortcut) favShortcut.onclick = null;
    }
}

export function openRouteTracking(routeId) {
    if (!routeId) return;

    if (activeRouteRef) activeRouteRef.off();
    resetTrackingMarker();
    navigateTo('screen-tracking');
    initTrackingMap();

    activeRouteRef = db.ref(`rotas/${routeId}`);

    activeRouteRef.once('value').then((snapshot) => {
        if (snapshot.exists()) {
            recordRouteAccess(routeId, snapshot.val());
        }
    });

    activeRouteRef.on('value', (snapshot) => {
        if (!snapshot.exists()) return;
        const data = snapshot.val();

        const title = document.getElementById('tracking-route-title');
        if (title) title.innerText = `${data.sede || ''} - ${data.nome || routeId}`;

        const driverName = document.getElementById('tracking-driver-name');
        if (driverName) driverName.innerText = data.motorista || 'Não alocado';

        const statusLabel = document.getElementById('tracking-status-label');
        if (statusLabel) {
            statusLabel.innerText = data.status || 'Fora de Operação';
            statusLabel.className = 'tracking-status-badge';
            if (data.status === 'Em Rota') statusLabel.classList.add('status-operacao');
            if (data.status === 'Atrasado') statusLabel.classList.add('status-atrasado');
        }

        const alertBanner = document.getElementById('tracking-alert-banner');
        if (alertBanner) {
            if (data.motivo) {
                alertBanner.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${data.motivo}`;
            } else {
                alertBanner.innerHTML = `Ônibus em deslocamento regular.`;
            }
        }

        const startName = document.getElementById('tracking-stop-start-name');
        const startTime = document.getElementById('tracking-stop-start-time');
        const endTime = document.getElementById('tracking-stop-end-time');

        if (startName) startName.innerText = `Origem - ${data.trajeto || data.sede}`;
        if (startTime) startTime.innerText = data.inicio || '--:--';
        if (endTime) endTime.innerText = data.chegada || '--:--';

        updateBusOnMap(data.latitude, data.longitude, data.motorista);
    });
}

export function initServices() {
    const selectCidade = document.getElementById('select-cidade-polo');
    const selectItinerario = document.getElementById('select-itinerario');
    const formSelectRoute = document.getElementById('form-select-route');
    const formFeedback = document.getElementById('form-feedback-student');

    renderHistoryAndFavorite();

    if (selectCidade) {
        db.ref('sedes').on('value', (snapshot) => {
            selectCidade.innerHTML = '<option value="" disabled selected>Escolha sua cidade sede...</option>';
            if (snapshot.exists()) {
                snapshot.forEach((childSnap) => {
                    const data = childSnap.val();
                    const option = document.createElement('option');
                    option.value = data.nome || childSnap.key;
                    option.textContent = data.nome || childSnap.key;
                    selectCidade.appendChild(option);
                });
            }
        });

        selectCidade.addEventListener('change', (e) => {
            const selectedSede = e.target.value;
            selectItinerario.innerHTML = '<option value="" disabled selected>Escolha a sua rota...</option>';
            selectItinerario.disabled = false;

            db.ref('rotas').once('value', (snapshot) => {
                if (snapshot.exists()) {
                    snapshot.forEach((childSnap) => {
                        const data = childSnap.val();
                        if (data.sede === selectedSede) {
                            const option = document.createElement('option');
                            option.value = childSnap.key;
                            option.textContent = data.nome || childSnap.key;
                            selectItinerario.appendChild(option);
                        }
                    });
                }
            });
        });
    }

    if (formSelectRoute) {
        formSelectRoute.addEventListener('submit', (e) => {
            e.preventDefault();
            const routeId = selectItinerario.value;
            if (routeId) openRouteTracking(routeId);
        });
    }

    if (formFeedback) {
        formFeedback.addEventListener('submit', (e) => {
            e.preventDefault();
            const studentName = localStorage.getItem('trackbus_aluno_nome') || 'Anônimo';
            const msgText = document.getElementById('feedback-text')?.value.trim();

            if (!msgText) return;

            const timestamp = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

            db.ref('feedbacks_estudantes').push({
                nome: studentName,
                mensagem: msgText,
                data: timestamp
            }).then(() => {
            showSuccess("Seu feedback foi entregue à secretaria.");
            formFeedback.reset();
            navigateTo('screen-home');
            });
        });
    }
}
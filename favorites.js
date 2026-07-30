export function renderFavoritesList() {
    const container = document.getElementById('favorites-container');
    if (!container) return;

    // Busca as rotas direto do nó 'rotas' do Firebase Database
    firebase.database().ref('rotas').once('value')
        .then((snapshot) => {
            const rotas = snapshot.val();
            if (!rotas) {
                container.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">Nenhuma rota cadastrada.</p>';
                return;
            }

            let html = '';
            Object.keys(rotas).forEach((routeId) => {
                const rota = rotas[routeId];
                html += `
                    <div class="tracking-details-card favorite-item-card" style="margin-bottom: 12px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <span class="promo-tag" style="background: #FFB800; color: #000;">${rota.tag || 'Rota'}</span>
                                <h4 style="margin-top: 6px;">${rota.nome || routeId}</h4>
                                <p style="font-size: 0.8rem; color: #888;">${rota.origem || 'Origem'} ➔ ${rota.destino || 'ECIT Dom Marcelo'}</p>
                            </div>
                            <button class="btn-open-fav-route" data-route-id="${routeId}" style="background: #FFB800; border: none; border-radius: 50%; width: 42px; height: 42px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                                <i class="fa-solid fa-location-arrow" style="color: #000; font-size: 1.1rem;"></i>
                            </button>
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html;
        })
        .catch((error) => {
            console.error('Erro ao carregar favoritos:', error);
            container.innerHTML = '<p style="color: #EF4444; text-align: center;">Erro ao carregar rotas do banco.</p>';
        });
}
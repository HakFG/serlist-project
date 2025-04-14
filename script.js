document.addEventListener('DOMContentLoaded', function() {
    // Filtro de Listas
    const listFilters = document.querySelectorAll('.list-filters a');
    const seriesGroups = document.querySelectorAll('.status-group');
    const sortBySelect = document.querySelector('#sort-by');
    let currentFilter = 'all'; // Variável para rastrear o filtro ativo

    listFilters.forEach(filter => {
        filter.addEventListener('click', function(event) {
            event.preventDefault();
            const status = this.getAttribute('data-status');
            currentFilter = status; // Atualiza o filtro ativo

            document.querySelector('.list-filters a.active').classList.remove('active');
            this.classList.add('active');

            loadAndDisplaySeries(sortBySelect ? sortBySelect.value : 'default', currentFilter);
        });
    });

    // Botão "Adicionar" e Modal
    const addSeriesBtn = document.getElementById('add-series-btn');
    const addSeriesModal = document.getElementById('add-series-modal');
    const closeButton = document.querySelector('.close-button');
    const addSeriesForm = document.getElementById('add-series-form');
    const seriesListMain = document.querySelector('.series-list');

    addSeriesBtn.addEventListener('click', function() {
        addSeriesModal.style.display = 'block';
    });

    closeButton.addEventListener('click', function() {
        addSeriesModal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target == addSeriesModal) {
            addSeriesModal.style.display = 'none';
        }
    });

    // Função para salvar os dados no LocalStorage
    function saveSeriesData() {
        const allSeries = [];
        document.querySelectorAll('.status-group').forEach(group => {
            const status = group.getAttribute('data-status');
            group.querySelectorAll('.series-item').forEach(item => {
                const nameElement = item.querySelector('.info-container h3');
                const scoreElement = item.querySelector('.info-container .score');
                const episodesElement = item.querySelector('.info-container .episodes');
                const coverElement = item.querySelector('.cover-container img');

                allSeries.push({
                    name: nameElement ? nameElement.textContent : '',
                    status: status,
                    score: scoreElement ? scoreElement.textContent : '',
                    episodes: episodesElement ? episodesElement.textContent : '',
                    coverLink: coverElement ? coverElement.src : '',
                });
            });
        });
        localStorage.setItem('mySeriesList', JSON.stringify(allSeries));
    }

    // Funções de comparação para ordenação
    function compareByScoreDescending(a, b) {
        const scoreA = parseFloat(a.score) || -1;
        const scoreB = parseFloat(b.score) || -1;
        return scoreB - scoreA;
    }

    function compareByScoreAscending(a, b) {
        const scoreA = parseFloat(a.score) || -1;
        const scoreB = parseFloat(b.score) || -1;
        return scoreA - scoreB;
    }

    function compareByTitleAscending(a, b) {
        return a.name.localeCompare(b.name);
    }

    function compareByTitleDescending(a, b) {
        return b.name.localeCompare(a.name);
    }

    // Função para renderizar as séries em um grupo de status
    function renderSeriesGroup(status, series) {
        const targetGrid = document.querySelector(`.status-group[data-status="${status}"] .series-grid`);
        if (targetGrid) {
            targetGrid.innerHTML = ''; // Limpa o grid antes de renderizar
            series.forEach(seriesItem => {
                const newSeriesItem = document.createElement('div');
                newSeriesItem.classList.add('series-item', seriesItem.status);
                newSeriesItem.innerHTML = `
                    <div class="cover-container">
                        ${seriesItem.coverLink ? `<img src="${seriesItem.coverLink}" alt="${seriesItem.name}" style="width: 100%; border-radius: 5px;">` : ''}
                        <button class="remove-series-btn">×</button>
                        <div class="info-container">
                            <h3>${seriesItem.name}</h3>
                            <div class="meta">
                                ${seriesItem.episodes ? `<span class="episodes">${seriesItem.episodes}</span>` : ''}
                                ${seriesItem.score ? `<span class="score">${seriesItem.score}</span>` : ''}
                            </div>
                        </div>
                    </div>
                `;
                targetGrid.appendChild(newSeriesItem);
            });
        } else if (series.length > 0) {
            const newStatusGroup = document.createElement('section');
            newStatusGroup.classList.add('status-group');
            newStatusGroup.setAttribute('data-status', status);
            newStatusGroup.innerHTML = `
                <h2>${status.charAt(0).toUpperCase() + status.slice(1)}</h2>
                <div class="series-grid"></div>
            `;
            seriesListMain.appendChild(newStatusGroup);
            renderSeriesGroup(status, series); // Renderiza as séries no novo grupo
        }
    }

    // Função para carregar e exibir os dados ordenados e filtrados
    function loadAndDisplaySeries(sortBy = 'default', filter = 'all') {
        const storedSeries = localStorage.getItem('mySeriesList');
        if (storedSeries) {
            let seriesData = JSON.parse(storedSeries);

            // Aplica o filtro
            if (filter !== 'all') {
                seriesData = seriesData.filter(series => series.status === filter);
            }

            // Aplica a ordenação
            switch (sortBy) {
                case 'score-desc':
                    seriesData.sort(compareByScoreDescending);
                    break;
                case 'score-asc':
                    seriesData.sort(compareByScoreAscending);
                    break;
                case 'title-asc':
                    seriesData.sort(compareByTitleAscending);
                    break;
                case 'title-desc':
                    seriesData.sort(compareByTitleDescending);
                    break;
                // case 'default': // Mantém a ordem em que foram adicionados
                //     break;
            }

            // Agrupa as séries filtradas e ordenadas por status
            const groupedSeries = {};
            seriesData.forEach(series => {
                if (!groupedSeries[series.status]) {
                    groupedSeries[series.status] = [];
                }
                groupedSeries[series.status].push(series);
            });

            // Limpa a lista principal antes de renderizar
            seriesListMain.innerHTML = '';

            // Renderiza cada grupo de status
            for (const status in groupedSeries) {
                renderSeriesGroup(status, groupedSeries[status]);
            }
        } else {
            // Se não houver dados, limpa a lista principal
            seriesListMain.innerHTML = '';
        }
    }

    // Carregar e exibir os dados ao carregar a página (ordem padrão, filtro "all")
    loadAndDisplaySeries();

    // Event listener para a mudança na opção de ordenação
    if (sortBySelect) {
        sortBySelect.addEventListener('change', function() {
            loadAndDisplaySeries(this.value, currentFilter);
        });
    }

    // Lógica para adicionar a série
    addSeriesForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const name = document.getElementById('series-name').value;
        const status = document.getElementById('series-status').value;
        const score = document.getElementById('series-score').value;
        const episodes = document.getElementById('series-episodes').value;
        const coverLink = document.getElementById('series-cover-link').value;

        const newSeriesItem = document.createElement('div');
        newSeriesItem.classList.add('series-item', status);
        newSeriesItem.innerHTML = `
            <div class="cover-container">
                ${coverLink ? `<img src="${coverLink}" alt="${name}" style="width: 100%; border-radius: 5px;">` : ''}
                <button class="remove-series-btn">×</button>
                <div class="info-container">
                    <h3>${name}</h3>
                    <div class="meta">
                        ${episodes ? `<span class="episodes">${episodes}</span>` : ''}
                        ${score ? `<span class="score">${score}</span>` : ''}
                    </div>
                </div>
            </div>
        `;

        const targetGroup = document.querySelector(`.status-group[data-status="${status}"] .series-grid`);
        if (targetGroup) {
            targetGroup.appendChild(newSeriesItem);
        } else {
            const newStatusGroup = document.createElement('section');
            newStatusGroup.classList.add('status-group');
            newStatusGroup.setAttribute('data-status', status);
            newStatusGroup.innerHTML = `
                <h2>${status.charAt(0).toUpperCase() + status.slice(1)}</h2>
                <div class="series-grid"></div>
            `;
            newStatusGroup.querySelector('.series-grid').appendChild(newSeriesItem);
            seriesListMain.appendChild(newStatusGroup);
        }

        saveSeriesData(); // Salva os dados após adicionar
        loadAndDisplaySeries(sortBySelect ? sortBySelect.value : 'default', currentFilter); // Recarrega e exibe a lista filtrada e ordenada
        addSeriesForm.reset();
        addSeriesModal.style.display = 'none';
    });

    // Botão Cancelar na modal
    const cancelButton = document.querySelector('.cancel-button');
    cancelButton.addEventListener('click', function() {
        addSeriesModal.style.display = 'none';
    });

    // Lógica para remover a série
    seriesListMain.addEventListener('click', function(event) {
        if (event.target.classList.contains('remove-series-btn')) {
            const seriesItemToRemove = event.target.closest('.series-item');
            seriesItemToRemove.remove();
            saveSeriesData(); // Salva os dados após remover
            loadAndDisplaySeries(sortBySelect ? sortBySelect.value : 'default', currentFilter); // Recarrega e exibe a lista filtrada e ordenada
        }
    });
});
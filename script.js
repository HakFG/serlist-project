document.addEventListener('DOMContentLoaded', function() {
    // Filtro de Listas
    const listFilters = document.querySelectorAll('.list-filters a');
    const seriesGroups = document.querySelectorAll('.status-group');
    const sortBySelect = document.querySelector('#sort-by');
    let currentFilter = 'all'; // Variável para rastrear o filtro ativo
    let allSeriesData = []; // Armazena todos os dados das séries carregados
    const statusOrder = ['completed', 'watching', 'paused', 'plan-to-watch', 'dropped', 'upcoming'];

    // Modal de Edição
    const editSeriesModal = document.getElementById('edit-series-modal');
    const closeEditModalButton = document.getElementById('close-edit-modal');
    const cancelEditButton = document.getElementById('cancel-edit-button');
    const editSeriesForm = document.getElementById('edit-series-form');
    const editSeriesIdInput = document.getElementById('edit-series-id');
    const editSeriesStatusSelect = document.getElementById('edit-series-status');
    const editSeriesScoreInput = document.getElementById('edit-series-score');
    const editSeriesWatchedEpisodesInput = document.getElementById('edit-series-watched-episodes');
    const editSeriesTotalEpisodesInput = document.getElementById('edit-series-total-episodes');
    let currentEditingSeries = null;

    // Barra de Pesquisa
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    // Função para filtrar as séries com base no termo de pesquisa
    function filterSeriesByTitle(searchTerm) {
        if (!searchTerm) {
            loadAndDisplaySeries(sortBySelect ? sortBySelect.value : 'default', currentFilter); // Se a pesquisa estiver vazia, mostra tudo
            return;
        }

        const filteredSeriesData = allSeriesData.filter(series =>
            series.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Agrupa as séries filtradas por status
        const groupedSeries = {};
        filteredSeriesData.forEach(series => {
            if (!groupedSeries[series.status]) {
                groupedSeries[series.status] = [];
            }
            groupedSeries[series.status].push(series);
        });

        // Limpa a lista principal e renderiza os resultados filtrados na ordem correta
        seriesListMain.innerHTML = '';
        statusOrder.forEach(status => {
            if (groupedSeries[status]) {
                renderSeriesGroup(status, groupedSeries[status]);
                delete groupedSeries[status]; // Remove para não renderizar novamente
            }
        });
        // Renderiza quaisquer outros grupos de status que possam existir (para compatibilidade futura)
        for (const status in groupedSeries) {
            renderSeriesGroup(status, groupedSeries[status]);
        }

        // Adiciona os event listeners aos novos itens renderizados
        addEpisodeButtonListeners();
        addOptionsButtonListeners(); // Adiciona listeners para o botão de opções
    }

    // Event listener para o campo de pesquisa (filtragem em tempo real ao digitar)
    searchInput.addEventListener('input', function() {
        filterSeriesByTitle(this.value.trim());
    });

    // Event listener para o botão de pesquisa (opcional, para pesquisar ao clicar no botão)
    searchButton.addEventListener('click', function() {
        filterSeriesByTitle(searchInput.value.trim());
    });

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

    // Botão "Adicionar" e Modal de Adicionar
    const addSeriesBtn = document.getElementById('add-series-btn');
    const addSeriesModal = document.getElementById('add-series-modal');
    const closeButton = document.querySelector('#add-series-modal .close-button');
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
        if (event.target == editSeriesModal) {
            editSeriesModal.style.display = 'none';
        }
    });

    closeEditModalButton.addEventListener('click', function() {
        editSeriesModal.style.display = 'none';
    });

    cancelEditButton.addEventListener('click', function() {
        editSeriesModal.style.display = 'none';
    });

    // Função para salvar os dados no LocalStorage
    function saveSeriesData(newSeries) {
        const storedSeries = localStorage.getItem('mySeriesList');
        let seriesArray = storedSeries ? JSON.parse(storedSeries) : [];
        seriesArray.push(newSeries);
        localStorage.setItem('mySeriesList', JSON.stringify(seriesArray));
        allSeriesData = seriesArray; // Atualiza a variável com todos os dados
    }

    // Funções de comparação para ordenação
    function compareByScoreDescending(a, b) {
        const scoreA = parseFloat(a.score) || -1;
        const scoreB = parseFloat(b.score) || -1;

        if (scoreB !== scoreA) {
            return scoreB - scoreA; // Ordena por nota decrescente
        } else {
            return a.name.localeCompare(b.name); // Se as notas são iguais, ordena alfabeticamente
        }
    }

    function compareByScoreAscending(a, b) {
        const scoreA = parseFloat(a.score) || -1;
        const scoreB = parseFloat(b.score) || -1;

        if (scoreA !== scoreB) {
            return scoreA - scoreB; // Ordena por nota crescente
        } else {
            return a.name.localeCompare(b.name); // Se as notas são iguais, ordena alfabeticamente
        }
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
                newSeriesItem.dataset.seriesId = seriesItem.id; // Adiciona um ID único para cada série

                let episodesDisplay = '';
                if (seriesItem.totalEpisodes > 0) {
                    if (seriesItem.watchedEpisodes < seriesItem.totalEpisodes) {
                        episodesDisplay = `<span class="episodes"><span class="episodes-watched">${seriesItem.watchedEpisodes}</span>/<span class="episodes-total">${seriesItem.totalEpisodes}</span><button class="add-episode-btn">+</button></span>`;
                    } else {
                        episodesDisplay = `<span class="episodes">${seriesItem.totalEpisodes}</span>`;
                    }
                } else {
                    episodesDisplay = `<span class="episodes">${seriesItem.episodes || ''}</span>`;
                }

                newSeriesItem.innerHTML = `
                    <div class="cover-container">
                        ${seriesItem.coverLink ? `<img src="${seriesItem.coverLink}" alt="${seriesItem.name}" style="width: 100%; border-radius: 5px;">` : ''}
                        <button class="remove-series-btn">×</button>
                        <button class="options-series-btn"><i class="fas fa-ellipsis-v"></i></button>
                        <div class="info-container">
                            <a href="serie.html?id=${seriesItem.id}" style="text-decoration: none; color: inherit;">
                                <h3>${seriesItem.name}</h3>
                            </a>
                            <div class="meta">
                                <span class="episodes">${episodesDisplay}</span>
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
            allSeriesData = seriesData; // Atualiza a variável com todos os dados

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

            // Renderiza os grupos de status na ordem predefinida
            statusOrder.forEach(status => {
                if (groupedSeries[status]) {
                    renderSeriesGroup(status, groupedSeries[status]);
                    delete groupedSeries[status]; // Remove para não renderizar novamente
                }
            });

            // Renderiza quaisquer outros grupos de status que possam existir (para compatibilidade futura)
            for (const status in groupedSeries) {
                renderSeriesGroup(status, groupedSeries[status]);
            }

            // Adiciona event listeners para os botões após a renderização
            addEpisodeButtonListeners();
            addOptionsButtonListeners(); // Adiciona listeners para o botão de opções
        } else {
            // Se não houver dados, limpa a lista principal
            seriesListMain.innerHTML = '';
            allSeriesData = [];
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
        const watchedEpisodes = parseInt(document.getElementById('series-watched-episodes').value) || 0;
        const totalEpisodes = parseInt(document.getElementById('series-total-episodes').value) || 0;
        const coverLink = document.getElementById('series-cover-link').value;
        const id = Date.now(); // Gera um ID único para a série

        const newSeries = {
            id: id,
            name: name,
            status: status,
            score: score,
            watchedEpisodes: watchedEpisodes,
            totalEpisodes: totalEpisodes,
            coverLink: coverLink,
        };

        saveSeriesData(newSeries); // Salva a nova série
        loadAndDisplaySeries(sortBySelect ? sortBySelect.value : 'default', currentFilter); // Recarrega e exibe a lista filtrada e ordenada
        addSeriesForm.reset();
        addSeriesModal.style.display = 'none';
    });

    // Botão Cancelar na modal de adicionar
    const cancelButton = document.querySelector('#add-series-modal .cancel-button');
    cancelButton.addEventListener('click', function() {
        addSeriesModal.style.display = 'none';
    });

    // Lógica para remover a série
    seriesListMain.addEventListener('click', function(event) {
        if (event.target.classList.contains('remove-series-btn')) {
            const seriesItemToRemove = event.target.closest('.series-item');
            if (seriesItemToRemove) {
                const seriesIdToRemove = seriesItemToRemove.dataset.seriesId;
                removeSeriesData(seriesIdToRemove); // Remove a série do Local Storage pelo ID
                loadAndDisplaySeries(sortBySelect ? sortBySelect.value : 'default', currentFilter); // Recarrega e exibe a lista filtrada e ordenada
            }
        }
    });

    function removeSeriesData(seriesId) {
        const storedSeries = localStorage.getItem('mySeriesList');
        if (storedSeries) {
            let seriesData = JSON.parse(storedSeries);
            const updatedSeriesData = seriesData.filter(series => series.id !== parseInt(seriesId));
            localStorage.setItem('mySeriesList', JSON.stringify(updatedSeriesData));
            allSeriesData = updatedSeriesData; // Atualiza a variável com todos os dados
        }
    }

    function addEpisodeButtonListeners() {
        const addEpisodeButtons = document.querySelectorAll('.add-episode-btn');
        addEpisodeButtons.forEach(button => {
            button.addEventListener('click', function(event) {
                const seriesItem = event.target.closest('.series-item');
                if (seriesItem) {
                    const seriesId = parseInt(seriesItem.dataset.seriesId);
                    const watchedSpan = seriesItem.querySelector('.episodes-watched');
                    const totalSpan = seriesItem.querySelector('.episodes-total');
                    const episodesContainer = seriesItem.querySelector('.episodes');
                    const addButton = event.target;

                    if (watchedSpan && totalSpan && episodesContainer && addButton) {
                        let watched = parseInt(watchedSpan.textContent);
                        const total = parseInt(totalSpan.textContent);

                        if (watched < total) {
                            watched++;
                            watchedSpan.textContent = watched;
                            updateSeriesData(seriesId, { watchedEpisodes: watched });
                            // A exibição será atualizada na próxima chamada de loadAndDisplaySeries
                        } else if (total > 0 && watched === total) {
                            // Optionally remove the button or change its state when completed
                            const episodesSpan = seriesItem.querySelector('.episodes');
                            if (episodesSpan && addButton) {
                                episodesSpan.removeChild(addButton);
                            }
                        }
                    }
                }
            });
        });
    }

    function updateSeriesData(seriesId, updates) {
        const storedSeries = localStorage.getItem('mySeriesList');
        if (storedSeries) {
            const seriesData = JSON.parse(storedSeries);
            const updatedSeriesData = seriesData.map(series => {
                if (series.id === seriesId) {
                    return { ...series, ...updates };
                }
                return series;
            });
            localStorage.setItem('mySeriesList', JSON.stringify(updatedSeriesData));
            allSeriesData = updatedSeriesData; // Atualiza a variável com todos os dados
            loadAndDisplaySeries(sortBySelect ? sortBySelect.value : 'default', currentFilter);
        }
    }

    function findSeriesById(seriesId) {
        return allSeriesData.find(series => series.id === seriesId);
    }

    function openEditModal(seriesId) {
        const seriesToEdit = findSeriesById(seriesId);
        if (seriesToEdit) {
            currentEditingSeries = seriesToEdit;
            editSeriesIdInput.value = seriesToEdit.id;
            editSeriesStatusSelect.value = seriesToEdit.status;
            editSeriesScoreInput.value = seriesToEdit.score || '';
            editSeriesWatchedEpisodesInput.value = seriesToEdit.watchedEpisodes || 0;
            editSeriesTotalEpisodesInput.value = seriesToEdit.totalEpisodes || 0;editSeriesModal.style.display = 'block';
        }
    }

    editSeriesForm.addEventListener('submit', function(event) {
        event.preventDefault();
        if (currentEditingSeries) {
            const seriesId = currentEditingSeries.id;
            const newStatus = editSeriesStatusSelect.value;
            const newScore = editSeriesScoreInput.value;
            const newWatchedEpisodes = parseInt(editSeriesWatchedEpisodesInput.value) || 0;
            const newTotalEpisodes = parseInt(editSeriesTotalEpisodesInput.value) || 0; // Adicionado total episodes

            const updates = {
                status: newStatus,
                score: newScore,
                watchedEpisodes: newWatchedEpisodes,
                totalEpisodes: newTotalEpisodes // Adicionado total episodes
            };

            updateSeriesData(seriesId, updates);
            editSeriesModal.style.display = 'none';
            currentEditingSeries = null;
        }
    });

    function addOptionsButtonListeners() {
        seriesListMain.addEventListener('click', function(event) {
            const optionsButton = event.target.closest('.options-series-btn');
            if (optionsButton) {
                const seriesItem = optionsButton.closest('.series-item');
                if (seriesItem) {
                    const seriesId = parseInt(seriesItem.dataset.seriesId);
                    openEditModal(seriesId);
                }
            }
        });
    }
    addOptionsButtonListeners(); // Chama a função para adicionar os listeners inicialmente

    // Adiciona listeners para mostrar/ocultar o botão "+" ao passar o mouse
    seriesListMain.addEventListener('mouseover', function(event) {
        const episodesSpan = event.target.closest('.episodes');
        if (episodesSpan && episodesSpan.querySelector('.episodes-total')) {
            const addButton = episodesSpan.querySelector('.add-episode-btn');
            if (addButton) {
                addButton.style.opacity = 1;
            }
        }
    });

    seriesListMain.addEventListener('mouseout', function(event) {
        const episodesSpan = event.target.closest('.episodes');
        if (episodesSpan && episodesSpan.querySelector('.episodes-total')) {
            const addButton = episodesSpan.querySelector('.add-episode-btn');
            if (addButton) {
                addButton.style.opacity = 0;
            }
        }
    });
});

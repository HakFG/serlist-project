let currentSeriesId = null; // Variável para armazenar o ID da série atual

function getSeriesId() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = parseInt(urlParams.get('id'));
    console.log("ID da série obtido:", id);
    return id;
}

function getGlobalCharacters() {
    const storedCharacters = localStorage.getItem('globalCharacters');
    return storedCharacters ? JSON.parse(storedCharacters) : [];
}

function saveGlobalCharacters(characters) {
    localStorage.setItem('globalCharacters', JSON.stringify(characters));
}

function addGlobalCharacter(character) {
    const globalCharacters = getGlobalCharacters();
    if (!globalCharacters.some(gc => gc.name.toLowerCase() === character.name.toLowerCase())) {
        globalCharacters.push(character);
        saveGlobalCharacters(globalCharacters);
    }
}

function getGlobalStaff() {
    const storedStaff = localStorage.getItem('globalStaff');
    const staffList = storedStaff ? JSON.parse(storedStaff) : [];
    console.log("Lista global de staff carregada:", staffList);
    return staffList;
}

function saveGlobalStaff(staffList) {
    localStorage.setItem('globalStaff', JSON.stringify(staffList));
}

function addGlobalStaff(staffMember) {
    const globalStaff = getGlobalStaff();
    if (!globalStaff.some(gs => gs.name.toLowerCase() === staffMember.name.toLowerCase())) {
        globalStaff.push(staffMember);
        saveGlobalStaff(globalStaff); // <--- CORREÇÃO: Adicionado para salvar a staff global
    }
}

function displaySeriesDetails() {
    const seriesId = getSeriesId();
    currentSeriesId = seriesId;

    if (seriesId) {
        const storedSeries = localStorage.getItem('mySeriesList');
        if (storedSeries) {
            const seriesData = JSON.parse(storedSeries);
            const series = seriesData.find(item => item.id === seriesId);
            console.log("Dados da série encontrados:", series);

            if (series) {
                document.getElementById('series-title').textContent = series.name;
                document.getElementById('backdrop-image').src = series.backdropLink || '';
                document.getElementById('cover-image').src = series.coverLink || '';
                document.getElementById('series-status').textContent = `Status: ${series.status}`;
                document.getElementById('series-synopsis').textContent = series.synopsis || 'Sinopse não disponível.';

                const episodiosAssistidos = series.watchedEpisodes || 0;
                const totalEpisodios = series.totalEpisodes || 0;
                let episodiosTexto = '';

                if (totalEpisodios > 0) {
                    if (episodiosAssistidos === totalEpisodios) {
                        episodiosTexto = `<span class="math-inline">${totalEpisodios}</span>`;
                    } else {
                        episodiosTexto = `<span class="math-inline">${episodiosAssistidos}/${totalEpisodios}</span>`;
                    }
                } else if (episodiosAssistidos > 0) {
                    episodiosTexto = `<span class="math-inline">${episodiosAssistidos}</span>`;
                } else {
                    episodiosTexto = '';
                }

                document.getElementById('series-episodes-overlay').innerHTML = episodiosTexto;
                document.getElementById('series-score-overlay').textContent = series.score || '';

                document.getElementById('detail-studio').textContent = series.studio || 'N/A';
                document.getElementById('detail-episodes').textContent = totalEpisodios > 0 ? totalEpisodios : 'N/A';
                document.getElementById('detail-status').textContent = series.detailStatus || 'N/A';
                document.getElementById('detail-start-date').textContent = series.startDate || 'N/A';
                document.getElementById('detail-finish-date').textContent = series.finishDate || 'N/A';
                document.getElementById('detail-source').textContent = series.source || 'N/A';
                document.getElementById('detail-genre').textContent = series.genre ? series.genre.join(', ') : 'N/A';

                document.getElementById('edit-synopsis').value = series.synopsis || '';
                document.getElementById('edit-backdrop-link').value = series.backdropLink || '';
                document.getElementById('edit-status').value = series.status;
                document.getElementById('edit-score').value = series.score || '';
                document.getElementById('edit-watched-episodes').value = episodiosAssistidos;
                document.getElementById('edit-total-episodes').value = totalEpisodios;

                document.getElementById('edit-studio').value = series.studio || '';
                document.getElementById('edit-episodes').value = totalEpisodios || '';
                document.getElementById('edit-detail-status').value = series.detailStatus || 'releasing';
                document.getElementById('edit-start-date').value = series.startDate || '';
                document.getElementById('edit-finish-date').value = series.finishDate || '';
                document.getElementById('edit-source').value = series.source || 'original';
                document.getElementById('edit-genre').value = series.genre ? series.genre.join(', ') : '';

                const backdrop = document.querySelector('.backdrop');
                if (backdrop) {
                    backdrop.style.filter = 'none';
                    backdrop.style.opacity = 1;
                }

                displayCharacters();
                displayStaff();

            } else {
                document.getElementById('series-title').textContent = 'Série não encontrada.';
            }
        } else {
            document.getElementById('series-title').textContent = 'Dados das séries não encontrados.';
        }
    } else {
        document.getElementById('series-title').textContent = 'ID da série não especificado.';
    }
}

const editInfoButton = document.querySelector('.edit-buttons-container .edit-button:nth-child(1)');
if (editInfoButton) {
    editInfoButton.addEventListener('click', function() {
        document.getElementById('edit-series-details-modal').style.display = 'block';
    });
}

const editDetailsButton = document.querySelector('.edit-buttons-container .edit-button:nth-child(2)');
if (editDetailsButton) {
    editDetailsButton.addEventListener('click', function() {
        document.getElementById('edit-spec-modal').style.display = 'block';
    });
}

document.getElementById('save-series-details').addEventListener('click', function() {
    if (currentSeriesId) {
        const newSynopsis = document.getElementById('edit-synopsis').value;
        const newBackdropLink = document.getElementById('edit-backdrop-link').value;
        const newStatus = document.getElementById('edit-status').value;
        const newScore = document.getElementById('edit-score').value;
        const newWatchedEpisodes = parseInt(document.getElementById('edit-watched-episodes').value) || 0;
        const newTotalEpisodes = parseInt(document.getElementById('edit-total-episodes').value) || 0;

        const updates = {
            synopsis: newSynopsis,
            backdropLink: newBackdropLink,
            status: newStatus,
            score: newScore,
            watchedEpisodes: newWatchedEpisodes,
            totalEpisodes: newTotalEpisodes
        };

        updateSeriesData(currentSeriesId, updates);
        document.getElementById('edit-series-details-modal').style.display = 'none';
        displaySeriesDetails();
    }
});

document.getElementById('save-spec-details').addEventListener('click', function() {
    if (currentSeriesId) {
        const newStudio = document.getElementById('edit-studio').value;
        const newEpisodes = parseInt(document.getElementById('edit-episodes').value) || 0;
        const newDetailStatus = document.getElementById('edit-detail-status').value;
        const newStartDate = document.getElementById('edit-start-date').value;
        const newFinishDate = document.getElementById('edit-finish-date').value;
        const newSource = document.getElementById('edit-source').value;
        const newGenreInput = document.getElementById('edit-genre').value;
        const newGenre = newGenreInput.split(',').map(genre => genre.trim()).filter(genre => genre !== '');

        const updates = {
            studio: newStudio,
            totalEpisodes: newEpisodes,
            detailStatus: newDetailStatus,
            startDate: newStartDate,
            finishDate: newFinishDate,
            source: newSource,
            genre: newGenre
        };

        updateSeriesData(currentSeriesId, updates);
        document.getElementById('edit-spec-modal').style.display = 'none';
        displaySeriesDetails();
    }
});

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
    }
}

function openCharactersTab() {
    document.getElementById('characters-tab').classList.add('active');
    document.getElementById('characters-tab').classList.remove('hidden');
    document.getElementById('staff-tab').classList.remove('active');
    document.getElementById('staff-tab').classList.add('hidden');

    const buttons = document.querySelectorAll('.tab-button');
    buttons[0].classList.add('active');
    buttons[1].classList.remove('active');
}

function openStaffTab() {
    document.getElementById('staff-tab').classList.add('active');
    document.getElementById('staff-tab').classList.remove('hidden');
    document.getElementById('characters-tab').classList.remove('active');
    document.getElementById('characters-tab').classList.add('hidden');

    const buttons = document.querySelectorAll('.tab-button');
    buttons[1].classList.add('active');
    buttons[0].classList.remove('active');
}

document.addEventListener('DOMContentLoaded', () => {
    displaySeriesDetails();
    openCharactersTab();
    populateExistingCharactersList();
    populateExistingStaffList(); // Garante que a lista de staff existente seja carregada ao iniciar
});

function openAddCharacterModal() {
    const modal = document.getElementById('addCharacterModal');
    modal.style.display = 'block';
    populateExistingCharactersList();
}

function closeAddCharacterModal() {
    const modal = document.getElementById('addCharacterModal');
    modal.style.display = 'none';
    document.getElementById('new-character-name').value = '';
    document.getElementById('new-character-image').value = '';
    document.getElementById('new-character-role').value = '';
}

function saveNewCharacter() {
    const name = document.getElementById('new-character-name').value.trim();
    const image = document.getElementById('new-character-image').value.trim();
    const role = document.getElementById('new-character-role').value;

    if (name) {
        const newCharacter = { name, cover: image, role };
        addGlobalCharacter(newCharacter);
        saveCharacterToLocalStorage(newCharacter);
        displayCharacters();
        closeAddCharacterModal();
    } else {
        alert('O nome do personagem é obrigatório.');
    }
}

function saveCharacterToLocalStorage(character) {
    const seriesId = getSeriesId();
    if (seriesId) {
        const storedSeries = localStorage.getItem('mySeriesList');
        if (storedSeries) {
            const seriesData = JSON.parse(storedSeries);
            const seriesIndex = seriesData.findIndex(series => series.id === seriesId);

            if (seriesIndex !== -1) {
                if (!seriesData[seriesIndex].characters) {
                    seriesData[seriesIndex].characters = [];
                }
                if (!seriesData[seriesIndex].characters.some(char => char.name.toLowerCase() === character.name.toLowerCase())) {
                    seriesData[seriesIndex].characters.unshift(character);
                    localStorage.setItem('mySeriesList', JSON.stringify(seriesData));
                    displayCharacters();
                } else {
                    alert(`O personagem "${character.name}" já foi adicionado a esta série.`);
                }
            }
        }
    }
}

function populateExistingCharactersList() {
    const existingCharactersSelect = document.getElementById('existing-characters-select');
    if (!existingCharactersSelect) return;

    existingCharactersSelect.innerHTML = '';

    const globalCharacters = getGlobalCharacters();
    globalCharacters.forEach(character => {
        const option = document.createElement('option');
        option.value = character.name;
        option.textContent = character.name;
        existingCharactersSelect.appendChild(option);
    });
}

function addSelectedExistingCharacters() {
    const seriesId = getSeriesId();
    const existingCharactersSelect = document.getElementById('existing-characters-select');
    if (!existingCharactersSelect) return;

    const selectedCharacterNames = Array.from(existingCharactersSelect.selectedOptions).map(option => option.value);
    const globalCharacters = getGlobalCharacters();
    const seriesCharacters = loadSeriesCharacters();

    selectedCharacterNames.forEach(characterName => {
        const foundGlobalCharacter = globalCharacters.find(gc => gc.name === characterName);

        if (foundGlobalCharacter && !seriesCharacters.some(sc => sc.name.toLowerCase() === foundGlobalCharacter.name.toLowerCase())) {
            saveCharacterToLocalStorage(foundGlobalCharacter);
        } else if (seriesCharacters.some(sc => sc.name.toLowerCase() === foundGlobalCharacter.name.toLowerCase())) {
            alert(`O personagem "${foundGlobalCharacter.name}" já está adicionado a esta série.`);
        }
    });

    closeAddCharacterModal();
}

function loadSeriesCharacters() {
    const seriesId = getSeriesId();
    if (seriesId) {
        const storedSeries = localStorage.getItem('mySeriesList');
        if (storedSeries) {
            const seriesData = JSON.parse(storedSeries);
            const currentSeries = seriesData.find(series => series.id === seriesId);
            return currentSeries && currentSeries.characters ? currentSeries.characters : [];
        }
    }
    return [];
}

function addCharacterInput() {
    console.log("Função openAddCharacterModal() foi chamada!");
    document.getElementById('addCharacterModal').style.display = 'block';
    populateExistingCharactersList();
}

function addStaffInput() {
    console.log("Função addStaffInput() foi chamada!");
    document.getElementById('addStaffModal').style.display = 'block'; // Tornar o modal visível
    populateExistingStaffList(); // Popular a lista de staff existente ao abrir o modal
}

function closeAddStaffModal() {
    const modal = document.getElementById('addStaffModal');
    modal.style.display = 'none';
    document.getElementById('new-staff-name').value = '';
    document.getElementById('new-staff-image').value = '';
    document.getElementById('new-staff-role').value = '';
}

function saveNewStaff() {
    const name = document.getElementById('new-staff-name').value;
    const image = document.getElementById('new-staff-image').value;
    const role = document.getElementById('new-staff-role').value;

    if (name) {
        const newStaff = { cover: image, name: name, role: role };
        addGlobalStaff(newStaff);
        saveStaffToLocalStorage(newStaff);
        displayStaff();
        closeAddStaffModal();
    } else {
        alert('O nome do membro da staff é obrigatório.');
    }
}

function saveStaffToLocalStorage(staff) {
    const seriesId = getSeriesId();
    if (seriesId) {
        const storedSeries = localStorage.getItem('mySeriesList');
        if (storedSeries) {
            const seriesData = JSON.parse(storedSeries);
            const seriesIndex = seriesData.findIndex(series => series.id === seriesId);

            if (seriesIndex !== -1) {
                if (!seriesData[seriesIndex].staff) {
                    seriesData[seriesIndex].staff = [];
                }
                seriesData[seriesIndex].staff.unshift(staff);
                localStorage.setItem('mySeriesList', JSON.stringify(seriesData));
                displayStaff();
            }
        }
    }
}

function removeInput(button) {
    console.warn("A função removeInput foi chamada, mas não é mais necessária com a implementação de modais.");
}

function displayCharacters() {
    const seriesId = getSeriesId();
    const characterGrid = document.getElementById('character-grid');
    characterGrid.innerHTML = '';

    if (seriesId) {
        const storedSeries = localStorage.getItem('mySeriesList');
        if (storedSeries) {
            const seriesData = JSON.parse(storedSeries);
            const currentSeries = seriesData.find(series => series.id === seriesId);

            if (currentSeries && currentSeries.characters) {
                currentSeries.characters.forEach((character, index) => {
                    const characterCard = document.createElement('div');
                    characterCard.classList.add('person-card');
                    characterCard.innerHTML = `<div class="remove-icon" onclick="removeCharacter(${index})">&times;</div>
                        <img src="${character.cover || 'placeholder.png'}" alt="${character.name}">
                        <div class="person-info">
                            <div class="person-name">${character.name}</div>
                            <div class="person-role">${character.role === 'main' ? 'Main' : 'Supporting'}</div>
                        </div>
                    `;
                    characterGrid.appendChild(characterCard);
                });
            }
        }
    }
}

function displayStaff() {
    const seriesId = getSeriesId();
    const staffGrid = document.getElementById('staff-grid');
    staffGrid.innerHTML = '';

    if (seriesId) {
        const storedSeries = localStorage.getItem('mySeriesList');
        if (storedSeries) {
            const seriesData = JSON.parse(storedSeries);
            const currentSeries = seriesData.find(series => series.id === seriesId);

            if (currentSeries && currentSeries.staff) {
                currentSeries.staff.forEach((person, index) => {
                    const staffCard = document.createElement('div');
                    staffCard.classList.add('staff-card');
                    staffCard.innerHTML = `
                        <div class="remove-icon" onclick="removeStaff(${index})">&times;</div>
                        <img src="${person.cover || 'placeholder.png'}" alt="${person.name}">
                        <div class="staff-info">
                            <div class="staff-name">${person.name}</div>
                            <div class="staff-role">${person.role ? person.role.replace('-', ' ') : 'N/A'}</div>
                        </div>
                    `;
                    staffGrid.appendChild(staffCard);
                });
            }
        }
    }
}

function removeCharacter(index) {
    const seriesId = getSeriesId();
    if (seriesId) {
        const storedSeries = localStorage.getItem('mySeriesList');
        if (storedSeries) {
            const seriesData = JSON.parse(storedSeries);
            const seriesIndex = seriesData.findIndex(series => series.id === seriesId);

            if (seriesIndex !== -1 && seriesData[seriesIndex].characters && seriesData[seriesIndex].characters[index]) {
                const characterName = seriesData[seriesIndex].characters[index].name;
                if (confirm(`Tem certeza que deseja remover "${characterName}"?`)) {
                    seriesData[seriesIndex].characters.splice(index, 1);
                    localStorage.setItem('mySeriesList', JSON.stringify(seriesData));
                    displayCharacters();
                }
            }
        }
    }
}

function removeStaff(index) {
    const seriesId = getSeriesId();
    if (seriesId) {
        const storedSeries = localStorage.getItem('mySeriesList');
        if (storedSeries) {
            const seriesData = JSON.parse(storedSeries);
            const seriesIndex = seriesData.findIndex(series => series.id === seriesId);

            if (seriesIndex !== -1 && seriesData[seriesIndex].staff && seriesData[seriesIndex].staff[index]) {
                const staffName = seriesData[seriesIndex].staff[index].name;
                if (confirm(`Tem certeza que deseja remover "${staffName}"?`)) {
                    seriesData[seriesIndex].staff.splice(index, 1);
                    localStorage.setItem('mySeriesList', JSON.stringify(seriesData));
                    displayStaff();
                }
            }
        }
    }
}

function populateExistingStaffList() {
    const existingStaffSelect = document.getElementById('existing-staff-select');
    if (!existingStaffSelect) return;

    existingStaffSelect.innerHTML = '';

    const globalStaff = getGlobalStaff();
    console.log("Dados da globalStaff dentro de populate:", globalStaff);
    globalStaff.forEach(staff => {
        const option = document.createElement('option');
        option.value = staff.name;
        option.textContent = staff.name;
        existingStaffSelect.appendChild(option);
    });
}

function addSelectedExistingStaff() {
    const seriesId = getSeriesId();
    const existingStaffSelect = document.getElementById('existing-staff-select');
    if (!existingStaffSelect) return;

    const selectedStaffNames = Array.from(existingStaffSelect.selectedOptions).map(option => option.value);
    const globalStaff = getGlobalStaff();
    const seriesStaff = loadSeriesStaff();

    selectedStaffNames.forEach(staffName => {
        const foundGlobalStaff = globalStaff.find(gs => gs.name === staffName);

        if (foundGlobalStaff && !seriesStaff.some(ss => ss.name.toLowerCase() === foundGlobalStaff.name.toLowerCase())) {
            saveStaffToLocalStorage(foundGlobalStaff);
        } else if (seriesStaff.some(ss => ss.name.toLowerCase() === foundGlobalStaff.name.toLowerCase())) {
            alert(`O membro da staff "${foundGlobalStaff.name}" já foi adicionado a esta série.`);
        }
    });

    closeAddStaffModal();
}

function loadSeriesStaff() {
    const seriesId = getSeriesId();
    if (seriesId) {
        const storedSeries = localStorage.getItem('mySeriesList');
        if (storedSeries) {
            const seriesData = JSON.parse(storedSeries);
            const currentSeries = seriesData.find(series => series.id === seriesId);
            return currentSeries && currentSeries.staff ? currentSeries.staff : [];
        }
    }
    return [];
}

function addStaffInput() {
    console.log("Função addStaffInput() foi chamada!");
    document.getElementById('addStaffModal').style.display = 'block';
    populateExistingStaffList();
}

function closeAddStaffModal() {
    const modal = document.getElementById('addStaffModal');
    modal.style.display = 'none';
    document.getElementById('new-staff-name').value = '';
    document.getElementById('new-staff-image').value = '';
    document.getElementById('new-staff-role').value = '';
}

document.addEventListener('DOMContentLoaded', () => {
    displaySeriesDetails();
    openCharactersTab();
    populateExistingCharactersList();
    populateExistingStaffList();
});

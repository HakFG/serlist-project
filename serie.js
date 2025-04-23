// serie.js

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

function displaySeriesDetails() {
    const seriesId = getSeriesId();
    currentSeriesId = seriesId;

    if (seriesId) {
        const storedSeries = localStorage.getItem('mySeriesList');
        if (storedSeries) {
            const seriesData = JSON.parse(storedSeries);
            const series = seriesData.find(item => item.id === seriesId);
            console.log("Dados da série encontrados:", series); // <--- ESTA LINHA

            if (series) {
                document.getElementById('series-title').textContent = series.name;
                document.getElementById('backdrop-image').src = series.backdropLink || '';
                document.getElementById('cover-image').src = series.coverLink || '';
                document.getElementById('series-status').textContent = `Status: ${series.status}`;
                document.getElementById('series-synopsis').textContent = series.synopsis || 'Sinopse não disponível.';

                const episodiosAssistidos = series.watchedEpisodes || 0;
                const totalEpisodios = series.totalEpisodes || 0;
                let episodiosTexto = '';
                if (episodiosAssistidos > 0 && episodiosAssistidos === totalEpisodios && totalEpisodios > 0) {
                    episodiosTexto = `${totalEpisodios}`;
                } else if (totalEpisodios > 0) {
                    episodiosTexto = `<span class="math-inline"><span class="math-inline">\{episodiosAssistidos\}/</span>{totalEpisodios}</span>`;
                } else if (episodiosAssistidos > 0) {
                    episodiosTexto = `${episodiosAssistidos}`;
                } else {
                    episodiosTexto = '';
                }
                document.getElementById('series-episodes-overlay').textContent = episodiosTexto;
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

                displayCharacters(); // Chama a função para exibir os personagens
                displayStaff(); // Chama a função para exibir a staff

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

document.getElementById('edit-series-info-btn').addEventListener('click', function() {
    document.getElementById('edit-series-details-modal').style.display = 'block';
});

document.getElementById('edit-details-btn').addEventListener('click', function() {
    document.getElementById('edit-spec-modal').style.display = 'block';
});

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
        displaySeriesDetails(); // Atualiza a página com os novos dados
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
        displaySeriesDetails(); // Atualiza a página com os novos dados
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
    populateExistingCharactersList(); // Carregar personagens globais ao carregar a página (se necessário)
});

function openAddCharacterModal() {
    const modal = document.getElementById('addCharacterModal');
    modal.style.display = 'block';
    populateExistingCharactersList(); // Certifique-se de popular a lista ao abrir o modal
}

function closeAddCharacterModal() {
    const modal = document.getElementById('addCharacterModal');
    modal.style.display = 'none';
    // Limpar os campos do formulário
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
        addGlobalCharacter(newCharacter); // Adicionar ao armazenamento global
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
                // Verificar se o personagem já está na lista da série (pelo nome)
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
if (!existingCharactersSelect) return; // Verificar se o elemento existe

existingCharactersSelect.innerHTML = ''; // Limpar as opções existentes

const globalCharacters = getGlobalCharacters();
globalCharacters.forEach(character => {
    const option = document.createElement('option');
    option.value = character.name; // Usamos o nome como valor para identificar o personagem
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
const seriesCharacters = loadSeriesCharacters(); // Carregar personagens da série atual

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
document.getElementById('addStaffModal').classList.remove('hidden');
}

function closeAddStaffModal() {
document.getElementById('addStaffModal').classList.add('hidden');
// Limpar os campos do formulário se desejar
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
    saveStaffToLocalStorage(newStaff); // Sua função para salvar no localStorage
    displayStaff(); // Sua função para exibir a staff
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
// Esta função não é mais usada com os modais
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
                characterCard.innerHTML = `
                    <div class="remove-icon" onclick="removeCharacter(${index})">&times;</div>
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
                displayCharacters(); // Atualiza a lista de personagens na tela
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
                displayStaff(); // Atualiza a lista de staff na tela
            }
        }
    }
}
}
document.addEventListener('DOMContentLoaded', () => {
displaySeriesDetails();
openCharactersTab();
populateExistingCharactersList();
});

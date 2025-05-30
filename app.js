const API_BASE = 'https://rickandmortyapi.com/api';

const charactersContainer = document.getElementById('charactersContainer');
const filterName = document.getElementById('filterName');
const filterEpisode = document.getElementById('filterEpisode');
const filterLocation = document.getElementById('filterLocation');
const btnClearFilters = document.getElementById('btnClearFilters');

let allEpisodes = [];
let allLocations = [];
let currentFilters = {
  name: '',
  episode: '',
  location: ''
};

// Fetch and populate episodes filter
async function loadEpisodes() {
  let page = 1;
  let episodes = [];
  while (true) {
    const res = await fetch(`${API_BASE}/episode?page=${page}`);
    const data = await res.json();
    episodes = episodes.concat(data.results);
    if (!data.info.next) break;
    page++;
  }
  allEpisodes = episodes;
  episodes.forEach(ep => {
    const option = document.createElement('option');
    option.value = ep.id;
    option.textContent = `${ep.episode} - ${ep.name}`;
    filterEpisode.appendChild(option);
  });
}

// Fetch and populate locations filter
async function loadLocations() {
  let page = 1;
  let locations = [];
  while (true) {
    const res = await fetch(`${API_BASE}/location?page=${page}`);
    const data = await res.json();
    locations = locations.concat(data.results);
    if (!data.info.next) break;
    page++;
  }
  allLocations = locations;
  locations.forEach(loc => {
    const option = document.createElement('option');
    option.value = loc.name;
    option.textContent = loc.name;
    filterLocation.appendChild(option);
  });
}

// Fetch characters with filters applied
async function loadCharacters() {
  charactersContainer.innerHTML = 'Cargando personajes...';

  // Build API url with filters
  let url = `${API_BASE}/character/?`;

  if (currentFilters.name) url += `name=${encodeURIComponent(currentFilters.name)}&`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      charactersContainer.innerHTML = 'No se encontraron personajes con ese filtro.';
      return;
    }
    let data = await res.json();

    // Filter by episode if selected
    if (currentFilters.episode) {
      // Filtrar personajes que aparecieron en ese episodio
      data.results = data.results.filter(char => 
        char.episode.some(epUrl => epUrl.endsWith(`/${currentFilters.episode}`))
      );
    }

    // Filter by location if selected
    if (currentFilters.location) {
      data.results = data.results.filter(char => char.location.name === currentFilters.location);
    }

    if (data.results.length === 0) {
      charactersContainer.innerHTML = 'No se encontraron personajes con esos filtros.';
      return;
    }

    renderCharacters(data.results);
  } catch (error) {
    charactersContainer.innerHTML = 'Error al cargar personajes.';
    console.error(error);
  }
}

// Render characters on page
function renderCharacters(chars) {
  charactersContainer.innerHTML = '';
  chars.forEach(char => {
    const card = document.createElement('div');
    card.className = 'character-card';
    card.innerHTML = `
      <img src="${char.image}" alt="${char.name}" />
      <div class="character-info">
        <h3>${char.name}</h3>
        <p><strong>Especie:</strong> ${char.species}</p>
        <p><strong>Estado:</strong> ${char.status}</p>
        <p><strong>Ubicación:</strong> ${char.location.name}</p>
      </div>
    `;
    charactersContainer.appendChild(card);
  });
}

// Event Listeners

filterName.addEventListener('input', e => {
  currentFilters.name = e.target.value.trim();
  loadCharacters();
});

filterEpisode.addEventListener('change', e => {
  currentFilters.episode = e.target.value;
  loadCharacters();
});

filterLocation.addEventListener('change', e => {
  currentFilters.location = e.target.value;
  loadCharacters();
});

btnClearFilters.addEventListener('click', () => {
  filterName.value = '';
  filterEpisode.value = '';
  filterLocation.value = '';
  currentFilters = { name: '', episode: '', location: '' };
  loadCharacters();
});

// Inicialización
(async function init() {
  await loadEpisodes();
  await loadLocations();
  loadCharacters();
})();

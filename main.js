let accessToken = "";
let currentTrack = null;
let timerInterval = null;
let player = null;
let playlistId = "2TieOXUFdPe8OrB8WYgKJy?si=5iJTAhqeQYWRAJj2HZf3kA";
let allTracks = []; // Variable global para almacenar todas las canciones

const levelSelectContainer = document.getElementById('levelSelectContainer');
const roundsSelectContainer = document.getElementById('roundsSelectContainer');
const selectionTypeSelectContainer = document.getElementById('selectionTypeSelectContainer');
const artistSelection = document.getElementById('artistSelection');
const playlistSelection = document.getElementById('playlistSelection');


//guess the lyric
const wordDisplay = document.getElementById('wordDisplay');
const lyricsInput = document.getElementById('lyricsInput');
const checkButtonLyric = document.getElementById('checkButtonLyric');
const loading = document.getElementById('loading');
const languageSelect = document.getElementById('languageSelect'); // Elemento de selección de idioma
const manualWordInput = document.getElementById('manualWordInput'); // Campo de entrada de palabra manual
const manualWordInputField = document.getElementById('manualWord'); // Campo de texto para palabra manual
const languageSelectContainer = document.getElementById('languageSelectContainer');
const minWordsContainer = document.getElementById('minWordsContainer');
const minWords = document.getElementById('minWords');
const answerModeSelectValue= document.getElementById("answerMode").value;
const answerModeSelect= document.getElementById("answerMode");
const textOption = document.getElementById('textOption');
const choiceOption = document.getElementById('choiceOption');
const randomOption = document.getElementById('randomOption');
const manualOption = document.getElementById('manualOption');
const startButton = document.getElementById('startButton');
const resultLyric = document.getElementById('resultLyric');
const gameArea = document.getElementById('gameArea')
const gameInfo = document.getElementById('gameInfo')
const gameAreaSongArtist = document.getElementById('gameAreaSongArtist')
const gameAreaLyric = document.getElementById('gameAreaLyric');
const gameConfigContainer = document.getElementById('gameConfig');
const playInstruction = document.getElementById('playInstruction')

let gameConfig = {
    mode: "single",
    rounds: 5,
    category: "song",
    currentRound: 1,
    usedTracks: new Set(),
    answerMode: "text", // Nuevo campo para el modo de respuesta
    options: [], // Almacenará las opciones para el modo múltiple
    players: {
        player1: { name: "Jugador 1", score: 0, correctAnswers: 0 },
        player2: { name: "Jugador 2", score: 0, correctAnswers: 0 },
    },
    currentPlayer: "player1",
    manualWords: {
        player1: [],
        player2: []
    }
};
const fullscreenBtn = document.getElementById("fullscreenBtn");
const gameContainer = document.getElementById("gameContainer");
fullscreenBtn.addEventListener("click", () => {
    if (!document.fullscreenElement) {
        // Entrar en pantalla completa
        if (gameContainer.requestFullscreen) {
            gameContainer.requestFullscreen();
        } else if (gameContainer.mozRequestFullScreen) {
            // Firefox
            gameContainer.mozRequestFullScreen();
        } else if (gameContainer.webkitRequestFullscreen) {
            // Chrome, Safari, Opera
            gameContainer.webkitRequestFullscreen();
        } else if (gameContainer.msRequestFullscreen) {
            // Edge/IE
            gameContainer.msRequestFullscreen();
        }
    } else {
        // Salir de pantalla completa
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            // Firefox
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            // Chrome, Safari, Opera
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            // Edge/IE
            document.msExitFullscreen();
        }
    }
});

function updateGameInfo() {
    console.log('updateGAmeInfoFunction')
    // Actualiza la ronda actual y el total
    document.getElementById("currentRound").textContent = gameConfig.currentRound;
    document.getElementById("totalRounds").textContent = gameConfig.rounds;

    // Actualiza información del jugador 1
    document.getElementById("player1Name").textContent = gameConfig.players.player1.name;
    document.getElementById("player1ScoreValue").textContent = gameConfig.players.player1.score;
    document.getElementById("player1CorrectAnswers").textContent = gameConfig.players.player1.correctAnswers;
    document.getElementById("player1TotalRounds").textContent = gameConfig.rounds;

    // Actualiza información del jugador 2
    document.getElementById("player2Name").textContent = gameConfig.players.player2.name;
    document.getElementById("player2ScoreValue").textContent = gameConfig.players.player2.score;
    document.getElementById("player2CorrectAnswers").textContent = gameConfig.players.player2.correctAnswers;
    document.getElementById("player2TotalRounds").textContent = gameConfig.rounds;

    // Muestra u oculta la puntuación del jugador 2 según el modo
    const player2ScoreContainer = document.getElementById("player2Score");
    player2ScoreContainer.style.display = gameConfig.mode === "multi" ? "block" : "none";

    // Actualiza el jugador actual
    document.getElementById("currentPlayer").textContent =
        `Turno de: ${gameConfig.players[gameConfig.currentPlayer].name}`;
}


let currentWord = '';
let palabras = { espanol: [], ingles: [] };  // Inicializamos un objeto para las palabras en ambos idiomas

// Función auxiliar para limpiar strings
function cleanString(str) {
    if (!str) return "";
    // Elimina escape characters y normaliza apóstrofes
    return str.replace(/\\'/g, "'").replace(/\\/g, "").trim();
}

// Función para crear inputs de palabras manuales
function createManualWordsInputs() {
    const manualWordInput = document.getElementById('manualWordInput');
    manualWordInput.innerHTML = ''; // Limpiar contenido previo
    
    if (gameConfig.mode === "multi") {
        // Crear inputs para ambos jugadores
        const player1Container = document.createElement('div');
        const player2Container = document.createElement('div');
        
        player1Container.innerHTML = `
            <h3>Palabras para ${gameConfig.players.player2.name}</h3>
            ${Array(gameConfig.rounds).fill(0).map((_, i) => `
                <div class="word-input-container">
                    <label>Palabra ${i + 1}:</label>
                    <input type="text" class="manual-word-input player1-word" data-round="${i + 1}" required>
                </div>
            `).join('')}
        `;
        
        player2Container.innerHTML = `
            <h3>Palabras para ${gameConfig.players.player1.name}</h3>
            ${Array(gameConfig.rounds).fill(0).map((_, i) => `
                <div class="word-input-container">
                    <label>Palabra ${i + 1}:</label>
                    <input type="text" class="manual-word-input player2-word" data-round="${i + 1}" required>
                </div>
            `).join('')}
        `;
        
        manualWordInput.appendChild(player1Container);
        manualWordInput.appendChild(player2Container);
    } else {
        // Solo mostrar un input para modo single
        const wordInput = document.createElement('div');
        wordInput.innerHTML = `
            <div class="word-input-container">
                <label>Palabra:</label>
                <input type="text" id="manualWordInputField" required>
            </div>
        `;
        manualWordInput.appendChild(wordInput);
    }
}

// Cargar las palabras desde el archivo JSON
async function loadWords() {
    try {
        const response = await fetch('words.json');
        const data = await response.json();
        palabras = data;
    } catch (error) {
        console.error('Error al cargar las palabras:', error);
    }
}

// Cargar palabras cuando la página se carga
window.addEventListener('load', loadWords);

// Función para generar palabra aleatoria
function generateRandomWord() {

    const selectedLanguage = languageSelect.value;
    
    if (palabras[selectedLanguage].length === 0) {
        wordDisplay.textContent = 'Cargando palabras...';
        return;
    }

    currentWord = palabras[selectedLanguage][Math.floor(Math.random() * palabras[selectedLanguage].length)];
    setupLyricGameUI();
    if (gameConfig.mode === "multi") {
        gameConfig.players.player1.name =
            document.getElementById("player1").value || "Jugador 1";
        gameConfig.players.player2.name =
            document.getElementById("player2").value || "Jugador 2";
        document.getElementById("player2Score").style.display = "block";
    } else {
        gameConfig.players.player1.name =
            document.getElementById("player1").value || "Jugador 1";
        document.getElementById("player2Score").style.display = "none";
    }
}

function updateLyricMode(mode) {
    console.log('updateLyricMode')
    // Limpiar estados previos
    wordDisplay.textContent = mode === 'manual' ? 'Escribe una palabra' : '';
    lyricsInput.value = '';
    manualWordInputField.value = '';
    resultLyric.style.display = 'none';

    if (mode === 'manual') {
        // Configuración para modo manual
        manualWordInput.style.display = 'flex';
        languageSelectContainer.style.display = 'none';
        lyricsInput.style.display = 'none';
        checkButtonLyric.style.display = 'none';
        startButton.style.display = 'block';
    } else if (mode === 'random') {
        // Configuración para modo aleatorio
        manualWordInput.style.display = 'none';
        languageSelectContainer.style.display = 'flex';
        startButton.style.display = 'block';
        lyricsInput.style.display = 'none';
        checkButtonLyric.style.display = 'none';
    }
}

// Actualizar el listener del modo de respuesta
answerModeSelect.addEventListener('change', function(e) {
    updateLyricMode(e.target.value);
    updateStartButtonListener();
});

// Modificar la función setManualWord
function setManualWord() {
    if (gameConfig.mode === "multi") {
        const player1Words = [...document.querySelectorAll('.player1-word')]
            .map(input => input.value.trim())
            .filter(word => word !== '');
        
        const player2Words = [...document.querySelectorAll('.player2-word')]
            .map(input => input.value.trim())
            .filter(word => word !== '');
        
        if (player1Words.length !== gameConfig.rounds || player2Words.length !== gameConfig.rounds) {
            alert("Por favor, ingresa todas las palabras requeridas");
            return;
        }
        
        gameConfig.manualWords.player1 = player1Words;
        gameConfig.manualWords.player2 = player2Words;
        createManualWordsInputs();
    }
    
    updateCurrentWord();
    setupLyricGameUI();
}
// Nueva función para actualizar la palabra actual
function updateCurrentWord() {
    if (gameConfig.answerMode === "random") {
        generateRandomWord();
    } else {
        if (gameConfig.mode === "multi") {
            const currentPlayerWords = gameConfig.manualWords[
                gameConfig.currentPlayer === "player1" ? "player2" : "player1"
            ];
            currentWord = currentPlayerWords[gameConfig.currentRound - 1];
        } else {
            currentWord = document.getElementById("manualWordInputField").value.trim();
        }
    }
    
    wordDisplay.textContent = currentWord.toUpperCase();
}

// Configurar la UI del juego de lírica
function setupLyricGameUI() {
    wordDisplay.textContent = currentWord.toUpperCase();
    lyricsInput.placeholder = `Escribe la letra de la canción (mínimo ${minWords.value} palabras)`;
    
    // Mostrar elementos necesarios
    lyricsInput.style.display = 'block';
    checkButtonLyric.style.display = 'block';
    gameArea.style.display = 'block';
    gameAreaLyric.style.display = 'flex';
    
    // Ocultar elementos innecesarios
    startButton.style.display = 'none';
    resultLyric.style.display = 'none';
    gameConfigContainer.style.display = 'none';
    gameInfo.style.display = 'block';
    gameAreaSongArtist.style.display = 'none';
    playInstruction.style.display = 'none';
    
    // Limpiar input y habilitar controles
    lyricsInput.value = '';
    lyricsInput.disabled = false;
    checkButtonLyric.disabled = false;

    // Iniciar el temporizador para la primera ronda
    startLyricTimer();
}

// Función para verificar las letras
async function checkLyrics() {
     // Detener el timer si está corriendo
     if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    if (timeLeft <= 0) {
        showResultLyric('¡Se acabó el tiempo!', false);
        endRound(false);
        return;
    }

    const normalizeText = (text) =>
        text.toLowerCase()
            .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '')
            .replace(/\s{2,}/g, ' ')
            .trim();

    const lyrics = normalizeText(lyricsInput.value.trim());
    const wordsCount = lyrics.split(' ').length;
    
    if (wordsCount <= minWords.value - 1) {
        showResultLyric(`Ingresa al menos ${minWords.value} palabras consecutivas`, false);
        return;
    }

    const wordRegex = new RegExp(`\\b${currentWord}\\b`, 'i');
    if (!wordRegex.test(lyrics)) {
        const points = calculateLyricPoints(false, wordsCount);
        showResultLyric(`La palabra "${currentWord}" no está presente en tu texto`, false, null, points);
        endRound(false);
        return;
    }

    loading.style.display = 'block';
    checkButtonLyric.disabled = true;

    try {
        const response = await fetch('https://guessthelyric.vercel.app/api/check-lyrics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ lyrics }),
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        clearInterval(timerInterval); // Detener el temporizador cuando hay una respuesta

        if (data.exists && data.verified) {
            const points = calculateLyricPoints(true, wordsCount);
            showResultLyric('¡Correcto! Letra verificada.', true, data, points);
            
            // Pasar a la siguiente ronda automáticamente después de mostrar el resultado
            setTimeout(() => {
                endRound(true);
                if (gameConfig.currentRound <= gameConfig.rounds) {
                    startNextRound();
                }
            }, 3000); // Esperar 3 segundos antes de pasar a la siguiente ronda
        } else if (data.exists && !data.verified) {
            const points = calculateLyricPoints(false, wordsCount);
            showResultLyric(
                `<p id="posible">Se encontró una posible coincidencia, pero no se pudo verificar la letra exacta.</p>`,
                false,
                data,
                points
            );
            endRound(false);
        } else {
            const points = calculateLyricPoints(false, wordsCount);
            showResultLyric('No se encontró una canción con esa letra exacta.', false, null, points);
            endRound(false);
        }
        
    } catch (error) {
        console.error('Error:', error);
        showResultLyric('Error al verificar la letra. Por favor, intenta nuevamente en unos momentos.', false);
        endRound(false);
    } finally {
        loading.style.display = 'none';
        checkButtonLyric.disabled = false;
    }
}

// Función para mostrar el resultado
function showResultLyric(message, isSuccess, data, points = 0) {
    resultLyric.innerHTML = '';

    if (isSuccess) {
        let formattedStanza = data.stanza
            .replace(/\n/g, '<br>')
            .replace(/(<br>\s*){3,}/g, '<br><br>');

        if (!formattedStanza.includes('<br>')) {
            const words = formattedStanza.split(/\s+/);
            if (words.length > 40) {
                formattedStanza = words.slice(0, 40).join(' ') + '...';
            }
        }

        // Actualizar puntuación del jugador actual
        gameConfig.players[gameConfig.currentPlayer].score += points;
        gameConfig.players[gameConfig.currentPlayer].correctAnswers += 1;

        resultLyric.innerHTML = `
            <h3 class="lyricVerification">¡Correcto! Letra verificada</h3>
            <span class="titleSong">${data.title}</span>
            <span class="artistSong">${data.artist}</span>
            <div class="stanzaSong">${formattedStanza}</div>
            <div class="points-earned">+${points}<img src="svg/points.svg" alt="puntos" class="svg-points-round"/></div>
            <div class="time-bonus">Tiempo restante: ${timeLeft}s</div>
        `;
    } else {
        // Aplicar penalización solo si hay puntos que quitar
        if (points < 0 && gameConfig.players[gameConfig.currentPlayer].score > 0) {
            gameConfig.players[gameConfig.currentPlayer].score += points;
        }

        let resultHTML = `<p>${message}</p>`;
        if (data && data.exists) {
            resultHTML = `
                <span class="titleSong">${data.title}</span>
                <span class="artistSong">${data.artist}</span>
                <p>${message}</p>
            `;
        }

        resultLyric.innerHTML = `
            ${resultHTML}
            <div class="points-earned">${points < 0 ? points : '+0'}<img src="svg/points.svg" alt="puntos" class="svg-points-round"/></div>
            <div class="time-bonus">Tiempo restante: ${timeLeft}s</div>
        `;
    }

    resultLyric.style.display = 'flex';
    updateScores();
}


// Función para inicializar el modo lírico
function initializeLyricMode() {
    updateStartButtonListener();
    updateGameInfo();
    
    gameConfig.category = "lyric";
    gameConfig.answerMode = document.getElementById("answerMode").value;
    gameConfig.currentRound = 1;
    gameConfig.manualWords = { player1: [], player2: [] };
    
    if (gameConfig.answerMode === "random") {
        manualWordInput.style.display = 'none';
        languageSelectContainer.style.display = 'flex';
    } else if (gameConfig.answerMode === "manual") {
        createManualWordsInputs();
        manualWordInput.style.display = 'flex';
        languageSelectContainer.style.display = 'none';
        lyricsInput.style.display = 'none';
        checkButtonLyric.style.display = 'none';
        wordDisplay.textContent = gameConfig.mode === "multi" ? 
            'Ingresa las palabras para cada jugador' : 'Escribe una palabra';
    }
}

// Event Listeners
checkButtonLyric.addEventListener('click', checkLyrics);

// Actualizar la función de cambio de categoría
document.getElementById("gameCategory").addEventListener("change", function(e) {
    if (e.target.value === "lyric") {
        // Mostrar/ocultar opciones de respuesta
        document.getElementById('textOption').style.display = 'none';
        document.getElementById('choiceOption').style.display = 'none';
        document.getElementById('randomOption').style.display = 'block';
        document.getElementById('manualOption').style.display = 'block';
        
        // Ajustar contenedores
        levelSelectContainer.style.display = 'none';
        roundsSelectContainer.style.display = 'block';
        selectionTypeSelectContainer.style.display = 'none';
        artistSelection.style.display = 'none';
        playlistSelection.style.display = 'none';
        languageSelectContainer.style.display = 'flex';
        minWordsContainer.style.display = 'flex';
        
        // Establecer modo por defecto
        document.getElementById("answerMode").value = 'random';
        
        initializeLyricMode();
    } else {
        ocultarLevel(); // Tu función existente para otros modos
    }
});

// Actualizar la función del botón de inicio
function updateStartButtonListener() {
    console.log('updateStartButtonListenerFunction')
    if (!startButton) {
        console.error('No se encontró el botón de inicio');
        return;
    }

    // Remover el botón actual y crear uno nuevo para limpiar listeners previos
    const newStartButton = startButton.cloneNode(true);
    startButton.replaceWith(newStartButton);
    
    const updatedButton = document.getElementById('startButton');
    const currentMode = document.getElementById("answerMode").value;
    const gameCategory = document.getElementById("gameCategory").value;
    
    // Solo asignar un listener si estamos en modo lyric
    if (gameCategory === "lyric") {
        // Asignar el listener correcto según el modo
        if (currentMode === "manual") {
            updatedButton.addEventListener('click', setManualWord);
            // Asegurarnos de que generateRandomWord no se ejecute
            updatedButton.removeEventListener('click', generateRandomWord);
        } else if (currentMode === "random") {
            updatedButton.addEventListener('click', generateRandomWord);
            // Asegurarnos de que setManualWord no se ejecute
            updatedButton.removeEventListener('click', setManualWord);
        }
    } else {
        // Para otros modos de juego
        updatedButton.addEventListener('click', initializeGame);
    }
}

// Inicialización - asegurarnos de que solo se ejecute una vez
let initialized = false;

function initialize() {
    console.log('Initialize')
    if (initialized) return;
    
    if (!startButton || !answerModeSelect) {
        console.error('No se pudieron encontrar todos los elementos necesarios');
        return;
    }

    // Configuración inicial
    updateStartButtonListener();
    
    initialized = true;
}

// Asegurarnos de que todo se inicialice una sola vez cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}


async function checkLyrics() {
    console.log('checkLyrics')
    const normalizeText = (text) =>
        text.toLowerCase()
            .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '') // Elimina puntuación
            .replace(/\s{2,}/g, ' ') // Reemplaza múltiples espacios
            .trim();

    const lyrics = normalizeText(lyricsInput.value.trim());
    
    if (lyrics.split(' ').length <= minWords.value-1) {
        showResultLyric(`Ingresa al menos ${minWords.value} palabras consecutivas`, false);
        return;
    }

    // Validación de la palabra en la letra
    const wordRegex = new RegExp(`\\b${currentWord}\\b`, 'i');
    if (!wordRegex.test(lyrics)) {
        showResultLyric(`La palabra "${currentWord}" no está presente en tu texto`, false);
        return;
    }

    loading.style.display = 'block';
    checkButtonLyric.disabled = true;

    try {
        const response = await fetch('https://guessthelyric.vercel.app/api/check-lyrics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ lyrics }),
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        if (data.exists && data.verified) {
            showResultLyric('¡Correcto! Letra verificada.', true, data);
        } else if (data.exists && !data.verified) {
            showResultLyric(
                `<p id="posible">Se encontró una posible coincidencia, pero no se pudo verificar la letra exacta.</p>`,
                false,
                data
            );
        } else {
            showResultLyric('No se encontró una canción con esa letra exacta.', false);
        }
        
    } catch (error) {
        console.error('Error:', error);
        showResultLyric('Error al verificar la letra. Por favor, intenta nuevamente en unos momentos.', false);
    } finally {
        loading.style.display = 'none';
        checkButtonLyric.disabled = false;
    }
}

function showResultLyric(message, isSuccess, data) {
    console.log('showResultLyric')
    resultLyric.innerHTML = ''; // Limpiar contenido previo

    if (isSuccess) {
        // Limitar las palabras a un máximo de 40 si la letra está toda seguida
        let formattedStanza = data.stanza
            .replace(/\n/g, '<br>') // Convertir saltos de línea a <br>
            .replace(/(<br>\s*){3,}/g, '<br><br>'); // Limitar a máximo 2 <br>

        // Si no hay saltos de línea o <br>, limitar a 40 palabras
        if (!formattedStanza.includes('<br>')) {
            const words = formattedStanza.split(/\s+/); // Dividir en palabras
            if (words.length > 40) {
                formattedStanza = words.slice(0, 40).join(' ') + '...'; // Limitar a 40 palabras y añadir "..."
            }
        }

        resultLyric.innerHTML = `
            <h3 class="lyricVerification">¡Correcto! Letra verificada</h3>
            <span class="titleSong">${data.title}</span>
            <span class="artistSong">${data.artist}</span>
            <div class="stanzaSong">${formattedStanza}</div>
        `;
    } else if (data && data.exists) {
        resultLyric.innerHTML = `
            <span class="titleSong">${data.title}</span>
            <span class="artistSong">${data.artist}</span>
            <p>${message}</p>
        `;
    } else {
        resultLyric.innerHTML = `<p>${message}</p>`;
    }

    resultLyric.style.display = 'flex';
    
}

// Función para generar opciones múltiples
async function generateMultipleChoiceOptions(correctTrack, allTracks) {
    console.log('generateMultipleChoiceOptions')
    const options = new Set();
    const correctOption =
        gameConfig.category === "song"
            ? cleanString(correctTrack.name)
            : cleanString(correctTrack.artists[0].name);
    options.add(correctOption);

    // Filtrar tracks únicos por artista o canción
    let availableOptions = [];
    if (gameConfig.category === "song") {
        availableOptions = [
            ...new Set(allTracks.map((track) => cleanString(track.name))),
        ];
    } else {
        availableOptions = [
            ...new Set(
                allTracks.map((track) => cleanString(track.artists[0].name))
            ),
        ];
    }

    // Remover la opción correcta
    availableOptions = availableOptions.filter(
        (option) => normalizeString(option) !== normalizeString(correctOption)
    );

    // Seleccionar opciones aleatorias
    while (options.size < 4 && availableOptions.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableOptions.length);
        const option = availableOptions[randomIndex];
        options.add(option);
        availableOptions.splice(randomIndex, 1);
    }

    return shuffleArray([...options]);
}
// Función para mezclar array
function shuffleArray(array) {
    console.log('shuffleArray')
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

document
    .getElementById("selectionType")
    .addEventListener("change", selectionTypeChange);
function selectionTypeChange(e) {
    console.log('selectionTypeChange')
    if (e.target.value === "artist") {
        document.getElementById("playlistSelection").style.display = "none";
        document.getElementById("artistSelection").style.display = "block";
    } else {
        document.getElementById("playlistSelection").style.display = "block";
        document.getElementById("artistSelection").style.display = "none";
    }
}

const artistTracksCache = {}; // Caché para almacenar canciones por artista y dificultad

// Cache para promesas de carga
const loadingPromises = {};

async function getTracksByArtist(artistName, isFirstRound = true) {
    console.log('getTrackByArtist')
    if (!accessToken) {
        accessToken = await getAccessToken();
    }

    const difficulty = document.getElementById("difficultySelect").value;

    // Retornar canciones cacheadas si existen
    if (artistTracksCache[artistName]?.[difficulty]) {
        return artistTracksCache[artistName][difficulty];
    }

    // Si ya hay una promesa de carga en curso, esperar a que termine
    if (loadingPromises[`${artistName}-${difficulty}`]) {
        return loadingPromises[`${artistName}-${difficulty}`];
    }

    try {
        // Buscar el artista
        const searchResponse = await fetch(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(
                artistName
            )}&type=artist`,
            {
                headers: { Authorization: `Bearer ${accessToken}` },
            }
        );
        const searchData = await searchResponse.json();
        const artistId = searchData.artists.items[0]?.id;

        if (!artistId) {
            updateGameStatus("No se encontró el artista", "error");
            return null;
        }

        // Modo normal - sin cambios
        if (difficulty === "normal") {
            const topTracksResponse = await fetch(
                `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`,
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );
            const topTracksData = await topTracksResponse.json();
            const tracks = topTracksData.tracks.slice(0, 10);

            // Guardar en caché
            if (!artistTracksCache[artistName]) {
                artistTracksCache[artistName] = {};
            }
            artistTracksCache[artistName][difficulty] = tracks;
            return tracks;
        }

        // Modo extremo con carga progresiva
        const loadingPromise = (async () => {
            const tracks = [];
            const albumsResponse = await fetch(
                `https://api.spotify.com/v1/artists/${artistId}/albums?market=US&include_groups=album,single&limit=50`,
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );
            const albumsData = await albumsResponse.json();

            // Si es la primera ronda, cargar solo las primeras 20 canciones
            const initialAlbums = isFirstRound
                ? albumsData.items.slice(0, 2)
                : albumsData.items;

            // Cargar canciones de los álbumes iniciales
            for (let album of initialAlbums) {
                const albumTracksResponse = await fetch(
                    `https://api.spotify.com/v1/albums/${album.id}/tracks`,
                    {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    }
                );
                const albumTracksData = await albumTracksResponse.json();
                tracks.push(...albumTracksData.items);
            }

            // Si es la primera ronda, iniciar la carga del resto en segundo plano
            if (isFirstRound) {
                setTimeout(async () => {
                    for (let album of albumsData.items.slice(2)) {
                        const albumTracksResponse = await fetch(
                            `https://api.spotify.com/v1/albums/${album.id}/tracks`,
                            {
                                headers: {
                                    Authorization: `Bearer ${accessToken}`,
                                },
                            }
                        );
                        const albumTracksData =
                            await albumTracksResponse.json();
                        tracks.push(...albumTracksData.items);
                    }

                    // Actualizar el caché con todas las canciones
                    if (!artistTracksCache[artistName]) {
                        artistTracksCache[artistName] = {};
                    }
                    artistTracksCache[artistName][difficulty] = tracks;

                    console.log(
                        `Carga completa: ${tracks.length} canciones para ${artistName}`
                    );
                }, 0);
            }

            return tracks;
        })();

        // Guardar la promesa de carga
        loadingPromises[`${artistName}-${difficulty}`] = loadingPromise;

        const tracks = await loadingPromise;

        // Limpiar la promesa de carga una vez completada
        delete loadingPromises[`${artistName}-${difficulty}`];
        console.log('se esta ejecutando')

        return tracks;
    } catch (error) {
        console.error("Error al obtener las canciones del artista:", error);
        updateGameStatus("Error al obtener las canciones del artista", "error");
        return null;
    }
}
document
    .querySelector("#gameCategory")
    .addEventListener("change", ocultarLevel, selectionTypeChange);

function ocultarLevel() {
    console.log('uocultarLevel')
    const gameCategory = document.querySelector("#gameCategory");
    const selectionTypeComprobation = document.querySelector("#selectionType");

    // Cuando se selecciona " adivinar el artista"
    if (gameCategory.value === "artist") {
        levelSelectContainer.style.display='flex'
        roundsSelectContainer.style.display='flex'
        selectionTypeSelectContainer.style.display='flex'
        artistSelection.style.display='flex'
        playlistSelection.style.display='none'
        languageSelectContainer.style.display='none'
        minWordsContainer.style.display='none'
        textOption.style.display = 'block';
        choiceOption.style.display = 'block';
        randomOption.style.display = 'none';
        manualOption.style.display = 'none';
        answerModeSelect.value = 'text';
        
        const levelSelect = document.querySelector(".level-select");
        if (levelSelect) {
            levelSelect.style.display = "none";
            console.log("artist");
        }
        const optionToDisable = document.querySelector(
            "#selectionType option[value='artist']"
        );
        if (optionToDisable) {
            optionToDisable.disabled = true; // Deshabilitar "artist"
            selectionTypeComprobation.value = "playlist";
            if (selectionTypeComprobation.value === "artist") {
                document.getElementById("playlistSelection").style.display =
                    "none";
                document.getElementById("artistSelection").style.display =
                    "block";
            } else {
                document.getElementById("playlistSelection").style.display =
                    "block";
                document.getElementById("artistSelection").style.display =
                    "none";
            }
        }
    } else if (gameCategory.value === "song"){
        levelSelectContainer.style.display='flex'
        roundsSelectContainer.style.display='flex'
        selectionTypeSelectContainer.style.display='flex'
        artistSelection.style.display='flex'
        playlistSelection.style.display='none'
        languageSelectContainer.style.display='none'
        minWordsContainer.style.display='none'
        textOption.style.display = 'block';
        choiceOption.style.display = 'block';
        randomOption.style.display = 'none';
        manualOption.style.display = 'none';
        answerModeSelect.value = 'text';

        // Si es adivina la "song"
        const levelSelect = document.querySelector(".level-select");
        if (levelSelect) {
            levelSelect.style.display = "flex";
            console.log("song");
        }
        const optionToDisable = document.querySelector(
            "#selectionType option[value='artist']"
        );
        if (optionToDisable) {
            optionToDisable.disabled = false; // Habilitar "playlist"
        }
    } else if (gameCategory.value === "lyric"){
        
        textOption.style.display = 'none';
        choiceOption.style.display = 'none';
        randomOption.style.display = 'block';
        manualOption.style.display = 'block';

        levelSelectContainer.style.display='none'
        roundsSelectContainer.style.display='block'
        selectionTypeSelectContainer.style.display='none'
        artistSelection.style.display='none'
        playlistSelection.style.display='none'
        languageSelectContainer.style.display='flex'
        minWordsContainer.style.display='flex'
        answerModeSelect.value = 'random';
    }
}

// Listener para el cambio en el modo de juego
document
    .querySelector("#gameMode")
    .addEventListener("change", actualizarMaximo);

// Listener para el cambio en la dificultad
document
    .querySelector("#difficultySelect")
    .addEventListener("change", actualizarMaximo);

// Listener para validar el valor del input roundsNumber
document.getElementById("roundsNumber").addEventListener("input", function () {
    const max = parseInt(this.max, 10); // Obtener el valor máximo permitido
    const currentValue = parseInt(this.value, 10);

    if (currentValue > max) {
        this.value = max; // Ajustar el valor al máximo permitido si lo excede
        console.log("Valor ajustado al máximo permitido:", max);
    }
});

// Función para actualizar el valor máximo basado en modo y dificultad
function actualizarMaximo() {
    console.log('actualizarMaximo')
    console.log(
        "Valor difficultySelect:",
        document.getElementById("difficultySelect").value
    );
    console.log("Valor gameMode:", document.getElementById("gameMode").value);

    const roundsInput = document.getElementById("roundsNumber");

    if (
        document.getElementById("gameMode").value === "single" &&
        document.getElementById("difficultySelect").value === "normal"
    ) {
        roundsInput.max = 10;
        console.log("Max value set to 10");
    } else if (
        document.getElementById("gameMode").value === "multi" &&
        document.getElementById("difficultySelect").value === "normal"
    ) {
        roundsInput.max = 5;
        console.log("Max value set to 5");
        document.getElementById("player2").style.display = "block";
    } else {
        roundsInput.max = 1000;
        console.log("Max value set to 1000");
    }
}

// Modificar la función initializeGame para incluir el modo de respuesta
function initializeGame() {
    console.log('initializeGame')
    updateGameInfo();
    const gameCategory = document.querySelector("#gameCategory");
    
    // Update configuration
    gameConfig.mode = document.getElementById("gameMode").value;
    gameConfig.rounds = parseInt(document.getElementById("roundsNumber").value);
    gameConfig.currentRound = 1;
    gameConfig.usedTracks.clear();
    gameConfig.category = gameCategory.value;
    gameConfig.answerMode = document.getElementById("answerMode").value;

    // Hide configuration screen
    document.getElementById("gameConfig").style.display = "none";

    if (gameConfig.category === "lyric") {
        // Lyric mode specific setup
        document.getElementById("gameArea").style.display = "block";
        document.getElementById("gameAreaSongArtist").style.display = "none";
        document.getElementById("gameAreaLyric").style.display = "flex";
        document.getElementById("playInstruction").style.display = "none";
        document.getElementById("playerContainer").style.display = "none"; // Hide Spotify player
        
        // Initialize lyric mode
        setupLyricGameUI();
    } else {
        // Song/Artist mode setup
        document.getElementById("gameArea").style.display = "block";
        document.getElementById("gameAreaSongArtist").style.display = "block";
        document.getElementById("gameAreaLyric").style.display = "none";
        document.getElementById("playInstruction").style.display = "block";
        document.getElementById("playerContainer").style.display = "block"; // Show Spotify player
        
        // Setup multiplayer if needed
        if (gameConfig.mode === "multi") {
            gameConfig.players.player1.name = document.getElementById("player1").value || "Jugador 1";
            gameConfig.players.player2.name = document.getElementById("player2").value || "Jugador 2";
            document.getElementById("player2Score").style.display = "block";
        } else {
            gameConfig.players.player1.name = document.getElementById("player1").value || "Jugador 1";
            document.getElementById("player2Score").style.display = "none";
        }

        // Update UI elements
        document.getElementById("currentRound").textContent = gameConfig.currentRound;
        document.getElementById("totalRounds").textContent = gameConfig.rounds;
        updateScores();
        updateCurrentPlayer();
        newGame();
    }
}

// Función para configurar la UI según el modo de respuesta
function setupAnswerMode() {
    console.log('setUpAnswerMode')
    const guessContainer = document.querySelector(".guess-container");
    if (gameConfig.answerMode === "choice") {
        guessContainer.innerHTML = `
            <div class="options-container">
                <div class="options-grid"></div>
            </div>
        `;
        const overlay = document.querySelector(".overlay");
        if (overlay) {
            overlay.style.backgroundColor = "#282828";
            overlay.style.borderRadius = "0";
        }
        const songInfo = document.querySelector(".song-info");
        if (songInfo) {
            songInfo.style.marginTop = "90px";
        }

    } else {
        guessContainer.innerHTML = `
            <input type="text" id="guessInput" placeholder="Escribe el nombre de la canción..." disabled />
            <button id="submitGuess" onclick="checkGuess()" disabled>Adivinar</button>
        `;
    }
}

// Event listener para el modo de juego
document.getElementById("gameMode").addEventListener("change", function (e) {
    document.getElementById("player2").style.display =
        e.target.value === "multi" ? "block" : "none";
});

async function getAccessToken() {
    console.log('getAccessToken')
    try {
        const response = await fetch("/api/getAccessToken");
        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error("Error al obtener el token:", error);
        return null;
    }
}

// Usarla directamente en getRandomTrack:
async function getRandomTrack() {
    if (!accessToken) {
        accessToken = await getAccessToken(); // Asignar el token aquí
    }

    try {
        const playlistResponse = await fetch(
            `https://api.spotify.com/v1/playlists/${playlistId}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
        const playlist = await playlistResponse.json();

        // Filtrar canciones ya usadas
        const availableTracks = playlist.tracks.items.filter(
            (item) => !gameConfig.usedTracks.has(item.track.id)
        );

        if (availableTracks.length === 0) {
            updateGameStatus("¡No hay más canciones disponibles!", "error");
            return null;
        }

        const randomTrack =
            availableTracks[Math.floor(Math.random() * availableTracks.length)]
                .track;
        gameConfig.usedTracks.add(randomTrack.id);

        return randomTrack;
    } catch (error) {
        updateGameStatus("Error al obtener la canción", "error");
        return null;
    }
}

function updatePlayer(trackId) {
    console.log('updatePlayer')
    return new Promise((resolve) => {
        const playerContainer = document.getElementById("playerContainer");
        let iframe = document.querySelector("#playerContainer .i-frame");

        // Si el iframe no existe, créalo
        if (!iframe) {
            iframe = document.createElement("iframe");
            iframe.width = "100%";
            iframe.height = "100px";
            iframe.frameBorder = "0";
            iframe.allow =
                "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
            iframe.loading = "lazy";
            iframe.className = "i-frame";

            // Agregar el evento de carga solo la primera vez
            iframe.onload = () => {
                console.log("Spotify player loaded");
                resolve();
            };

            playerContainer.appendChild(iframe);
        } else {
            // Si el iframe ya existe, solo actualizamos el src y resolvemos
            iframe.onload = () => {
                console.log("Spotify player updated");
                resolve();
            };
        }

        // Actualizar la URL del iframe
        iframe.src = `https://open.spotify.com/embed/track/${trackId}?utm_source=generator`;
    });
}
function normalizeString(str) {
    console.log('normalizeString')
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, ""); // Elimina marcas diacríticas (tildes)
}

function checkGuess(isTimeOut = false) {
    console.log('checkGuess')
    const guess = normalizeString(
        document.getElementById("guessInput").value.trim()
    );
    let correctAnswer = "";
    let isCorrect = false;
    let isPartialMatch = false; // Nuevo indicador para coincidencia parcial

    if (isTimeOut && !guess) {
        clearInterval(timerInterval);
        endRound(false);
        return;
    }

    if (!isTimeOut && !guess) {
        updateGameStatus("Escribe una respuesta antes de enviar.", "error");
        return;
    }

    if (gameConfig.category === "song") {
        correctAnswer = normalizeString(currentTrack.name);
    } else {
        correctAnswer = normalizeString(currentTrack.artists[0].name);
    }

    const minLength = 3;
    if (guess === correctAnswer) {
        isCorrect = true;
    } else if (
        (guess.length >= minLength && correctAnswer.includes(guess)) ||
        (correctAnswer.length >= minLength && guess.includes(correctAnswer))
    ) {
        isCorrect = true;
    }

    console.log("Guess:", guess);
    console.log("Correct Answer:", correctAnswer);
    console.log("Is Correct:", isCorrect);

    clearInterval(timerInterval);
    endRound(isCorrect, ""); // Pasar indicador de coincidencia parcial
    guessInput.value = "";
}

let timeLeft = 25; // Tiempo inicial del temporizador

function endRound(isCorrect, selectedOption = "") {
    console.log('endRound')
    if (gameConfig.category === 'lyric'){
        console.log("terminó la ronda")
    } else {
    const guessInputShow =
        gameConfig.answerMode === "text"
            ? (document.getElementById("guessInput")?.value || "").trim()
            : selectedOption;

    if (
        gameConfig.answerMode === "text" &&
        document.getElementById("guessInput")
    ) {
        document.getElementById("guessInput").disabled = true;
        document.getElementById("submitGuess").disabled = true;
    }

    let pointsForTime = 0;
    if (timeLeft > 20) {
        pointsForTime = 200;
    } else if (timeLeft > 10) {
        pointsForTime = 150;
    } else if (timeLeft > 5) {
        pointsForTime = 100;
    } else if (timeLeft > 0) {
        pointsForTime = 50;
    }

    const correctAnswer =
        gameConfig.category === "song"
            ? currentTrack.name
            : currentTrack.artists[0].name;

    if (guessInputShow === "") {
        // Caso de entrada vacía (sin respuesta)
        updateGameStatus(
            `<div class="overlay-points">La respuesta correcta era: 
            <h2 class="answer-submited">${correctAnswer}</h2>
            <span class="points-round">+0<img src="svg/points.svg" alt="puntos" class="svg-points-round"/></span></div>`,
            "neutral"
        );
    } else if (isCorrect) {
        // Caso de respuesta correcta
        gameConfig.players[gameConfig.currentPlayer].score +=
            300 + pointsForTime;
        gameConfig.players[gameConfig.currentPlayer].correctAnswers += 1;
        updateGameStatus(
            `<div class="overlay-points">¡Correcto! 🎉 
            <h2 class="answer-submited">${correctAnswer}</h2>
            <span class="points-round">+${
                pointsForTime + 300
            }<img src="svg/points.svg" alt="puntos" class="svg-points-round"/></span>`,
            "correct"
        );
    } else {
        // Caso de respuesta incorrecta
        let pointsLost = 0;

        if (gameConfig.players[gameConfig.currentPlayer].score > 0) {
            pointsLost = 50;
            gameConfig.players[gameConfig.currentPlayer].score -= pointsLost;
        }

        updateGameStatus(
            `<div class="overlay-points">¡Incorrecto! No era: <h2 class="answer-submited">${guessInputShow}</h2> era: 
            <h2 class="answer-submited">${correctAnswer}</h2>
            <span class="points-round">${
                pointsLost > 0 ? `-${pointsLost}` : "+0"
            }<img src="svg/points.svg" alt="puntos" class="svg-points-round"/></span></div>`,
            "incorrect"
        );
    }
    displaySongInfo();
}
    updateScores();


    setTimeout(() => {
        if (gameConfig.mode === "multi") {
            if (gameConfig.currentPlayer === "player1" && !isCorrect) {
                gameConfig.currentPlayer = "player2";
                updateCurrentPlayer();
                newGame();
            } else {
                nextRound();
            }
        } else {
            nextRound();
        }
    }, 5000);
}

function nextRound() {
    console.log('nextRound')
    if (gameConfig.mode === "multi") {
        gameConfig.currentPlayer =
            gameConfig.currentPlayer === "player1" ? "player2" : "player1";

        if (gameConfig.currentPlayer === "player1") {
            gameConfig.currentRound++;
        }
    } else {
        gameConfig.currentRound++;
    }

    if (gameConfig.currentRound > gameConfig.rounds) {
        showFinalResults();
    } else {
        document.getElementById("currentRound").textContent =
            gameConfig.currentRound;
        updateCurrentPlayer();
        newGame();
    }

    // Solo limpiar el campo de entrada si estamos en modo texto
    if (gameConfig.answerMode === "text") {
        const guessInput = document.getElementById("guessInput");
        if (guessInput) {
            guessInput.value = "";
        }
    }
}

function updateScores() {
    console.log('updateScores')
    updateGameInfo()
    console.log('updateGameInfoUpdateScore')
}

function updateCurrentPlayer() {
    console.log('updateCurrentPlayer')
    const currentPlayerElement = document.getElementById("currentPlayer");

    // Crear el nuevo h2 con la clase 'current-player'
    const playerNameElement = document.createElement("h2");
    playerNameElement.classList.add("current-player"); // Asignar la clase 'current-player'
    playerNameElement.textContent =
        gameConfig.players[gameConfig.currentPlayer].name;

    // Limpiar el contenido anterior (si hay alguno) antes de agregar el nuevo
    currentPlayerElement.innerHTML = ""; // Limpiar el contenido actual

    // Insertar el nuevo h2 al contenedor
    currentPlayerElement.appendChild(playerNameElement);

    // También se puede mostrar el texto adicional (por ejemplo, "Turno de: ")
    const turnTextElement = document.createElement("span");
    turnTextElement.textContent = `Turno de: `;
    currentPlayerElement.prepend(turnTextElement);
}

async function takeScreenshot() {
    console.log('takeScreenshot')
    try {
        const finalResults = document.getElementById("finalResults");

        // Clonar el nodo para evitar inconsistencias de estilo
        const tempContainer = finalResults.cloneNode(true);
        tempContainer.style.position = "absolute";
        tempContainer.style.left = "-9999px";
        tempContainer.style.background = "#282828"; // Fondo oscuro
        tempContainer.style.width = finalResults.offsetWidth + "px";
        document.body.appendChild(tempContainer);

        // Mostrar un indicador de carga
        const loadingMessage = document.createElement("div");
        loadingMessage.textContent = "Generando captura...";
        loadingMessage.style.position = "fixed";
        loadingMessage.style.top = "50%";
        loadingMessage.style.left = "50%";
        loadingMessage.style.transform = "translate(-50%, -50%)";
        loadingMessage.style.backgroundColor = "#000";
        loadingMessage.style.color = "#fff";
        loadingMessage.style.padding = "10px 20px";
        loadingMessage.style.borderRadius = "5px";
        document.body.appendChild(loadingMessage);

        // Tomar la captura
        const canvas = await html2canvas(tempContainer, {
            backgroundColor: "#282828",
            scale: 2,
            useCORS: true,
        });

        // Remover elementos temporales
        document.body.removeChild(tempContainer);
        document.body.removeChild(loadingMessage);

        // Convertir a blob
        const blob = await new Promise((resolve) =>
            canvas.toBlob(resolve, "image/png")
        );

        // Compartir o descargar
        if (navigator.share) {
            const file = new File([blob], "score.png", { type: "image/png" });
            await navigator.share({
                files: [file],
                title: "Mi puntuación en Spotify Game",
            });
        } else {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "score.png";
            a.click();
            URL.revokeObjectURL(url);
        }
    } catch (error) {
        console.error("Error al tomar la captura:", error);
        alert("No se pudo compartir la captura. Intenta de nuevo.");
    }
}

// Función para precargar imagen
function preloadImage(url) {
    console.log('perloadImage')
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.onload = () => resolve(url);
        img.onerror = () => reject(new Error("Error loading image"));
    });
}

// Función para actualizar la imagen con fade
async function updateContentImage(imageUrl) {
    console.log('updateContentImage')
    const container = document.querySelector(".content-thumbnail-container");
    const img = document.getElementById("contentImage");

    try {
        // Mantener el skeleton mientras se carga
        container.classList.add("skeleton-loading");
        img.classList.remove("loaded");

        // Precargar la imagen
        await preloadImage(imageUrl);

        // Actualizar la imagen y mostrarla con fade
        img.src = imageUrl;
        img.classList.add("loaded");
        container.classList.remove("skeleton-loading");
    } catch (error) {
        // En caso de error, mostrar imagen de fallback
        img.src = "https://placehold.co/200x200?text=No+Image";
        img.classList.add("loaded");
        container.classList.remove("skeleton-loading");
        console.error("Error loading image:", error);
    }
}

// Modificar la función showFinalResults para incluir el botón de captura
async function showFinalResults() {
    console.log('showFinalResults')
    // Ocultar área de juego
    document.getElementById("gameArea").style.display = "none";

    // Mostrar contenedores de resultados
    const finalResults = document.getElementById("finalResults");
    const finalBtn = document.getElementById("finalBtn");
    finalResults.style.display = "block";
    finalBtn.style.display = "block";

    // Actualizar información de jugadores
    document.getElementById("player1NameFinal").textContent =
        gameConfig.players.player1.name;
    document.getElementById("player1ScoreFinal").textContent =
        gameConfig.players.player1.score;
    document.getElementById("player1CorrectFinal").textContent =
        gameConfig.players.player1.correctAnswers;
    document.getElementById("player1TotalFinal").textContent = gameConfig.rounds;

    // Manejar modo multijugador
    const winnerDisplay = document.getElementById("winnerDisplay");
    const player2Container = document.getElementById("player2Container");

    if (gameConfig.mode === "multi") {
        // Mostrar contenedor del jugador 2
        player2Container.style.display = "block";

        // Actualizar información del jugador 2
        document.getElementById("player2NameFinal").textContent =
            gameConfig.players.player2.name;
        document.getElementById("player2ScoreFinal").textContent =
            gameConfig.players.player2.score;
        document.getElementById("player2CorrectFinal").textContent =
            gameConfig.players.player2.correctAnswers;
        document.getElementById("player2TotalFinal").textContent = gameConfig.rounds;

        // Mostrar y actualizar ganador
        const winner =
            gameConfig.players.player1.score > gameConfig.players.player2.score
                ? gameConfig.players.player1.name
                : gameConfig.players.player1.score <
                  gameConfig.players.player2.score
                ? gameConfig.players.player2.name
                : "Empate";

        winnerDisplay.textContent = `${winner} 🏆`;
        winnerDisplay.style.display = "block";
    } else {
        // Ocultar elementos del modo multijugador
        winnerDisplay.style.display = "none";
        player2Container.style.display = "none";
    }

    if (gameConfig.answerMode === 'lyric'){
        console.log("funcionaaaaaaa")
    } else{
    // Actualizar información del contenido (artista/playlist)
    try {
        const selectionType = document.getElementById("selectionType").value;

        if (selectionType === "artist") {
            const artistName = document
                .getElementById("artistNameInput")
                .value.trim();
            const artists = await searchArtists(artistName);

            if (artists && artists.length > 0) {
                const artist = artists[0];
                // Usar la nueva función para actualizar la imagen
                await updateContentImage(
                    artist.images?.[0]?.url ||
                        "https://placehold.co/200x200?text=No+Image"
                );
                document.getElementById("contentTitle").textContent =
                    artist.name;
                document.getElementById(
                    "contentSubtitle1"
                ).textContent = `${new Intl.NumberFormat().format(
                    artist.followers?.total || 0
                )} seguidores`;
                document.getElementById(
                    "contentSubtitle2"
                ).textContent = `Popularidad: ${artist.popularity || 0}%`;
            }
        } else {
            const response = await fetch(
                `https://api.spotify.com/v1/playlists/${playlistId}`,
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );
            const playlist = await response.json();

            if (playlist) {
                // Usar la nueva función para actualizar la imagen
                await updateContentImage(
                    playlist.images?.[0]?.url ||
                        "https://placehold.co/200x200?text=No+Image"
                );
                document.getElementById("contentTitle").textContent =
                    playlist.name;
                document.getElementById(
                    "contentSubtitle1"
                ).textContent = `Por: ${
                    playlist.owner?.display_name || "Usuario desconocido"
                }`;
                document.getElementById("contentSubtitle2").textContent = `${
                    playlist.tracks?.total || 0
                } canciones`;
            }
        }
    } catch (error) {
        console.error("Error al obtener información:", error);
        await updateContentImage("https://placehold.co/200x200?text=Error");
        document.getElementById("contentTitle").textContent = "Error al cargar";
        document.getElementById("contentSubtitle1").textContent =
            "No se pudo obtener la información";
        document.getElementById("contentSubtitle2").textContent = "";
    }
}

    // Configurar event listeners
    document
        .getElementById("playAgainButton")
        .addEventListener("click", resetGame);
    document
        .getElementById("shareButton")
        .addEventListener("click", takeScreenshot);
}



function updateGameStatus(message, status) {
    console.log('updateGAmeStatus')
    const gameStatus = document.getElementById("gameStatus");
    gameStatus.innerHTML = message; // Cambiamos textContent a innerHTML
    gameStatus.className = `game-status ${status}`;
}

function displaySongInfo() {
    console.log('DispleySongInfo')
    document.getElementById("playInstruction").style.display = "none";
    const songInfo = document.getElementById("songInfo");
    songInfo.innerHTML = `
            <p><strong>Canción:</strong> ${currentTrack.name}</p>
            <p><strong>Artista:</strong> ${currentTrack.artists[0].name}</p>
        `;
    document.getElementById("answerContainer").style.display = "block";
}

// Función para buscar artistas
async function searchArtists(query) {
    console.log('searchArtists')
    if (!accessToken) {
        accessToken = await getAccessToken();
    }

    try {
        const response = await fetch(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(
                query
            )}&type=artist&limit=5`,
            {
                headers: { Authorization: `Bearer ${accessToken}` },
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.artists.items;
    } catch (error) {
        console.error("Error al buscar artistas:", error);
        updateGameStatus("Error al buscar artistas", "error");
        return [];
    }
}

// Función para mostrar los resultados de la búsqueda de artistas
function displayArtistResults(artists) {
    console.log('displayArtistResults')
    const resultsContainer = document.getElementById("artistSearchResults");
    resultsContainer.innerHTML = "";

    if (!artists || artists.length === 0) {
        resultsContainer.innerHTML =
            "<div class='artist-result'>No se encontraron artistas</div>";
        return;
    }

    artists.forEach((artist) => {
        if (!artist) return;

        const artistElement = document.createElement("div");
        artistElement.className = "artist-result";

        // Obtener la imagen del artista o usar un placeholder
        const imageUrl =
            artist.images && artist.images.length > 0
                ? artist.images[0].url
                : "https://placehold.co/60x60?text=No+Image";

        // Obtener el número de seguidores formateado
        const followers = artist.followers?.total
            ? new Intl.NumberFormat().format(artist.followers.total)
            : "0";

        artistElement.innerHTML = `
            <div class="artist-item">
                <img src="${imageUrl}" alt="${
            artist.name
        }" class="artist-thumbnail">
                <div class="artist-info">
                    <h4>${artist.name}</h4>
                    <p>${followers} seguidores</p>
                    <p>Popularidad: ${artist.popularity || 0}%</p>
                </div>
            </div>
        `;

        if (artist.name) {
            artistElement.addEventListener("click", () => {
                document.getElementById("artistNameInput").value = artist.name;
                resultsContainer.innerHTML = ""; // Limpiar resultados
            });
        }

        resultsContainer.appendChild(artistElement);
    });
}

// Función para inicializar la búsqueda de artistas
function initializeArtistSearch() {
    console.log('initializeArtistSearch')
    const artistInput = document.getElementById("artistNameInput");
    if (!artistInput) {
        console.error("No se encontró el elemento artistNameInput");
        return;
    }

    artistInput.insertAdjacentHTML(
        "afterend",
        `
        <div id="artistSearchContainer">
            <div id="artistSearchResults" class="artist-results-container"></div>
        </div>
    `
    );

    // Configurar el evento de búsqueda con debounce
    let timeout;
    artistInput.addEventListener("input", (e) => {
        clearTimeout(timeout);
        const query = e.target.value.trim();

        if (query.length < 3) {
            document.getElementById("artistSearchResults").innerHTML = "";
            return;
        }

        timeout = setTimeout(async () => {
            const artists = await searchArtists(query);
            displayArtistResults(artists);
        }, 500);
    });
}

// Llamar a la inicialización cuando se cargue la página
document.addEventListener("DOMContentLoaded", () => {
    initializeArtistSearch();
});

// Función para extraer el ID de la playlist
function extractPlaylistId(input) {
    console.log('extractPlaylistId')
    // Si el input está vacío, retornar el ID por defecto
    if (!input) return "2TieOXUFdPe8OrB8WYgKJy";

    // Si es una URL de Spotify
    if (input.includes("spotify.com/playlist/")) {
        // Extraer el ID después de /playlist/
        const match = input.match(/playlist\/([a-zA-Z0-9]+)/);
        if (match) {
            // Remover cualquier parámetro adicional después del ID
            return match[1].split("?")[0];
        }
    }

    // Si no es una URL, asumimos que es un ID directo
    return input.split("?")[0]; // Remover cualquier parámetro adicional
}

// Función para mostrar los resultados de la búsqueda con manejo de datos faltantes
function displayPlaylistResults(playlists) {
    console.log('displayListResults')
    const resultsContainer = document.getElementById("playlistSearchResults");
    resultsContainer.innerHTML = "";

    if (!playlists || playlists.length === 0) {
        resultsContainer.innerHTML =
            "<div class='playlist-result'>No se encontraron playlists</div>";
        return;
    }

    playlists.forEach((playlist) => {
        // Verificar que playlist es un objeto válido
        if (!playlist) return;

        const playlistElement = document.createElement("div");
        playlistElement.className = "playlist-result";

        // Manejar caso donde no hay imágenes o datos faltantes
        const imageUrl =
            playlist.images && playlist.images.length > 0
                ? playlist.images[0].url
                : "https://placehold.co/60x60?text=No+Image";

        // Manejar otros datos potencialmente faltantes
        const playlistName = playlist.name || "Sin nombre";
        const ownerName = playlist.owner?.display_name || "Usuario desconocido";
        const trackCount = playlist.tracks?.total || 0;

        playlistElement.innerHTML = `
            <div class="playlist-item">
                <img src="${imageUrl}" alt="${playlistName}" class="playlist-thumbnail">
                <div class="playlist-info">
                    <h4>${playlistName}</h4>
                    <p>Por: ${ownerName}</p>
                    <p>${trackCount} canciones</p>
                </div>
            </div>
        `;

        // Solo añadir el evento click si tenemos un ID válido
        if (playlist.id) {
            playlistElement.addEventListener("click", () => {
                document.getElementById("playlistIdInput").value = playlist.id;
                resultsContainer.innerHTML = ""; // Limpiar resultados después de seleccionar
                // También podríamos ocultar el contenedor de búsqueda aquí
            });
        }

        resultsContainer.appendChild(playlistElement);
    });
}

// Función para buscar playlists con mejor manejo de errores
async function searchPlaylists(query) {
    console.log('searchPlaylists')
    if (!accessToken) {
        try {
            accessToken = await getAccessToken();
        } catch (error) {
            console.error("Error al obtener el token:", error);
            updateGameStatus("Error al conectar con Spotify", "error");
            return [];
        }
    }

    try {
        const response = await fetch(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(
                query
            )}&type=playlist&limit=5`,
            {
                headers: { Authorization: `Bearer ${accessToken}` },
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Verificar que tenemos los datos que esperamos
        if (!data.playlists || !data.playlists.items) {
            console.error("Formato de respuesta inesperado:", data);
            return [];
        }

        return data.playlists.items;
    } catch (error) {
        console.error("Error al buscar playlists:", error);
        updateGameStatus("Error al buscar playlists", "error");
        return [];
    }
}

function initializePlaylistSearch() {
    console.log('initializePlaylistSearch')
    // Insertar el HTML de búsqueda después del input de playlist existente
    const playlistInput = document.getElementById("playlistIdInput");
    if (!playlistInput) {
        console.error("No se encontró el elemento playlistIdInput");
        return;
    }

    playlistInput.insertAdjacentHTML(
        "afterend",
        `
        <div id="playlistSearchContainer">
            <input 
                type="text" 
                id="playlistSearchInput" 
                class="form-control" 
                placeholder="Buscar playlist (ej: top 100 rock)"
            >
            <div id="playlistSearchResults" class="playlist-results-container"></div>
        </div>
    `
    );

    // Configurar el evento de búsqueda con debounce
    let timeout;
    const searchInput = document.getElementById("playlistSearchInput");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            clearTimeout(timeout);
            const query = e.target.value.trim();

            if (query.length < 3) {
                document.getElementById("playlistSearchResults").innerHTML = "";
                return;
            }

            timeout = setTimeout(async () => {
                const playlists = await searchPlaylists(query);
                displayPlaylistResults(playlists);
            }, 500);
        });
    }
}

// Llamar a esta función cuando se cargue la página
document.addEventListener("DOMContentLoaded", initializePlaylistSearch);

// Modificar la función newGame para manejar las opciones múltiples
async function newGame() {
    console.log('newGame')
    if (gameConfig.category==="lyric"){
        console.log("nuevo juego")
    } else {
    resetGameUI();
    updateGameStatus("Cargando nueva canción...");

    try {
        const selectionType = document.getElementById("selectionType").value;
        if (selectionType === "playlist") {
            const playlistInput = document
                .getElementById("playlistIdInput")
                .value.trim();
            playlistId = extractPlaylistId(playlistInput) || playlistId;
            currentTrack = await getRandomTrack();

            // Para playlists, necesitamos obtener todas las canciones para generar opciones
            const playlistResponse = await fetch(
                `https://api.spotify.com/v1/playlists/${playlistId}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            const playlist = await playlistResponse.json();
            allTracks = playlist.tracks.items.map((item) => item.track);
        } else {
            const artistName = document
                .getElementById("artistNameInput")
                .value.trim();
            resetArtistTracks();
            const artistTracks = await getTracksByArtist(artistName);
            if (!artistTracks || artistTracks.length === 0) {
                updateGameStatus(
                    "No se encontraron canciones para el artista",
                    "error"
                );
                return;
            }

            const availableTracks = artistTracks.filter(
                (track) => !gameConfig.usedTracks.has(track.id)
            );
            if (availableTracks.length === 0) {
                updateGameStatus("¡No hay más canciones disponibles!", "error");
                return;
            }

            currentTrack =
                availableTracks[
                    Math.floor(Math.random() * availableTracks.length)
                ];
            gameConfig.usedTracks.add(currentTrack.id);
            allTracks = artistTracks; // Guardamos todas las canciones para generar opciones
        }

        if (!currentTrack) return;

        // Generar opciones múltiples independientemente del tipo de selección
        if (gameConfig.answerMode === "choice") {
            gameConfig.options = await generateMultipleChoiceOptions(
                currentTrack,
                allTracks
            );
            displayMultipleChoiceOptions(gameConfig.options);
        }

        await updatePlayer(currentTrack.id);

        if (gameConfig.answerMode === "text") {
            document.getElementById("guessInput").disabled = false;
            document.getElementById("submitGuess").disabled = false;
        } else {
            enableMultipleChoiceButtons();
        }

        startTimer();
        updateGameStatus("¡Escucha y adivina!");
    } catch (error) {
        console.error("Error en newGame:", error);
        updateGameStatus("Error al cargar la canción", "error");
    }
}
}
// Function to escape special characters for use in onclick handlers
function escapeString(str) {
    console.log('scapeString')
    return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// Update the displayMultipleChoiceOptions function
function displayMultipleChoiceOptions(options) {
    console.log('displayMultipleChoiceOptions')
    const optionsGrid = document.querySelector(".options-grid");
    optionsGrid.innerHTML = options
        .map((option) => {
            const escapedOption = escapeString(option);
            return `
            <button class="option-button" 
                    data-option="${escapedOption}" 
                    onclick="checkMultipleChoiceGuess(this.dataset.option)" 
                    disabled>
                ${option}
            </button>
        `;
        })
        .join("");
}

// Función para habilitar los botones de opciones
function enableMultipleChoiceButtons() {
    console.log('enableMultipleChoiceButtons')
    const buttons = document.querySelectorAll(".option-button");
    buttons.forEach((button) => (button.disabled = false));
}

// Función para verificar respuesta en modo de opciones múltiples
function checkMultipleChoiceGuess(selectedOption) {
    console.log('checkMulpleChoiceGuess')
    const correctAnswer =
        gameConfig.category === "song"
            ? cleanString(currentTrack.name)
            : cleanString(currentTrack.artists[0].name);

    selectedOption = cleanString(selectedOption);

    const isCorrect =
        selectedOption &&
        normalizeString(selectedOption) === normalizeString(correctAnswer);

    // Deshabilitar todos los botones de opción
    const buttons = document.querySelectorAll(".option-button");
    buttons.forEach((button) => {
        const buttonOption = cleanString(button.dataset.option);
        button.disabled = true;

        if (normalizeString(buttonOption) === normalizeString(correctAnswer)) {
            button.classList.add("correct-option");
        } else if (
            normalizeString(buttonOption) === normalizeString(selectedOption) &&
            !isCorrect
        ) {
            button.classList.add("incorrect-option");
        }
    });

    if (!selectedOption) {
        updateGameStatus(
            "¡Se acabó el tiempo! No seleccionaste ninguna opción.",
            "error"
        );
    }

    clearInterval(timerInterval);
    endRound(isCorrect, selectedOption);
}

function resetArtistTracks() {
    console.log('resetArtistTracks')
    allTracks = []; // Limpiar las canciones almacenadas
}

// Actualizar la función de startTimer (mantener la versión modificada anterior)
function startTimer() {
    console.log('startTimer')
    const timer = document.getElementById("timer");
    timeLeft = 25;
    timer.textContent = timeLeft;

    setTimeout(() => {
        timerInterval = setInterval(() => {
            timeLeft--;
            timer.textContent = timeLeft;

            if (timeLeft <= 0) {
                clearInterval(timerInterval);

                if (gameConfig.answerMode === "choice") {
                    checkMultipleChoiceGuess(null); // Marcar como incorrecta por falta de selección
                } else if (gameConfig.answerMode === "text") {
                    checkGuess(true); // Verificar como incorrecta en modo texto
                }
            }
        }, 1000);
    }, 1500);
}

function resetGameUI() {
    document.getElementById("answerContainer").style.display = "none";
    document.getElementById("playInstruction").style.display = "flex";
    document.getElementById("songInfo").innerHTML = "";
}

function resetGame() {
    document.getElementById("gameConfig").style.display = "block";
    document.getElementById("gameArea").style.display = "none";
    document.getElementById("finalResults").style.display = "none";
    document.getElementById("finalBtn").style.display = "none";
    gameConfig.players.player1.correctAnswers = 0;
    gameConfig.players.player2.correctAnswers = 0;
}
function startLyricTimer() {
    // Limpiar cualquier temporizador existente y asegurarse de que timerInterval sea null
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    const timer = document.getElementById("timer");
    timeLeft = 25;
    timer.textContent = timeLeft;

    // Habilitar la entrada y el botón al inicio del temporizador
    lyricsInput.disabled = false;
    checkButtonLyric.disabled = false;

    // Remover el setTimeout exterior que estaba causando múltiples intervalos
    timerInterval = setInterval(() => {
        // Verificar que timeLeft sea mayor que 0 antes de decrementar
        if (timeLeft > 0) {
            timeLeft--;
            timer.textContent = timeLeft;

            if (timeLeft === 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                // Deshabilitar la entrada y el botón cuando se acaba el tiempo
                lyricsInput.disabled = true;
                checkButtonLyric.disabled = true;
                handleLyricTimeout();
            }
        } else {
            // Si por alguna razón timeLeft llega a 0, limpiar el intervalo
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }, 1000);
}

function handleLyricTimeout() {
    // Asegurarse de que el temporizador se detenga completamente
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    showResultLyric('¡Se acabó el tiempo!', false);
    endRound(false);
}

function calculateLyricPoints(isCorrect, wordsCount) {
    let points = 0;
    
    if (isCorrect) {
        // Puntos base por respuesta correcta
        points += 300;
        
        // Bonus por tiempo restante
        if (timeLeft > 20) {
            points += 200;
        } else if (timeLeft > 10) {
            points += 150;
        } else if (timeLeft > 5) {
            points += 100;
        } else if (timeLeft > 0) {
            points += 50;
        }
        
        // Bonus por longitud de la letra (máximo 200 puntos adicionales)
        const wordBonus = Math.min(200, wordsCount * 5);
        points += wordBonus;
    } else {
        // Penalización por respuesta incorrecta
        points = -50;
    }
    
    return points;
}
function startNextRound() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    gameConfig.currentRound++;
    
    if (gameConfig.currentRound > gameConfig.rounds) {
        showFinalResults();
        return;
    }

    document.getElementById("currentRound").textContent = gameConfig.currentRound;
    
    if (gameConfig.mode === "multi") {
        gameConfig.currentPlayer = gameConfig.currentPlayer === "player1" ? "player2" : "player1";
        updateCurrentPlayer();
    }

    lyricsInput.value = '';
    resultLyric.style.display = 'none';
    
    updateCurrentWord();
    startLyricTimer();
}

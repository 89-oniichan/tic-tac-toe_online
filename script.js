// Firebase will be initialized from firebase-config.js
const database = firebase.database();

// Game State
const gameState = {
    board: ['', '', '', '', '', '', '', '', ''],
    currentPlayer: 'X',
    player1Name: 'Player 1',
    player2Name: 'Player 2',
    player1Score: 0,
    player2Score: 0,
    totalGames: 0,
    draws: 0,
    gameMode: 'local',
    gameActive: false,
    isAIThinking: false,
    isOnline: false,
    isHost: false,
    mySymbol: 'X',
    roomCode: null,
    roomRef: null,
    player1Ready: false,
    player2Ready: false,
    hasStartedOnce: false,  // Track if game has started at least once
    opponentLeft: false  // Track if opponent left to prevent duplicate triggers
};

// DOM Elements
const modeSelection = document.getElementById('modeSelection');
const playerSetup = document.getElementById('playerSetup');
const gameContainer = document.getElementById('gameContainer');
const board = document.getElementById('board');
const cells = document.querySelectorAll('[data-cell]');
const winnerModal = document.getElementById('winnerModal');
const confetti = document.getElementById('confetti');
const particles = document.getElementById('particles');

// Buttons
const localModeBtn = document.getElementById('localMode');
const onlineModeBtn = document.getElementById('onlineMode');
const aiModeBtn = document.getElementById('aiMode');
const startGameBtn = document.getElementById('startGame');
const resetBtn = document.getElementById('resetBtn');
const menuBtn = document.getElementById('menuBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const menuModalBtn = document.getElementById('menuModalBtn');

// Online Elements
const onlineSetup = document.getElementById('onlineSetup');
const createRoomNameScreen = document.getElementById('createRoomNameScreen');
const waitingRoomScreen = document.getElementById('waitingRoomScreen');
const joinRoomScreen = document.getElementById('joinRoomScreen');
const createRoomBtn = document.getElementById('createRoomBtn');
const confirmCreateBtn = document.getElementById('confirmCreateBtn');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const backToModeBtn = document.getElementById('backToModeBtn');
const backFromNameBtn = document.getElementById('backFromNameBtn');
const backFromCreateBtn = document.getElementById('backFromCreateBtn');
const backFromJoinBtn = document.getElementById('backFromJoinBtn');
const copyCodeBtn = document.getElementById('copyCodeBtn');
const joinGameBtn = document.getElementById('joinGameBtn');
const roomCodeDisplay = document.getElementById('roomCode');
const roomCodeInput = document.getElementById('roomCodeInput');
const hostNameInput = document.getElementById('hostName');
const guestNameInput = document.getElementById('guestName');
const waitingOverlay = document.getElementById('waitingOverlay');
const hostCrown = document.getElementById('hostCrown');

// Chat elements
const chatContainer = document.getElementById('chatContainer');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');
const chatToggle = document.getElementById('chatToggle');

// Inputs
const player1NameInput = document.getElementById('player1Name');
const player2NameInput = document.getElementById('player2Name');

// Display
const player1NameDisplay = document.getElementById('player1NameDisplay');
const player2NameDisplay = document.getElementById('player2NameDisplay');
const player1ScoreDisplay = document.getElementById('player1Score');
const player2ScoreDisplay = document.getElementById('player2Score');
const currentPlayerDisplay = document.getElementById('currentPlayer');
const winnerText = document.getElementById('winnerText');
const winnerSubtitle = document.getElementById('winnerSubtitle');
const winnerIcon = document.getElementById('winnerIcon');

// Winning Combinations
const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

init();

function init() {
    createParticles();
    setupEventListeners();
}

function createParticles() {
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.width = Math.random() * 3 + 1 + 'px';
        particle.style.height = particle.style.width;
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = Math.random() * 4 + 6 + 's';
        particles.appendChild(particle);
    }
}

function setupEventListeners() {
    localModeBtn.addEventListener('click', () => selectMode('local'));
    onlineModeBtn.addEventListener('click', () => selectMode('online'));
    aiModeBtn.addEventListener('click', () => selectMode('ai'));
    startGameBtn.addEventListener('click', startGame);
    resetBtn.addEventListener('click', resetGame);
    menuBtn.addEventListener('click', backToMenu);
    playAgainBtn.addEventListener('click', playAgain);
    menuModalBtn.addEventListener('click', backToMenuFromModal);

    // Online multiplayer
    createRoomBtn.addEventListener('click', () => fadeTransition(onlineSetup, createRoomNameScreen));
    confirmCreateBtn.addEventListener('click', createRoom);
    joinRoomBtn.addEventListener('click', () => fadeTransition(onlineSetup, joinRoomScreen));
    backToModeBtn.addEventListener('click', () => fadeTransition(onlineSetup, modeSelection));
    backFromNameBtn.addEventListener('click', () => fadeTransition(createRoomNameScreen, onlineSetup));
    backFromCreateBtn.addEventListener('click', () => {
        console.log('Back from waiting room - cleaning up');
        if (gameState.roomRef) {
            gameState.roomRef.off();
            gameState.roomRef.remove();
        }
        // Reset all online state
        gameState.isOnline = false;
        gameState.isHost = false;
        gameState.hasStartedOnce = false;
        gameState.roomCode = null;
        gameState.roomRef = null;
        gameState.player1Ready = false;
        gameState.player2Ready = false;
        fadeTransition(waitingRoomScreen, onlineSetup);
    });
    backFromJoinBtn.addEventListener('click', () => fadeTransition(joinRoomScreen, onlineSetup));
    copyCodeBtn.addEventListener('click', copyRoomCode);
    joinGameBtn.addEventListener('click', joinRoom);

    // Chat
    chatSend.addEventListener('click', sendChatMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });
    chatToggle.addEventListener('click', toggleChat);

    cells.forEach((cell, index) => {
        cell.addEventListener('click', () => handleCellClick(index));
    });

    // Keyboard support
    document.addEventListener('keydown', handleKeyPress);
}

function selectMode(mode) {
    gameState.gameMode = mode;

    if (mode === 'online') {
        fadeTransition(modeSelection, onlineSetup);
    } else {
        fadeTransition(modeSelection, playerSetup);
        const player2Label = document.querySelector('label[for="player2Name"]');
        if (mode === 'ai') {
            player2Label.textContent = 'Computer (O)';
            player2NameInput.value = 'Computer';
        } else {
            player2Label.textContent = 'Player 2 (O)';
            player2NameInput.value = 'Player 2';
        }
    }
}

function startGame() {
    gameState.player1Name = player1NameInput.value.trim() || 'Player 1';
    gameState.player2Name = player2NameInput.value.trim() || (gameState.gameMode === 'ai' ? 'Computer' : 'Player 2');

    player1NameDisplay.textContent = gameState.player1Name;
    player2NameDisplay.textContent = gameState.player2Name;

    fadeTransition(playerSetup, gameContainer);

    // Show reset button for local/AI mode
    resetBtn.style.display = 'flex';

    // Hide crown icon in local/AI mode
    hostCrown.style.display = 'none';

    gameState.gameActive = true;
    updateTurnDisplay();
    updatePlayerHighlight();
}

function handleCellClick(index) {
    if (!gameState.gameActive || gameState.board[index] !== '' || gameState.isAIThinking) {
        return;
    }

    // Check if it's online mode and it's our turn
    if (gameState.isOnline && gameState.currentPlayer !== gameState.mySymbol) {
        return;
    }

    makeMove(index, gameState.currentPlayer);

    // Send move to Firebase if online
    if (gameState.isOnline && gameState.roomRef) {
        const nextPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
        gameState.roomRef.update({
            board: gameState.board,
            currentPlayer: nextPlayer
        });
    }

    if (checkWinner() || checkDraw()) {
        return;
    }

    switchPlayer();

    if (gameState.gameMode === 'ai' && gameState.currentPlayer === 'O' && gameState.gameActive) {
        gameState.isAIThinking = true;
        setTimeout(() => {
            makeAIMove();
            gameState.isAIThinking = false;
        }, 400);
    }
}

function makeMove(index, player) {
    gameState.board[index] = player;
    const cell = cells[index];
    cell.classList.add(player.toLowerCase());
    cell.textContent = player;
}

function switchPlayer() {
    gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
    updateTurnDisplay();
    updatePlayerHighlight();
}

function updateTurnDisplay() {
    const playerName = gameState.currentPlayer === 'X' ? gameState.player1Name : gameState.player2Name;
    currentPlayerDisplay.textContent = playerName;
}

function updatePlayerHighlight() {
    const player1Info = document.querySelector('.player1-info');
    const player2Info = document.querySelector('.player2-info');

    if (gameState.currentPlayer === 'X') {
        player1Info.classList.add('active');
        player2Info.classList.remove('active');
    } else {
        player1Info.classList.remove('active');
        player2Info.classList.add('active');
    }
}

function checkWinner() {
    for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        if (gameState.board[a] &&
            gameState.board[a] === gameState.board[b] &&
            gameState.board[a] === gameState.board[c]) {

            gameState.gameActive = false;
            highlightWinningCells(combination);

            // Get the winning symbol from the board
            const winningSymbol = gameState.board[a];
            console.log('Winner detected! Symbol:', winningSymbol, 'CurrentPlayer:', gameState.currentPlayer, 'IsHost:', gameState.isHost);

            if (winningSymbol === 'X') {
                gameState.player1Score++;
                player1ScoreDisplay.textContent = gameState.player1Score;
            } else {
                gameState.player2Score++;
                player2ScoreDisplay.textContent = gameState.player2Score;
            }

            gameState.totalGames++;

            setTimeout(() => showWinnerModal(winningSymbol), 600);
            return true;
        }
    }
    return false;
}

function checkDraw() {
    if (!gameState.board.includes('')) {
        gameState.gameActive = false;
        gameState.totalGames++;
        gameState.draws++;
        setTimeout(() => showDrawModal(), 600);
        return true;
    }
    return false;
}

function highlightWinningCells(combination) {
    combination.forEach(index => {
        cells[index].classList.add('winner');
    });
}

function showWinnerModal(winningSymbol) {
    const winnerName = winningSymbol === 'X' ? gameState.player1Name : gameState.player2Name;
    console.log('showWinnerModal - Symbol:', winningSymbol, 'Name:', winnerName, 'Player1:', gameState.player1Name, 'Player2:', gameState.player2Name);

    winnerIcon.textContent = '🏆';
    winnerText.textContent = `${winnerName} Wins!`;
    winnerSubtitle.textContent = `Game ${gameState.totalGames} | ${gameState.player1Name}: ${gameState.player1Score} - ${gameState.player2Name}: ${gameState.player2Score} | Draws: ${gameState.draws}`;

    createConfetti();
    winnerModal.classList.add('show');
}

function showDrawModal() {
    winnerIcon.textContent = '🤝';
    winnerText.textContent = "It's a Draw!";
    winnerSubtitle.textContent = `Game ${gameState.totalGames} | ${gameState.player1Name}: ${gameState.player1Score} - ${gameState.player2Name}: ${gameState.player2Score} | Draws: ${gameState.draws}`;

    winnerModal.classList.add('show');
}

function showOpponentLeftModal() {
    gameState.gameActive = false;

    if (gameState.isHost) {
        // Host stays in the room, reset for new guest
        winnerIcon.textContent = '👋';
        winnerText.textContent = 'Opponent Left';
        winnerSubtitle.textContent = 'Waiting for a new player to join...';

        // Show waiting screen
        fadeTransition(gameContainer, waitingRoomScreen);

        // Reset game state but keep room open
        gameState.hasStartedOnce = false;
        gameState.player2Name = 'Player 2';
        resetGame();

        // Close modal if open
        winnerModal.classList.remove('show');
    } else {
        // Guest gets kicked back to menu
        winnerIcon.textContent = '👋';
        winnerText.textContent = 'Disconnected';
        winnerSubtitle.textContent = 'You have been disconnected from the game';
        winnerModal.classList.add('show');

        // Auto return to menu after 2 seconds
        setTimeout(() => {
            backToMenuFromModal();
        }, 2000);
    }
}

function createConfetti() {
    confetti.innerHTML = '';
    const colors = ['#d4af37', '#c0c0c0', '#ffffff', '#a0a0a0'];

    for (let i = 0; i < 40; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + '%';
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = Math.random() * 0.3 + 's';
        piece.style.animationDuration = Math.random() * 1 + 2 + 's';
        confetti.appendChild(piece);
    }
}

function resetGame() {
    console.log('resetGame called - isOnline:', gameState.isOnline, 'isHost:', gameState.isHost);
    gameState.board = ['', '', '', '', '', '', '', '', ''];

    // Randomize starting player
    const randomStart = Math.random() < 0.5 ? 'X' : 'O';
    gameState.currentPlayer = randomStart;

    // Disable game until both players ready in online mode
    if (gameState.isOnline) {
        gameState.gameActive = false;
        waitingOverlay.style.display = 'flex';
        console.log('Showing waiting overlay');
    } else {
        gameState.gameActive = true;
    }

    gameState.isAIThinking = false;

    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'winner');
    });

    updateTurnDisplay();
    updatePlayerHighlight();

    // Sync reset with Firebase if online
    if (gameState.isOnline && gameState.roomRef) {
        // Mark this player as ready and set random starting player
        const readyField = gameState.isHost ? 'player1Ready' : 'player2Ready';

        if (gameState.isHost) {
            // Host sets the random starting player and resets board
            console.log('Host setting ready and resetting board');
            gameState.roomRef.update({
                [readyField]: true,
                currentPlayer: randomStart,
                board: ['', '', '', '', '', '', '', '', '']
            });
        } else {
            console.log('Guest setting ready');
            gameState.roomRef.update({
                [readyField]: true
            });
        }
    }
}

function playAgain() {
    winnerModal.classList.remove('show');
    resetGame();
}

function backToMenu() {
    console.log('backToMenu called - cleaning up online mode');

    // Clean up Firebase connection if online
    if (gameState.isOnline && gameState.roomRef) {
        console.log('Removing Firebase listeners and room');

        // Mark player as disconnected before leaving
        if (gameState.isHost) {
            gameState.roomRef.update({ hostConnected: false }).then(() => {
                gameState.roomRef.off(); // Remove all listeners
                gameState.roomRef.remove(); // Delete room if host
            });
        } else {
            gameState.roomRef.update({ guestConnected: false }).then(() => {
                gameState.roomRef.off(); // Remove all listeners
            });
        }
    }

    // Reset online state
    gameState.isOnline = false;
    gameState.isHost = false;
    gameState.hasStartedOnce = false;
    gameState.roomCode = null;
    gameState.roomRef = null;
    gameState.mySymbol = 'X';
    gameState.player1Ready = false;
    gameState.player2Ready = false;
    gameState.opponentLeft = false;

    // Hide waiting overlay
    waitingOverlay.style.display = 'none';

    fadeTransition(gameContainer, modeSelection);
    resetScores();
    resetGame();
}

function backToMenuFromModal() {
    winnerModal.classList.remove('show');
    backToMenu();
}

function resetScores() {
    gameState.player1Score = 0;
    gameState.player2Score = 0;
    player1ScoreDisplay.textContent = '0';
    player2ScoreDisplay.textContent = '0';
}

function fadeTransition(hideElement, showElement) {
    hideElement.style.opacity = '0';
    hideElement.style.transform = 'scale(0.98)';

    setTimeout(() => {
        hideElement.style.display = 'none';
        showElement.style.display = 'block';
        showElement.style.opacity = '0';
        showElement.style.transform = 'scale(0.98)';

        setTimeout(() => {
            showElement.style.opacity = '1';
            showElement.style.transform = 'scale(1)';
        }, 20);
    }, 200);
}

// AI Logic - Minimax Algorithm (Unbeatable)
function makeAIMove() {
    if (!gameState.gameActive) return;

    const bestMove = findBestMove();
    makeMove(bestMove, 'O');

    if (checkWinner() || checkDraw()) return;
    switchPlayer();
}

function findBestMove() {
    let bestScore = -Infinity;
    let bestMove = -1;

    for (let i = 0; i < 9; i++) {
        if (gameState.board[i] === '') {
            gameState.board[i] = 'O';
            let score = minimax(gameState.board, 0, false);
            gameState.board[i] = '';

            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }

    return bestMove;
}

function minimax(board, depth, isMaximizing) {
    const winner = checkWinnerForMinimax(board);

    if (winner === 'O') return 10 - depth;
    if (winner === 'X') return depth - 10;
    if (!board.includes('')) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                let score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                let score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkWinnerForMinimax(board) {
    for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
}

// Online Multiplayer Functions with Firebase
function generateRoomCode() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
}

function createRoom() {
    const hostName = hostNameInput.value.trim();

    if (!hostName) {
        alert('Please enter your name');
        return;
    }

    const roomCode = generateRoomCode();
    gameState.roomCode = roomCode;
    gameState.isHost = true;
    gameState.isOnline = true;
    gameState.mySymbol = 'X';
    gameState.player1Name = hostName;
    gameState.opponentLeft = false;

    // Create room in Firebase
    const roomRef = database.ref('rooms/' + roomCode);
    gameState.roomRef = roomRef;

    // Randomize starting player
    const randomStart = Math.random() < 0.5 ? 'X' : 'O';

    roomRef.set({
        host: hostName,
        guest: null,
        board: ['', '', '', '', '', '', '', '', ''],
        currentPlayer: randomStart,
        timestamp: Date.now(),
        gameStarted: false,
        player1Ready: false,
        player2Ready: false,
        hostConnected: true,
        guestConnected: false
    }).then(() => {
        console.log('Room created:', roomCode);
        roomCodeDisplay.textContent = roomCode;
        fadeTransition(createRoomNameScreen, waitingRoomScreen);

        // Listen for guest joining
        roomRef.on('value', (snapshot) => {
            const data = snapshot.val();
            console.log('HOST listener triggered - guest:', data?.guest, 'gameStarted:', data?.gameStarted, 'gameActive:', gameState.gameActive, 'hasStartedOnce:', gameState.hasStartedOnce);

            // Start game ONLY on initial guest join (not during Play Again)
            if (data && data.guest && data.gameStarted && !gameState.hasStartedOnce) {
                console.log('✅ Host detected guest joined for FIRST TIME, starting game');
                gameState.player2Name = data.guest;
                gameState.opponentLeft = false;  // Reset flag when new guest joins
                startOnlineGame();
            } else {
                console.log('❌ Condition not met - data:', !!data, 'guest:', !!data?.guest, 'gameStarted:', data?.gameStarted, 'hasStartedOnce:', gameState.hasStartedOnce);
            }

            // Check if opponent disconnected (during game OR at winner modal/play again)
            if (data && data.gameStarted && !gameState.opponentLeft) {
                const opponentConnected = gameState.isHost ? data.guestConnected : data.hostConnected;
                if (opponentConnected === false) {
                    console.log('Opponent disconnected!');
                    gameState.opponentLeft = true;
                    showOpponentLeftModal();
                }
            }

            // If host and guest left, reset room for new guest
            if (data && gameState.isHost && data.guestConnected === false && data.guest !== null) {
                console.log('Guest left, resetting room for new guest');
                gameState.roomRef.update({
                    guest: null,
                    gameStarted: false,
                    player2Ready: false,
                    board: ['', '', '', '', '', '', '', '', ''],
                    guestConnected: false
                });
            }

            // Sync game state during active game OR during Play Again (when waiting for both ready)
            if (data && data.board && data.gameStarted) {
                syncGameState(data);
            }
        });

        // Clean up room after 1 hour
        setTimeout(() => {
            roomRef.remove();
        }, 3600000);

    }).catch((error) => {
        console.error('Error creating room:', error);
        alert('Failed to create room. Please try again.');
    });
}

function joinRoom() {
    const guestName = guestNameInput.value.trim();
    const roomCode = roomCodeInput.value.trim().toUpperCase();

    if (!guestName) {
        alert('Please enter your name');
        return;
    }

    if (roomCode.length < 6) {
        alert('Please enter a valid room code');
        return;
    }

    gameState.roomCode = roomCode;
    gameState.isHost = false;
    gameState.isOnline = true;
    gameState.mySymbol = 'O';
    gameState.player2Name = guestName;
    gameState.opponentLeft = false;

    // Check if room exists and join
    const roomRef = database.ref('rooms/' + roomCode);
    gameState.roomRef = roomRef;

    roomRef.once('value').then((snapshot) => {
        if (!snapshot.exists()) {
            alert('Room not found. Please check the room code.');
            return;
        }

        const roomData = snapshot.val();

        // Check if room is full (guest exists AND is connected)
        if (roomData.guest && roomData.guestConnected) {
            alert('Room is full. Please try a different room.');
            return;
        }

        // Join the room (works for new room or after previous guest left)
        roomRef.update({
            guest: guestName,
            gameStarted: true,
            guestConnected: true
        }).then(() => {
            console.log('GUEST joined room:', roomCode);
            gameState.player1Name = roomData.host;
            startOnlineGame();

            // Listen for updates
            roomRef.on('value', (snapshot) => {
                const data = snapshot.val();
                console.log('GUEST listener triggered - gameStarted:', data?.gameStarted, 'gameActive:', gameState.gameActive);

                // Check if room was deleted (host left)
                if (!data && !gameState.opponentLeft) {
                    console.log('Room deleted - host left');
                    gameState.opponentLeft = true;
                    showOpponentLeftModal();
                    return;
                }

                // Check if opponent disconnected (during game OR at winner modal/play again)
                if (data && data.gameStarted && !gameState.opponentLeft) {
                    const opponentConnected = gameState.isHost ? data.guestConnected : data.hostConnected;
                    if (opponentConnected === false) {
                        console.log('Opponent disconnected!');
                        gameState.opponentLeft = true;
                        showOpponentLeftModal();
                    }
                }

                // Sync game state during active game OR during Play Again (when waiting for both ready)
                if (data && data.board && data.gameStarted) {
                    syncGameState(data);
                }
            });

        }).catch((error) => {
            console.error('Error joining room:', error);
            alert('Failed to join room. Please try again.');
        });

    }).catch((error) => {
        console.error('Error checking room:', error);
        alert('Failed to connect. Please try again.');
    });
}

function syncGameState(data) {
    console.log('syncGameState called - gameActive:', gameState.gameActive, 'player1Ready:', data.player1Ready, 'player2Ready:', data.player2Ready);

    // Check if both players are ready for a new game
    if (data.player1Ready && data.player2Ready && !gameState.gameActive) {
        // Both players ready, start new game
        console.log('Both players ready, starting game!');

        // Hide waiting overlay
        waitingOverlay.style.display = 'none';

        // Reset local state
        gameState.board = ['', '', '', '', '', '', '', '', ''];
        gameState.currentPlayer = data.currentPlayer;
        gameState.gameActive = true;

        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o', 'winner');
        });

        updateTurnDisplay();
        updatePlayerHighlight();

        // Reset ready states if we're the host
        if (gameState.isHost) {
            console.log('Host resetting ready states to false');
            gameState.roomRef.update({
                player1Ready: false,
                player2Ready: false
            });
        }
        return; // Don't process moves yet
    }

    // Don't sync moves if game is not active (waiting for both players)
    if (!gameState.gameActive) {
        console.log('Game not active, waiting for both players...');
        return;
    }

    // Only sync if the board state is different
    const currentBoardString = gameState.board.join('');
    const newBoardString = data.board.join('');

    if (currentBoardString !== newBoardString) {
        // Update visual board
        data.board.forEach((value, index) => {
            if (gameState.board[index] !== value && value !== '') {
                gameState.board[index] = value;
                const cell = cells[index];
                cell.classList.add(value.toLowerCase());
                cell.textContent = value;
            }
        });

        gameState.currentPlayer = data.currentPlayer;
        updateTurnDisplay();
        updatePlayerHighlight();

        // Check for game end
        if (checkWinner() || checkDraw()) {
            return;
        }
    }
}

function startOnlineGame() {
    console.log('startOnlineGame called for', gameState.isHost ? 'HOST' : 'GUEST');
    console.log('Player names - Player1:', gameState.player1Name, 'Player2:', gameState.player2Name);
    player1NameDisplay.textContent = gameState.player1Name;
    player2NameDisplay.textContent = gameState.player2Name;

    fadeTransition(gameState.isHost ? waitingRoomScreen : joinRoomScreen, gameContainer);

    // Hide reset button in online mode (use Play Again after game ends)
    resetBtn.style.display = 'none';

    // Show crown icon for host (Player 1 is always the host)
    hostCrown.style.display = 'inline';

    // Show chat container
    chatContainer.style.display = 'block';
    chatMessages.innerHTML = ''; // Clear previous messages

    // Listen for chat messages
    gameState.roomRef.child('chat').on('child_added', (snapshot) => {
        const chatData = snapshot.val();
        const isOwnMessage = chatData.isHost === gameState.isHost;
        displayChatMessage(chatData.sender, chatData.message, isOwnMessage);
    });

    // Ensure waiting overlay is hidden when starting game
    waitingOverlay.style.display = 'none';

    // Mark that game has started at least once
    gameState.hasStartedOnce = true;

    // Get starting player from Firebase (already randomized when room was created)
    gameState.roomRef.once('value').then((snapshot) => {
        const data = snapshot.val();
        if (data && data.currentPlayer) {
            gameState.currentPlayer = data.currentPlayer;
        }
        gameState.gameActive = true;
        console.log('Game active! Starting player:', gameState.currentPlayer);
        updateTurnDisplay();
        updatePlayerHighlight();
    });
}

function copyRoomCode() {
    const code = roomCodeDisplay.textContent;
    navigator.clipboard.writeText(code).then(() => {
        copyCodeBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyCodeBtn.textContent = 'Copy Code';
        }, 2000);
    });
}

function handleKeyPress(e) {
    if (e.key === 'Escape' && winnerModal.classList.contains('show')) {
        winnerModal.classList.remove('show');
    }

    if (gameState.gameActive && e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key) - 1;
        handleCellClick(index);
    }

    if (e.key.toLowerCase() === 'r' && gameState.gameActive) {
        resetGame();
    }
}

// Chat Functions
function sendChatMessage() {
    const message = chatInput.value.trim();
    if (!message || !gameState.isOnline || !gameState.roomRef) return;

    const chatData = {
        sender: gameState.isHost ? gameState.player1Name : gameState.player2Name,
        message: message,
        isHost: gameState.isHost,
        timestamp: Date.now()
    };

    // Add to Firebase
    gameState.roomRef.child('chat').push(chatData);
    chatInput.value = '';
}

function displayChatMessage(sender, message, isOwnMessage) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isOwnMessage ? 'own' : 'opponent'}`;

    const senderDiv = document.createElement('div');
    senderDiv.className = 'chat-message-sender';
    senderDiv.textContent = sender;

    const textDiv = document.createElement('div');
    textDiv.textContent = message;

    messageDiv.appendChild(senderDiv);
    messageDiv.appendChild(textDiv);
    chatMessages.appendChild(messageDiv);

    // Auto scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function toggleChat() {
    chatContainer.classList.toggle('minimized');
    chatToggle.textContent = chatContainer.classList.contains('minimized') ? '+' : '−';
}

// Add smooth transitions
cells.forEach(cell => {
    cell.style.transition = 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
});

[modeSelection, playerSetup, gameContainer].forEach(element => {
    element.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
});

console.log('%cTic Tac Toe', 'font-size: 24px; font-weight: bold; color: #d4af37;');
console.log('%cKeyboard shortcuts: 1-9 (select cell), R (reset), ESC (close modal)', 'color: #a0a0a0;');

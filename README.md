# Tic Tac Toe - Multiplayer Game

A modern, feature-rich Tic Tac Toe game with multiple game modes and real-time multiplayer capabilities.
Playable online: https://xox.oniisama.com

## Features

### Game Modes
- **Local Multiplayer** - Play with a friend on the same device
- **Online Multiplayer** - Play with anyone around the world using room codes
- **VS Computer** - Challenge an unbeatable AI powered by the Minimax algorithm

### Online Multiplayer Features
- Create or join game rooms with unique codes
- Real-time gameplay synchronization
- Live chat system for communication
- Player disconnect detection
- Room persistence - new players can join if someone leaves
- Crown icon for room host

### Game Features
- Score tracking across multiple rounds
- Game statistics (total games, draws)
- Smooth animations and transitions
- Particle effects and confetti celebrations
- Mobile responsive design
- Keyboard shortcuts support

## How to Play

### Local/AI Mode
1. Select "Local Multiplayer" or "VS Computer"
2. Enter player names
3. Click "Start Game"
4. Click cells to make moves

### Online Multiplayer
1. Select "Online Multiplayer"
2. **To Host:**
   - Click "Create Room"
   - Enter your name
   - Share the room code with your friend
   - Wait for them to join
3. **To Join:**
   - Click "Join Room"
   - Enter your name and room code
   - Click "Join Game"

## Keyboard Shortcuts
- `1-9` - Select cell (number pad layout)
- `R` - Reset game (local/AI mode)
- `ESC` - Close modal

## Technologies Used
- HTML5
- CSS3 (Custom animations, responsive design)
- JavaScript (ES6+)
- Firebase Realtime Database (for multiplayer)

## Setup

1. Clone or download this repository
2. Update `firebase-config.js` with your Firebase configuration
3. Open `index.html` in a web browser

## Firebase Configuration

The game uses Firebase Realtime Database for online multiplayer. To set up:

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Realtime Database
3. Update `firebase-config.js` with your project credentials
4. Set up database rules for security

## Mobile Support

The game is fully responsive and optimized for:
- Desktop browsers
- Tablets (≤640px)
- Mobile phones (≤360px)


## License

Free to use for personal and educational purposes.

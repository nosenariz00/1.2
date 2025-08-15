// game.js - Integración simplificada del juego con UI
import { getCurrentAccount, submitScore, getLeaderboard } from './wallet.js';

// Referencias a elementos del DOM
const els = {
  gameScreen: document.getElementById('gameScreen'),
  score: document.getElementById('score'),
  backBtn: document.getElementById('backBtn'),
  restartBtn: document.getElementById('restartBtn'),
  playBtn: document.getElementById('playButton'),
  lobby: document.getElementById('lobby'),
  leaderboard: document.getElementById('leaderboard')
};

let currentScore = 0;

export function showGame() {
  console.log('🎮 Mostrando juego...');
  els.lobby.classList.add('hidden');
  els.gameScreen.classList.remove('hidden');
  
  // Reiniciar el juego de p5.js
  if (window.reiniciarJuego) {
    window.reiniciarJuego();
  }
}

export function hideGame() {
  console.log('🔙 Ocultando juego...');
  els.gameScreen.classList.add('hidden');
  els.lobby.classList.remove('hidden');
}

export function updateScore(newScore) {
  currentScore = newScore;
  if (els.score) {
    els.score.textContent = String(newScore);
  }
}

export async function gameOver(finalScore) {
  console.log('💀 Game Over - Score:', finalScore);
  
  const account = getCurrentAccount();
  if (account && finalScore > 0) {
    try {
      await submitScore(finalScore);
      showStatusMessage(`¡Score ${finalScore} guardado en blockchain!`, 'info');
      await updateLeaderboardDisplay();
    } catch (error) {
      console.error('Error guardando score:', error);
      showStatusMessage('Error guardando score en blockchain', 'error');
    }
  }
}

export async function updateLeaderboardDisplay() {
  try {
    const scores = await getLeaderboard();
    const leaderboardEl = document.getElementById('leaderboard-list');
    if (!leaderboardEl) return;
    
    leaderboardEl.innerHTML = '';
    scores.forEach((entry, index) => {
      const item = document.createElement('div');
      item.className = 'leaderboard-item';
      item.innerHTML = `
        <span class="rank">#${index + 1}</span>
        <span class="address">${entry.player.substring(0, 6)}...${entry.player.substring(entry.player.length - 4)}</span>
        <span class="score">${entry.score}</span>
      `;
      leaderboardEl.appendChild(item);
    });
  } catch (error) {
    console.error('Error cargando leaderboard:', error);
  }
}

function showStatusMessage(message, type = 'info') {
  let container = document.querySelector('.status-message-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'status-message-container';
    document.body.appendChild(container);
  }

  const statusEl = document.createElement('div');
  statusEl.className = `status-message status-${type}`;
  statusEl.innerHTML = message;
  container.insertBefore(statusEl, container.firstChild);

  setTimeout(() => {
    statusEl?.remove();
    if (container.childElementCount === 0) {
      container.remove();
    }
  }, 3000);
}

// Exponer funciones globalmente para que p5.js pueda usarlas
window.updateGameScore = updateScore;
window.onGameOver = gameOver;
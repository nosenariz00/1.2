// main.js
// Punto de entrada principal

import { updateLeaderboardDisplay } from './game.js';

console.log('🚀 Iniciando aplicación...');

document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 DOM cargado');
  
  // Cargar leaderboard inicial
  setTimeout(() => {
    updateLeaderboardDisplay();
  }, 1000);
  
  console.log('✅ Aplicación inicializada');
});
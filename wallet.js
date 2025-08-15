// wallet.js — Monad Testnet (EVM-like) integration

// Si usas import, elimina el script CDN de ethers en el HTML
import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js";

const connectWalletBtn = document.getElementById('connectWalletBtn');
const walletAddressDisplay = document.getElementById('wallet-address');
const mintBtn = document.getElementById('mintBtn');

let provider;
let signer;
let contract;
let currentAccount = null;

// Datos del contrato
const CONTRACT_ADDRESS = "0x11ddb63052d2ad69d15c7879890104eccccff3be";
const CONTRACT_ABI = [
  "function mint() public",
  "function submitScore(uint256 score) public",
  "function getPlayerScore(address player) public view returns (uint256)",
  "function getTopScores(uint256 limit) public view returns (address[] memory players, uint256[] memory scores)"
];

// Parámetros de la red Monad Testnet
const MONAD_PARAMS = {
  chainId: '0x279F', // 10143 decimal
  chainName: 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: ['https://testnet-rpc.monad.xyz'],
  blockExplorerUrls: ['https://testnet.monadexplorer.com/'],
};

mintBtn.disabled = true;

function showStatusMessage(message, type = 'info', link = null) {
  // Usar un contenedor para apilar notificaciones
  let container = document.querySelector('.status-message-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'status-message-container';
    document.body.appendChild(container);
  }

  // Crear nueva notificación
  const statusEl = document.createElement('div');
  statusEl.className = `status-message status-${type}`;
  statusEl.innerHTML = message;
  if (link) {
    statusEl.style.cursor = "pointer";
    statusEl.onclick = () => window.open(link, "_blank");
  }
  // Insertar arriba de las anteriores
  container.insertBefore(statusEl, container.firstChild);

  // Eliminar después de 3 segundos
  setTimeout(() => {
    statusEl?.remove();
    // Si no quedan notificaciones, elimina el contenedor
    if (container.childElementCount === 0) {
      container.remove();
    }
  }, 3000); // 3 segundos
}

async function connectWallet() {
  try {
    if (!window.ethereum) {
      showStatusMessage("MetaMask no está instalado.", "error");
      return;
    }

    // Verificar red actual
    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });

    if (currentChainId !== MONAD_PARAMS.chainId) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: MONAD_PARAMS.chainId }],
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [MONAD_PARAMS],
          });
        } else {
          showStatusMessage("Error cambiando de red: " + switchError.message, "error");
          throw switchError;
        }
      }
    }

    // Conectar cuenta
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    currentAccount = accounts[0];
    walletAddressDisplay.textContent = `${currentAccount.substring(0, 6)}...${currentAccount.substring(currentAccount.length - 4)}`;
    walletAddressDisplay.title = currentAccount;
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();

    // Instanciar contrato
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    // Mostrar botones y dirección
    mintBtn.disabled = false;
    document.getElementById('controls').classList.remove('hidden');
    document.getElementById('wallet-address').classList.remove('hidden');
    document.getElementById('disconnectWalletBtn').classList.remove('hidden');
    showStatusMessage("Wallet conectada correctamente.", "info");
  } catch (err) {
    console.error(err);
    showStatusMessage("Error conectando wallet: " + err.message, "error");
  }
}

export function disconnectWallet() {
  currentAccount = null;
  mintBtn.disabled = true;
  document.getElementById('controls').classList.add('hidden');
  document.getElementById('wallet-address').classList.add('hidden');
  document.getElementById('disconnectWalletBtn').classList.add('hidden');
  document.getElementById('connectWalletBtn').classList.remove('hidden');
  walletAddressDisplay.textContent = 'No conectado';
  walletAddressDisplay.removeAttribute('title');
  showStatusMessage("Wallet desconectada.", "info");
}

async function mintNFT() {
  if (!contract) {
    showStatusMessage("Primero conecta tu wallet.", "error");
    return;
  }
  try {
    const tx = await contract.mint();
    // No mostrar notificación de "Transacción enviada"
    await tx.wait();
    const explorerUrl = `https://testnet.monadexplorer.com/tx/${tx.hash}`;
    showStatusMessage(
      `NFT minteado.<br><span style="font-size:0.95em;">Ver en explorer</span>`,
      "info",
      explorerUrl
    );
  } catch (err) {
    console.error(err);
    // Si hay hash de tx, muestra el link aunque sea error
    let explorerUrl = null;
    if (err?.transaction?.hash) {
      explorerUrl = `https://testnet.monadexplorer.com/tx/${err.transaction.hash}`;
    }
    if (err.code === 'ACTION_REJECTED') {
      showStatusMessage(
        `Mint cancelado por el usuario.<br>${explorerUrl ? '<span style="font-size:0.95em;">Ver en explorer</span>' : ''}`,
        "error",
        explorerUrl
      );
    } else {
      showStatusMessage(
        `Error al mintear: ${err.message}<br>${explorerUrl ? '<span style="font-size:0.95em;">Ver en explorer</span>' : ''}`,
        "error",
        explorerUrl
      );
    }
  }
}

export function getCurrentAccount() {
  return currentAccount;
}

export async function submitScore(score) {
  if (!contract || !currentAccount) {
    throw new Error("Wallet no conectada");
  }
  
  try {
    const tx = await contract.submitScore(score);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error("Error enviando score:", error);
    throw error;
  }
}

export async function getLeaderboard(limit = 10) {
  if (!contract) {
    throw new Error("Contrato no disponible");
  }
  
  try {
    const [players, scores] = await contract.getTopScores(limit);
    return players.map((player, index) => ({
      player,
      score: parseInt(scores[index].toString())
    })).sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error("Error obteniendo leaderboard:", error);
    return [];
  }
}

connectWalletBtn.addEventListener('click', connectWallet);
mintBtn.addEventListener('click', mintNFT);

// Eventos de los botones
document.addEventListener('DOMContentLoaded', () => {
  const connectBtn = document.getElementById('connectWalletBtn');
  const disconnectBtn = document.getElementById('disconnectWalletBtn');
  connectBtn?.addEventListener('click', connectWallet);
  disconnectBtn?.addEventListener('click', disconnectWallet);
  // Oculta controles y dirección al cargar
  document.getElementById('controls').classList.add('hidden');
  document.getElementById('wallet-address').classList.add('hidden');
  document.getElementById('disconnectWalletBtn').classList.add('hidden');
});
  

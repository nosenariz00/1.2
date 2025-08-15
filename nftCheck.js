// Nueva función para validar si el usuario tiene NFT
export async function checkIfUserHasNFT(contract, userAddress) {
    try {
        if (!contract || !userAddress) {
            console.log("No hay conexión con el contrato o usuario.");
            return false;
        }

        // Llamada al contrato para saber cuántos NFTs tiene
        const balance = await contract.balanceOf(userAddress);

        console.log(`El usuario tiene ${balance.toString()} NFTs`);
        return parseInt(balance.toString()) > 0;
    } catch (error) {
        console.error("Error verificando NFTs:", error);
        return false;
    }
}

// Elimina el evento del botón aquí, solo exporta la función.
document.getElementById("playButton").addEventListener("click", async function () {
    const hasNFT = await checkIfUserHasNFT();

    if (hasNFT) {
        // Aquí va tu lógica original para iniciar el juego
        startFlappyMon(); 
    } else {
        alert("Necesitas tener al menos 1 NFT para jugar.");
    }
});

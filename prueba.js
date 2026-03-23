// Reemplaza ESTA URL base por la que dice en tu consola de Green API
const API_URL_BASE = 'https://7107.api.greenapi.com'; // Puede ser https://1103.api.greenapi.com
const ID_INSTANCE = '7107558989';
const TOKEN = '8a5221704e1744ef9ed796ed52344ab00a68e6ba989f4397bf';

// Arma la URL final automáticamente
const urlGreenApi = `${API_URL_BASE}/waInstance${ID_INSTANCE}/sendMessage/${TOKEN}`;

const numeroDestino = '5217711600414'; // Tu número de celular

const probarWhatsApp = async () => {
    try {
        console.log(`Enviando a la URL: ${urlGreenApi}`);
        
        const respuesta = await fetch(urlGreenApi, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chatId: `${numeroDestino}@c.us`,
                message: "¡Hola! Esta es una prueba blindada desde Unicafé. ☕"
            })
        });

        // Si la respuesta NO es exitosa (ej. un 404 o 400)
        if (!respuesta.ok) {
            const textoError = await respuesta.text(); // Leemos el HTML crudo
            throw new Error(`Error del servidor (${respuesta.status}): ${textoError.substring(0, 100)}...`);
        }

        const data = await respuesta.json();
        console.log("✅ ¡ÉXITO! Respuesta de Green API:", data);
        
    } catch (error) {
        console.error("❌ ERROR CRÍTICO:", error.message);
    }
};

probarWhatsApp();
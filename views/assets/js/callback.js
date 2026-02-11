// Funzione che riceve il nome della funzione da chiamare
async function callbackMethod(functionName, callback) {
    if (typeof globalThis[functionName] === "function") {
        // Chiama la funzione e passa il callback
        return await globalThis[functionName](callback);
    } else {
        console.error(`Funzione ${functionName} non trovata`);
        return null;
    }
}

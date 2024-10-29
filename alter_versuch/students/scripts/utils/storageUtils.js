// utils/storageUtils.js

/**
 * Speichert den aktuellen Spielstand im localStorage.
 * @param {Object} templateData - Die gesamten Spieldaten inklusive aller Aufgaben.
 * @param {number} currentTaskIndex - Der Index der aktuellen Aufgabe.
 * @param {number} startTime - Der Startzeitpunkt in Millisekunden seit dem Epoch.
 */
export function setGameState(templateData, currentTaskIndex, startTime) {
    const gameState = {
        templateData: templateData,
        currentTaskIndex: currentTaskIndex,
        startTime: startTime
    };
    localStorage.setItem('gameState', JSON.stringify(gameState));
}

/**
 * Ruft den gespeicherten Spielstand aus dem localStorage ab.
 * @returns {Object|null} Das gespeicherte Spielstand-Objekt oder null, wenn keiner existiert.
 */
export function getGameState() {
    const gameState = localStorage.getItem('gameState');
    if (gameState) {
        return JSON.parse(gameState);
    }
    return null;
}

/**
 * Entfernt den gespeicherten Spielstand aus dem localStorage.
 */
export function clearGameState() {
    localStorage.removeItem('gameState');
}

/**
 * Setzt den Spielabschlussstatus.
 * @param {boolean} isCompleted - True, wenn das Spiel abgeschlossen ist.
 */
export function setGameCompleted(isCompleted) {
    localStorage.setItem('gameCompleted', isCompleted ? 'true' : 'false');
}

/**
 * Prüft, ob das Spiel abgeschlossen ist.
 * @returns {boolean} True, wenn das Spiel abgeschlossen ist, sonst False.
 */
export function isGameCompleted() {
    return localStorage.getItem('gameCompleted') === 'true';
}

/**
 * Entfernt den Spielabschlussstatus aus dem localStorage.
 */
export function clearGameCompleted() {
    localStorage.removeItem('gameCompleted');
}

/**
 * Setzt den Spiel beendet Status.
 * @param {boolean} isEnded - True, wenn das Spiel beendet ist.
 */
export function setGameEnded(isEnded) {
    localStorage.setItem('gameEnded', isEnded ? 'true' : 'false');
}

/**
 * Prüft, ob das Spiel beendet ist.
 * @returns {boolean} True, wenn das Spiel beendet ist, sonst False.
 */
export function isGameEnded() {
    return localStorage.getItem('gameEnded') === 'true';
}

/**
 * Entfernt den Spiel beendet Status aus dem localStorage.
 */
export function clearGameEnded() {
    localStorage.removeItem('gameEnded');
}

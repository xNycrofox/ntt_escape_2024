import { displayStartupLogs } from './gameLogic.js';

// Funktion zur Passwort-Verarbeitung
/**
 * Handles the password input for the terminal.
 *
 * @param {Object} terminal - The terminal instance to write output to.
 * @param {string} e - The input character received from the terminal.
 * @param {Object} templateData - The template data containing the correct password.
 * @param {string} currentPasswordInput - The current password input entered by the user.
 * @param {Function} setPasswordPromptActive - Function to set the password prompt active state.
 * @param {Function} setGameStarted - Function to set the game started state.
 * @param {Function} updatePasswordInput - Function to update the current password input.
 * @returns {Promise<void>} - A promise that resolves when the password handling is complete.
 */
export async function handlePasswordInput(terminal, e, templateData, currentPasswordInput, setPasswordPromptActive, setGameStarted, updatePasswordInput) {
    if (e === '\r') {  // Enter-Taste gedrückt
        const correctPassword = templateData.logon_password || 'administrative_overwrite';  // Passwort aus Template laden

        // Überprüfe, ob das eingegebene Passwort korrekt ist
        if (currentPasswordInput === correctPassword) {
            terminal.writeln('\r\nCorrect Password! Access Granted.\r\n');
            await displayStartupLogs(terminal, templateData);  // Coole Logs anzeigen nach erfolgreicher Passwort-Eingabe
            setPasswordPromptActive(false);  // Passwort-Eingabe beenden
            setGameStarted(true);  // Spiel als gestartet markieren
            terminal.prompt();  // Zeige den regulären Prompt nach den Logs
        } else {
            terminal.writeln('\r\nIncorrect Password. Try again.\r\n');
            terminal.write('Password: ');  // Fordere erneut das Passwort an
            updatePasswordInput('');  // Eingabe zurücksetzen
        }
    } else if (e === '\u007F') {  // Backspace
        if (currentPasswordInput.length > 0) {
            terminal.write('\b \b');  // Terminal-Backspace
            updatePasswordInput(currentPasswordInput.slice(0, -1));  // Eingabe aktualisieren
        }
    } else {
        // Speichere den Input in `currentPasswordInput` und maskiere ihn im Terminal
        updatePasswordInput(currentPasswordInput + e);
        terminal.write('*');  // Maskiere die Eingabe
    }
}

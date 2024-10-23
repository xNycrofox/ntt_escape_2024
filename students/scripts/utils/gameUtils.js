import { displayStartupLogs } from './gameLogic.js';

// Funktion zur Passwort-Verarbeitung
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

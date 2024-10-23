// app.js

import { initCommand } from './commands/init.js';
import { unknownCommand } from './commands/unknown.js';
import { displaySituationLogs, displayFinalLogs } from './utils/gameLogic.js';
import { setupTerminal, clearTerminal, handleCommandHistory } from './utils/terminalUtils.js';
import { setGameState, getGameState, clearGameState, setGameCompleted, isGameCompleted, clearGameCompleted, setGameEnded, isGameEnded, clearGameEnded } from './utils/storageUtils.js';
import { handlePasswordInput } from './utils/gameUtils.js';
import { displayTaskModal, solveTask, showHint, clearHintTimers } from './utils/taskUtils.js';

// Initialisierung von xterm.js
const { terminal, terminalContainer } = setupTerminal();

let templateData = null;  // Variable, um das Template zu speichern
let passwordPromptActive = false;
let gameStartReady = false;  // Status, um den Beginn der Spielansicht zu erkennen
let currentPasswordInput = '';  // Variable für die Passwort-Eingabe
let gameStarted = false;  // Status, ob das Spiel gestartet wurde
let currentTaskIndex = 0;  // Index für die aktuelle Aufgabe
let startTime = null; // Startzeit für die Stoppuhr

// maximale Anzahl an Tasks aus dem Template auslesen
const maxTasksCount = templateData ? templateData.sections.length : 0;

// Mapping der verstrichenen Zeit zu maximalen Aufgaben
const taskThresholds = [
    { time: 15 * 60 * 1000, maxTasks: 15 },  // 15 Minuten
    { time: 30 * 60 * 1000, maxTasks: 25 },  // 30 Minuten
    { time: 45 * 60 * 1000, maxTasks: 30 },  // 45 Minuten
    { time: 60 * 60 * 1000, maxTasks: 35 }   // 60 Minuten
];

/**
 * Bestimmt die maximale Anzahl von Aufgaben basierend auf der verstrichenen Zeit.
 * @param {number} elapsedTime - Verstrichene Zeit in Millisekunden.
 * @returns {number} Maximale Anzahl der Aufgaben.
 */
function getMaxTasks(elapsedTime) {
    for (let threshold of taskThresholds) {
        if (elapsedTime <= threshold.time) {
            return threshold.maxTasks;
        }
    }
    // Falls die Zeit die maximale Schwelle überschreitet
    return taskThresholds[taskThresholds.length - 1].maxTasks;
}

/**
 * Startet den Vollbildmodus.
 */
function enterFullscreen() {
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
    } else if (document.documentElement.webkitRequestFullscreen) { /* Safari */
        document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) { /* IE11 */
        document.documentElement.msRequestFullscreen();
    }
}

/**
 * Beendet den Vollbildmodus.
 */
function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
        document.msExitFullscreen();
    }
}

// Funktion zur Aktualisierung der Passwort-Eingabe
function updatePasswordInput(newInput) {
    currentPasswordInput = newInput;
}

// Funktion zur Anzeige des Gratulationsmodals
function showCongratsModal() {
    const congratsModal = document.getElementById('congratsModal');
    const finalCodeSpan = document.getElementById('finalCode');
    const closeCongratsButton = document.getElementById('closeCongratsButton');

    // Generiere den Zahlencode (hier als Beispiel: zufälliger 6-stelliger Code)
    const finalCode = generateFinalCode();

    finalCodeSpan.textContent = finalCode;

    // Zeige das Modal
    congratsModal.style.display = 'block';

    // Speichere den finalCode im localStorage verschlüsselt
    // (Einfaches Beispiel, da echte Verschlüsselung komplexer ist)
    const encodedFinalCode = btoa(finalCode); // base64 encoding
    localStorage.setItem('finalCode', encodedFinalCode);

    // Event Listener für den Button zum Beenden des Spiels
    closeCongratsButton.addEventListener('click', handleCloseCongrats);
}

// Funktion zum ausgeben eines Zahlencodes
function generateFinalCode() {
    // Beispiel Ausgabe der Zahl 813128
    return 813128;
}

// Funktion zur Handhabung des Schließens des Gratulationsmodals
function handleCloseCongrats() {
    const congratsModal = document.getElementById('congratsModal');
    congratsModal.style.display = 'none';

    // Informiere den Benutzer über die Änderung
    terminal.writeln('Game has been ended. Only admin commands are available.');
    terminal.prompt();
}

// Überprüfen, ob das Spiel abgeschlossen ist
const gameIsCompleted = isGameCompleted();

// Überprüfen, ob das Spiel beendet ist
const gameIsEnded = isGameEnded();

// Überprüfen, ob ein gespeicherter Spielstand im localStorage existiert
const savedGameState = getGameState();

if (gameIsCompleted && !gameIsEnded) {
    // Spiel ist abgeschlossen und nicht beendet, zeige das Gratulationsmodal
    terminal.writeln('Game session completed. Showing congratulations.');
    showCongratsModal();
} else if (savedGameState) {
    templateData = savedGameState.templateData;
    currentTaskIndex = savedGameState.currentTaskIndex;
    startTime = savedGameState.startTime || Date.now(); // Setze startTime, falls nicht vorhanden
    terminal.writeln('Restoring active game session...');
    terminal.writeln("Game is already running. Press ENTER to continue.");
    gameStarted = true;
    terminal.prompt();  // Zeige den regulären Prompt
} else {
    terminal.writeln('Escape Room Terminal - Welcome');
    terminal.writeln('-------------------------------');
    terminal.writeln('Type `init` to begin...');
    terminal.writeln('You can always exit the game session by typing `sessioncontrol --exit` in the solution input field.');
    terminal.prompt();
}

// Funktion für das Starten der nächsten Aufgabe
function startNextTask() {
    // Alte Hint-Timer löschen
    clearHintTimers();

    if (currentTaskIndex < templateData.sections.length) {
        const taskData = templateData.sections[currentTaskIndex];

        // Aufgabenfenster anzeigen
        displayTaskModal(taskData);

        // Starte 'neutral' Logs mit langsamer Geschwindigkeit
        displaySituationLogs(terminal, 'neutral');

        // Hinweislogik starten
        showHint(taskData);

        // Lösung prüfen, wenn der Benutzer auf den Button klickt
        const solveButton = document.getElementById('solveButton');
        const userInputField = document.getElementById('taskAnswerInput');

        // Event Listener entfernen und neu hinzufügen, um mehrfaches Hinzufügen zu verhindern
        solveButton.removeEventListener('click', handleSolveClick);

        function handleSolveClick() {
            const userAnswer = userInputField.value.trim();

            // Überprüfe, ob der Admin den Befehl zum Beenden eingibt
            if (userAnswer.toLowerCase() === "sessioncontrol --exit") {
                clearGameState();
                clearGameCompleted();
                clearGameEnded();
                localStorage.removeItem('finalCode');
                exitFullscreen();
                window.location.reload();
                return;
            }

            solveTask(userAnswer, taskData.solution, terminal, () => {
                // Richtige Antwort
                terminal.clear();
                displaySituationLogs(terminal, 'improving');  // Nur ein positives Log anzeigen
                currentTaskIndex++;  // Nächste Aufgabe
                userInputField.value = '';  // Eingabefeld zurücksetzen
                document.getElementById('taskWindow').style.display = 'none';  // Aufgabenfenster ausblenden

                // Speichern des aktuellen Spielstands mit startTime
                setGameState(templateData, currentTaskIndex, startTime);

                // Überprüfen der verstrichenen Zeit
                const elapsedTime = Date.now() - startTime;
                const maxTasks = getMaxTasks(elapsedTime);

                if (currentTaskIndex < maxTasks && currentTaskIndex < templateData.sections.length) {
                    setTimeout(startNextTask, 1000);  // Verzögerung vor der nächsten Aufgabe
                } else {
                    // Letzte Aufgabe abgeschlossen oder maximale Aufgaben erreicht
                    terminal.writeln('All tasks completed. You have successfully stopped the virus.');
                    displayFinalLogs(terminal);  // Abschlusslogs anzeigen

                    // Setze das Spiel als abgeschlossen
                    setGameCompleted(true);

                    // Speichern des aktuellen Spielstands (optional)
                    setGameState(templateData, currentTaskIndex, startTime);

                    // Zeige das Gratulationsmodal nach einer kurzen Verzögerung
                    setTimeout(showCongratsModal, 2000); // 2 Sekunden Verzögerung für Abschlusslogs
                }
            }, () => {
                // Falsche Antwort
                displaySituationLogs(terminal, 'worsening');  // Nur ein negatives Log anzeigen
                userInputField.classList.add('shake', 'error');
                setTimeout(() => {
                    userInputField.classList.remove('shake', 'error');
                }, 500);
            });
        }

        solveButton.addEventListener('click', handleSolveClick);
    } else {
        // Letzte Aufgabe abgeschlossen
        terminal.writeln('All tasks completed. You have successfully stopped the virus.');
        displayFinalLogs(terminal);  // Abschlusslogs anzeigen

        // Setze das Spiel als abgeschlossen
        setGameCompleted(true);

        // Speichern des aktuellen Spielstands (optional)
        setGameState(templateData, currentTaskIndex, startTime);

        // Zeige das Gratulationsmodal nach einer kurzen Verzögerung
        setTimeout(showCongratsModal, 2000); // 2 Sekunden Verzögerung für Abschlusslogs
    }
}

// Event listener für Benutzereingaben
terminal.onData(async (e) => {
    if (passwordPromptActive) {
        // Falls Passwortabfrage aktiv ist, handle nur die Passwort-Eingabe
        handlePasswordInput(terminal, e, templateData, currentPasswordInput, 
            (active) => passwordPromptActive = active, 
            (started) => gameStarted = started, 
            updatePasswordInput);
        return;
    }

    if (e === '\r') {  // Enter-Taste gedrückt
        if (gameStartReady && !passwordPromptActive && !gameStarted) {
            // Drücke ENTER, um das Spiel zu starten
            terminal.clear();
            terminal.writeln('Password: ');  // Passwort-Eingabeaufforderung
            passwordPromptActive = true;  // Passwort-Eingabe aktivieren

            // Startzeit setzen, wenn nicht bereits gesetzt
            if (!startTime) {
                startTime = Date.now();
                setGameState(templateData, currentTaskIndex, startTime);
            }

            // Starte den Vollbildmodus
            enterFullscreen();
        } else if (gameStarted) {
            // Re-check the current state
            const currentGameIsCompleted = isGameCompleted();
            const currentGameIsEnded = isGameEnded();

            if (currentGameIsCompleted && !currentGameIsEnded) {
                // Wenn das Spiel beendet ist, nur admin Befehle erlauben
                
                const [command, ...args] = terminal.currentCommand.trim().split(" ");
                terminal.commandHistory.unshift(terminal.currentCommand);
                terminal.currentCommand = '';
                console.log(command, args);
                if (command === 'sessioncontrol' && args[0] === '--exit') {
                    // Beende das aktuelle Spiel
                    clearGameState(); 
                    clearGameCompleted(); // Entferne Spielabschluss
                    clearGameEnded(); // Entferne Spiel beendet
                    localStorage.removeItem('finalCode'); // Entferne finalCode
                    exitFullscreen(); // Beende den Vollbildmodus
                    gameStarted = false;
                    gameStartReady = false;
                    templateData = null;
                    currentTaskIndex = 0;
                    terminal.clear();
                    terminal.writeln("\nGame session ended. Reloading.");
                    window.location.reload();
                } else {
                    // Andere Befehle nicht erlauben
                    terminal.writeln('\rSpiel beendet. Ab hier kann nur der Admin weitermachen.');
                }
                terminal.prompt();
                return;
            } else if (currentGameIsEnded) {
                // Spiel ist beendet, nichts tun hier; commands will be handled below
            } else {
                // Wenn das Spiel läuft, zeige die nächste Aufgabe an
                startNextTask();
            }
        } else {
            // Wenn das Spiel nicht läuft, handle Befehle
            const [command, ...args] = terminal.currentCommand.trim().split(" ");

            terminal.commandHistory.unshift(terminal.currentCommand);
            terminal.currentCommand = '';  // Eingabe zurücksetzen
            terminal.prompt();

            // Überprüfe, ob das Spiel beendet ist
            const isEnded = isGameEnded();

            if (gameIsCompleted) {
                // Wenn das Spiel beendet ist, nur admin Befehle erlauben
                if (command === 'sessioncontrol' && args[0] === '--exit') {
                    // Beende das aktuelle Spiel
                    clearGameState(); 
                    clearGameCompleted(); // Entferne Spielabschluss
                    clearGameEnded(); // Entferne Spiel beendet
                    localStorage.removeItem('finalCode'); // Entferne finalCode
                    exitFullscreen(); // Beende den Vollbildmodus
                    gameStarted = false;
                    gameStartReady = false;
                    templateData = null;
                    currentTaskIndex = 0;
                    terminal.clear();
                    terminal.writeln("Game session ended. Reloading.");
                    window.location.reload();
                } else {
                    // Andere Befehle nicht erlauben
                    terminal.writeln('Spiel beendet. Ab hier kann nur der Admin weitermachen.');
                }
                terminal.prompt();
                return;
            }

            // `switch`-Anweisung für Befehle
            switch (command) {
                case 'init':
                    if (gameStarted) {
                        terminal.writeln('The game is already active.');
                    } else {
                        templateData = await initCommand(terminal, args);  // Template laden
                        if (templateData) {
                            currentTaskIndex = 0; // Start bei 0
                            startTime = Date.now(); // Setze die Startzeit
                            setGameState(templateData, currentTaskIndex, startTime); 
                            terminal.writeln("Press Enter to start the game for the students. The password prompt at the next screen is already part of the game.");
                            gameStartReady = true;  // Spielansicht bereit zum Starten
                        } else {
                            terminal.writeln('Failed to load template data.');
                        }
                    }
                    break;

                case 'sessioncontrol':
                    if (args[0] === '--exit') {
                        // Beende das aktuelle Spiel
                        clearGameState(); 
                        clearGameCompleted(); // Entferne Spielabschluss
                        clearGameEnded(); // Entferne Spiel beendet
                        localStorage.removeItem('finalCode'); // Entferne finalCode
                        exitFullscreen(); // Beende den Vollbildmodus
                        gameStarted = false;
                        gameStartReady = false; 
                        templateData = null;
                        currentTaskIndex = 0;
                        terminal.clear();
                        terminal.writeln("Game session ended. Reloading.");
                        window.location.reload();
                    } else {
                        terminal.writeln('Unknown argument for `sessioncontrol`. Use `--exit` to end the game.');
                    }
                    break;

                case 'clear':
                    clearTerminal(terminal);  // Terminal leeren
                    break;

                default:
                    unknownCommand(terminal);  // Unbekannter Befehl
                    break;
            }
        }
    } else if (e === '\u007F') {  // Backspace
        handleCommandHistory(terminal, e);
    } else {
        handleCommandHistory(terminal, e);
    }
});

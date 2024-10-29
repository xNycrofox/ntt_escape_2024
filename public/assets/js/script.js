const terminal = document.getElementById('terminal');
const userInput = document.getElementById('user-input');
const progressBar = document.getElementById('progress');
const progressBarContainer = document.getElementById('progress-bar-container'); // Container des Fortschrittsbalkens

const gameData = JSON.parse(localStorage.getItem('gameData')) || null;
let gameProgress = localStorage.getItem('gameProgress') || 0;
let currentSection = parseInt(gameProgress) || 0;
let isBooting = false;
let waitingForEnter = false;
let gameFinished = false;
let sessionStopped = false;
let logInterval = null;

// Neue Variablen für die Zeitsteuerung
const totalGameDurationMinutes = parseInt(localStorage.getItem('totalGameDuration')) || 60;
const totalGameDuration = totalGameDurationMinutes * 60; // Umrechnung in Sekunden
let gameStartTime = parseInt(localStorage.getItem('gameStartTime')) || Date.now();
let averageTaskTime = 0; // Durchschnittliche Bearbeitungszeit pro Aufgabe
let taskStartTime = Date.now(); // Startzeit der aktuellen Aufgabe

const MINIMUM_TASK_TIME = 180; // Minimale Bearbeitungszeit pro Aufgabe in Sekunden

// Variable zum Speichern der Hint-Timer
let hintTimers = [];

function showMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.innerHTML = message;
    terminal.appendChild(messageElement);
    terminal.scrollTop = terminal.scrollHeight;
}

function clearTerminal() {
    terminal.innerHTML = ''; // Leert das Terminal
}

function resetGame() {
    clearTerminal();
    gameProgress = 0;
    currentSection = 0;
    isBooting = false;
    waitingForEnter = false;
    gameFinished = false;
    sessionStopped = false;
    userInput.disabled = true; // Deaktiviert die Eingabe, wenn das Spiel gestoppt ist

    if (logInterval) {
        clearInterval(logInterval); // Setzt das Log-Intervall zurück, falls es läuft
        logInterval = null;
    }

    // Lösche alle Hint-Timer
    clearHintTimers();

    showMessage("Spiel Session nicht gestartet.");

    // Überprüfe alle 5 Sekunden, ob ein neues Spiel gestartet wurde
    setInterval(() => {
        if (localStorage.getItem('gameStarted') && localStorage.getItem('gameProgress') == 0) {
            location.reload();
        }
    }, 5000);
}

function checkGameSession() {
    if (!gameData || !localStorage.getItem('gameStarted')) {
        if (!sessionStopped) {
            resetGame(); // Reset alle Variablen, Timer und UI
            sessionStopped = true; // Verhindert wiederholtes Anzeigen der "Spiel Session nicht gestartet." Nachricht
        }
    } else {
        loadCurrentState();
    }
}

function loadCurrentState() {
    if (gameProgress == 0) {
        showMessage('Bitte geben Sie das Passwort ein:');
    } else {
        currentSection = parseInt(gameProgress); // Setzt die aktuelle Sektion basierend auf dem Fortschritt
        showSection(currentSection); // Lädt die aktuelle Sektion basierend auf gameProgress
        userInput.disabled = false; // Reaktiviert die Eingabe, wenn das Spiel läuft
    }
}

function processPassword(input) {
    if (input === gameData.logon_password) {
        showMessage('Passwort korrekt. Starte das System...');
        startBootSequence();
    } else {
        showMessage('Falsches Passwort. Versuchen Sie es erneut.');
    }
}

function startBootSequence() {
    isBooting = true;
    // Starte Bildschirmflackern für 1,5 Sekunden
    startScreenFlicker(1500);
    const bootMessages = [
        "Started Apply Kernel Variables.",
        "Mounted Kernel Debug File System.",
        "Mounted Huge Pages File System.",
        "Mounted POSIX Message Queue File System.",
        "Started Read and set NIS domainname from /etc/sysconfig/network.",
        "Activated swap /dev/mapper/cl-swap.",
        "Reached target Swap.",
        "Started Remount Root and Kernel File Systems.",
        "Starting Flush Journal to Persistent Storage...",
        "Starting Load/Save Random Seed...",
        "Starting Create Static Device Nodes in /dev...",
        "Started Load/Save Random Seed.",
        "Started Flush Journal to Persistent Storage.",
        "Started Setup Virtual Console.",
        "Started Create Static Device Nodes in /dev.",
        "Starting udev Kernel Device Manager...",
        "Started udev Kernel Device Manager.",
        "Created slice system-lvm2\\x2dpvscan.slice.",
        "Starting LVM event activation on device 8:2...",
        "Started Monitoring of LVM mirrors, snapshots etc. using dmeventd or progress polling.",
        "Reached target Local File Systems (Pre).",
        "Starting File System Check on /dev/disk/by-uuid/0868ca58-6212-404b-91d8-b512c612c58a...",
        "Started LVM event activation on device 8:2.",
        "Started File System Check on /dev/disk/by-uuid/0868ca58-6212-404b-91d8-b512c612c58a.",
        "Mounting /boot...",
        "Mounted /boot.",
        "Reached target Local File Systems.",
        "Starting Import network configuration from initramfs...",
        "Starting Tell Plymouth To Write Out Runtime Data...",
        "Starting Restore /run/initramfs on shutdown...",
        "Started Restore /run/initramfs on shutdown.",
        "Started Tell Plymouth To Write Out Runtime Data.",
        "Started Import network configuration from initramfs.",
        "Starting Create Volatile Files and Directories...",
        "Started Create Volatile Files and Directories.",
        "Starting Security Auditing Service..."
    ];

    let i = 0;
    const bootInterval = setInterval(() => {
        if (i < bootMessages.length) {
            // Formatiere die Nachricht mit grünem [ OK ]
            const message = `<span style="color: green;">[  OK  ]</span> ${bootMessages[i]}`;
            showMessage(message);
            i++;
        } else {
            clearInterval(bootInterval);
            showIntroduction();
        }
    }, 100); // Passe das Intervall an, um die Geschwindigkeit zu ändern
}

function showIntroduction() {
    showMessage(gameData.introduction);
    showMessage('Drücken Sie ENTER, um fortzufahren...');
    waitingForEnter = true; // Nach der Introduction warten wir auf ENTER
    isBooting = false;
}

function processInput(input) {
    if (isBooting || gameFinished) return; // Ignoriere Eingaben nach Spielende

    if (waitingForEnter) {
        waitingForEnter = false;
        currentSection = 1; // Setzt den Fortschritt für das erste Rätsel
        gameProgress = currentSection;
        localStorage.setItem('gameProgress', currentSection); // Speichert die erste Sektion
        clearTerminal(); // Terminal leeren nach der Einführung
        showSection(currentSection);
    } else if (currentSection === 0) {
        processPassword(input);
    } else {
        processRiddle(input.toLowerCase());
    }    
    userInput.value = '';
}

function processRiddle(input) {
    const section = gameData.sections[currentSection - 1]; // Aktuelle Sektion (Rätsel)
    if (input === section.solution.toLowerCase()) { // Vergleicht Lösungen unabhängig von Groß/Kleinschreibung
        let taskEndTime = Date.now();
        let taskDuration = (taskEndTime - taskStartTime) / 1000; // Dauer der Aufgabe in Sekunden

        // Aktualisiere durchschnittliche Bearbeitungszeit
        if (averageTaskTime === 0) {
            averageTaskTime = taskDuration;
        } else {
            averageTaskTime = (averageTaskTime + taskDuration) / 2;
        }

        // Setze minimale durchschnittliche Bearbeitungszeit
        averageTaskTime = Math.max(averageTaskTime, MINIMUM_TASK_TIME);

        showMessage(`Rätsel "${section.title}" gelöst!`);

        // Lösche alle Hint-Timer
        clearHintTimers();

        currentSection++; // Fortschritt auf nächste Sektion erhöhen
        gameProgress = currentSection;
        localStorage.setItem('gameProgress', currentSection); // Speichert die nächste Sektion

        // Berechne verstrichene Zeit
        let elapsedTime = (Date.now() - gameStartTime) / 1000; // in Sekunden
        let remainingTime = totalGameDuration - elapsedTime;

        // Schätzen, ob genügend Zeit für eine weitere Aufgabe ist
        let estimatedNextTaskTime = averageTaskTime;
        let tasksRemainingInSections = gameData.sections.length - (currentSection - 1);
        let remainingTasksEstimate = Math.min(Math.floor(remainingTime / estimatedNextTaskTime), tasksRemainingInSections);

        console.log(`Verbleibende Zeit: ${remainingTime.toFixed(2)} Sekunden`);
        console.log(`Geschätzte Anzahl verbleibender Rätsel: ${remainingTasksEstimate}`);

        // Überprüfe, ob wir die letzte Aufgabe erreicht haben
        if (currentSection > gameData.sections.length) {
            // Alle Aufgaben erledigt -> Endsequenz starten
            clearTerminal();
            userInput.value = '';
            showVirusRemovalLogs(); // Startet die Virus-Lösch-Logs
            progressBarContainer.style.display = 'none'; // Fortschrittsbalken nach Spielende entfernen
        } else if (remainingTime < estimatedNextTaskTime && currentSection < gameData.sections.length) {
            // Nicht genügend Zeit für weitere Aufgaben und noch nicht bei der letzten Aufgabe -> Endsequenz starten
            clearTerminal();
            userInput.value = '';
            showVirusRemovalLogs(); // Startet die Virus-Lösch-Logs
            progressBarContainer.style.display = 'none'; // Fortschrittsbalken nach Spielende entfernen
        } else {
            // Zeige nächste Aufgabe
            clearTerminal(); // Terminal leeren nach jedem Rätsel
            showSection(currentSection);
            // Setze Startzeit für nächste Aufgabe
            taskStartTime = Date.now();
            updateProgressBar((currentSection / gameData.sections.length) * 100); // Fortschritt aktualisieren
        }
    } else {
        showMessage('Falsche Antwort. Versuchen Sie es erneut.');
    }
}

function showSection(sectionIndex) {
    const section = gameData.sections[sectionIndex - 1];
    // Starte Bildschirmflackern für 1,5 Sekunden
    startScreenFlicker(1500);
    // Lösche alle vorherigen Hint-Timer
    clearHintTimers();

    showMessage(section.story);
    showMessage(''); // Fügt eine Leerzeile nach der Story ein
    if (section.task) {
        showMessage(section.task);
        showMessage(''); // Fügt eine Leerzeile nach der Aufgabe ein
    }

    if (section.images && section.images.length > 0) {
        if (section.images.length <= 5) {
            // Bilder nebeneinander anzeigen
            let imagesHTML = '<div style="display: flex; flex-wrap: wrap;">';

            section.images.forEach(image => {
                imagesHTML += `<div style="margin: 5px;"><img src="${image.image}" alt="Bild" style="width: 400px; height: auto;"></div>`;
            });

            imagesHTML += '</div>';

            showMessage(imagesHTML);
        } else {
            // Bilder untereinander anzeigen
            section.images.forEach(image => {
                showMessage(`<div><img src="${image.image}" alt="Bild" style="width: 150px; height: auto;"></div>`);
            });
        }
        showMessage(''); // Fügt eine Leerzeile nach den Bildern ein
    }

    showMessage('Geben Sie Ihre Antwort ein:');
    // Setze Startzeit für diese Aufgabe
    taskStartTime = Date.now();

    // Setze Hint-Timer für diese Sektion
    if (section.hints && section.hints.length > 0) {
        section.hints.forEach(hint => {
            const timer = setTimeout(() => {
                showMessage('');
                showMessage(`HINWEIS: ${hint.hint}`);
            }, hint.time * 1000); // Multipliziere mit 1000, um Millisekunden zu erhalten
            hintTimers.push(timer);
        });
    }
}


function clearHintTimers() {
    hintTimers.forEach(timer => clearTimeout(timer));
    hintTimers = [];
}

// Funktion zum Starten des Bildschirmflackerns
function startScreenFlicker(duration) {
    terminal.classList.add('screen-flicker');
    setTimeout(() => {
        terminal.classList.remove('screen-flicker');
    }, duration);
}

// Funktion zum Hinzufügen von statischem Rauschen
function addScreenStatic(duration) {
    terminal.classList.add('screen-static');
    setTimeout(() => {
        terminal.classList.remove('screen-static');
    }, duration);
}

function invertScreenColors(duration) {
    terminal.classList.add('invert-colors');
    setTimeout(() => {
        terminal.classList.remove('invert-colors');
    }, duration);
}


function updateProgressBar(value) {
    progressBar.style.width = value + '%';
}

function showVirusRemovalLogs() {
    addScreenStatic(5000); // Rauschen für 5 Sekunden
    const logs = [
        "Erkennen des Virus gestartet...",
        "Analysiere Netzwerkverkehr...",
        "Scanne nach ungewöhnlichen Mustern...",
        "Erhöhe Sicherheitsschutz...",
        "Isoliere verdächtige Dateien...",
        "Starte Tiefenscan...",
        "Verdächtige Datei gefunden: virus.exe...",
        "Überprüfe Datei-Signatur...",
        "Datei-Signatur bestätigt: Virus erkannt...",
        "Beginne Quarantäne-Prozess...",
        "Entferne schädliche Prozesse...",
        "Schließe infizierte Ports...",
        "Stoppe Virus-Kommunikation...",
        "Erhöhe Firewall-Schutz...",
        "Lösche schädliche Dateien...",
        "Überprüfe Systemintegrität...",
        "Korrigiere beschädigte Systemdateien...",
        "Führe Reboot durch...",
        "Überprüfe Bootsektor...",
        "Starte finale Virenüberprüfung...",
        "Systemscan abgeschlossen: Keine Bedrohungen gefunden.",
        "Virus erfolgreich entfernt...",
        "Stelle Netzwerkverbindung wieder her...",
        "Überprüfe Logs auf verdächtige Aktivitäten...",
        "Säubere temporäre Dateien...",
        "Führe finale Systemprüfung durch...",
        "Prüfe alle externen Verbindungen...",
        "Erhöhe Schutzstufe gegen zukünftige Angriffe...",
        "Aktiviere automatischen Sicherheitsscan...",
        "System vollständig gesichert."
    ];

    let i = 0;
    logInterval = setInterval(() => {
        if (i < logs.length) {
            showMessage(logs[i]);
            i++;
        } else {
            clearInterval(logInterval);
            showFinalMessage();
        }
    }, i % 5 === 0 ? 1000 : 200); // Ausgabe mit wechselnder Geschwindigkeit
}

function showFinalMessage() {
    showMessage("Ihr habt es geschafft und habt eine Belohnung verdient - Hier ist der Code: 518381");
    gameFinished = true; // Setzt den Status auf 'Spiel beendet', um weitere Eingaben zu ignorieren
}

userInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        const input = userInput.value.trim();
        processInput(input);
    }
});

function randomScreenFlicker() {
    const randomTime = Math.floor(Math.random() * 30000) + 10000; // Zwischen 10 und 40 Sekunden
    setTimeout(() => {
        startScreenFlicker(500); // Flackern für 0,5 Sekunden
        randomScreenFlicker(); // Funktion erneut aufrufen
    }, randomTime);
}

// Starte das zufällige Flackern beim Laden der Seite
randomScreenFlicker();

checkGameSession(); // Überprüfe beim Laden der Seite den Spielstatus

// Überprüfe alle 5 Sekunden, ob das Spiel noch läuft
setInterval(() => {
    if (!localStorage.getItem('gameStarted') || !localStorage.getItem('gameProgress')) {
        if (!sessionStopped) {
            resetGame(); // Setzt das Spiel zurück, wenn der Admin es gestoppt hat
        }
    }
}, 5000);

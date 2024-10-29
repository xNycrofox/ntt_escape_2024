// taskUtils.js

// Funktion zum Anzeigen des Modals mit der aktuellen Aufgabe
export function displayTaskModal(taskData) {
    // Elemente referenzieren
    const taskWindow = document.getElementById('taskWindow');
    const taskTitle = document.getElementById('taskTitle');
    const taskStory = document.getElementById('taskStory');
    const taskDescription = document.getElementById('taskDescription');
    const taskAnswerInput = document.getElementById('taskAnswerInput');

    // Task-Daten setzen
    taskTitle.innerText = taskData.title;
    taskStory.innerText = taskData.story;
     // **WICHTIG:** Verwende innerHTML, um HTML-Tags zu rendern
     taskDescription.innerHTML = taskData.task ? taskData.task.replace(/\r\n/g, '<br>') : "";

    taskAnswerInput.value = ''; // Eingabefeld zurücksetzen

    // Bilder anzeigen, falls vorhanden
    if (taskData.images && Array.isArray(taskData.images) && taskData.images.length > 0) {
        const imagesContainer = document.getElementById('taskImages');
        
        // Überprüfe, ob das imagesContainer-Element existiert
        if (imagesContainer) {
            imagesContainer.innerHTML = ''; // Leere das Container-Element

            taskData.images.forEach((imageObj, index) => {
                if (imageObj.image) { // Stelle sicher, dass die image-Eigenschaft existiert
                    const imageElement = document.createElement('img');
                    imageElement.src = imageObj.image; // Korrigierte Zuweisung
                    imageElement.classList.add('task-image');
                    imageElement.width = "50%";
                    imageElement.alt = `Task Image ${index + 1}`; // Alternativer Text
                    imagesContainer.appendChild(imageElement);
                } else {
                    console.warn(`Bildobjekt an Index ${index} fehlt die 'image'-Eigenschaft.`);
                }
            });
        } else {
            console.error("Element mit ID 'taskImages' wurde nicht gefunden.");
        }
    } else {
        // Falls keine Bilder vorhanden sind, stelle sicher, dass der Container leer ist
        const imagesContainer = document.getElementById('taskImages');
        if (imagesContainer) {
            imagesContainer.innerHTML = '';
        }
    }

    // Aufgabenfenster anzeigen
    taskWindow.style.display = 'block';
}


export function solveTask(userInput, correctAnswer, terminal, onSuccess, onFailure) {
    const userInputField = document.getElementById('taskAnswerInput');

    if (userInput.trim().toLowerCase() === correctAnswer.trim().toLowerCase()) {
        // Richtige Antwort
        terminal.writeln('\nTask solved successfully!');
        onSuccess();
    } else {
        // Falsche Antwort
        terminal.writeln('\nIncorrect answer. Try again!');
        onFailure();

        // Eingabefeld wackeln und rot einfärben
        userInputField.classList.add('shake', 'error');
        setTimeout(() => {
            userInputField.classList.remove('shake', 'error');
        }, 500);
    }
}



let hintTimers = []; // Array zum Speichern der Hint-Timer

export function showHint(taskData) {
    // Vorherige Hint-Timer löschen
    clearHintTimers();

    const globalHintBox = document.getElementById('globalHintBox');
    globalHintBox.style.display = 'none'; // Hinweisbox initial ausblenden

    // Hinweise der aktuellen Aufgabe planen
    taskData.hints.forEach((hintObj, index) => {
        const hintTime = parseInt(hintObj.time, 10); // Zeit aus dem Template (in Sekunden)
        const timerId = setTimeout(() => {
            globalHintBox.innerHTML = `<strong>Hinweis:</strong> ${hintObj.hint}`;
            globalHintBox.style.display = 'block';

            // Hinweis nach 10 Sekunden ausblenden
            setTimeout(() => {
                globalHintBox.classList.add('fade-out');
                setTimeout(() => {
                    globalHintBox.style.display = 'none';
                    globalHintBox.classList.remove('fade-out');
                }, 2000); // Dauer des Fade-Out-Effekts
            }, 10000); // Hinweis für 10 Sekunden anzeigen
        }, hintTime * 1000); // Verzögerung basierend auf `time`

        // Timer speichern
        hintTimers.push(timerId);
    });
}

// Funktion zum Löschen der Hint-Timer
export function clearHintTimers() {
    hintTimers.forEach((timerId) => {
        clearTimeout(timerId);
    });
    hintTimers = [];
}


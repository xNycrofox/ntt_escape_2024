const tasks = [
    {
        section: "Abschnitt 1",
        message: "Die Mission beginnt: Ihr müsst einen Virus im System aufhalten. Nutzt eure Fähigkeiten, um den Ursprung zu finden."
    },
    {
        section: "Abschnitt 2",
        message: "Die Energieversorgung der KI ist instabil. Nutzt die folgende Formel, um die Energiequelle zu stabilisieren..."
    },
    // Weitere Abschnitte können hier hinzugefügt werden
];

let currentTaskIndex = 0;
let startTime = Date.now();

const terminalOutput = document.getElementById("terminal-output");
const userInput = document.getElementById("user-input");

function displayMessage(message) {
    const newLine = document.createElement("div");
    newLine.textContent = message;
    terminalOutput.appendChild(newLine);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function processInput(input) {
    if (input.toLowerCase() === 'next') {
        if (currentTaskIndex < tasks.length) {
            displayMessage(tasks[currentTaskIndex].message);
            currentTaskIndex++;
        } else {
            displayMessage("Mission erfolgreich abgeschlossen.");
            const endTime = Date.now();
            const duration = (endTime - startTime) / 1000;
            displayMessage(`Zeit: ${duration} Sekunden.`);
        }
    } else {
        displayMessage("Ungültiger Befehl. Geben Sie 'next' ein, um fortzufahren.");
    }
}

userInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        const input = userInput.value;
        processInput(input);
        userInput.value = "";
    }
});

// Start der ersten Aufgabe
displayMessage(tasks[currentTaskIndex].message);
currentTaskIndex++;

// init.js

/**
 * Initializes the command by prompting the user to select a JSON file and loading its contents.
 *
 * @param {object} terminal - The terminal object used to write messages.
 * @param {Array} args - The arguments passed to the command.
 * @returns {Promise<object|null>} A promise that resolves to the loaded JSON object or null if no file was selected.
 * @throws {Error} If there is an error during the file loading process.
 */
export async function initCommand(terminal, args) {
    terminal.writeln('Initializing...');
    terminal.writeln('Please wait...');

    return new Promise((resolve, reject) => {
        try {
            // Erstelle ein unsichtbares Datei-Input-Element
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'application/json';
            input.style.display = 'none';

            // Event-Listener für die Datei-Auswahl
            input.onchange = async (event) => {
                const file = event.target.files[0];
                if (file) {
                    const template = await file.text();
                    const template_json = JSON.parse(template);
                    terminal.writeln('Template loaded successfully!');
                    resolve(template_json);  // Rückgabe des geladenen JSON
                } else {
                    terminal.writeln('No file selected.');
                    resolve(null);
                }
            };

            // Füge das Input-Element zum Dokument hinzu und öffne den Dateiauswahldialog
            document.body.appendChild(input);
            input.click();
            document.body.removeChild(input);  // Nach der Auswahl wird das Input-Element wieder entfernt
        } catch (error) {
            terminal.writeln('Failed to load the template.');
            console.error(error);
            reject(error);
        }
    });
}

// utils/gameLogic.js

/**
 * Prompts the user for a password via the terminal interface.
 * 
 * @param {object} terminal - The terminal interface to interact with the user.
 * @param {string} correctPassword - The correct password to validate against.
 * @returns {Promise<boolean>} - A promise that resolves to true if the correct password is entered, otherwise it keeps prompting.
 */
export async function promptForPassword(terminal, correctPassword) {
    return new Promise((resolve) => {
        let passwordPromptActive = true;
        terminal.write('\r\nPassword: ');

        let inputPassword = '';

        terminal.onData((e) => {
            if (passwordPromptActive) {
                if (e === '\r') {  // Enter gedrückt
                    if (inputPassword === correctPassword) {
                        terminal.writeln('\r\nCorrect Password! Access Granted.');
                        passwordPromptActive = false;
                        gameStarted = true;
                        resolve(true);
                    } else {
                        terminal.writeln('\r\nIncorrect Password. Try again.');
                        inputPassword = '';
                        terminal.write('\r\nPassword: ');
                    }
                } else if (e === '\u007F') {  // Backspace
                    if (inputPassword.length > 0) {
                        terminal.write('\b \b');
                        inputPassword = inputPassword.slice(0, -1);
                    }
                } else {
                    inputPassword += e;  // Passwort wird eingegeben
                    terminal.write('*');  // Anstelle der Eingabe wird `*` angezeigt
                }
            }
        });
    });
}

/**
 * Displays startup logs on the terminal with a sequence of messages.
 *
 * @param {Object} terminal - The terminal object to write logs to.
 * @param {Object} templateData - The data object containing the introduction text.
 * @param {string} templateData.introduction - The introduction text to be displayed after the startup logs.
 */

export function displayStartupLogs(terminal, templateData) {
    terminal.writeln('\r\nSystem Booting...');
    setTimeout(() => terminal.writeln('[Loading modules... 10%]'), 500);
    setTimeout(() => terminal.writeln('[Connecting to the server... 40%]'), 1000);
    setTimeout(() => terminal.writeln('[Initiating protocols... 70%]'), 1500);
    setTimeout(() => terminal.writeln('[Preparing applications... 90%]'), 2000);
    setTimeout(() => terminal.writeln('[Cleaning up... 100%]'), 2500);
    setTimeout(() => terminal.writeln('\r\nSystem Ready.'), 2500);
    setTimeout(() => terminal.writeln('\r\n-----------------'), 2500);
    //Display the template Data introduction text after 2.5 seconds
    setTimeout(() => terminal.writeln(templateData.introduction), 2500);
    setTimeout(() => terminal.writeln('\r\n--Press ENTER to continue--'), 2500);
}



/**
 * Displays situation logs on the terminal based on the given situation.
 *
 * @param {Object} terminal - The terminal object where logs will be displayed.
 * @param {string} situation - The current situation which can be 'improving', 'worsening', or any other value for neutral.
 *
 * @example
 * displaySituationLogs(terminal, 'improving');
 * // Outputs a random log from the 'improving' situation logs.
 *
 * @example
 * displaySituationLogs(terminal, 'neutral');
 * // Outputs all logs from the 'neutral' situation logs with a 1-second delay between each.
 */
export function displaySituationLogs(terminal, situation) {
    let logs = [];
    switch(situation) {
        case 'improving':
            logs = [
                'System Scan Complete: No Threats Detected.',
                'Firewall Updated Successfully.',
                'AI Core Stability Increasing...',
                'Data Integrity Restored.',
                'Virus Signature Database Updated.',
                'Securing Communication Channels...',
                'Reconnecting to Secure Servers...',
                'System Optimization in Progress...',
                'Memory Leaks Resolved.',
                'All Systems Operational.'
            ];
            break;
        case 'worsening':
            logs = [
                'Warning: Unusual Activity Detected!',
                'Error: Failed to Contain Virus.',
                'AI Core Integrity Compromised!',
                'Data Corruption Detected...',
                'Unauthorized Access Attempt Blocked.',
                'Malware Signature Not Recognized!',
                'System Resources Exceeding Limits...',
                'Critical Error: System Overload Imminent.',
                'Network Breach Detected!',
                'Emergency Shutdown Initiated!'
            ];
            break;
        default:  // 'neutral' oder unbekannte Situation
            logs = [
                'Initializing System Protocols...',
                'Running Diagnostic Checks...',
                'Monitoring Network Traffic...',
                'Analyzing AI Algorithms...',
                'Updating System Configurations...',
                'Scanning for Potential Threats...',
                'Synchronizing Time Servers...',
                'Optimizing Resource Allocation...',
                'Establishing Secure Connection...',
                'System Idle...'
            ];
            break;
    }

    if (situation === 'improving' || situation === 'worsening') {
        // Wähle ein zufälliges Log aus und zeige es an
        const log = logs[Math.floor(Math.random() * logs.length)];
        terminal.writeln(log);
    } else {
        // Für 'neutral' Logs, langsamer anzeigen mit mindestens einer Sekunde Verzögerung
        logs.forEach((log, index) => {
            setTimeout(() => {
                terminal.writeln(log);
            }, index * 1000);  // Verzögerung von 1 Sekunde zwischen den Logs
        });
    }
}

/**
 * Displays a sequence of final logs on the provided terminal.
 * Each log is displayed with a delay of 200 milliseconds between them.
 *
 * @param {Object} terminal - The terminal object where logs will be written.
 * @param {Function} terminal.writeln - Function to write a log to the terminal.
 */
export function displayFinalLogs(terminal) {
    const logs = [
        'Initiating Final Virus Purge...',
        'Decrypting Core Files...',
        'Reconstructing AI Subroutines...',
        'Restoring System Settings...',
        'Applying Security Patches...',
        'Rebooting Neural Networks...',
        'Calibrating Sensors...',
        'Reconnecting to Main Server...',
        'Verifying Data Integrity...',
        'System Uptime Restored.',
        'Analyzing User Input...',
        'Purging Residual Malware...',
        'Updating Firewall Rules...',
        'Encrypting Communication Channels...',
        'Optimizing Performance...',
        'Finalizing System Restore...',
        'All Threats Neutralized.',
        'AI Core Functionality at 100%.',
        'Mission Accomplished!',
        'System Secure and Operational.'
    ];

    // Logs ausgeben
    logs.forEach((log, index) => {
        setTimeout(() => {
            terminal.writeln(log);
        }, index * 200);  // Verzögerung zwischen den Logs
    });
}

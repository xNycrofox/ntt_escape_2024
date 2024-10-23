// utils/gameLogic.js

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


// gameLogic.js

// gameLogic.js

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

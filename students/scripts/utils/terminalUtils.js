// utils/terminalUtils.js

export function setupTerminal() {
    const terminal = new Terminal({
        cols: 80,
        rows: 24,
        cursorBlink: true,
        theme: {
            background: '#000000',
            foreground: '#00FF00'
        }
    });

    const terminalContainer = document.getElementById('terminal-container');
    terminal.open(terminalContainer);
    terminal.focus();
    terminal.prompt = () => terminal.write('\r\n$ ');
    terminal.prompt();

    terminal.currentCommand = '';
    terminal.commandHistory = [];
    terminal.historyIndex = -1;

    return { terminal, terminalContainer };
}

export function clearTerminal(terminal) {
    terminal.clear();
    terminal.prompt();
}

export function handleCommandHistory(terminal, e) {
    if (e === '\u007F') {  // Backspace
        if (terminal.currentCommand.length > 0) {
            terminal.write('\b \b');  // Terminal-Backspace
            terminal.currentCommand = terminal.currentCommand.slice(0, -1);
        }
    } else if (e === '\u001B[A') {  // Pfeiltaste nach oben
        if (terminal.commandHistory.length > 0) {
            terminal.historyIndex = (terminal.historyIndex + 1) % terminal.commandHistory.length;
            terminal.currentCommand = terminal.commandHistory[terminal.historyIndex];
            terminal.write(`\r$ ${terminal.currentCommand}`);
        }
    } else if (e === '\u001B[B') {  // Pfeiltaste nach unten
        if (terminal.commandHistory.length > 0) {
            terminal.historyIndex = (terminal.historyIndex - 1 + terminal.commandHistory.length) % terminal.commandHistory.length;
            terminal.currentCommand = terminal.commandHistory[terminal.historyIndex];
            terminal.write(`\r$ ${terminal.currentCommand}`);
        }
    } else {
        terminal.currentCommand += e;
        terminal.write(e);
    }
}

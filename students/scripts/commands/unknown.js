// commands/unknown.js

/**
 * Handles unknown commands in the terminal.
 *
 * @param {object} terminal - The terminal instance where the command is executed.
 */
export function unknownCommand(terminal) {
    terminal.writeln('Unknown command');
}

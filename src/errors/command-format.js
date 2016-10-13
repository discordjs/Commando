const FriendlyError = require('./friendly');

/** Has a descriptive message for a command not having proper format */
class CommandFormatError extends FriendlyError {
	/**
	 * @param {CommandMessage} msg - The command message the error is for
	 */
	constructor(msg) {
		super(`Invalid command format. Use ${msg.commandUsage(`help ${msg.command.name}`)} for information.`);
		/** @ignore */
		this.name = 'CommandFormatError';
	}
}

module.exports = CommandFormatError;

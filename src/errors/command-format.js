const FriendlyError = require('./friendly');

/** Has a descriptive message for a command not having proper format */
module.exports = class CommandFormatError extends FriendlyError {
	/**
	 * @param {CommandMessage} message - The command message the error is for
	 */
	constructor(message) {
		super(`Invalid command format. Use ${message.commandUsage} for information.`);
		/** @ignore */
		this.name = 'CommandFormatError';
	}
};

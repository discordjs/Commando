const FriendlyError = require('./friendly');
const i18next = require('i18next');

/**
 * Has a descriptive message for a command not having proper format
 * @extends {FriendlyError}
 */
class CommandFormatError extends FriendlyError {
	/**
	 * @param {CommandoMessage} msg - The command message the error is for
	 */
	constructor(msg) {
		const lng = msg.client.translator.resolveLanguage(msg);
		super(i18next.t('invalid_command_usage', {
			lng,
			commandName: msg.command.name,
			usage: msg.usage(
				msg.command.format,
				msg.guild ? undefined : null,
				msg.guild ? undefined : null
			),
			anyUsage: msg.anyUsage(
				`help ${msg.command.name}`,
				msg.guild ? undefined : null,
				msg.guild ? undefined : null
			)
		}));
		this.name = 'CommandFormatError';
	}
}

module.exports = CommandFormatError;

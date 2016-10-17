const commando = require('../../../src');
const oneLine = require('common-tags').oneLine;

module.exports = class AddNumbersCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'add-numbers',
			aliases: ['add', 'add-nums'],
			group: 'math',
			memberName: 'add',
			description: 'Adds numbers together.',
			format: '<number> [number2] [number3...]',
			details: oneLine`
				This is an incredibly useful command that finds the sum of numbers.
				This command is the envy of all other commands.
			`,
			examples: ['add-numbers 42 1337'],
			argsType: 'multiple'
		});
	}

	async run(msg, args) {
		if(!args[0]) throw new commando.CommandFormatError(msg);
		const total = args.reduce((prev, arg) => prev + parseFloat(arg), 0);
		return msg.reply(`**Sum:** ${total}`);
	}
};

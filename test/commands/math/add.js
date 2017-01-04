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
			details: oneLine`
				This is an incredibly useful command that finds the sum of numbers.
				This command is the envy of all other commands.
			`,
			examples: ['add-numbers 42 1337'],

			args: [
				{
					key: 'numbers',
					label: 'number',
					prompt: 'What numbers would you like to add? Every message you send will be interpreted as a single number.',
					type: 'float',
					infinite: true
				}
			]
		});
	}

	async run(msg, args) {
		const total = args.numbers.reduce((prev, arg) => prev + parseFloat(arg), 0);
		return msg.reply(`**Sum:** ${total}`);
	}
};

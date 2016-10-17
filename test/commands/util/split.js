const commando = require('../../../src');

module.exports = class SplitCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'split',
			group: 'util',
			memberName: 'split',
			description: 'Sends split messages with a specific total length.',
			format: '<length>',
			details: 'This command is for testing split messages. The length must be at least 1.',
			examples: ['split 3000']
		});
	}

	async run(msg, length) {
		if(!length) throw new commando.CommandFormatError(msg);
		length = parseInt(length);
		if(isNaN(length) || length < 1) throw new commando.CommandFormatError(msg);
		let content = '';
		for(let i = 0; i < length; i++) content += `${i % 500 === 0 ? '\n' : ''}a`;
		return [await msg.reply(content, { split: true })];
	}
};

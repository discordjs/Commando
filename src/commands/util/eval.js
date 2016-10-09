const util = require('util');
const discord = require('discord.js');
const tags = require('common-tags');
const escapeRegex = require('escape-string-regexp');
const Command = require('../../command');
const CommandFormatError = require('../../errors/command-format');

const nl = '!!NL!!';
const nlPattern = new RegExp(nl, 'g');

module.exports = class EvalCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'eval',
			group: 'util',
			memberName: 'eval',
			description: 'Evaluates input as JavaScript.',
			usage: '<script>',
			details: 'Only the bot owner may use this command.'
		});

		this.lastResult = null;
		this.objects = client.registry.evalObjects;
	}

	hasPermission(cmdMsg) {
		return cmdMsg.author.id === this.client.options.owner;
	}

	async run(message, script) {
		if(!script) throw new CommandFormatError(this, message.guild);

		// Make a bunch of helpers
		/* eslint-disable no-unused-vars */
		const msg = message;
		const client = message.client;
		const objects = this.objects;
		const doReply = val => {
			if(val instanceof Error) {
				message.reply(`Callback error: \`${val}\``);
			} else {
				const result = this.makeResultMessages(val, process.hrtime(this.hrStart));
				if(Array.isArray(result)) {
					for(const item of result) {
						if(this.client.options.selfbot) message.say(item); else message.reply(item);
					}
				} else if(this.client.options.selfbot) {
					message.say(result);
				} else {
					message.reply(result);
				}
			}
		};
		/* eslint-enable no-unused-vars */

		// Run the code and measure its execution time
		let hrDiff;
		try {
			const hrStart = process.hrtime();
			this.lastResult = eval(script);
			hrDiff = process.hrtime(hrStart);
		} catch(err) {
			return `Error while evaluating: \`${err}\``;
		}

		// Prepare for callback time and respond
		this.hrStart = process.hrtime();
		let response = this.makeResultMessages(this.lastResult, hrDiff, script, message.editable);
		if(message.editable) {
			if(response instanceof Array) {
				if(response.length > 0) response = response.slice(1, response.length - 1);
				for(const re of response) message.say(re);
				return null;
			} else {
				return message.edit(response);
			}
		} else {
			return message.reply(response);
		}
	}

	makeResultMessages(result, hrDiff, input = null, editable = false) {
		const inspected = util.inspect(result, { depth: 0 })
			.replace(nlPattern, '\n')
			.replace(this.sensitivePattern, '--snip--');
		const split = inspected.split('\n');
		const last = inspected.length - 1;
		const prependPart = inspected[0] !== '{' && inspected[0] !== '[' && inspected[0] !== "'" ? split[0] : inspected[0];
		const appendPart = inspected[last] !== '}' && inspected[last] !== ']' && inspected[last] !== "'" ?
			split[split.length - 1] :
			inspected[last];
		const prepend = `\`\`\`javascript\n${prependPart}\n`;
		const append = `\n${appendPart}\n\`\`\``;
		if(input) {
			return discord.splitMessage(tags.stripIndents`
				${editable ? `
					*Input*
					\`\`\`javascript
					${input}
					\`\`\`` :
				''}
				*Executed in ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.*
				\`\`\`javascript
				${inspected}
				\`\`\`
			`, 1900, '\n', prepend, append);
		} else {
			return discord.splitMessage(tags.stripIndents`
				*Callback executed after ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.*
				\`\`\`javascript
				${inspected}
				\`\`\`
			`, 1900, '\n', prepend, append);
		}
	}

	get sensitivePattern() {
		if(!this._sensitivePattern) {
			const client = this.client;
			let pattern = '';
			if(client.token) pattern += escapeRegex(client.token);
			if(client.email) pattern += (pattern.length > 0 ? '|' : '') + escapeRegex(client.email);
			if(client.password) pattern += (pattern.length > 0 ? '|' : '') + escapeRegex(client.password);
			this._sensitivePattern = new RegExp(pattern, 'gi');
		}
		return this._sensitivePattern;
	}
};

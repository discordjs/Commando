const escapeMarkdown = require('discord.js').escapeMarkdown;
const { oneLine, stripIndents } = require('common-tags');
const disambiguation = require('./util').disambiguation;

const types = ['string', 'integer', 'float', 'boolean', 'user', 'member', 'role', 'channel'];

/** A fancy argument for a command */
class CommandArgument {
	/**
	 * @typedef {Object} CommandArgumentInfo
	 * @property {string} key - Key for the argument
	 * @property {string} [label=key] - Label for the argument
	 * @property {string} prompt - First prompt for the argument when it wasn't specified
	 * @property {string} [type] - Type of the argument
	 * ('string', 'integer', 'float', 'user', 'member', 'role', or 'channel')
	 * @property {boolean} [infinite=false] - Whether the argument accepts infinite values
	 * @property {ArgumentValidator} [validate] - Validator function for the argument
	 * @property {ArgumentParser} [parse] - Parser function for the argument
	 * @property {number} [wait=30] - How long to wait for input (in seconds)
	 */

	/**
	 * Function that validates an input value string
	 * @typedef {function} ArgumentValidator
	 * @param {string} value - Value to check for validity
	 * @return {Promise<boolean|string>|boolean|string} If a string is returned, it is considered to be the error message
	 * for the validation.
	 */

	/**
	 * Function that parses an input value string into a proper value for the argument
	 * @typedef {function} ArgumentParser
	 * @param {string} value - Value to parse
	 * @return {Promise<*>|*}
	 */

	/**
	 * @param {Command} command - Command the argument is for
	 * @param {CommandArgumentInfo} info - Information for the command argument
	 */
	constructor(command, info) {
		if(!command) throw new Error('The command must be specified.');
		if(!info) throw new Error('The command argument info must be specified.');
		if(typeof info.key !== 'string') throw new TypeError('Command argument key must be a string.');
		if(info.label && typeof info.label !== 'string') throw new TypeError('Command argument label must be a string.');
		if(typeof info.prompt !== 'string') throw new TypeError('Command argument prompt must be a string.');
		if(!info.type && !info.validate) {
			throw new Error('Command argument must have either "type" or "validate" specified.');
		}
		if(info.type && !types.includes(info.type)) {
			throw new RangeError('Command argument type must be one of "string", "integer", "float", or "boolean".');
		}
		if(info.validate && typeof info.validate !== 'function') {
			throw new TypeError('Command argument validate must be a function.');
		}
		if(info.parse && typeof info.parse !== 'function') {
			throw new TypeError('Command argument parse must be a function.');
		}
		if(!info.type && (!info.validate || !info.parse)) {
			throw new Error('Command argument must have both validate and parse since it doesn\'t have a type.');
		}
		if(typeof info.wait !== 'undefined' && (typeof info.wait !== 'number' || Number.isNaN(info.wait))) {
			throw new TypeError('Command argument wait must be a number.');
		}

		/**
		 * Command the argument is for
		 * @type {Command}
		 */
		this.command = command;

		/**
		 * Key for the argument
		 * @type {string}
		 */
		this.key = info.key;

		/**
		 * Label for the argument
		 * @type {string}
		 */
		this.label = info.label || info.key;

		/**
		 * Question prompt for the argument
		 * @type {string}
		 */
		this.prompt = info.prompt;

		/**
		 * Type of the argument ('string', 'integer', 'float', 'boolean', 'user', 'member', 'role', or 'channel')
		 * @type {?string}
		 */
		this.type = info.type || null;

		/**
		 * Whether the argument accepts infinite values
		 * @type {boolean}
		 */
		this.infinite = Boolean(info.infinite);

		/**
		 * Validator function for validating a value for the argument
		 * @type {ArgumentValidator}
		 */
		this.validator = info.validate || null;

		/**
		 * Parser function for parsing a value for the argument
		 * @type {ArgumentParser}
		 */
		this.parser = info.parse || null;

		/**
		 * How long to wait for input (in seconds)
		 * @type {number}
		 */
		this.wait = typeof info.wait !== 'undefined' ? info.wait : 30;
	}

	/**
	 * Prompts the user and obtains the value for the argument
	 * @param {Message} msg - Message that triggered the command
	 * @param {string} [value] - Pre-provided value for the argument
	 * @return {Promise<?*>}
	 */
	async obtain(msg, value) {
		if(this.infinite) return this.obtainInfinite(msg, value);
		const wait = this.wait > 0 && this.wait !== Infinity ? this.wait * 1000 : undefined;
		let valid = value ? await this.validate(value, msg) : false;
		while(!valid || typeof valid === 'string') {
			await msg.reply(stripIndents`
				${!value ? this.prompt : valid ? valid : `You provided an invalid ${this.label}. Please try again.`}
				${oneLine`
					Respond with \`cancel\` to cancel the command.
					${wait ? `The command will automatically be cancelled in ${this.wait} seconds.` : ''}
				`}
			`);
			const responses = await msg.channel.awaitMessages(msg2 => msg2.author.id === msg.author.id, {
				maxMatches: 1,
				time: wait
			});
			if(responses && responses.size === 1) value = responses.first().content; else return null;
			if(value.toLowerCase() === 'cancel') return null;
			valid = await this.validate(value, msg);
		}
		return this.parse(value, msg);
	}

	/**
	 * Prompts the user and obtains multiple values for the argument
	 * @param {Message} msg - Message that triggered the command
	 * @param {string[]} [values] - Pre-provided values for the argument
	 * @return {Promise<?Array<*>>}
	 */
	async obtainInfinite(msg, values) {
		const results = [];
		let currentVal = 0;
		const wait = this.wait > 0 && this.wait !== Infinity ? this.wait * 1000 : undefined;
		while(true) { // eslint-disable-line no-constant-condition
			let value = values && values[currentVal] ? values[currentVal] : null;
			let valid = value ? await this.validate(value) : false;

			while(!valid || typeof valid === 'string') {
				if(value) {
					const escaped = escapeMarkdown(value).replace(/@/g, '@\u200b');
					await msg.reply(stripIndents`
						${valid ? valid : oneLine`
							You provided an invalid ${this.label},
							"${escaped.length < 1850 ? escaped : '[too long]'}".
							Please try again.
						`}
						${oneLine`
							Respond with \`cancel\` to cancel the command, or \`finish\` to finish entry up to this point.
							${wait ? `The command will automatically be cancelled in ${this.wait} seconds.` : ''}
						`}
					`);
				} else if(results.length === 0) {
					await msg.reply(stripIndents`
						${this.prompt}
						${oneLine`
							Respond with \`cancel\` to cancel the command, or \`finish\` to finish entry.
							${wait ? `The command will automatically be cancelled in ${this.wait} seconds, unless you respond.` : ''}
						`}
					`);
				}

				const responses = await msg.channel.awaitMessages(msg2 => msg2.author.id === msg.author.id, {
					maxMatches: 1,
					time: wait
				});
				if(responses && responses.size === 1) value = responses.first().content; else return null;
				const lc = value.toLowerCase();
				if(lc === 'cancel') return null;
				if(lc === 'finish') return results.length > 0 ? results : null;
				valid = await this.validate(value, msg);
			}

			results.push(await this.parse(value, msg));

			if(values) {
				currentVal++;
				if(currentVal === values.length) return results;
			}
		}
	}

	/**
	 * Checks if a value is valid for the argument
	 * @param {string} value - Value to check
	 * @param {Message} msg - Message that triggered the command
	 * @return {Promise<boolean|string>}
	 */
	async validate(value, msg) {
		if(this.validator) return this.validator(value);
		switch(this.type) {
			case 'string':
				return Boolean(value);
			case 'integer':
				return !Number.isNaN(Number.parseInt(value));
			case 'float':
				return !Number.isNaN(Number.parseFloat(value));
			case 'boolean':
				return ['true', 'false', 'yes', 'no', 'on', 'off'].includes(value.toLowerCase());
			case 'user':
				return this.constructor.validateUser(value, msg);
			case 'member':
				return this.constructor.validateMember(value, msg);
			case 'role':
				return this.constructor.validateRole(value, msg);
			case 'channel':
				return this.constructor.validateChannel(value, msg);
			default:
				throw new RangeError('Unknown command argument type.');
		}
	}

	/**
	 * Parses a value string into a proper value for the argument
	 * @param {string} value - Value to parse
	 * @param {Message} msg - Message that triggered the command
	 * @return {Promise<*>}
	 */
	async parse(value, msg) {
		if(this.parser) return this.parser(value);
		switch(this.type) {
			case 'string':
				return String(value);
			case 'integer':
				return Number.parseInt(value);
			case 'float':
				return Number.parseFloat(value);
			case 'boolean':
				if(['true', 'yes', 'on'].includes(value.toLowerCase())) return true;
				if(['false', 'no', 'off'].includes(value.toLowerCase())) return false;
				throw new RangeError('Unknown boolean value.');
			case 'user':
				return this.constructor.parseUser(value, msg);
			case 'member':
				return this.constructor.parseMember(value, msg);
			case 'role':
				return this.constructor.parseRole(value, msg);
			case 'channel':
				return this.constructor.parseChannel(value, msg);
			default:
				throw new RangeError('Unknown command argument type.');
		}
	}

	static async validateUser(value, msg) {
		const matches = value.match(/^(?:<@!?)?([0-9]+)>?$/);
		if(matches) {
			try {
				return await msg.client.fetchUser(matches[1]);
			} catch(err) {
				return false;
			}
		}
		if(!msg.guild) return false;
		const search = value.toLowerCase();
		let members = msg.guild.members.filterArray(memberFilterInexact(search));
		if(members.length === 0) return false;
		if(members.length === 1) return true;
		const exactMembers = members.filter(memberFilterExact(search));
		if(exactMembers.length === 1) return true;
		if(exactMembers.length > 0) members = exactMembers;
		return members.length <= 15 ?
			`${disambiguation(
				members.map(mem => `${escapeMarkdown(mem.user.username)}#${mem.user.discriminator}`), 'users', null
			)}\n` :
			'Multiple users found. Please be more specific.';
	}

	static parseUser(value, msg) {
		const matches = value.match(/^(?:<@!?)?([0-9]+)>?$/);
		if(matches) return msg.client.users.get(matches[1]) || null;
		if(!msg.guild) return null;
		const search = value.toLowerCase();
		const members = msg.guild.members.filterArray(memberFilterInexact(search));
		if(members.length === 0) return null;
		if(members.length === 1) return members[0].user;
		const exactMembers = members.filter(memberFilterExact(search));
		if(exactMembers.length === 1) return members[0].user;
		return null;
	}

	static async validateMember(value, msg) {
		const matches = value.match(/^(?:<@!?)?([0-9]+)>?$/);
		if(matches) {
			try {
				return await msg.guild.fetchMember(await msg.client.fetchUser(matches[1]));
			} catch(err) {
				return false;
			}
		}
		const search = value.toLowerCase();
		let members = msg.guild.members.filterArray(memberFilterInexact(search));
		if(members.length === 0) return false;
		if(members.length === 1) return members[0];
		const exactMembers = members.filter(memberFilterExact(search));
		if(exactMembers.length === 1) return members[0];
		if(exactMembers.length > 0) members = exactMembers;
		return members.length <= 15 ?
			`${disambiguation(
				members.map(mem => `${escapeMarkdown(mem.user.username)}#${mem.user.discriminator}`), 'users', null
			)}\n` :
			'Multiple users found. Please be more specific.';
	}

	static parseMember(value, msg) {
		const matches = value.match(/^(?:<@!?)?([0-9]+)>?$/);
		if(matches) return msg.guild.member(matches[1]) || null;
		const search = value.toLowerCase();
		const members = msg.guild.members.filterArray(memberFilterInexact(search));
		if(members.length === 0) return null;
		if(members.length === 1) return members[0];
		const exactMembers = members.filter(memberFilterExact(search));
		if(exactMembers.length === 1) return members[0];
		return null;
	}

	static validateRole(value, msg) {
		const matches = value.match(/^(?:<@&)?([0-9]+)>?$/);
		if(matches) return msg.guild.roles.has(matches[1]);
		const search = value.toLowerCase();
		let roles = msg.guild.roles.filterArray(nameFilterInexact(search));
		if(roles.length === 0) return false;
		if(roles.length === 1) return true;
		const exactRoles = roles.filter(nameFilterExact(search));
		if(exactRoles.length === 1) return true;
		if(exactRoles.length > 0) roles = exactRoles;
		return `${disambiguation(roles.map(role => `${escapeMarkdown(role.name)}`), 'roles', null)}\n`;
	}

	static parseRole(value, msg) {
		const matches = value.match(/^(?:<@&)?([0-9]+)>?$/);
		if(matches) return msg.guild.roles.get(matches[1]) || null;
		const search = value.toLowerCase();
		const roles = msg.guild.roles.filterArray(nameFilterInexact(search));
		if(roles.length === 0) return null;
		if(roles.length === 1) return roles[0];
		const exactRoles = roles.filter(nameFilterExact(search));
		if(exactRoles.length === 1) return roles[0];
		return null;
	}

	static validateChannel(value, msg) {
		const matches = value.match(/^(?:<#)?([0-9]+)>?$/);
		if(matches) return msg.guild.channels.has(matches[1]);
		const search = value.toLowerCase();
		let channels = msg.guild.channels.filterArray(nameFilterInexact(search));
		if(channels.length === 0) return false;
		if(channels.length === 1) return true;
		const exactChannels = channels.filter(nameFilterExact(search));
		if(exactChannels.length === 1) return true;
		if(exactChannels.length > 0) channels = exactChannels;
		return `${disambiguation(channels.map(chan => escapeMarkdown(chan.name)), 'channels', null)}\n`;
	}

	static parseChannel(value, msg) {
		const matches = value.match(/^(?:<#)?([0-9]+)>?$/);
		if(matches) return msg.guild.channels.get(matches[1]) || null;
		const search = value.toLowerCase();
		const channels = msg.guild.channels.filterArray(nameFilterInexact(search));
		if(channels.length === 0) return null;
		if(channels.length === 1) return channels[0];
		const exactChannels = channels.filter(nameFilterExact(search));
		if(exactChannels.length === 1) return channels[0];
		return null;
	}
}

function memberFilterExact(search) {
	return mem => mem.user.username.toLowerCase() === search ||
		(mem.nickname && mem.nickname.toLowerCase() === search) ||
		`${mem.user.username.toLowerCase()}#${mem.user.discriminator}` === search;
}

function memberFilterInexact(search) {
	return mem => mem.user.username.toLowerCase().includes(search) ||
		(mem.nickname && mem.nickname.toLowerCase().includes(search)) ||
		`${mem.user.username.toLowerCase()}#${mem.user.discriminator}`.includes(search);
}

function nameFilterExact(search) {
	return thing => thing.name.toLowerCase() === search;
}

function nameFilterInexact(search) {
	return thing => thing.name.toLowerCase().includes(search);
}

module.exports = CommandArgument;

const Command = require('../Command');

/**
 * Additional methods added to Guild objects
 * @interface
 */
module.exports = class GuildExtension {
	get commandPrefix() {
		return this._commandPrefix ? this._commandPrefix : this.client.options.commandPrefix;
	}

	set commandPrefix(prefix) {
		if(prefix === this.client.options.commandPrefix) this._commandPrefix = null;
		else this._commandPrefix = prefix;
		this.client.emit('commandPrefixChange', this, this._commandPrefix);
	}

	setCommandEnabled(command, enabled) {
		command = this.client.registry.resolveCommand(command);
		if(typeof enabled !== 'boolean') throw new TypeError('Enabled must be a boolean.');
		if(command.guarded) throw new Error('The command is guarded.');
		if(!this._commandsEnabled) this._commandsEnabled = {};
		this._commandsEnabled[command.name] = enabled;
		this.client.emit('commandStatusChange', this, command, enabled);
	}

	isCommandEnabled(command) {
		command = this.client.registry.resolveCommand(command);
		if(command.guarded) return true;
		if(!this._commandsEnabled || typeof this._commandsEnabled[command] === 'undefined') return true;
		return this._commandsEnabled[command.name];
	}

	setGroupEnabled(group, enabled) {
		group = this.client.registry.resolveGroup(group);
		if(typeof enabled !== 'boolean') throw new TypeError('Enabled must be a boolean.');
		if(group.guarded) throw new Error('The group is guarded.');
		if(!this._groupsEnabled) this._groupsEnabled = {};
		this._groupsEnabled[group.name] = enabled;
		this.client.emit('groupStatusChange', this, group, enabled);
	}

	isGroupEnabled(group) {
		group = this.client.registry.resolveGroup(group);
		if(group.guarded) return true;
		if(!this._groupsEnabled || typeof this._groupsEnabled[group] === 'undefined') return true;
		return this._groupsEnabled[group];
	}

	commandUsage(command, onlyMention = false) {
		return Command.usage(this.client, command, this, onlyMention);
	}

	static applyToClass(target) {
		for(const prop of [
			'commandPrefix',
			'setCommandEnabled',
			'isCommandEnabled',
			'setGroupEnabled',
			'isGroupEnabled',
			'commandUsage'
		]) {
			Object.defineProperty(target.prototype, prop, Object.getOwnPropertyDescriptor(this.prototype, prop));
		}
	}
};

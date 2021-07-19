const Command = require('../commands/base');
const GuildSettingsHelper = require('../providers/helper');

	/**
	 * A fancier Guild for fancier people.
	 * @extends Guild
	 */

module.exports = Discord => {

	/**
	 * Sets whether a command is enabled in the guild
	 * @param {CommandResolvable} command - Command to set status of
	 * @param {boolean} enabled - Whether the command should be enabled
	 */

	Discord.Guild.prototype.setCommandEnabled = function (command, enabled) {
		command = this.client.registry.resolveCommand(command);
		if (command.guarded) throw new Error('The command is guarded.');
		if (typeof enabled === 'undefined') throw new TypeError('Enabled must not be undefined.');
		enabled = Boolean(enabled);
		if (!this._commandsEnabled) {
			/**
			 * Map object of internal command statuses, mapped by command name
			 * @type {Object}
			 * @private
			 */
			this._commandsEnabled = {};
		}
		this._commandsEnabled[command.name] = enabled;
		/**
		 * Emitted whenever a command is enabled/disabled in a guild
		 * @event CommandoClient#commandStatusChange
		 * @param {?CommandoGuild} guild - Guild that the command was enabled/disabled in (null for global)
		 * @param {Command} command - Command that was enabled/disabled
		 * @param {boolean} enabled - Whether the command is enabled
		 */
		this.client.emit('commandStatusChange', this, command, enabled);
	}

	/**
 * Checks whether a command is enabled in the guild (does not take the command's group status into account)
 * @param {CommandResolvable} command - Command to check status of
 * @return {boolean}
 */
	Discord.Guild.prototype.isCommandEnabled = function (command) {
		command = this.client.registry.resolveCommand(command);
		if (command.guarded) return true;
		if (!this._commandsEnabled || typeof this._commandsEnabled[command.name] === 'undefined') {
			return command._globalEnabled;
		}
		return this._commandsEnabled[command.name];
	}


	/**
	 * Sets whether a command group is enabled in the guild
	 * @param {CommandGroupResolvable} group - Group to set status of
	 * @param {boolean} enabled - Whether the group should be enabled
	 */
	Discord.Guild.prototype.setGroupEnabled = function (group, enabled) {
		group = this.client.registry.resolveGroup(group);
		if (group.guarded) throw new Error('The group is guarded.');
		if (typeof enabled === 'undefined') throw new TypeError('Enabled must not be undefined.');
		enabled = Boolean(enabled);
		if (!this._groupsEnabled) {
			/**
			 * Internal map object of group statuses, mapped by group ID
			 * @type {Object}
			 * @private
			 */
			this._groupsEnabled = {};
		}
		this._groupsEnabled[group.id] = enabled;
		/**
 * Emitted whenever a command group is enabled/disabled in a guild
 * @event CommandoClient#groupStatusChange
 * @param {?CommandoGuild} guild - Guild that the group was enabled/disabled in (null for global)
 * @param {CommandGroup} group - Group that was enabled/disabled
 * @param {boolean} enabled - Whether the group is enabled
 */
		this.client.emit('groupStatusChange', this, group, enabled);
	}


	/**
	 * Checks whether a command group is enabled in the guild
	 * @param {CommandGroupResolvable} group - Group to check status of
	 * @return {boolean}
	 */
	Discord.Guild.prototype.isGroupEnabled = function (group) {
		group = this.client.registry.resolveGroup(group);
		if (group.guarded) return true;
		if (!this._groupsEnabled || typeof this._groupsEnabled[group.id] === 'undefined') return group._globalEnabled;
		return this._groupsEnabled[group.id];
	}


	/**
	 * Creates a command usage string using the guild's prefix
	 * @param {string} [command] - A command + arg string
	 * @param {User} [user=this.client.user] - User to use for the mention command format
	 * @return {string}
	 */
	Discord.Guild.prototype.commandUsage = function (command, user = this.client.user) {
		return Command.usage(command, this.commandPrefix, user);
	}

	/**
	 * Command prefix in the guild. An empty string indicates that there is no prefix, and only mentions will be used.
	 * Setting to `null` means that the prefix from {@link CommandoClient#commandPrefix} will be used instead.
	 * @type {string}
	 * @emits {@link CommandoClient#commandPrefixChange}
	 */

	Object.defineProperty(Discord.Guild.prototype, "commandPrefix", {


		get: function commandPrefix() {
			if (!this._commandPrefix || this._commandPrefix === null) {
				this._commandPrefix = null;
				return this.client.commandPrefix;
			}
			return this._commandPrefix;
		},

		set: function commandPrefix(prefix) {
			this._commandPrefix = prefix;

			/**
		 * Emitted whenever a guild's command prefix is changed
		 * @event CommandoClient#commandPrefixChange
		 * @param {?CommandoGuild} guild - Guild that the prefix was changed in (null for global)
		 * @param {?string} prefix - New command prefix (null for default)
		 */
			this.client.emit('commandPrefixChange', this, this._commandPrefix);
		}
	});

			/**
			 * Shortcut to use setting provider methods for this guild
			 * @type {GuildSettingsHelper}
			 */

	Object.defineProperty(Discord.Guild.prototype, "settings", {
		get: function () {
			if (!this._settings || this._settings == null) {
				this._settings = new GuildSettingsHelper(this.client, this);
			}
			return this._settings
		}
	});



}
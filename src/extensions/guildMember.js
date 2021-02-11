const Discord = require('discord.js');

module.exports = Discord.Structures.extend('GuildMember', GuildMember => {
	class CommandoGuildMember extends GuildMember {
		/**
		 *
		 * @param {Discord.Role} role - Role to check
		 * @returns {boolean}
		 */
		hasRole(role) {
			if(role instanceof Discord.GuildMember) {
				if(role.guild !== this.guild) return undefined;
				role = role.id;
			} else if(typeof role === 'string') {
				return this.roles.cache.find(ro => ro.id === role) !== undefined;
			}

			throw new TypeError('Role must be of type Role or Snowflake');
		}
	}

	return CommandoGuildMember;
});

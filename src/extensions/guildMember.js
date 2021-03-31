const Discord = require('discord.js');

module.exports = Discord.Structures.extend('GuildMember', GuildMember => {
	class CommandoGuildMember extends GuildMember {
		/**
		 *
		 * @param {Discord.Role} role - Role to check
		 * @returns {boolean}
		 */
		hasRole(role) {
			if(role instanceof Discord.Role) {
				if(this.guild.id !== role.guild.id) return false;
				return this.roles.cache.has(role.id);
			} else if(typeof role === 'string' && /^[0-9]+$/.test(role)) {
				return this.roles.cache.has(role);
			}

			throw new TypeError('Role must be of type Role or Snowflake');
		}
	}

	return CommandoGuildMember;
});

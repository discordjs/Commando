/* eslint-disable no-useless-escape */
const tags = require('common-tags');
const { applyExtensionsLater } = require('../util.js');

exports.name = 'en';

exports.TEMPLATE = {
	beMoreSpecific: 'Please be more specific.',

	onAllShards: ' on all shards',
	enabled: 'Enabled',
	disabled: 'Disabled',

	onlyOwner: 'Only the bot owner(s) may use this command.',
	onlyAdministrator: 'Only administrators may use this command.',

	labelCommandGroup: 'command/group'
};

exports.util = {
	disambiguation: applyExtensionsLater('Multiple {{label}} found, please be more specific: {{itemList}}'),
	permissions: {
		ADMINISTRATOR: 'Administrator',
		VIEW_AUDIT_LOG: 'View audit log',
		MANAGE_GUILD: 'Manage server',
		MANAGE_ROLES: 'Manage roles',
		MANAGE_CHANNELS: 'Manage channels',
		KICK_MEMBERS: 'Kick members',
		BAN_MEMBERS: 'Ban members',
		CREATE_INSTANT_INVITE: 'Create instant invite',
		CHANGE_NICKNAME: 'Change nickname',
		MANAGE_NICKNAMES: 'Manage nicknames',
		MANAGE_EMOJIS: 'Manage emojis',
		MANAGE_WEBHOOKS: 'Manage webhooks',
		VIEW_CHANNEL: 'View channels',
		SEND_MESSAGES: 'Send messages',
		SEND_TTS_MESSAGES: 'Send TTS messages',
		MANAGE_MESSAGES: 'Manage messages',
		EMBED_LINKS: 'Embed links',
		ATTACH_FILES: 'Attach files',
		READ_MESSAGE_HISTORY: 'Read message history',
		MENTION_EVERYONE: 'Mention everyone',
		USE_EXTERNAL_EMOJIS: 'Use external emojis',
		ADD_REACTIONS: 'Add reactions',
		CONNECT: 'Connect',
		SPEAK: 'Speak',
		MUTE_MEMBERS: 'Mute members',
		DEAFEN_MEMBERS: 'Deafen members',
		MOVE_MEMBERS: 'Move members',
		USE_VAD: 'Use voice activity',
		PRIORITY_SPEAKER: 'Priority speaker',
		VIEW_GUILD_INSIGHTS: 'View server insights',
		STREAM: 'Video'
	}
};

exports.client = {
};

exports.dispatcher = {
	commandDisabled: applyExtensionsLater('The \`{{command}}\` command is disabled.')
};

exports.registry = {
	groups: {
		commands: {
			name: 'Commands'
		},
		util: {
			name: 'Utility'
		}
	}
};

exports.errors = {
	commandFormat: {
		message: applyExtensionsLater(tags.oneLine`
            Invalid command usage.
            The \`{{command}}\` command's accepted format is: {{usage}}.
            Use {{help}} for more information
        `)
	}
};

exports.types = {
	enterOne: applyExtensionsLater('Please enter one of the following options: {{list}}'),
	enterAbove: applyExtensionsLater('Please enter a number above or exactly {{min}}'),
	enterBelow: applyExtensionsLater('Please enter a number below or exactly {{max}}'),

	boolean: {
		truthy: ['true', 't', 'yes', 'y', 'on', 'enable', 'enabled'],
		falsy: ['false', 'f', 'no', 'n', 'off', 'disable', 'disabled']
	},
	categoryChannel: {
		multipleFound: `Multiple categories found. ${exports.TEMPLATE.beMoreSpecific}`,
		disambiguation: 'categories'
	},
	channel: {
		multipleFound: `Multiple channels found. ${exports.TEMPLATE.beMoreSpecific}`,
		disambiguation: 'channels'
	},
	command: {
		multipleFound: `Multiple commands found. ${exports.TEMPLATE.beMoreSpecific}`,
		disambiguation: 'commands'
	},
	customEmoji: {
		multipleFound: `Multiple emojis found. ${exports.TEMPLATE.beMoreSpecific}`,
		disambiguation: 'emojis'
	},
	defaultEmoji: {
	},
	group: {
		multipleFound: `Multiple groups found. ${exports.TEMPLATE.beMoreSpecific}`,
		disambiguation: 'groups'
	},
	member: {
		multipleFound: `Multiple members found. ${exports.TEMPLATE.beMoreSpecific}`,
		disambiguation: 'members'
	},
	role: {
		multipleFound: `Multiple roles found. ${exports.TEMPLATE.beMoreSpecific}`,
		disambiguation: 'roles'
	},
	string: {
		lengthEnterAbove: applyExtensionsLater('Please keep the {{label}} above or exactly {{min}} characters.'),
		lengthEnterBelow: applyExtensionsLater('Please keep the {{label}} below or exactly {{max}} characters.')
	},
	textChannel: {
		multipleFound: `Multiple text channels found. ${exports.TEMPLATE.beMoreSpecific}`,
		disambiguation: 'text channels'
	},
	union: {
		typeNotRegistered: applyExtensionsLater('Argument type "{{typeID}}" is not registered.'),
		couldntParse: applyExtensionsLater('Couldn\'t parse value \"{{val}}\" with union type {{this_id}}.')
	},
	user: {
		multipleFound: `Multiple users found. ${exports.TEMPLATE.beMoreSpecific}`,
		disambiguation: 'users'
	},
	voiceChannel: {
		multipleFound: `Multiple voice channels found. ${exports.TEMPLATE.beMoreSpecific}`,
		disambiguation: 'voice channels'
	}
};

exports.extensions = {
	guild: {

	},
	message: {
		cancelledCommand: 'Cancelled command.'
	}
};

exports.commands = {
	commands: {
		disable: {
			constructor: {
				description: 'Disables a command or command group.',
				details: tags.oneLine`
                    The argument must be the name/ID (partial or whole) of a command or command group.
                    ${exports.TEMPLATE.onlyAdministrator}
			    `,
				args: [
					{
						label: exports.TEMPLATE.labelCommandGroup,
						prompt: 'Which command or group would you like to disable?'
					}
				]
			},
			run: {
				commandAlreadyDisabled: applyExtensionsLater('The \`{{name}}\` command is already disabled.'),
				groupAlreadyDisabled: applyExtensionsLater('The \`{{name}}\` group is already disabled.'),
				commandGuarded: applyExtensionsLater('You cannot disable the \`{{name}}\` command.'),
				groupGuarded: applyExtensionsLater('You cannot disable the \`{{name}}\` group.'),
				commandSuccess: applyExtensionsLater('Disabled the \`{{name}}\` command.'),
				groupSuccess: applyExtensionsLater('Disabled the \`{{name}}\` group.')
			}
		},
		enable: {
			constructor: {
				description: 'Enables a command or command group.',
				details: tags.oneLine`
                    The argument must be the name/ID (partial or whole) of a command or command group.
                    ${exports.TEMPLATE.onlyAdministrator}
			    `,
				args: [
					{
						label: exports.TEMPLATE.labelCommandGroup,
						prompt: 'Which command or group would you like to enable?'
					}
				]
			},
			run: {
				commandAlreadyEnabled: applyExtensionsLater('The \`{{name}}\` command is already enabled{{but}}.'),
				groupAlreadyEnabled: applyExtensionsLater('The \`{{name}}\` group is already enabled.'),
				commandSuccess: applyExtensionsLater('Enabled the \`{{name}}\` command{{but}}.'),
				groupSuccess: applyExtensionsLater('Enabled the \`{{name}}\` group.'),
				groupDisabled: applyExtensionsLater(' but the \`{{group}}\` group is disabled, so it still can\'t be used')
			}
		},
		groups: {
			constructor: {
				description: 'Lists all command groups.',
				details: exports.TEMPLATE.onlyAdministrator
			},
			run: {
				success: applyExtensionsLater('__**Groups**__\n{{groups}}')
			}
		},
		load: {
			constructor: {
				description: 'Loads a new command.',
				details: tags.oneLine`
                    The argument must be full name of the command in the format of \`group:memberName\`. 
                    ${exports.TEMPLATE.onlyOwner}
                `,
				args: [
					{
						prompt: 'Which command would you like to load?',
						validate: {
							alreadyRegistered: 'That command is already registered.'
						}
					}
				]
			},
			run: {
				errorShards: applyExtensionsLater('Loaded \`{{command}}\` command, but failed to load on other shards.'),
				success: applyExtensionsLater('Loaded \`{{command}}\` command{{where}}.')
			}
		},
		reload: {
			constructor: {
				description: 'Reloads a command or command group.',
				details: applyExtensionsLater(tags.oneLine`
                    The argument must be the name/ID (partial or whole) of a command or command group. 
                    Providing a command group will reload all of the commands in that group. 
                    ${exports.TEMPLATE.onlyOwner}
                `),
				args: [
					{
						label: 'command/group',
						prompt: 'Which command or group would you like to reload?'
					}
				]
			},
			run: {
				commandErrorShards: applyExtensionsLater('Reloaded \`{{name}}\` command, but failed to reload on other shards.'),
				groupErrorShards: applyExtensionsLater('Reloaded all of the commands in the \`{{name}}\` group, but failed to reload on other shards.'),
				commandSuccess: applyExtensionsLater('Reloaded \`{{name}}\` command{{where}}.'),
				groupSuccess: applyExtensionsLater('Reloaded all of the commands in the \{{name}}\` group{{where}}.')
			}
		},
		unload: {
			constructor: {
				description: 'Unloads a command.',
				details: tags.oneLine`
                    The argument must be the name/ID (partial or whole) of a command. 
                    ${exports.TEMPLATE.onlyOwner}
                `,
				args: [
					{
						prompt: 'Which command would you like to unload?'
					}
				]
			},
			run: {
				errorShards: applyExtensionsLater('Unloaded \`{{name}}\` command, but failed to unload on other shards.'),
				success: applyExtensionsLater('Unloaded \`{{name}}\` command{{where}}.')
			}
		}
	},
	util: {
		eval: {
			constructor: {
				description: 'Executes JavaScript code.',
				details: exports.TEMPLATE.onlyOwner,
				args: [
					{
						prompt: 'What code would you like to evaluate?'
					}
				]
			},
			run: {
				error: applyExtensionsLater('Error while evaluating: \`{{err}}\`'),
				errorCallback: applyExtensionsLater('Callback error: \`{{val}}\`'),
				second: 's ',
				success: applyExtensionsLater(tags.stripIndents`
                    *Executed in {{sec}}{{ms}}ms.*
                    \`\`\`javascript
                    {{inspected}}
                    \`\`\`
                `),
				successCallback: applyExtensionsLater(tags.stripIndents`
                    *Callback executed after {{sec}}{{ms}}ms.*
                    \`\`\`javascript
                    {{inspected}}
                    \`\`\`
                `)
			}
		},
		help: {
			constructor: {
				description: 'Displays a list of available commands, or detailed information for a specified command.',
				details: tags.oneLine`
                    The command may be part of a command name or a whole command name.
                    If it isn't specified, all available commands will be listed.
			    `,
				args: [
					{
						prompt: 'Which command would you like to view the help for?'
					}
				]
			},
			run: {
				onlyServers: ' (Usable only in servers)',
				onlyDms: ' (Usable only in dms)',
				onlyNSFW: ' (NSFW)',
				show: applyExtensionsLater(tags.stripIndents`
                    ${tags.oneLine`
                        __Command **{{name}}**:__ {{description}}
						{{onlyServers}}
						{{onlyDms}}
                        {{onlyNSFW}}    
                    `}

                    **Format:** {{format}}
				`),
				disambiguation: 'commands',
				showAliases: applyExtensionsLater(`\n**Aliases:** {{aliases}}`),
				showGroup: applyExtensionsLater(`\n**Group:** {{group}} (\`{{groupID}}:{{memberName}}\`)`),
				showDetails: applyExtensionsLater(`\n**Details:** {{details}}`),
				showExamples: applyExtensionsLater(`\n**Examples:**\n{{examples}}`),
				success: 'Sent you a DM with information.',
				dmsDisabled: 'Unable to send you the help DM. You probably have DMs disabled.',
				multipleFound: exports.types.command.multipleFound,
				unableIdentify: applyExtensionsLater(`Unable to identify command. Use {{help}} to view the list of all commands`),
				anyServer: 'any server',
				allCommands: 'All commands',
				availableInGuild: applyExtensionsLater(`Available commands in {{guild}}`),
				availableInDM: 'Available commands in this DM',
				showAll: applyExtensionsLater(tags.stripIndents`
                    ${tags.oneLine`
                        To run a command in {{runWhere}},
                        use {{usage}}.
                        For example, {{example}}.
                    `}
                    To run a command in this DM, simply use {{usageDM}} with no prefix.

                    Use {{helpDetailed}} to view detailed information about a specific command.
                    Use {{helpAll}} to view a list of *all* commands, not just available ones.
                    
                    __**{{commandsWhere}}**__

                    {{commands}}
				`),
				showGroupCommands: tags.stripIndent`
					__{{name}}__
					{{commands}}
				`
			}
		},
		locale: {
			constructor: {
				description: 'Shows or sets the bot locale',
				details: tags.oneLine`
					If no locale is provided, the current locale will be shown.
					If the locale is "list", the list of available locales will be printed.
					Only administrators may change the locale.
				`,
				args: [
					{
						prompt: 'What would you like to the the bot\'s locale to?',
						validate: {
							invalidLocale: 'Invalid locale.'
						}
					}
				]
			},
			run: {
				listLocales: applyExtensionsLater('Available locales: {{locales}}'),
				localeIs: applyExtensionsLater('The locale is \`\`{{locale}}\`\`'),
				onlyAdministrator: 'Only administrators may change the locale.',
				success: applyExtensionsLater('Set the locale to \`\`{{locale}}\`\`.')
			}
		},
		ping: {
			constructor: {
				description: 'Checks the bot\'s ping to the Discord server.'
			},
			run: {
				pinging: 'Pinging...',
				success: applyExtensionsLater(tags.oneLine`
                    {{author}}
                    Pong! The mssage round-trip took {{ping}}ms.
                    {{heartbeat}}
                `),
				heartbeat: applyExtensionsLater('The heartbeat ping is {{ping}}ms.')
			}
		},
		prefix: {
			constructor: {
				description: 'Shows or sets the command prefix.',
				details: tags.oneLine`
					If no prefix is provided, the current prefix will be shown.
					If the prefix is "default", the prefix will be reset to the bot's default prefix.
					If the prefix is "none", the prefix will be removed entirely, only allowing mentions to run commands.
					Only administrators may change the prefix.
				`,
				args: [
					{
						prompt: 'What would you like to set the bot\'s prefix to?'
					}
				]
			},
			run: {
				prefixIs: applyExtensionsLater('The command prefix is \`\`{{prefix}}\`\`.'),
				prefixIsNone: 'There is no command prefix.',
				getPrefix: applyExtensionsLater('{{prefix}} To run commands, use {{command}}.'),
				onlyAdministrator: 'Only administrators may change the command prefix.',
				onlyOwner: 'Only the bot owner(s) may change the global command prefix.',
				noPrefix: 'no prefix',
				setDefault: applyExtensionsLater('Reset the command prefix to the default (currently {{prefix}}).'),
				setPrefix: applyExtensionsLater('Set the command prefix to \`\`{{prefix}}\`\`.'),
				removePrefix: 'Removed the command prefix entirely.',
				success: applyExtensionsLater('{{response}} To run commands, use {{command}}.')
			}
		},
		unknownCommand: {
			constructor: {
				description: 'Displays help information for when an unknown command is used.'
			},
			run: {
				success: applyExtensionsLater('Unknown command. Use {{help}} to view the command list.')
			}
		}
	},
	argument: {
		tooLongToShow: '[too long to show]',
		invalidValue: applyExtensionsLater('You provided an invalid {{type}}. Please try again.'),
		respondCancel: 'Respond with \`cancel\` to cancel the command.',
		autoCancel: applyExtensionsLater('The command will automatically be cancelled in {{wait}} seconds.'),
		invalidValueShow: applyExtensionsLater('You provided an invalid {{type}}, {{value}}. Please try again.'),
		respondCancelOrFinishNow: 'Respond with \`cancel\` to cancel the command, or \`finish\` to finish entry up to this point.',
		respondCancelOrFinish: 'Respond with \`cancel\` to cancel the command, or \`finish\` to finish entry.',
		autoCancelUnlessRespond: applyExtensionsLater('The command will automatically be cancelled in {{wait}} seconds, unless you respond.')
	},
	base: {
		or: 'or ',
		onlyOwner: applyExtensionsLater('The \`{{name}}` command can only be used by the bot owner.'),
		requiresPermission: applyExtensionsLater('The \`{{name}}\` command requires you to have the "{{permission}}" permission.'),
		requiresPermissions: applyExtensionsLater('The \`{{name}}\` command requires you to have the following permissions: {{permissions}}'),
		guildOnly: applyExtensionsLater('The \`{{name}}\` command must be used in a server channel.'),
		dnOnly: applyExtensionsLater('The \`{{name}}\` command must be used in a dm.'),
		nsfw: applyExtensionsLater('The \`{{name}}\` command can only be used in NSFW channels.'),
		noPermission: applyExtensionsLater('You do not have permission to use the \`{{name}}\` command.'),
		noClientPermission: applyExtensionsLater('I need the "{{permission}}" permission for the \`{{name}}\` command to work.'),
		noClientPermissions: applyExtensionsLater('I need the following permissions for the \`{{name}}\` command to work: {{permissions}}'),
		throttling: applyExtensionsLater('You may not use the \`{{name}}\` command again for another {{seconds}} seconds.'),
		theBotOwner: 'the bot owner',
		inThisServer: applyExtensionsLater(' in this server: {{invite}}'),
		unexpectedError: applyExtensionsLater(tags.stripIndent`
			An error occurred while running the command: \`{{errName}}: {{errMessage}}\`
			You shouldn't ever receive an error like this.
			Please contact {{who}}{{where}}
		`)
	},
	collector: {
	},
	group: {
	}
};

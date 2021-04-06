/* eslint-disable no-useless-escape */
const tags = require('common-tags');
const { applyExtensionsLater } = require('../util.js');

exports.name = 'ru';

exports.TEMPLATE = {
	beMoreSpecific: 'Пожалуйста, будьте более точны.',

	onAllShards: ' на всех осколках',
	enabled: 'Включено',
	disabled: 'Выключено',

	onlyOwner: 'Только владелец бота может выполнить данную команду.',
	onlyAdministrator: 'Только администратор может выполнить данную команду.',

	labelCommandGroup: 'команда/группа'
};

exports.util = {
	disambiguation: applyExtensionsLater('Найдено несколько {{label}}, пожалуйста, будьте более точны: {{itemList}}'),
	permissions: {
		ADMINISTRATOR: 'Администратор',
		VIEW_AUDIT_LOG: 'Просматривать журнал аудита',
		MANAGE_GUILD: 'Управлять сервером',
		MANAGE_ROLES: 'Управлять ролями',
		MANAGE_CHANNELS: 'Управлять каналами',
		KICK_MEMBERS: 'Выгонять участников',
		BAN_MEMBERS: 'Банить участников',
		CREATE_INSTANT_INVITE: 'Создание приглашения',
		CHANGE_NICKNAME: 'Изменить никнейм',
		MANAGE_NICKNAMES: 'Управлять никнеймами',
		MANAGE_EMOJIS: 'Управлять эмодзи',
		MANAGE_WEBHOOKS: 'Управлять вебхуками',
		VIEW_CHANNEL: 'Просматривать каналы',
		SEND_MESSAGES: 'Отправлять сообщения',
		SEND_TTS_MESSAGES: 'Отправка сообщений TTS',
		MANAGE_MESSAGES: 'Управлять сообщениями',
		EMBED_LINKS: 'Встраивать ссылки',
		ATTACH_FILES: 'Прикреплять файлы',
		READ_MESSAGE_HISTORY: 'Читать историю сообщений',
		MENTION_EVERYONE: 'Упоминание @everyone',
		USE_EXTERNAL_EMOJIS: 'Использовать внешние эмодзи',
		ADD_REACTIONS: 'Добавлять реакции',
		CONNECT: 'Подключаться',
		SPEAK: 'Говорить',
		MUTE_MEMBERS: 'Отключать участникам микрофон',
		DEAFEN_MEMBERS: 'Отключать участникам звук',
		MOVE_MEMBERS: 'Перемещать участников',
		USE_VAD: 'Использовать режим активации по голосу',
		PRIORITY_SPEAKER: 'Приоритетный режим',
		VIEW_GUILD_INSIGHTS: 'Просмотр аналитики сервера',
		STREAM: 'Видео'
	}
};

exports.client = {
};

exports.dispatcher = {
	commandDisabled: applyExtensionsLater('Команда \`{{command}}\` выключена.')
};

exports.registry = {
	groups: {
		commands: {
			name: 'Команды'
		},
		util: {
			name: 'Утилиты'
		}
	}
};

exports.errors = {
	commandFormat: {
		message: applyExtensionsLater(tags.oneLine`
            Неправильное использование команды.
            Формат команды \`{{command}}\` следующий: {{usage}}.
            Используйте {{help}} для большей информации.
        `)
	}
};

exports.types = {
	enterOne: applyExtensionsLater('Пожалуйста выберите один из следующих вариантов: {{list}}.'),
	enterAbove: applyExtensionsLater('Пожалуйста введите число не меньше {{min}}.'),
	enterBelow: applyExtensionsLater('Пожалуйста введите число не больше {{max}}.'),

	boolean: {
		truthy: ['true', 't', 'yes', 'y', 'on', 'enable', 'enabled', 'да', 'д'],
		falsy: ['false', 'f', 'no', 'n', 'off', 'disable', 'disabled', 'нет', 'н']
	},
	category: {
		multipleFound: `Найдено много катагорий. ${exports.TEMPLATE.beMoreSpecific}`,
		disambiguation: 'категории'
	},
	channel: {
		multipleFound: `Найдено много каналов. ${exports.TEMPLATE.beMoreSpecific}`,
		disambiguation: 'каналы'
	},
	command: {
		multipleFound: `Найдено много команд. ${exports.TEMPLATE.beMoreSpecific}`,
		disambiguation: 'команды'
	},
	customEmoji: {
		multipleFound: `Multiple emojis found. ${exports.TEMPLATE.beMoreSpecific}`,
		disambiguation: 'эмодзи'
	},
	defaultEmoji: {
	},
	group: {
		multipleFound: `Найдено много групп. ${exports.TEMPLATE.beMoreSpecific}`,
		disambiguation: 'группы'
	},
	member: {
		multipleFound: `Найдено много участников. ${exports.TEMPLATE.beMoreSpecific}`,
		disambiguation: 'участники'
	},
	message: {
		linkGuildInDm: `Нельзя использовать ссылку на сообщение сервера в лс`,
		linkGuildOther: `Нельзя использовать ссылку на сообщение другого сервера`,
		linkDmInGuild: `Нельзя использовать ссылку на сообщение лс в сервере`,
		linkDmOther: `Нельзя использовать ссылку на сообщение другого пользователя`
	},
	role: {
		multipleFound: `Найдено много ролей. ${exports.TEMPLATE.beMoreSpecific}`,
		disambiguation: 'роли'
	},
	string: {
		lengthEnterAbove: applyExtensionsLater('{{label}} должен быть не менее {{min}} символов.'),
		lengthEnterBelow: applyExtensionsLater('{{label}} должен быть не более {{max}} символов.')
	},
	textChannel: {
		multipleFound: `Найдено много текстовых каналов. ${exports.TEMPLATE.beMoreSpecific}`,
		disambiguation: 'текстовые каналы'
	},
	textableChannel: {
		multipleFound: `Найдено много текстовых каналов. ${exports.TEMPLATE.beMoreSpecific}`,
		disambiguation: 'текстовые каналы'
	},
	union: {
		typeNotRegistered: applyExtensionsLater('Аргумент типа "{{typeID}}" не зарегистрирован.'),
		couldntParse: applyExtensionsLater('Не удалось обработать значение \"{{val}}\" типа {{this_id}}.')
	},
	user: {
		multipleFound: `Найдено много пользователей. ${exports.TEMPLATE.beMoreSpecific}`,
		disambiguation: 'пользователи'
	},
	voiceChannel: {
		multipleFound: `Найдено много голосовых каналов. ${exports.TEMPLATE.beMoreSpecific}`,
		disambiguation: 'голосовые каналы'
	}
};

exports.extensions = {
	guild: {

	},
	message: {
		cancelledCommand: 'Команда отменена.'
	}
};

exports.commands = {
	commands: {
		disable: {
			constructor: {
				description: 'Выключает команду или группу команд.',
				details: tags.oneLine`
					Аргумент должен быть названием/ID (полным или частичным) команды или группы команд.
                    ${exports.TEMPLATE.onlyAdministrator}
			    `,
				args: {
					cmdOrGrp: {
						label: exports.TEMPLATE.labelCommandGroup,
						prompt: 'Какую команду вы бы хотели выключить?'
					}
				}
			},
			run: {
				commandAlreadyDisabled: applyExtensionsLater('Команда \`{{name}}\` уже выключена.'),
				groupAlreadyDisabled: applyExtensionsLater('Группа \`{{name}}\` уже выключена.'),
				commandGuarded: applyExtensionsLater('Вы не можете выключить команду \`{{name}}\`.'),
				groupGuarded: applyExtensionsLater('Вы не можете выключить группу \`{{name}}\`.'),
				commandSuccess: applyExtensionsLater('Команда \`{{name}}\` выключена.'),
				groupSuccess: applyExtensionsLater('Группа \`{{name}}\` выключена.')
			}
		},
		enable: {
			constructor: {
				description: 'Включает команду или группу команд.',
				details: tags.oneLine`
					Аргумент должен быть названием/ID (полным или частичным) команды или группы команд.
                    ${exports.TEMPLATE.onlyAdministrator}
			    `,
				args: {
					cmdOrGrp: {
						label: exports.TEMPLATE.labelCommandGroup,
						prompt: 'Какую команду вы бы хотели включить?'
					}
				}
			},
			run: {
				commandAlreadyEnabled: applyExtensionsLater('Команда \`{{name}}\` уже включена{{but}}.'),
				groupAlreadyEnabled: applyExtensionsLater('Группа \`{{name}}\` {{type}} уже включена.'),
				commandSuccess: applyExtensionsLater('Команда \`{{name}}\` включена{{but}}.'),
				groupSuccess: applyExtensionsLater('Группа \`{{name}}\` включена.'),
				groupDisabled: applyExtensionsLater(' но группа \`{{group}}\` выключена, поэтому команду всё ещё нельзя использовать')
			}
		},
		groups: {
			constructor: {
				description: 'Перечисляет все группы команд.',
				details: exports.TEMPLATE.onlyAdministrator
			},
			run: {
				success: applyExtensionsLater('__**Группы**__\n{{groups}}')
			}
		},
		load: {
			constructor: {
				description: 'Загружает новую команду.',
				details: tags.oneLine`
					Аргумент должнын быть полным названием команды формата \`group:memberName\`.
                    ${exports.TEMPLATE.onlyOwner}
                `,
				args: {
					command: {
						prompt: 'Какую команду вы бы хотели загрузить?',
						validate: {
							alreadyRegistered: 'Данная команда уже зарегистрирована.'
						}
					}
				}
			},
			run: {
				errorShards: applyExtensionsLater('Команда \`{{command}}\` загружена, но произошла ошибка на других осколках.'),
				success: applyExtensionsLater('Команда \`{{command}}\` загружена{{where}}.')
			}
		},
		reload: {
			constructor: {
				description: 'Перезагружает команду или группу команд.',
				details: applyExtensionsLater(tags.oneLine`
					Аргумент должен быть названием/ID (полным или частичным) команды или группы команд.
					При предоставлении группы команд все команды в данной группе будут перезагружены.
                    ${exports.TEMPLATE.onlyOwner}
                `),
				args: {
					cmdOrGrp: {
						label: exports.TEMPLATE.labelCommandGroup,
						prompt: 'Какую команду или группу команд вы бы хотели перезагрузить?'
					}
				}
			},
			run: {
				commandErrorShards: applyExtensionsLater('Команда \`{{name}}\` перезагружена, но произошла ошибка на других осколках.'),
				groupErrorShards: applyExtensionsLater('Перезагружены все команды в группе \`{{name}}\`, но произошла ошибка на других осколках.'),
				commandSuccess: applyExtensionsLater('Команда \`{{name}}\` перезагружена{{where}}.'),
				groupSuccess: applyExtensionsLater('Перезагружены все команды в группе \{{name}}\`{{where}}.')
			}
		},
		unload: {
			constructor: {
				description: 'Выгружает команду.',
				details: tags.oneLine`
					Аргумент должнын быть полным названием команды формата \`group:memberName\`.
                    ${exports.TEMPLATE.onlyOwner}
                `,
				args: {
					command: {
						prompt: 'Какую команду вы бы хотели выгрузить?'
					}
				}
			},
			run: {
				errorShards: applyExtensionsLater('Команда \`{{name}}\` выгружена, но произошла ошибка на других осколках.'),
				success: applyExtensionsLater('Команда \`{{name}}\` выгружена{{where}}.')
			}
		}
	},
	util: {
		eval: {
			constructor: {
				description: 'Выполняет JavaScript код.',
				details: exports.TEMPLATE.onlyOwner,
				args: {
					script: {
						prompt: 'Что бы вы хотели выполнить?'
					}
				}
			},
			run: {
				error: applyExtensionsLater('Ошибка при выполнении: \`{{err}}\`'),
				errorCallback: applyExtensionsLater('Callback ошибка: \`{{val}}\`'),
				second: 'сек ',
				success: applyExtensionsLater(tags.stripIndents`
                    *Выполнено за {{sec}}{{ms}}мс.*
                    \`\`\`javascript
                    {{inspected}}
                    \`\`\`
                `),
				successCallback: applyExtensionsLater(tags.stripIndents`
                    *Callback выполнен после {{sec}}{{ms}}мс.*
                    \`\`\`javascript
                    {{inspected}}
                    \`\`\`
                `)
			}
		},
		help: {
			constructor: {
				description: 'Показывает список доступных команд или детальную информацию об указанной команде.',
				details: tags.oneLine`
					Команда может быть частью названия команды или полным названием.
					Если команда не указана, будет выведен весь список команд.
			    `,
				args: {
					command: {
						prompt: 'О какой команде вы бы хотели просмотреть информацию?'
					}
				}
			},
			run: {
				onlyServers: ' (Только для сервера)',
				onlyDms: ' (Только для лс)',
				onlyNSFW: ' (NSFW)',
				show: applyExtensionsLater(tags.stripIndents`
                    ${tags.oneLine`
                        __Команда **{{name}}**:__ {{description}}
						{{onlyServers}}
						{{onlyDms}}
                        {{onlyNSFW}}    
                    `}

                    **Формат:** {{format}}
				`),
				disambiguation: 'команды',
				showAliases: applyExtensionsLater(`\n**Алиасы:** {{aliases}}`),
				showGroup: applyExtensionsLater(`\n**Группа:** {{group}} (\`{{groupID}}:{{memberName}}\`)`),
				showDetails: applyExtensionsLater(`\n**Подробности:** {{details}}`),
				showExamples: applyExtensionsLater(`\n**Примеры:**\n{{examples}}`),
				success: 'Вам отправлено личное сообщение с информацией.',
				dmsDisabled: 'Не удалось вам отправить личное сообщение. Вы, вожможно, отключили личные сообщения.',
				multipleFound: exports.types.command.multipleFound,
				unableIdentify: applyExtensionsLater(`Не удалось найти команду. Используйте {{help}} чтобы получить список всех команд.`),
				anyServer: 'любом сервере',
				allCommands: 'Все команды',
				availableInGuild: applyExtensionsLater(`Команды, доступные на {{guild}}`),
				availableInDM: 'Команды, доступные в личных сообщениях',
				showAll: applyExtensionsLater(tags.stripIndents`
                    ${tags.oneLine`
						Чтобы выполнить команду на {{runWhere}},
                        используйте {{usage}}.
                        Например, {{example}}.
                    `}
                    Чтобы выполнить команду в данном личном чате, просто используйте {{usageDM}} без префикса.

                    Используйте {{helpDetailed}} чтобы получить детальную информацию о необходимой команде.
                    Используйте {{helpAll}} чтобы получить список **всех** команд, а не только доступных вам.
                    
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
				description: 'Показывает или устанавливает язык бота.',
				details: tags.oneLine`
					Если язык не указан, то будет выведен текущий язык.
					Если язык будет "list", то будет показан список всех доступных языков.
					Только администратор может изменять язык.
				`,
				args: {
					locale: {
						prompt: 'Какой язык для бота вы бы хотели установить?',
						validate: {
							invalidLocale: 'Неверный язык.'
						}
					}
				}
			},
			run: {
				listLocales: applyExtensionsLater('Доступные языки: {{locales}}'),
				localeIs: applyExtensionsLater('Текущий язык: \`\`{{locale}}\`\`'),
				onlyAdministrator: 'Только администратор может изменять язык бота.',
				success: applyExtensionsLater('Установлен язык на \`\`{{locale}}\`\`.')
			}
		},
		ping: {
			constructor: {
				description: 'Проверяет пинг бота к Discord серверу.'
			},
			run: {
				pinging: 'Пингую...',
				success: applyExtensionsLater(tags.oneLine`
                    {{author}}
                    Понг! Путь сообщения туда-обратно занял {{ping}}мс.
                    {{heartbeat}}
                `),
				heartbeat: applyExtensionsLater('Пинг heartbeat {{ping}}мс.')
			}
		},
		prefix: {
			constructor: {
				description: 'Показывает или устанавливает префикс команд.',
				details: tags.oneLine`
					Если префикс не указан, то будет выведен текущий префикс.
					Если префикс будет "default", то префикс будет спрошен до стандартного префикса бота.
					Если префикс будет "none", то префикс будет удалён полностью, позволяя только команды через упоминание.
					Только администратор может изменять префикс.
				`,
				args: {
					prefix: {
						prompt: 'Какой префикс для бота вы бы хотели установить?'
					}
				}
			},
			run: {
				prefixIs: applyExtensionsLater('Префикс команд: \`\`{{prefix}}\`\`.'),
				prefixIsNone: 'Префикс команд отключён',
				getPrefix: applyExtensionsLater('{{prefix}} Чтобы выполнить команду, используйте {{command}}.'),
				onlyAdministrator: 'Только администратор может изменять префикс.',
				onlyOwner: 'Только владелец бота может изменять глобальный префикс.',
				noPrefix: 'нет префикса',
				setDefault: applyExtensionsLater('Префикс сброшен до стандартного (текущий: {{prefix}}).'),
				setPrefix: applyExtensionsLater('Префикс установлен на \`\`{{prefix}}\`\`.'),
				removePrefix: 'Префикс удалён полностью',
				success: applyExtensionsLater('{{response}} Чтобы выполнить команду, используйте {{command}}.')
			}
		},
		unknownCommand: {
			constructor: {
				description: 'Отображает помощь когда введена неизвестная команда.'
			},
			run: {
				success: applyExtensionsLater('Введена неизвестная команда. Используйте {{help}} чтобы получить список команд.')
			}
		}
	},
	argument: {
		tooLongToShow: '[слишком длинное для показа]',
		invalidValue: applyExtensionsLater('Вы ввели неверный {{type}}. Пожалуйста, повторите попытку.'),
		respondCancel: 'Введите \`cancel\` чтобы отменить команду.',
		autoCancel: applyExtensionsLater('Команда будет автоматически отменена через {{wait}} секунд.'),
		invalidValueShow: applyExtensionsLater('Вы ввели неверный {{type}}, {{value}}. Пожалуйста, повторите попытку.'),
		respondCancelOrFinishNow: 'Введите \`cancel\` чтобы отменить команду, или \`finish\` чтобы завершить ввод на данном месте.',
		respondCancelOrFinish: 'Введите \`cancel\` чтобы отменить команду, или \`finish\` чтобы завершить ввод.',
		autoCancelUnlessRespond: applyExtensionsLater('Команда будет автоматически отменена через {{wait}} секунд если вы не ответите.')
	},
	base: {
		or: 'или ',
		onlyOwner: applyExtensionsLater('Команда \`{{name}}` может быть выполнена только владельцем бота.'),
		requiresPermission: applyExtensionsLater('Команда \`{{name}}\` требует чтобы у вас было разрешение "{{permission}}".'),
		requiresPermissions: applyExtensionsLater('Команда \`{{name}}\` требует чтобы у вас были стедующие разрешения: {{permissions}}'),
		guildOnly: applyExtensionsLater('Команда \`{{name}}\` может быть использована только на сервере.'),
		dmOnly: applyExtensionsLater('Команда \`{{name}}\` может быть использована только в лс.'),
		nsfw: applyExtensionsLater('Команда \`{{name}}\` может быть использовага только в NSFW каналах.'),
		noPermission: applyExtensionsLater('У вас нет разрешения на использование команды \`{{name}}\`.'),
		noClientPermission: applyExtensionsLater('Мне необходимо разрешение "{{permission}}" чтобы команда \`{{name}}\` работала.'),
		noClientPermissions: applyExtensionsLater('Мне необходимы следующие разрешения чтобы команда \`{{name}}\` работала: {{permissions}}'),
		throttling: applyExtensionsLater('Вы не можете использовать команду \`{{name}}\` в течении следующих {{seconds}} секунд.'),
		theBotOwner: 'владелецем бота ',
		inThisServer: applyExtensionsLater(' на этом сервере: {{invite}}'),
		unexpectedError: applyExtensionsLater(tags.stripIndent`
			Произошла непредвиденная ошибка при выполнении команды: \`{{errName}}: {{errMessage}}\`
			Вы не должны были получить такую ошибку.
			Пожалуйста свяжитесь с {{who}}{{where}}
		`)
	},
	collector: {
	},
	group: {
	}
};

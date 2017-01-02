/**
 * Discord.js Client with a command framework
 * @extends {Client}
 */
declare var CommandoClient: any;

/**
 * Options for a CommandoClient
 * @typedef {ClientOptions} CommandoClientOptions
 * @property {boolean} [selfbot=false] - Whether the command dispatcher should be in selfbot mode
 * @property {string} [commandPrefix=!] - Default command prefix
 * @property {number} [commandEditableDuration=30] - Time in seconds that command messages should be editable
 * @property {boolean} [nonCommandEditable=true] - Whether messages without commands can be edited to a command
 * @property {boolean} [unknownCommandResponse=true] - Whether the bot should respond to an unknown command
 * @property {string} [owner] - ID of the bot owner's Discord user
 * @property {string} [invite] - Invite URL to the bot's support server
 */
type CommandoClientOptions = ClientOptions;

/**
 * Sets the setting provider to use, and initialises it once the client is ready
 * @param {SettingProvider|Promise<SettingProvider>} provider Provider to use
 * @return {Promise<void>}
 */
declare var value: any;

/** A fancy argument for a command */
declare var CommandArgument: any;

/**
 * @typedef {Object} CommandArgumentInfo
 * @property {string} key - Key for the argument
 * @property {string} [label=key] - Label for the argument
 * @property {string} prompt - First prompt for the argument when it wasn't specified
 * @property {string} [type] - Type of the argument (must be the ID of one of the registered argument types -
 * see {@link CommandRegistry#registerDefaultTypes} for the built-in types)
 * @property {number} [max] - If type is 'integer' or 'float', this is the maximum value of the number.
 * If type is 'string', this is the maximum length of the string.
 * @property {number} [min] - If type is 'integer' or 'float', this is the minimum value of the number.
 * If type is 'string', this is the minimum length of the string.
 * @property {*} [default] - Default value for the argument (makes the argument optional - cannot be `null`)
 * @property {boolean} [infinite=false] - Whether the argument accepts infinite values
 * @property {Function} [validate] - Validator function for the argument (see {@link ArgumentType#validate})
 * @property {Function} [parse] - Parser function for the argument (see {@link ArgumentType#parse})
 * @property {number} [wait=30] - How long to wait for input (in seconds)
 */
interface ICommandArgumentInfo {
   key: string;
   label: string;
   prompt: string;
   type: string;
   max: number;
   min: number;
   default: any;
   infinite: boolean;
   validate: (() => any);
   parse: (() => any);
   wait: number;
}


/** A command that can be run in a client */
declare var Command: any;

/**
 * @typedef {Object} ThrottlingOptions
 * @property {number} usages - Maximum number of usages of the command allowed in the time frame.
 * @property {number} duration - Amount of time to count the usages of the command within (in seconds).
 */
interface IThrottlingOptions {
   usages: number;
   duration: number;
}


/**
 * @typedef {Object} CommandInfo
 * @property {string} name - The name of the command (must be lowercase)
 * @property {string[]} [aliases] - Alternative names for the command (all must be lowercase)
 * @property {boolean} [autoAliases=true] - Whether automatic aliases should be added
 * @property {string} group - The ID of the group the command belongs to (must be lowercase)
 * @property {string} memberName - The member name of the command in the group (must be lowercase)
 * @property {string} description - A short description of the command
 * @property {string} [format] - The command usage format string - will be automatically generated if not specified,
 * and `args` is specified
 * @property {string} [details] - A detailed description of the command and its functionality
 * @property {string[]} [examples] - Usage examples of the command
 * @property {boolean} [guildOnly=false] - Whether or not the command should only function in a guild channel
 * @property {boolean} [defaultHandling=true] - Whether or not the default command handling should be used.
 * If false, then only patterns will trigger the command.
 * @property {ThrottlingOptions} [throttling] - Options for throttling usages of the command.
 * @property {CommandArgumentInfo[]} [args] - Arguments for the command.
 * @property {number} [argsPromptLimit=Infinity] - Maximum number of times to prompt a user for a single argument.
 * Only applicable if `args` is specified.
 * @property {string} [argsType=single] - One of 'single' or 'multiple'. Only applicable if `args` is not specified.
 * When 'single', the entire argument string will be passed to run as one argument.
 * When 'multiple', it will be passed as multiple arguments.
 * @property {number} [argsCount=0] - The number of arguments to parse from the command string.
 * Only applicable when argsType is 'multiple'. If nonzero, it should be at least 2.
 * When this is 0, the command argument string will be split into as many arguments as it can be.
 * When nonzero, it will be split into a maximum of this number of arguments.
 * @property {boolean} [argsSingleQuotes=true] - Whether or not single quotes should be allowed to box-in arguments
 * in the command string.
 * @property {RegExp[]} [patterns] - Patterns to use for triggering the command
 * @property {boolean} [guarded=false] - Whether the command should be protected from disabling
 */
interface ICommandInfo {
   name: string;
   aliases: string[];
   autoAliases: boolean;
   group: string;
   memberName: string;
   description: string;
   format: string;
   details: string;
   examples: string[];
   guildOnly: boolean;
   defaultHandling: boolean;
   throttling: ThrottlingOptions;
   args: CommandArgumentInfo[];
   argsPromptLimit: number;
   argsType: string;
   argsCount: number;
   argsSingleQuotes: boolean;
   patterns: RegExp[];
   guarded: boolean;
}


/** A group for commands. Whodathunkit? */
declare var CommandGroup: any;

/** A container for a message that triggers a command, that command, and methods to respond */
declare var CommandMessage: any;

/**
 * Shortcut to `this.message.id`
 * @type {string}
 * @see {@link Message#id}
 */
declare function get(): void;

/** Handles parsing messages and running commands from them */
declare var CommandDispatcher: any;

/**
 * A function that can block the usage of a command - these functions are passed the command message that is
 * triggering the command. They should return `false` if the command should *not* be blocked. If the command *should*
 * be blocked, they should return one of the following:
 * - A single string identifying the reason the command is blocked
 * - An array of the above string as element 0, and a response promise or `null` as element 1
 * @typedef {Function} Inhibitor
 */
type Inhibitor = () => void;

/**
 * Has a descriptive message for a command not having proper format
 * @extends {FriendlyError}
 */
declare var CommandFormatError: any;

/**
 * Has a message that can be considered user-friendly
 * @extends {Error}
 */
declare var FriendlyError: any;

/** Contains additional methods and properties that are added to the discord.js Guild class */
declare var GuildExtension: any;

/**
 * Loads and stores settings associated with guilds
 * @abstract
 */
declare var SettingProvider: any;

/** Helper class to use {@link SettingProvider} methods for a specific Guild */
declare var GuildSettingsHelper: any;

/**
 * Uses an SQLite database to store settings with guilds
 * @extends {SettingProvider}
 */
declare var SQLiteProvider: any;

/** Handles registration and searching of commands and groups */
declare var CommandRegistry: any;

/**
 * A CommandGroupResolvable can be:
 * * A CommandGroup
 * * A group ID
 * @typedef {CommandGroup|string} CommandGroupResolvable
 */
type CommandGroupResolvable = (CommandGroup|string);

/**
 * A CommandResolvable can be:
 * * A Command
 * * A command name
 * * A CommandMessage
 * @typedef {Command|string} CommandResolvable
 */
type CommandResolvable = (Command|string);

/** A type for command arguments */
declare var ArgumentType: any;

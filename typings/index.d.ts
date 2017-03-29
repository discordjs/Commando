declare module 'discord.js-commando' {
	import { Channel, Client, ClientOptions, Collection, DMChannel, Emoji, GroupDMChannel, Guild, GuildChannel, GuildMember, GuildResolvable, Message, MessageAttachment, MessageEmbed, MessageOptions, MessageReaction, ReactionEmoji, RichEmbed, Role, StringResolvable, TextChannel, User, UserResolvable, Webhook } from 'discord.js';
	import { Database as SQLiteDatabase, Statement as SQLiteStatement } from 'sqlite';

	export class Argument {
		public constructor(client: CommandoClient, info: ArgumentInfo);

		public default: any;
		public infinite: boolean;
		public key: string;
		public label: string;
		public max: number;
		public min: number;
		public parser: Function;
		public prompt: string;
		public type: ArgumentType;
		public validator: Function;
		public wait: number;

		public obtain(msg: CommandMessage, value?: string, promptLimit?: number): Promise<ArgumentResult>;
		private obtainInfinite(msg: CommandMessage, values?: string[], promptLimit?: number): Promise<ArgumentResult>;
		public parse(value: string, msg: CommandMessage): any | Promise<any>;
		public validate(value: string, msg: CommandMessage): boolean | string | Promise<boolean | string>;
		private static validateInfo(client: CommandoClient, info: ArgumentInfo);
	}

	export class ArgumentCollector {
		public constructor(client: CommandoClient, args: ArgumentInfo[], promptLimit?: number);

		public args: Argument[];
		public readonly client: CommandoClient;
		public promptLimit: number;

		public obtain(msg: CommandMessage, provided?: any[], promptLimit?: number): Promise<ArgumentCollectorResult>;
	}

	export class ArgumentType {
		public constructor(client: CommandoClient, id: string);

		public readonly client: CommandoClient;
		public id: string;

		public parse(value: string, msg: CommandMessage, arg: Argument): any | Promise<any>;
		public validate(value: string, msg: CommandMessage, arg: Argument): boolean | string | Promise<boolean | string>;
	}

	export class Command {
		public constructor(client: CommandoClient, info: CommandInfo);

		private _globalEnabled: boolean;
		private _throttles: Map<string, {}>;
		public aliases: string[];
		public argsCount: number;
		public argsSingleQuotes: boolean;
		public argsType: string;
		public readonly client: CommandoClient;
		public defaultHandling: boolean;
		public description: string;
		public details: string;
		public examples: string[];
		public format: string;
		public group: CommandGroup;
		public groupID: string;
		public guarded: boolean;
		public guildOnly: boolean;
		public memberName: string;
		public name: string;
		public patterns: RegExp[];
		public throttling: ThrottlingOptions;

		public hasPermission(message: CommandMessage): boolean;
		public isEnabledIn(guild: GuildResolvable): boolean;
		public isUsable(message: Message): boolean;
		public reload(): void;
		public run(message: CommandMessage, args: {} | string | string[], fromPattern: boolean): Promise<Message | Message[]>
		public setEnabledIn(guild: GuildResolvable, enabled: boolean): void;
		private throttle(userID: string): {};
		public unload(): void;
		public usage(argString?: string, prefix?: string, user?: User): string;
		public static usage(command: string, prefix?: string, user?: User): string;
		private static validateInfo(client: CommandoClient, info: CommandInfo);
	}

	export class CommandDispatcher {
		public constructor(client: CommandoClient, registry: CommandRegistry);

		private _awaiting: Set<string>;
		private _commandPatterns: {};
		private _results: Map<string, CommandMessage>
		public readonly client: CommandoClient;
		public inhibitors: Set<Function>;
		public registry: CommandRegistry;

		public addInhibitor(inhibitor: Inhibitor): boolean;
		private buildCommandPattern(prefix: string): RegExp;
		private cacheCommandMessage(message: Message, oldMessage: Message, cmdMsg: CommandMessage, responses: Message | Message[]): void;
		private handleMessage(messge: Message, oldMessage?: Message): Promise<void>;
		private inhibit(cmdMsg: CommandMessage): [Inhibitor, undefined];
		private matchDefault(message: Message, pattern: RegExp, commandNameIndex: number): CommandMessage;
		private parseMessage(message: Message): CommandMessage;
		public removeInhibitor(inhibitor: Inhibitor): boolean;
		private shouldHandleMessage(message: Message, oldMessage?: Message): boolean;
	}

	export class CommandFormatError extends FriendlyError {
		public constructor(msg: CommandMessage);
	}

	export class CommandGroup {
		public constructor(client: CommandoClient, id: string, name?: string, guarded?: boolean, commands?: Command[]);

		public readonly client: CommandoClient;
		public commands: Collection<string, Command>
		public guarded: boolean;
		public id: string;
		public name: string;

		public isEnabledIn(guild: GuildResolvable): boolean;
		public reload(): void;
		public setEnabledIn(guild: GuildResolvable, enabled: boolean): void;
	}

	export class CommandMessage {
		public constructor(message: Message, command?: Command, argString?: string, patternMatches?: string[]);

		public argString: string;
		public readonly attachments: Collection<string, MessageAttachment>;
		public readonly author: User;
		public readonly channel: TextChannel | DMChannel | GroupDMChannel;
		public readonly cleanContent: string;
		public readonly client: CommandoClient;
		public command: Command;
		public readonly content: string;
		public readonly createdAt: Date;
		public readonly createdTimestamp: number;
		public readonly deletable: boolean;
		public readonly editable: boolean;
		public readonly editedAt: Date;
		public readonly editedTimestamp: number;
		public readonly edits: Message[];
		public readonly embeds: MessageEmbed[];
		public readonly guild: Guild;
		public readonly id: string;
		public readonly member: GuildMember;
		public readonly mentions: {};
		public message: Message;
		public readonly nonce: string;
		public patternMatches: string[];
		public readonly pinnable: boolean;
		public readonly pinned: boolean;
		public readonly reactions: Collection<string, MessageReaction>;
		public responsePositions: {};
		public responses: {};
		public readonly system: boolean;
		public readonly tts: boolean;
		public readonly webhookID: string;

		public anyUsage(command?: string, prefix?: string, user?: User): string;
		public clearReactions(): Promise<Message>;
		public code(lang: string, content: StringResolvable, options?: MessageOptions): Promise<Message | Message[]>
		public delete(timeout?: number): Promise<Message>;
		private deleteRemainingResponses(): void;
		public direct(content: StringResolvable, options?: MessageOptions): Promise<Message | Message[]>;
		public edit(content: StringResolvable): Promise<Message>
		public editCode(lang: string, content: StringResolvable): Promise<Message>;
		private editCurrentResponse(id: string, options?: {}): Promise<Message | Message[]>;
		private editResponse(response: Message | Message[], options?: {}): Promise<Message | Message[]>;
		public embed(embed: RichEmbed | {}, content?: StringResolvable, options?: MessageOptions): Promise<Message | Message[]>;
		public fetchWebhook(): Promise<Webhook>;
		private finalize(responses: Message | Message[]): void;
		public isMemberMentioned(member: GuildMember | User): boolean;
		public isMentioned(data: GuildChannel | User | Role | string): boolean;
		public parseArgs(): string | string[];
		public static parseArgs(argString: string, argCount?: number, allowSingleQuote?: boolean): string[];
		public pin(): Promise<Message>
		public react(emoji: string | Emoji | ReactionEmoji): Promise<MessageReaction>;
		public reply(content: StringResolvable, options?: MessageOptions): Promise<Message | Message[]>;
		public replyEmbed(embed: RichEmbed | {}, content?: StringResolvable, options?: MessageOptions): Promise<Message | Message[]>;
		private respond(options?: {}): Message | Message[];
		public run(): Promise<Message | Message[]>;
		public say(content: StringResolvable, options?: MessageOptions): Promise<Message | Message[]>;
		public unpin(): Promise<Message>;
		public usage(argString?: string, prefix?: string, user?: User): string;
	}

	export class CommandoClient extends Client {
		public constructor(options?: CommandoClientOptions);

		private _commandPrefix: string;
		public commandPrefix: string;
		public dispatcher: CommandDispatcher;
		public readonly owners: User[];
		public provider: SettingProvider;
		public registry: CommandRegistry;
		public settings: GuildSettingsHelper;

		public isOwner(user: UserResolvable): boolean;
		public setProvider(provider: SettingProvider | Promise<SettingProvider>): Promise<void>;

		public on(event: string, listener: Function): this;
		public on(event: 'commandBlocked', listener: (message: CommandMessage, reason: string) => void): this;
		public on(event: 'commandError', listener: (command: Command, err: Error, message: CommandMessage, args: {} | string | string[], fromPattern: boolean) => void): this;
		public on(event: 'commandPrefixChange', listener: (guild: Guild, prefix: string) => void): this;
		public on(event: 'commandRegister', listener: (command: Command, registry: CommandRegistry) => void): this;
		public on(event: 'commandReregister', listener: (newCommand: Command, oldCommand: Command) => void): this;
		public on(event: 'commandRun', listener: (command: Command, promise: Promise<any>, message: CommandMessage, args: {} | string | string[], fromPattern: boolean) => void): this;
		public on(event: 'commandStatusChange', listener: (guild: Guild, command: Command, enabled: boolean) => void): this;
		public on(event: 'commandUnregister', listener: (command: Command) => void): this;
		public on(event: 'groupRegister', listener: (group: CommandGroup, registry: CommandRegistry) => void): this;
		public on(event: 'groupStatusChange', listener: (guild: Guild, group: CommandGroup, enabled: boolean) => void): this;
		public on(event: 'typeRegister', listener: (type: ArgumentType, registry: CommandRegistry) => void): this;
		public on(event: 'unknownCommand', listener: (message: CommandMessage) => void): this;
		public on(event: 'channelCreate', listener: (channel: Channel) => void): this;
		public on(event: 'channelDelete', listener: (channel: Channel) => void): this;
		public on(event: 'channelPinsUpdate', listener: (channel: Channel, time: Date) => void): this;
		public on(event: 'channelUpdate', listener: (oldChannel: Channel, newChannel: Channel) => void): this;
		public on(event: 'debug', listener: (info: string) => void): this;
		public on(event: 'disconnect', listener: (event: any) => void): this;
		public on(event: 'emojiCreate', listener: (emoji: Emoji) => void): this;
		public on(event: 'emojiCreate', listener: (emoji: Emoji) => void): this;
		public on(event: 'emojiUpdate', listener: (oldEmoji: Emoji, newEmoji: Emoji) => void): this;
		public on(event: 'error', listener: (error: Error) => void): this;
		public on(event: 'guildBanAdd', listener: (guild: Guild, user: User) => void): this;
		public on(event: 'guildBanRemove', listener: (guild: Guild, user: User) => void): this;
		public on(event: 'guildCreate', listener: (guild: Guild) => void): this;
		public on(event: 'guildDelete', listener: (guild: Guild) => void): this;
		public on(event: 'guildMemberAdd', listener: (member: GuildMember) => void): this;
		public on(event: 'guildMemberAvailable', listener: (member: GuildMember) => void): this;
		public on(event: 'guildMemberRemove', listener: (member: GuildMember) => void): this;
		public on(event: 'guildMembersChunk', listener: (members: Collection<string, GuildMember>, guild: Guild) => void): this;
		public on(event: 'guildMemberSpeaking', listener: (member: GuildMember, speaking: boolean) => void): this;
		public on(event: 'guildMemberUpdate', listener: (oldMember: GuildMember, newMember: GuildMember) => void): this;
		public on(event: 'guildUnavailable', listener: (guild: Guild) => void): this;
		public on(event: 'guildUpdate', listener: (oldGuild: Guild, newGuild: Guild) => void): this;
		public on(event: 'message', listener: (message: Message) => void): this;
		public on(event: 'messageDelete', listener: (message: Message) => void): this;
		public on(event: 'messageDeleteBulk', listener: (messages: Collection<string, Message>) => void): this;
		public on(event: 'messageReactionAdd', listener: (messageReaction: MessageReaction, user: User) => void): this;
		public on(event: 'messageReactionRemove', listener: (messageReaction: MessageReaction, user: User) => void): this;
		public on(event: 'messageReactionRemoveAll', listener: (message: Message) => void): this;
		public on(event: 'messageUpdate', listener: (oldMessage: Message, newMessage: Message) => void): this;
		public on(event: 'presenceUpdate', listener: (oldMember: GuildMember, newMember: GuildMember) => void): this;
		public on(event: 'ready', listener: () => void): this;
		public on(event: 'reconnecting', listener: () => void): this;
		public on(event: 'roleCreate', listener: (role: Role) => void): this;
		public on(event: 'roleDelete', listener: (role: Role) => void): this;
		public on(event: 'roleUpdate', listener: (oldRole: Role, newRole: Role) => void): this;
		public on(event: 'typingStart', listener: (channel: Channel, user: User) => void): this;
		public on(event: 'typingStop', listener: (channel: Channel, user: User) => void): this;
		public on(event: 'userNoteUpdate', listener: (user: UserResolvable, oldNote: string, newNote: string) => void): this;
		public on(event: 'userUpdate', listener: (oldUser: User, newUser: User) => void): this;
		public on(event: 'voiceStateUpdate', listener: (oldMember: GuildMember, newMember: GuildMember) => void): this;
		public on(event: 'warn', listener: (info: string) => void): this;
	}

	export class CommandRegistry {
		public constructor(client?: CommandoClient);

		public readonly client: CommandoClient;
		public commands: Collection<string, Command>
		public commandsPath: string;
		public evalObjects: {};
		public groups: Collection<string, CommandGroup>
		public types: Collection<string, ArgumentType>

		public findCommands(searchString?: string, exact?: boolean, message?: Message): Command[];
		public findGroups(searchString?: string, exact?: boolean): CommandGroup[];
		public registerCommand(command: Command | Function): CommandRegistry;
		public registerCommands(commands: Command[] | Function[]): CommandRegistry;
		public registerCommandsIn(options: string | {}): CommandRegistry;
		public registerDefaultCommands(options?: { help?: boolean, prefix?: boolean, eval_?: boolean, ping?: boolean, commandState?: boolean }): CommandRegistry;
		public registerDefaultGroups(): CommandRegistry;
		public registerDefaults(): CommandRegistry;
		public registerDefaultTypes(): CommandRegistry;
		public registerEvalObject(key: string, obj: {}): CommandRegistry;
		public registerEvalObjects(obj: {}): CommandRegistry;
		public registerGroup(group: CommandGroup | Function | string[] | string, name?: string): CommandRegistry;
		public registerGroups(groups: CommandGroup[] | Function[] | string[][]): CommandRegistry;
		public registerType(type: ArgumentType | Function): CommandRegistry;
		public registerTypes(type: ArgumentType[] | Function[]): CommandRegistry;
		public registerTypesIn(options: string | {}): CommandRegistry;
		public reregisterCommand(command: Command | Function, oldCommand: Command): void;
		public resolveCommand(command: CommandResolvable): Command;
		public resolveCommandPath(groups: string, memberName: string): string;
		public resolveGroup(group: CommandGroupResolvable): CommandGroup;
		public unregisterCommand(command: Command): void;
	}

	export class FriendlyError extends Error {
		public constructor(message: string);
	}

	export class GuildExtension extends Guild {
		private _commandPrefix: string;
		private _commandsEnabled: {};
		private _groupsEndabled: {};
		private _settings: GuildSettingsHelper;
		public commandPrefix: string;
		public readonly settings: GuildSettingsHelper;

		private static applyToClass(target: Function): void;
		public commandUsage(command?: string, user?: User): string;
		public isCommandEndabled(command: CommandResolvable): boolean;
		public isGroupEnabled(group: CommandGroupResolvable): boolean;
		public setCommandEnabled(command: CommandResolvable, enabled: boolean): void;
		public setGroupdEnabled(group: CommandGroupResolvable, enabled: boolean): void;
	}

	export class GuildSettingsHelper {
		public constructor(client: CommandoClient, guild: Guild);

		public readonly client: CommandoClient;
		public guild: Guild;

		public clear(): Promise<void>;
		public get(key: string, defVal?: any): any;
		public remove(key: string): Promise<any>;
		public set(key: string, value: any): Promise<any>;
	}

	export class SettingProvider {
		public clear(guild: Guild | string): Promise<void>;
		public destroy(): Promise<void>;
		public get(guild: Guild | string, key: string, defVal?: any): any;
		public getGuildID(guild: Guild | string): string;
		public init(client: CommandoClient): Promise<void>;
		public remove(guild: Guild | string, key: string): Promise<any>;
		public set(guild: Guild | string, key: string, val: any): Promise<any>;
	}

	export class SQLiteProvider extends SettingProvider {
		public constructor(db: SQLiteDatabase);

		public readonly client: CommandoClient;
		public db: SQLiteDatabase;
		private deleteStmt: SQLiteStatement;
		private insertOrReplaceStmt: SQLiteStatement;
		private listeners: Map<any, any>;
		private settings: Map<any, any>;

		public clear(guild: Guild | string): Promise<void>;
		public destroy(): Promise<void>;
		public get(guild: Guild | string, key: string, defVal?: any): any;
		public init(client: CommandoClient): Promise<void>;
		public remove(guild: Guild | string, key: string): Promise<any>;
		public set(guild: Guild | string, key: string, val: any): Promise<any>;
		private setupGuild(guild: string, settings: {}): void;
		private setupGuildCommand(guild: Guild, command: Command, settings: {}): void;
		private setupGuildGroup(guild: Guild, group: CommandGroup, settings: {}): void;
		private updateOtherShards(key: string, val: any): void;
	}

	type ArgumentCollectorResult = {
		values?: {};
		cancelled?: 'user' | 'time' | 'promptLimit';
		prompts: Message[];
		answers: Message[];
	};

	type ArgumentInfo = {
		key: string;
		label?: string;
		prompt: string;
		type?: string;
		max?: number;
		min?: number;
		default?: any;
		infinite?: boolean;
		validate?: Function;
		parse?: Function;
		wait?: number;
	};

	type ArgumentResult = {
		value: any | any[];
		cancelled?: 'user' | 'time' | 'promptLimit';
		prompts: Message[];
		answers: Message[];
	};

	type CommandGroupResolvable = CommandGroup | string;

	type CommandInfo = {
		name: string;
		aliases?: string[];
		autoAliases?: boolean;
		group: string;
		memberName: string;
		description: string;
		format?: string;
		details?: string;
		examples?: string[];
		guildOnly?: boolean;
		defaultHandling?: boolean;
		throttling?: ThrottlingOptions;
		args?: ArgumentInfo[];
		argsPromptLimit?: number;
		argsType?: string;
		argsCount?: number;
		argsSingleQuotes?: boolean;
		patterns?: RegExp[];
		guarded?: boolean;
	};

	type CommandoClientOptions = {
		selfbot?: boolean;
		commandPrefix?: string;
		commandEditableDuration?: number;
		nonCommandEditable?: boolean;
		unknownCommandResponse?: boolean;
		owner?: string | string[] | Set<string>;
		invite?: string;
	} & ClientOptions;

	type CommandResolvable = Command | string;

	type Inhibitor = (msg: Message) => string | [string, Promise<any>];

	type ThrottlingOptions = {
		usages: number;
		duration: number;
	}
}

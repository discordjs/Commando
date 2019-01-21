declare module 'sqlite' {
	export interface Database {}
	export interface Statement {}
}

declare module 'SyncSqlite' {
	export interface Database {}
	export interface Statement {}
}

declare module 'discord.js-commando' {
	import { Channel, Client, ClientOptions, Collection, DMChannel, Emoji, GroupDMChannel, Guild, GuildChannel, GuildMember, GuildResolvable, Message, MessageAttachment, MessageEmbed, MessageMentions, MessageOptions, MessageReaction, PermissionResolvable, PermissionString, ReactionEmoji, Role, Snowflake, StringResolvable, TextChannel, User, UserResolvable, VoiceState, Webhook } from 'discord.js';
	import { Database as SQLiteDatabase, Statement as SQLiteStatement } from 'sqlite';
	import { Database as SyncSQLiteDatabase, Statement as SyncSQLiteStatement } from 'SyncSqlite';

	export class Argument {
		private constructor(client: CommandoClient, info: ArgumentInfo);

		private obtainInfinite(msg: CommandoMessage, vals?: string[], promptLimit?: number): Promise<ArgumentResult>;

		private static validateInfo(client: CommandoClient, info: ArgumentInfo);

		public default: any;
		public error: string;
		public infinite: boolean;
		public key: string;
		public label: string;
		public max: number;
		public min: number;
		public oneOf: any[];
		public parser: Function;
		public prompt: string;
		public type: ArgumentType;
		public validator: Function;
		public wait: number;

		public obtain(msg: CommandoMessage, val?: string, promptLimit?: number): Promise<ArgumentResult>;
		public parse(val: string, msg: CommandoMessage): any | Promise<any>;
		public validate(val: string, msg: CommandoMessage): boolean | string | Promise<boolean | string>;
	}

	export class ArgumentCollector {
		public constructor(client: CommandoClient, args: ArgumentInfo[], promptLimit?: number);

		public args: Argument[];
		public readonly client: CommandoClient;
		public promptLimit: number;

		public obtain(msg: CommandoMessage, provided?: any[], promptLimit?: number): Promise<ArgumentCollectorResult>;
	}

	export class ArgumentType {
		public constructor(client: CommandoClient, id: string);

		public readonly client: CommandoClient;
		public id: string;

		public parse(val: string, msg: CommandoMessage, arg: Argument): any | Promise<any>;
		public validate(val: string, msg: CommandoMessage, arg: Argument): boolean | string | Promise<boolean | string>;
		public isEmpty(val: string, msg: CommandoMessage, arg: Argument): boolean;
	}

	export class ArgumentUnionType extends ArgumentType {
		public types: ArgumentType[];
	}

	export class Command {
		public constructor(client: CommandoClient, info: CommandInfo);

		private _globalEnabled: boolean;
		private _throttles: Map<string, object>;

		private throttle(userID: string): object;

		private static validateInfo(client: CommandoClient, info: CommandInfo);

		public aliases: string[];
		public argsCount: number;
		public argsSingleQuotes: boolean;
		public argsType: string;
		public readonly client: CommandoClient;
		public clientPermissions: PermissionResolvable[];
		public defaultHandling: boolean;
		public description: string;
		public details: string;
		public examples: string[];
		public format: string;
		public group: CommandGroup;
		public groupID: string;
		public guarded: boolean;
		public hidden: boolean;
		public guildOnly: boolean;
		public memberName: string;
		public name: string;
		public nsfw: boolean;
		public ownerOnly: boolean;
		public patterns: RegExp[];
		public throttling: ThrottlingOptions;
		public unknown: boolean;
		public userPermissions: PermissionResolvable[];

		public hasPermission(message: CommandoMessage): boolean | string;
		public isEnabledIn(guild: GuildResolvable, bypassGroup?: boolean): boolean;
		public isUsable(message: Message): boolean;
		public onBlocked(message: CommandoMessage, reason: string, data?: Object): Promise<Message | Message[]>;
		public onBlocked(message: CommandoMessage, reason: 'guildOnly' | 'nsfw'): Promise<Message | Message[]>;
		public onBlocked(message: CommandoMessage, reason: 'permission', data: { response?: string }): Promise<Message | Message[]>;
		public onBlocked(message: CommandoMessage, reason: 'clientPermissions', data: { missing: string }): Promise<Message | Message[]>;
		public onBlocked(message: CommandoMessage, reason: 'throttling', data: { throttle: Object, remaining: number }): Promise<Message | Message[]>;
		public onError(err: Error, message: CommandoMessage, args: object | string | string[], fromPattern: false): Promise<Message | Message[]>;
		public onError(err: Error, message: CommandoMessage, args: string[], fromPattern: true): Promise<Message | Message[]>;
		public reload(): void;
		public run(message: CommandoMessage, args: object | string | string[], fromPattern: false): Promise<Message | Message[]>;
		public run(message: CommandoMessage, args: string[], fromPattern: true): Promise<Message | Message[]>;
		public setEnabledIn(guild: GuildResolvable, enabled: boolean): void;
		public unload(): void;
		public usage(argString?: string, prefix?: string, user?: User): string;

		public static usage(command: string, prefix?: string, user?: User): string;
	}

	export class CommandDispatcher {
		public constructor(client: CommandoClient, registry: CommandoRegistry);

		private _awaiting: Set<string>;
		private _commandPatterns: object;
		private _results: Map<string, CommandoMessage>;

		private buildCommandPattern(prefix: string): RegExp;
		private cacheCommandoMessage(message: Message, oldMessage: Message, cmdMsg: CommandoMessage, responses: Message | Message[]): void;
		private handleMessage(messge: Message, oldMessage?: Message): Promise<void>;
		private inhibit(cmdMsg: CommandoMessage): Inhibition;
		private matchDefault(message: Message, pattern: RegExp, commandNameIndex: number): CommandoMessage;
		private parseMessage(message: Message): CommandoMessage;
		private shouldHandleMessage(message: Message, oldMessage?: Message): boolean;

		public readonly client: CommandoClient;
		public inhibitors: Set<Function>;
		public registry: CommandoRegistry;

		public addInhibitor(inhibitor: Inhibitor): boolean;
		public removeInhibitor(inhibitor: Inhibitor): boolean;
	}

	export class CommandFormatError extends FriendlyError {
		public constructor(msg: CommandoMessage);
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

	export class CommandoMessage {
		public constructor(message: Message, command?: Command, argString?: string, patternMatches?: string[]);

		private deleteRemainingResponses(): void;
		private editCurrentResponse(id: string, options?: {}): Promise<Message | Message[]>;
		private editResponse(response: Message | Message[], options?: {}): Promise<Message | Message[]>;
		private finalize(responses: Message | Message[]): void;
		private respond(options?: {}): Message | Message[];

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
		public readonly guild: CommandoGuild;
		public readonly id: string;
		public readonly member: GuildMember;
		public readonly mentions: MessageMentions;
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
		public direct(content: StringResolvable, options?: MessageOptions): Promise<Message | Message[]>;
		public edit(content: StringResolvable): Promise<Message>
		public editCode(lang: string, content: StringResolvable): Promise<Message>;
		public embed(embed: MessageEmbed | {}, content?: StringResolvable, options?: MessageOptions): Promise<Message | Message[]>;
		public fetchWebhook(): Promise<Webhook>;
		public isMemberMentioned(member: GuildMember | User): boolean;
		public isMentioned(data: GuildChannel | User | Role | string): boolean;
		public parseArgs(): string | string[];
		public static parseArgs(argString: string, argCount?: number, allowSingleQuote?: boolean): string[];
		public pin(): Promise<Message>
		public react(emoji: string | Emoji | ReactionEmoji): Promise<MessageReaction>;
		public reply(content: StringResolvable, options?: MessageOptions): Promise<Message | Message[]>;
		public replyEmbed(embed: MessageEmbed | {}, content?: StringResolvable, options?: MessageOptions): Promise<Message | Message[]>;
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
		public options: CommandoClientOptions;
		public readonly owners: User[];
		public provider: SettingProvider;
		public registry: CommandoRegistry;
		public settings: GuildSettingsHelper;

		public isOwner(user: UserResolvable): boolean;
		public setProvider(provider: SettingProvider | Promise<SettingProvider>): Promise<void>;

		on(event: string, listener: Function): this;
		on(event: 'commandBlocked', listener: (message: CommandoMessage, reason: string, data?: Object) => void): this;
		on(event: 'commandBlocked', listener: (message: CommandoMessage, reason: 'guildOnly' | 'nsfw') => void): this;
		on(event: 'commandBlocked', listener: (message: CommandoMessage, reason: 'permission', data: { response?: string }) => void): this;
		on(event: 'commandBlocked', listener: (message: CommandoMessage, reason: 'throttling', data: { throttle: Object, remaining: number }) => void): this;
		on(event: 'commandBlocked', listener: (message: CommandoMessage, reason: 'clientPermissions', data: { missing: string }) => void): this;
		on(event: 'commandCancelled', listener: (command: Command, reason: string, message: CommandoMessage) => void): this;
		on(event: 'commandError', listener: (command: Command, err: Error, message: CommandoMessage, args: object | string | string[], fromPattern: false) => void): this;
		on(event: 'commandError', listener: (command: Command, err: Error, message: CommandoMessage, args: string[], fromPattern: true) => void): this;
		on(event: 'commandPrefixChange', listener: (guild: CommandoGuild, prefix: string) => void): this;
		on(event: 'commandRegister', listener: (command: Command, registry: CommandoRegistry) => void): this;
		on(event: 'commandReregister', listener: (newCommand: Command, oldCommand: Command) => void): this;
		on(event: 'commandRun', listener: (command: Command, promise: Promise<any>, message: CommandoMessage, args: object | string | string[], fromPattern: boolean) => void): this;
		on(event: 'commandStatusChange', listener: (guild: CommandoGuild, command: Command, enabled: boolean) => void): this;
		on(event: 'commandUnregister', listener: (command: Command) => void): this;
		on(event: 'groupRegister', listener: (group: CommandGroup, registry: CommandoRegistry) => void): this;
		on(event: 'groupStatusChange', listener: (guild: CommandoGuild, group: CommandGroup, enabled: boolean) => void): this;
		on(event: 'typeRegister', listener: (type: ArgumentType, registry: CommandoRegistry) => void): this;
		on(event: 'unknownCommand', listener: (message: CommandoMessage) => void): this;
		on(event: 'channelCreate', listener: (channel: Channel) => void): this;
		on(event: 'channelDelete', listener: (channel: Channel) => void): this;
		on(event: 'channelPinsUpdate', listener: (channel: Channel, time: Date) => void): this;
		on(event: 'channelUpdate', listener: (oldChannel: Channel, newChannel: Channel) => void): this;
		on(event: 'debug', listener: (info: string) => void): this;
		on(event: 'disconnect', listener: (event: any) => void): this;
		on(event: 'emojiCreate', listener: (emoji: Emoji) => void): this;
		on(event: 'emojiDelete', listener: (emoji: Emoji) => void): this;
		on(event: 'emojiUpdate', listener: (oldEmoji: Emoji, newEmoji: Emoji) => void): this;
		on(event: 'error', listener: (error: Error) => void): this;
		on(event: 'guildBanAdd', listener: (guild: CommandoGuild, user: User) => void): this;
		on(event: 'guildBanRemove', listener: (guild: CommandoGuild, user: User) => void): this;
		on(event: 'guildCreate', listener: (guild: CommandoGuild) => void): this;
		on(event: 'guildDelete', listener: (guild: CommandoGuild) => void): this;
		on(event: 'guildMemberAdd', listener: (member: GuildMember) => void): this;
		on(event: 'guildMemberAvailable', listener: (member: GuildMember) => void): this;
		on(event: 'guildMemberRemove', listener: (member: GuildMember) => void): this;
		on(event: 'guildMembersChunk', listener: (members: Collection<Snowflake, GuildMember>, guild: CommandoGuild) => void): this;
		on(event: 'guildMemberSpeaking', listener: (member: GuildMember, speaking: boolean) => void): this;
		on(event: 'guildMemberUpdate', listener: (oldMember: GuildMember, newMember: GuildMember) => void): this;
		on(event: 'guildUnavailable', listener: (guild: CommandoGuild) => void): this;
		on(event: 'guildUpdate', listener: (oldGuild: CommandoGuild, newGuild: CommandoGuild) => void): this;
		on(event: 'message', listener: (message: Message) => void): this;
		on(event: 'messageDelete', listener: (message: Message) => void): this;
		on(event: 'messageDeleteBulk', listener: (messages: Collection<Snowflake, Message>) => void): this;
		on(event: 'messageReactionAdd', listener: (messageReaction: MessageReaction, user: User) => void): this;
		on(event: 'messageReactionRemove', listener: (messageReaction: MessageReaction, user: User) => void): this;
		on(event: 'messageReactionRemoveAll', listener: (message: Message) => void): this;
		on(event: 'messageUpdate', listener: (oldMessage: Message, newMessage: Message) => void): this;
		on(event: 'presenceUpdate', listener: (oldMember: GuildMember, newMember: GuildMember) => void): this;
		on(event: 'providerReady', listener: (provider: SettingProvider) => void): this;
		on(event: 'ready', listener: () => void): this;
		on(event: 'reconnecting', listener: () => void): this;
		on(event: 'roleCreate', listener: (role: Role) => void): this;
		on(event: 'roleDelete', listener: (role: Role) => void): this;
		on(event: 'roleUpdate', listener: (oldRole: Role, newRole: Role) => void): this;
		on(event: 'typingStart', listener: (channel: Channel, user: User) => void): this;
		on(event: 'typingStop', listener: (channel: Channel, user: User) => void): this;
		on(event: 'userNoteUpdate', listener: (user: UserResolvable, oldNote: string, newNote: string) => void): this;
		on(event: 'userUpdate', listener: (oldUser: User, newUser: User) => void): this;
		on(event: 'voiceStateUpdate', listener: (oldState: VoiceState | undefined, newState: VoiceState) => void): this;
		on(event: 'warn', listener: (info: string) => void): this;
	}

	export { CommandoClient as Client };

	export class CommandoGuild extends Guild {
		private _commandPrefix: string;
		private _commandsEnabled: object;
		private _groupsEnabled: object;
		private _settings: GuildSettingsHelper;

		public commandPrefix: string;
		public readonly settings: GuildSettingsHelper;

		public commandUsage(command?: string, user?: User): string;
		public isCommandEndabled(command: CommandResolvable): boolean;
		public isGroupEnabled(group: CommandGroupResolvable): boolean;
		public setCommandEnabled(command: CommandResolvable, enabled: boolean): void;
		public setGroupEnabled(group: CommandGroupResolvable, enabled: boolean): void;
	}

	export class CommandoRegistry {
		public constructor(client?: CommandoClient);

		public readonly client: CommandoClient;
		public commands: Collection<string, Command>;
		public commandsPath: string;
		public evalObjects: object;
		public groups: Collection<string, CommandGroup>;
		public types: Collection<string, ArgumentType>;
		public unknownCommand?: Command;

		public findCommands(searchString?: string, exact?: boolean, message?: Message | CommandoMessage): Command[];
		public findGroups(searchString?: string, exact?: boolean): CommandGroup[];
		public registerCommand(command: Command | Function): CommandoRegistry;
		public registerCommands(commands: Command[] | Function[], ignoreInvalid?: boolean): CommandoRegistry;
		public registerCommandsIn(options: string | {}): CommandoRegistry;
		public registerDefaultCommands(commands?: { help?: boolean, prefix?: boolean, eval?: boolean, ping?: boolean, commandState?: boolean, unknownCommand?: boolean }): CommandoRegistry;
		public registerDefaultGroups(): CommandoRegistry;
		public registerDefaults(): CommandoRegistry;
		public registerDefaultTypes(types?: { string?: boolean, integer?: boolean, float?: boolean, boolean?: boolean, user?: boolean, member?: boolean, role?: boolean, channel?: boolean, message?: boolean, command?: boolean, group?: boolean }): CommandoRegistry;
		public registerEvalObject(key: string, obj: {}): CommandoRegistry;
		public registerEvalObjects(obj: {}): CommandoRegistry;
		public registerGroup(group: CommandGroup | Function | { id: string, name?: string, guarded?: boolean } | string, name?: string, guarded?: boolean): CommandoRegistry;
		public registerGroups(groups: CommandGroup[] | Function[] | { id: string, name?: string, guarded?: boolean }[] | string[][]): CommandoRegistry;
		public registerType(type: ArgumentType | Function): CommandoRegistry;
		public registerTypes(type: ArgumentType[] | Function[], ignoreInvalid?: boolean): CommandoRegistry;
		public registerTypesIn(options: string | {}): CommandoRegistry;
		public reregisterCommand(command: Command | Function, oldCommand: Command): void;
		public resolveCommand(command: CommandResolvable): Command;
		public resolveCommandPath(groups: string, memberName: string): string;
		public resolveGroup(group: CommandGroupResolvable): CommandGroup;
		public unregisterCommand(command: Command): void;
	}

	export class FriendlyError extends Error {
		public constructor(message: string);
	}

	export class GuildSettingsHelper {
		public constructor(client: CommandoClient, guild: CommandoGuild);

		public readonly client: CommandoClient;
		public guild: CommandoGuild;

		public clear(): Promise<void>;
		public get(key: string, defVal?: any): any;
		public remove(key: string): Promise<any>;
		public set(key: string, val: any): Promise<any>;
	}

	export class SettingProvider {
		public clear(guild: Guild | string): Promise<void>;
		public destroy(): Promise<void>;
		public get(guild: Guild | string, key: string, defVal?: any): any;
		public static getGuildID(guild: Guild | string): string;
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
		private setupGuildCommand(guild: CommandoGuild, command: Command, settings: {}): void;
		private setupGuildGroup(guild: CommandoGuild, group: CommandGroup, settings: {}): void;
		private updateOtherShards(key: string, val: any): void;
	}

	export class SyncSQLiteProvider extends SettingProvider {
		public constructor(db: SyncSQLiteDatabase);

		public readonly client: CommandoClient;
		public db: SyncSQLiteDatabase;
		private deleteStmt: SyncSQLiteStatement;
		private insertOrReplaceStmt: SyncSQLiteStatement
		private listeners: Map<any, any>;
		private settings: Map<any, any>;

		public clear(guild: Guild | string): Promise<void>;
		public destroy(): Promise<void>;
		public get(guild: Guild | string, key: string, defVal?: any): any;
		public init(client: CommandoClient): Promise<void>;
		public remove(guild: Guild | string, key: string): Promise<any>;
		public set(guild: Guild | string, key: string, val: any): Promise<any>;
		private setupGuild(guild: string, settings: {}): void;
		private setupGuildCommand(guild: CommandoGuild, command: Command, settings: {}): void;
		private setupGuildGroup(guild: CommandoGuild, group: CommandGroup, settings: {}): void;
		private updateOtherShards(key: string, val: any): void;
	}

	export class util {
		public static disambiguation(items: any[], label: string, property?: string): string;
		public static paginate<T>(items: T[], page?: number, pageLength?: number): {
			items: T[],
			page: number,
			maxPage: number,
			pageLength: number
		};
		public static readonly permissions: { [K in PermissionString]: string };
	}

	export const version: string;

	type ArgumentCollectorResult = {
		values?: object;
		cancelled?: 'user' | 'time' | 'promptLimit';
		prompts: Message[];
		answers: Message[];
	};

	type ArgumentInfo = {
		key: string;
		label?: string;
		prompt: string;
		error?: string;
		type?: string;
		max?: number;
		min?: number;
		oneOf?: any[];
		default?: any | Function;
		infinite?: boolean;
		validate?: Function;
		parse?: Function;
		isEmpty?: Function;
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
		nsfw?: boolean;
		guildOnly?: boolean;
		ownerOnly?: boolean;
		clientPermissions?: PermissionResolvable[];
		userPermissions?: PermissionResolvable[];
		defaultHandling?: boolean;
		throttling?: ThrottlingOptions;
		args?: ArgumentInfo[];
		argsPromptLimit?: number;
		argsType?: string;
		argsCount?: number;
		argsSingleQuotes?: boolean;
		patterns?: RegExp[];
		guarded?: boolean;
		hidden?: boolean;
		unknown?: boolean;
	};

	type CommandoClientOptions = ClientOptions & {
		commandPrefix?: string;
		commandEditableDuration?: number;
		nonCommandEditable?: boolean;
		owner?: string | string[] | Set<string>;
		invite?: string;
	};

	type CommandResolvable = Command | string;

	type Inhibitor = (msg: CommandoMessage) => false | string | Inhibition;
	type Inhibition = {
		reason: string;
		response?: Promise<Message>;
	}

	type ThrottlingOptions = {
		usages: number;
		duration: number;
	}
}

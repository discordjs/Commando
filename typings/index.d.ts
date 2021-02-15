declare module 'discord.js-commando' {
	import { Client, ClientEvents, ClientOptions, Collection, Guild, GuildResolvable, Message, MessageAttachment, MessageEditOptions, MessageEmbed, MessageOptions, MessageAdditions, MessageReaction, PermissionResolvable, PermissionString, StringResolvable, User, UserResolvable } from 'discord.js';

	export class Argument {
		private constructor(client: CommandoClient, info: ArgumentInfo);

		private obtainInfinite(msg: CommandoMessage, vals?: string[], promptLimit?: number): Promise<ArgumentResult>;

		private static validateInfo(client: CommandoClient, info: ArgumentInfo): void;

		public default: ArgumentDefault;
		public emptyChecker: Function;
		public error: string;
		public infinite: boolean;
		public key: string;
		public label: string;
		public max: number;
		public min: number;
		public oneOf: string[];
		public parser: Function;
		public prompt: string;
		public type: ArgumentType;
		public validator: Function;
		public wait: number;

		public isEmpty(val: string, msg: CommandoMessage): boolean;
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

	export abstract class ArgumentType {
		public constructor(client: CommandoClient, id: string);

		public readonly client: CommandoClient;
		public id: string;

		public isEmpty(val: string, msg: CommandoMessage, arg: Argument): boolean;
		public abstract parse(val: string, msg: CommandoMessage, arg: Argument): any | Promise<any>;
		public abstract validate(val: string, msg: CommandoMessage, arg: Argument): boolean | string | Promise<boolean | string>;
	}

	export class ArgumentUnionType extends ArgumentType {
		public types: ArgumentType[];

		public parse(val: string, msg: CommandoMessage, arg: Argument): any | Promise<any>;
		public validate(val: string, msg: CommandoMessage, arg: Argument): string | boolean | Promise<string | boolean>;
	}

	export abstract class Command {
		public constructor(client: CommandoClient, info: CommandInfo);

		private _globalEnabled: boolean;
		private _throttles: Map<string, object>;

		private throttle(userID: string): object;

		private static validateInfo(client: CommandoClient, info: CommandInfo);

		public aliases: string[];
		public argsCollector: ArgumentCollector;
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
		public guildOnly: boolean;
		public hidden: boolean;
		public memberName: string;
		public name: string;
		public nsfw: boolean;
		public ownerOnly: boolean;
		public patterns: RegExp[];
		public throttling: ThrottlingOptions;
		public unknown: boolean;
		public userPermissions: PermissionResolvable[];

		public hasPermission(message: CommandoMessage, ownerOverride?: boolean): boolean | string;
		public isEnabledIn(guild: GuildResolvable, bypassGroup?: boolean): boolean;
		public isUsable(message?: Message): boolean;
		public onBlock(message: CommandoMessage, reason: string, data?: object): Promise<Message | Message[]>;
		public onBlock(message: CommandoMessage, reason: 'guildOnly' | 'nsfw'): Promise<Message | Message[]>;
		public onBlock(message: CommandoMessage, reason: 'permission', data: { response?: string }): Promise<Message | Message[]>;
		public onBlock(message: CommandoMessage, reason: 'clientPermissions', data: { missing: PermissionString[] }): Promise<Message | Message[]>;
		public onBlock(message: CommandoMessage, reason: 'throttling', data: { throttle: object, remaining: number }): Promise<Message | Message[]>;
		public onError(err: Error, message: CommandoMessage, args: object | string | string[], fromPattern: false, result?: ArgumentCollectorResult): Promise<Message | Message[]>;
		public onError(err: Error, message: CommandoMessage, args: string[], fromPattern: true, result?: ArgumentCollectorResult): Promise<Message | Message[]>;
		public reload(): void;
		public abstract run(message: CommandoMessage, args: object | string | string[], fromPattern: boolean, result?: ArgumentCollectorResult): Promise<Message | Message[] | null> | null;
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
		private handleMessage(message: Message, oldMessage?: Message): Promise<void>;
		private inhibit(cmdMsg: CommandoMessage): Inhibition;
		private matchDefault(message: Message, pattern: RegExp, commandNameIndex?: number, prefixless?: boolean): CommandoMessage;
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
		public constructor(client: CommandoClient, id: string, name?: string, guarded?: boolean);

		public readonly client: CommandoClient;
		public commands: Collection<string, Command>
		public guarded: boolean;
		public id: string;
		public name: string;

		public isEnabledIn(guild: GuildResolvable): boolean;
		public reload(): void;
		public setEnabledIn(guild: GuildResolvable, enabled: boolean): void;
	}

	export class CommandoMessage extends Message {
		public argString: string | null;
		public command: Command | null;
		public isCommand: boolean;
		public patternMatches: string[] | null;
		public responsePositions: { [key: string]: number } | null;
		public responses: { [key: string]: CommandoMessage[] } | null;
		public readonly guild: CommandoGuild;

		private deleteRemainingResponses(): void;
		private editCurrentResponse(id: string, options: MessageEditOptions | Exclude<MessageAdditions, MessageAttachment>): Promise<CommandoMessage | CommandoMessage[]>;
		private editResponse(response: CommandoMessage | CommandoMessage[], options: RespondEditOptions): Promise<CommandoMessage | CommandoMessage[]>;
		private finalize(responses: (CommandoMessage | CommandoMessage[])[]): void;
		private respond(options: RespondOptions): Promise<CommandoMessage | CommandoMessage[]>;

		public anyUsage(argString?: string, prefix?: string, user?: User): string;
		public code: CommandoMessage['say'];
		public direct: CommandoMessage['say'];
		public embed(embed: MessageEmbed, content?: StringResolvable, options?: (MessageOptions & { split?: false }) | MessageAdditions): Promise<CommandoMessage>;
		public embed(embed: MessageEmbed, content?: StringResolvable, options?: (MessageOptions & { split: true | Exclude<MessageOptions['split'], boolean> }) | MessageAdditions): Promise<CommandoMessage[]>;
		public initCommand(command?: Command, argString?: string[], patternMatches?: string[]): this;
		public parseArgs(): string | string[];
		public replyEmbed: CommandoMessage['embed'];
		public run(): Promise<null | CommandoMessage | CommandoMessage[]>;
		public say(
			content: StringResolvable | (MessageOptions & { split?: false }) | MessageAdditions,
			options?: (MessageOptions & { split?: false }) | MessageAdditions
		): Promise<CommandoMessage>;
		public say(
			content: StringResolvable | (MessageOptions & { split: true | Exclude<MessageOptions['split'], boolean> }) | MessageAdditions,
			options?: (MessageOptions & { split: true | Exclude<MessageOptions['split'], boolean> }) | MessageAdditions
		): Promise<CommandoMessage[]>;
		public usage(argString?: string, prefix?: string, user?: User): string;

		public static parseArgs(argString: string, argCount?: number, allowSingleQuote?: boolean): string[];
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

		public on<K extends keyof CommandoClientEvents>(event: K, listener: (...args: CommandoClientEvents[K]) => void): this;
		public once<K extends keyof CommandoClientEvents>(event: K, listener: (...args: CommandoClientEvents[K]) => void): this;
		public emit<K extends keyof CommandoClientEvents>(event: K, ...args: CommandoClientEvents[K]): boolean;
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
		public isCommandEnabled(command: CommandResolvable): boolean;
		public isGroupEnabled(group: CommandGroupResolvable): boolean;
		public setCommandEnabled(command: CommandResolvable, enabled: boolean): void;
		public setGroupEnabled(group: CommandGroupResolvable, enabled: boolean): void;
	}

	export class CommandoRegistry {
		public constructor(client?: CommandoClient);

		public readonly client: CommandoClient;
		public commands: Collection<string, Command>;
		public commandsPath: string;
		public groups: Collection<string, CommandGroup>;
		public types: Collection<string, ArgumentType>;
		public unknownCommand?: Command;

		public findCommands(searchString?: string, exact?: boolean, message?: Message | CommandoMessage): Command[];
		public findGroups(searchString?: string, exact?: boolean): CommandGroup[];
		public registerCommand(command: Command | Function): CommandoRegistry;
		public registerCommands(commands: Command[] | Function[], ignoreInvalid?: boolean): CommandoRegistry;
		public registerCommandsIn(options: string | {}): CommandoRegistry;
		public registerDefaultCommands(commands?: DefaultCommandsOptions): CommandoRegistry;
		public registerDefaultGroups(): CommandoRegistry;
		public registerDefaults(): CommandoRegistry;
		public registerDefaultTypes(types?: DefaultTypesOptions): CommandoRegistry;
		public registerGroup(group: CommandGroup | Function | { id: string, name?: string, guarded?: boolean } | string, name?: string, guarded?: boolean): CommandoRegistry;
		public registerGroups(groups: CommandGroup[] | Function[] | { id: string, name?: string, guarded?: boolean }[] | string[][]): CommandoRegistry;
		public registerType(type: ArgumentType | Function): CommandoRegistry;
		public registerTypes(type: ArgumentType[] | Function[], ignoreInvalid?: boolean): CommandoRegistry;
		public registerTypesIn(options: string | {}): CommandoRegistry;
		public reregisterCommand(command: Command | Function, oldCommand: Command): void;
		public resolveCommand(command: CommandResolvable): Command;
		public resolveCommandPath(group: string, memberName: string): string;
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

	export abstract class SettingProvider {
		public abstract clear(guild: Guild | string): Promise<void>;
		public abstract destroy(): Promise<void>;
		public abstract get(guild: Guild | string, key: string, defVal?: any): any;
		public abstract init(client: CommandoClient): Promise<void>;
		public abstract remove(guild: Guild | string, key: string): Promise<any>;
		public abstract set(guild: Guild | string, key: string, val: any): Promise<any>;

		public static getGuildID(guild: Guild | string): string;
	}

	export class SQLiteProvider extends SettingProvider {
		public constructor(db: any | Promise<any>);

		public readonly client: CommandoClient;
		public db: any;
		private deleteStmt: any;
		private insertOrReplaceStmt: any;
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
		public constructor(db: any | Promise<any>);

		public readonly client: CommandoClient;
		public db: any;
		private deleteStmt: any;
		private insertOrReplaceStmt: any;
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
		public static escapeRegex(str: string): string;
		public static paginate<T>(items: T[], page?: number, pageLength?: number): {
			items: T[],
			page: number,
			maxPage: number,
			pageLength: number
		};
		public static readonly permissions: { [K in PermissionString]: string };
	}

	export const version: string;

	export interface ArgumentCollectorResult<T = object> {
		values: T | null;
		cancelled?: 'user' | 'time' | 'promptLimit';
		prompts: Message[];
		answers: Message[];
	}

	type ArgumentDefault = any | Function;

	export interface ArgumentInfo {
		key: string;
		label?: string;
		prompt: string;
		error?: string;
		type?: string;
		max?: number;
		min?: number;
		oneOf?: string[];
		default?: ArgumentDefault;
		infinite?: boolean;
		validate?: Function;
		parse?: Function;
		isEmpty?: Function;
		wait?: number;
	}

	export interface ArgumentResult {
		value: any | any[];
		cancelled?: 'user' | 'time' | 'promptLimit';
		prompts: Message[];
		answers: Message[];
	}

	type CommandGroupResolvable = CommandGroup | string;

	export interface CommandInfo {
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
	}

	interface CommandoClientEvents extends ClientEvents {
		commandBlock:
		| [CommandoMessage, string, object?]
		| [CommandoMessage, 'guildOnly' | 'nsfw']
		| [CommandoMessage, 'permission', { response?: string }]
		| [CommandoMessage, 'throttling', { throttle: object, remaining: number }]
		| [CommandoMessage, 'clientPermissions', { missing: string }];
		commandCancel: [Command, string, CommandoMessage];
		commandError:
		| [Command, Error, CommandoMessage, object | string | string[], false]
		| [Command, Error, CommandoMessage, string[], true];
		commandPrefixChange: [CommandoGuild, string];
		commandRegister: [Command, CommandoRegistry];
		commandReregister: [Command, Command];
		commandRun: [Command, Promise<any>, CommandoMessage, object | string | string[], boolean];
		commandStatusChange: [CommandoGuild, Command, boolean];
		commandUnregister: [Command];
		groupRegister: [CommandGroup, CommandoRegistry];
		groupStatusChange: [CommandoGuild, CommandGroup, boolean];
		typeRegister: [ArgumentType, CommandoRegistry];
		unknownCommand: [CommandoMessage];
		providerReady: [SettingProvider];
	}

	export interface CommandoClientOptions extends ClientOptions {
		commandPrefix?: string;
		commandEditableDuration?: number;
		nonCommandEditable?: boolean;
		owner?: string | string[] | Set<string>;
		invite?: string;
	}

	type CommandResolvable = Command | string;

	interface DefaultCommandsOptions {
		help?: boolean;
		prefix?: boolean;
		eval?: boolean;
		ping?: boolean;
		unknownCommand?: boolean;
		commandState?: boolean;
	}

	interface DefaultTypesOptions {
		string?: boolean;
		integer?: boolean;
		float?: boolean;
		boolean?: boolean;
		user?: boolean;
		member?: boolean;
		role?: boolean;
		channel?: boolean;
		textChannel?: boolean;
		voiceChannel?: boolean;
		categoryChannel?: boolean;
		message?: boolean;
		customEmoji?: boolean;
		defaultEmoji?: boolean;
		command?: boolean;
		group?: boolean;
	}

	type Inhibitor = (msg: CommandoMessage) => false | string | Inhibition;

	export interface Inhibition {
		reason: string;
		response?: Promise<Message>;
	}

	export interface ThrottlingOptions {
		usages: number;
		duration: number;
	}

	type ResponseType = 'reply' | 'plain' | 'direct' | 'code';

	interface RespondOptions {
		content: StringResolvable | MessageOptions;
		fromEdit?: boolean;
		options?: MessageOptions;
		lang?: string;
		type?: ResponseType;
	}

	interface RespondEditOptions {
		content: StringResolvable | MessageEditOptions | Exclude<MessageAdditions, MessageAttachment>;
		options?: MessageEditOptions | Exclude<MessageAdditions, MessageAttachment>;
		type?: ResponseType;
	}
}

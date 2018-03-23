const ArgumentType = require('./base');

/** A type for command arguments that handles multiple other types */
class ArgumentUnionType extends ArgumentType {
	constructor(client, id) {
		super(client, id);

		/**
		 * Types to handle, in order of priority
		 * @type {ArgumentType[]}
		 */
		this.types = types;
		const typeIDs = id.split('|');
		for(const id of typeIDs) {
			const type = client.registry.types.get(id)
			if(!type) throw new Error(`Argument type "${id}" is not registered.`);
			this.types.push(type);
		}
	}

	async validate(value, msg, arg) {
		let results = this.types.map(type => type.validate(value, msg, arg));
		results = await Promise.all(results);
		if(results.some(valid => valid && typeof valid !== 'string')) return true;
		return false;
	}

	async parse(value, msg, arg) {
		let results = this.types.map(type => type.validate(value, msg, arg));
		results = await Promise.all(results);
		for(let i = 0; i < results.length; i++) {
			if(results[i] && typeof results[i] !== 'string') return this.types[i].parse(value, msg, arg);
		}
		throw new Error(`Couldn't parse value "${value}" with union type ${this.id}.`);
	}
}

module.exports = ArgumentUnionType;

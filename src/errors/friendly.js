/** Has a message that can be considered user-friendly */
module.exports = class FriendlyError extends Error {
	/** @param {string} message - The error message */
	constructor(message) {
		super(message);
		/** @ignore */
		this.name = 'FriendlyError';
	}
};

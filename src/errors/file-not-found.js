/**
 * Error to be thrown when a Loader fails to load files.
 * @extends {Error}
 */
class FileNotFoundError extends Error {
	/** @param {string} message - The error message */
	constructor(message) {
		super(message);
		this.name = 'FileNotFoundException';
	}
}

module.exports = FileNotFoundError;

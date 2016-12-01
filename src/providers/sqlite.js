const SettingProvider = require('./provider');

/**
 * Uses an SQLite database to store settings with guilds
 * @extends {SettingProvider}
 */
class SQLiteProvider extends SettingProvider {

}

module.exports = SQLiteProvider;

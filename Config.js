const fs = require('fs');
const CONFIG_FILE_PATH = './config.json';

module.exports = class Config {
    constructor() {
        this.values = {
            "discord_token": "DISCORD_TOKEN",
            "log_path": "latest.log",
            "last_log_parsed": "0-0-0",
            "update_interval": 1000,
            "channels": [/* {
                "id": "CHANNEL_ID",
                "log": ["ADVANCEMENT", "DEATH"]
            } */]
        }

        this.load();
    }

    get(key, fallback = () => { }) {
        if (this.values.hasOwnProperty(key)) {
            return this.values[key];
        } else {
            return fallback();
        }
    }

    get_crucial(key, verify = (value) => { }) {
        if (this.values.hasOwnProperty(key)) {
            if (verify(this.values[key])) {
                return this.values[key];
            } else {
                throw new Error(`Config value for '${key}' is invalid.`);
            }
        } else {
            throw new Error(`Config value for '${key}' is missing.`);
        }
    }

    set(key, value) {
        this.values[key] = value;
        this.save();
    }

    load() {
        // Check if config file exists
        if (fs.existsSync(CONFIG_FILE_PATH)) {
            // Read config file
            let config = JSON.parse(fs.readFileSync(CONFIG_FILE_PATH, 'utf8'));

            // Update values
            for (let key in config) {
                if (this.values.hasOwnProperty(key)) {
                    this.values[key] = config[key];
                }
            }
        }

        this.save()
    }

    save() {
        // Write config file
        fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(this.values, null, 4));
    }
}
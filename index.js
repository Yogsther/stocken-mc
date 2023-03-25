const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Import Config
const Config = require('./Config.js');
const LogParser = require('./LogParser.js');

const config = new Config();
const logParser = new LogParser(config.get("log_path"));

var player_count = 0;

const interval = setInterval(() => {
    let newLogs = logParser.getNewLogs(config.get("last_log_parsed"));
    if (newLogs.length > 0) {
        config.set("last_log_parsed", newLogs[newLogs.length - 1].id)

        let previous_player_count = player_count;
        for (let log of newLogs) {

            if (log.type.toLowerCase() == "joined") {
                player_count++;
            } else if (log.type.toLowerCase() == "left" && player_count > 0) {
                player_count--;
            }

            for (let channel of config.get("channels")) {
                if (channel.log.includes(log.type.toUpperCase())) {
                    client.channels.cache.get(channel.id).send(log.message)
                    console.log(log.message)
                }
            }
        }

        if (player_count != previous_player_count) set_bot_status()
    }

}, config.get("update_interval"));

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

function set_bot_status() {
    client.user.setActivity(`${player_count} players online`, { type: 'WATCHING' })
}

client.login(config.get_crucial("discord_token", token => token.length > 50));
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Import Config
const Config = require('./config.js');
const LogParser = require('./LogParser.js');

const config = new Config();
const logParser = new LogParser(config.get("log_path"));


const interval = setInterval(() => {
    let newLogs = logParser.getNewLogs(config.get("last_log_parsed"));
    if (newLogs.length > 0) {
        config.set("last_log_parsed", newLogs[newLogs.length - 1].id)

        for (let log of newLogs) {
            for (let channel of config.get("channels")) {
                if (channel.log.includes(log.type.toUpperCase())) {
                    client.channels.cache.get(channel.id).send(log.message)
                    console.log(log.message)
                }
            }
        }
    }
}, config.get("update_interval"));




client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'ping') {
        await interaction.reply('Pong!');
    }
});

client.login(config.get("discord_token"));
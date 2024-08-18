const Discord = require("discord.js");
const config = require("./Configs/config.json");
const fs = require("fs");

const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMembers,
    Discord.GatewayIntentBits.GuildIntegrations,
    Discord.GatewayIntentBits.GuildWebhooks,
    Discord.GatewayIntentBits.GuildInvites,
    Discord.GatewayIntentBits.GuildVoiceStates,
    Discord.GatewayIntentBits.GuildPresences,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.GuildMessageReactions,
    Discord.GatewayIntentBits.GuildMessageTyping,
    Discord.GatewayIntentBits.DirectMessages,
    Discord.GatewayIntentBits.DirectMessageReactions,
    Discord.GatewayIntentBits.DirectMessageTyping,
    Discord.GatewayIntentBits.MessageContent,
  ],
  partials: [
    Discord.Partials.Message,
    Discord.Partials.Channel, 
    Discord.Partials.Reaction],
});

module.exports = client;
const { Database } = require('sqlite3');


client.on("interactionCreate", (interaction) => {
  if (interaction.type === Discord.InteractionType.ApplicationCommand) {
    const cmd = client.slashCommands.get(interaction.commandName);

    if (!cmd)
      return interaction.reply({
        content: `Olá ${interaction.member}, Tive problemas para executar este comando!`,
        ephemeral: true,
      });

    interaction["member"] = interaction.guild.members.cache.get(
      interaction.user.id
    );

    cmd.run(client, interaction);
  }
});

client.slashCommands = new Discord.Collection();
require("./Handler")(client);

client.login(config.token);

fs.readdir("./Eventos", (err, file) => {
  file.forEach((event) => {
    require(`./Eventos/${event}`);
  });
});

process.on("uncaughtException", (error, origin) => {
  console.log(`🚫 Erro Detectado:]\n\n${error.stack}`);
});

process.on("uncaughtExceptionMonitor", (error, origin) => {
  console.log(`🚫 Erro Detectado:\n\n${error.stack}`);
});



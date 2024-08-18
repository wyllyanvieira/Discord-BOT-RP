const fs = require("fs");

module.exports = async (client) => {
  const SlashsArray = [];

  fs.readdir(`./Comandos`, (error, files) => {
    files.forEach((file) => {
      if (!file?.endsWith(".js")) return;
      file = require(`../Comandos/${file}`);
      if (!file?.name) return;
      client.slashCommands.set(file?.name, file);

      SlashsArray.push(file);
    });
  });
  client.on("ready", async () => {
    client.guilds.cache.forEach((guild) => guild.commands.set(SlashsArray));
  });
};

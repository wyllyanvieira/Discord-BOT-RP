const Discord = require("discord.js");
const config = require('../Configs/config.json')
module.exports = {
  name: "whitelist", // Coloque o nome do comando
  description: "Abra o painel do formulário para os membros.", // Coloque a descrição do comando
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: "canal_formulario",
      description: "Canal para enviar o formulário para os membros.",
      type: Discord.ApplicationCommandOptionType.Channel,
      required: true,
    }
  ],

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) 
      { return interaction.reply(
        { content: `Você não possui permissão para utilizar este comando.`, 
          ephemeral: true })
    } else {
      const canal_formulario =
        interaction.options.getChannel("canal_formulario");

      if (canal_formulario.type !== Discord.ChannelType.GuildText) {
        interaction.reply({
          content: `O canal ${canal_formulario} não é um canal de texto.`,
          ephemeral: true,
        });
      } else {
        let embed_formulario = new Discord.EmbedBuilder()
          .setColor(config.embedColor)
          .setAuthor({
            name: interaction.guild.name,
            iconURL: interaction.guild.iconURL({ dynamic: true }),
          })
          .setTimestamp(Date.now())
          .setFooter({
            iconURL: client.user.displayAvatarURL(),
            url: null,
            text: `Sistema exclusivo ${client.user.username}®`})
          .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
          .setTitle(`**📃 |** *** Allowlist...***`)
          .setDescription(
            `*Nosso servidor possui uma **allowlist séria...**
        
            Pessoas menores de 14 anos estarão sujeitas a entrevista com nossa equipe de **Whitelist Managers.**

            Ciente disso, para realizar sua allowlist, clique no botão abaixo:*`
          )
          

        let botao = new Discord.ActionRowBuilder().addComponents(
          new Discord.ButtonBuilder()
            .setCustomId("fazerwl")
            .setEmoji("📄")
            .setLabel("Iniciar AllowList")
            .setStyle(Discord.ButtonStyle.Primary)
        );
        interaction.reply("Mensagem enviada com sucesso!")
        canal_formulario.send({
          embeds: [embed_formulario],
          components: [botao],
        });
      }
    }
  },
};

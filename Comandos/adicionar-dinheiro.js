const Discord = require("discord.js");
const { Usuario } = require("../Usuario"); // Ajuste o caminho conforme necessário

module.exports = {
  name: "adicionar-dinheiro",
  description: "Adiciona uma quantia a conta bancária de um usuário",
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'usuário',
      description: 'Escolha o usuário para adicionar o dinheiro.',
      type: Discord.ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: 'valor',
      description: 'Defina o valor a ser adicionado',
      type: Discord.ApplicationCommandOptionType.Integer,
      minValue: 1,
      required: true,
    },
  ],

  run: async (client, interaction) => {
    let usuário = interaction.options.getUser("usuário");
    let valor = interaction.options.getInteger("valor");

    let embed_sucesso = new Discord.EmbedBuilder()
      .setTitle("***✅*** | ***Dinheiro Adicionado:***")
      .setDescription(`*${interaction.user} você adicionou \`R$${valor}\` à conta bancária de ${usuário}.*`)
      .setTimestamp(Date.now())
      .setColor("#000000")
      .setThumbnail(interaction.user.displayAvatarURL())
      .setAuthor({
        name: client.user.username,
        iconURL: client.user.displayAvatarURL({ dynamic: true })
      })
      .setFooter({
        iconURL: client.user.displayAvatarURL(),
        text: `Sistema exclusivo ${client.user.username}`
      });

    let embed_falha = new Discord.EmbedBuilder()
      .setTitle("***❌*** | ***Comando Negado:***")
      .setDescription(`*${interaction.user} Você não possui autorização para usar esse comando.*`)
      .setTimestamp(Date.now())
      .setColor("#000000")
      .setThumbnail(interaction.user.displayAvatarURL())
      .setAuthor({
        name: client.user.username,
        iconURL: client.user.displayAvatarURL({ dynamic: true })
      })
      .setFooter({
        iconURL: client.user.displayAvatarURL(),
        text: `Sistema exclusivo ${client.user.username}`
      });

      let embed_erro = new Discord.EmbedBuilder()
      .setTitle("***❌*** | ***Comando Negado:***")
      .setDescription(`*${interaction.user} Houve um erro ao executar esse comando esse comando.*`)
      .setTimestamp(Date.now())
      .setColor("#000000")
      .setThumbnail(interaction.user.displayAvatarURL())
      .setAuthor({
        name: client.user.username,
        iconURL: client.user.displayAvatarURL({ dynamic: true })
      })
      .setFooter({
        iconURL: client.user.displayAvatarURL(),
        text: `Sistema exclusivo ${client.user.username}`
      });
      

    if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ embeds: [embed_falha] });
    }

    try {
      const user = new Usuario(usuário.id);
      await user.GiveMoney(valor);
      interaction.reply({ embeds: [embed_sucesso] });
    } catch (err) {
      console.error("Erro ao adicionar dinheiro:", err);
      interaction.reply({ embeds: [embed_erro], ephemeral: true });
    }
  }
};

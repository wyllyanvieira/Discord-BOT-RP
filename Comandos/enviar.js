const Discord = require("discord.js");
const { Usuario } = require("../Usuario"); // Ajuste o caminho conforme necessário

module.exports = {
  name: "enviar",
  description: "Transfira um valor para um usuário!",
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'usuário',
      description: 'Escolha o usuário para realizar a transferência.',
      type: Discord.ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: 'valor',
      description: 'Defina o valor da transferência',
      type: Discord.ApplicationCommandOptionType.Integer,
      minValue: 1,
      required: true,
    },
  ],

  run: async (client, interaction) => {
    let usuário = interaction.options.getUser("usuário");
    let valor = interaction.options.getInteger("valor");
    let userId = interaction.user.id;

    let embed_sucesso = new Discord.EmbedBuilder()
      .setTitle("***💳*** | ***Transferência Realizada:***")
      .setDescription(`*${interaction.user} você transferiu \`R$${valor}\` para ${usuário}.*`)
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
      .setTitle("***❌*** | ***Transferência Negada:***")
      .setDescription(`*${interaction.user} você não pode transferir para sua própria conta.*`)
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

    let embed_falha2 = new Discord.EmbedBuilder()
      .setTitle("***❌*** | ***Transferência Negada:***")
      .setDescription(`*${interaction.user} seu saldo atual é insuficiente para realizar essa transferência.*`)
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

    if (usuário.id === interaction.user.id) {
      return interaction.reply({ embeds: [embed_falha] });
    }

    try {
      const user = new Usuario(userId);
      const targetUser = new Usuario(usuário.id);

      const saldo = await user.carteira();

      if (saldo < valor) {
        return interaction.reply({ embeds: [embed_falha2] });
      }

      await user.TakeMoney(valor);
      await targetUser.GiveMoney(valor);

      interaction.reply({ embeds: [embed_sucesso] });
    } catch (err) {
      console.error("Erro ao realizar transferência:", err);
      interaction.reply({ content: "Houve um erro ao realizar a transferência.", ephemeral: true });
    }
  }
};

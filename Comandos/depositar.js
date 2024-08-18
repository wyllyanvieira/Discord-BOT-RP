const Discord = require("discord.js");
const { Usuario } = require("../Usuario"); // Ajuste o caminho conforme necessário

module.exports = {
  name: "depositar",
  description: "Deposite uma quantia na sua conta.",
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'valor',
      description: 'Defina o valor a ser depositado.',
      type: Discord.ApplicationCommandOptionType.Integer,
      required: true,
      minValue: 1
    },
  ],

  run: async (client, interaction) => {
    let valor = interaction.options.getInteger("valor");
    let userId = interaction.user.id;

    let embed_sucesso = new Discord.EmbedBuilder()
      .setTitle("***🗳*** | ***Depósito Realizado:***")
      .setDescription(`*${interaction.user} você depositou \`R$${valor}\` na sua conta.*`)
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
      .setTitle("***❌*** | ***Depósito Negado:***")
      .setDescription(`*${interaction.user} você não possui \`R$${valor}\` na sua carteira.*`)
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

    try {
      const user = new Usuario(userId);
      const carteira = await user.carteira();

      if (valor > carteira) {
        return interaction.reply({ embeds: [embed_falha] });
      }

      await user.DepositMoney(valor);
      interaction.reply({ embeds: [embed_sucesso] });
    } catch (err) {
      console.error("Erro ao depositar dinheiro:", err);
      interaction.reply({ content: "Houve um erro ao depositar dinheiro.", ephemeral: true });
    }
  }
};

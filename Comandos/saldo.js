const Discord = require("discord.js");
const { Usuario } = require("../Usuario"); // Ajuste o caminho conforme necessário

module.exports = {
  name: "saldo", // Coloque o nome do comando
  description: "Veja o saldo de um usuário!", // Coloque a descrição do comando
  type: Discord.ApplicationCommandType.ChatInput,
  options:[    
    {
      name: 'usuário',
      description: 'Escolha o usuário para ver o saldo.',
      type: Discord.ApplicationCommandOptionType.User,
      required: false
    },
  ],

  run: async (client, interaction) => {
    let user = interaction.options.getUser("usuário") || interaction.user;
    let userId = user.id;

    try {
      const usuario = new Usuario(userId);
      const banco = await usuario.banco();
      const carteira = await usuario.carteira();

      let embed = new Discord.EmbedBuilder()
        .setTitle("***📱*** | ***Saldo atual:***")
        .addFields([
          {
            name: "***💵 Carteira:***",
            value: `\`R$${carteira}\``
          },
          {
            name: "***🏛 Banco:***",
            value: `\`R$${banco}\``
          }
        ])
        .setDescription(`*${user} seu saldo atual é:*`)
        .setTimestamp(Date.now())
        .setColor("#000000")
        .setThumbnail(user.displayAvatarURL())
        .setAuthor({ 
          name: client.user.username,
          iconURL: client.user.displayAvatarURL({ dynamic: true })
        })
        .setFooter({
          iconURL: client.user.displayAvatarURL(),
          text: `Sistema exclusivo ${client.user.username}`
        });

      interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error("Erro ao obter o saldo:", err);
      interaction.reply({ content: "Houve um erro ao obter o saldo.", ephemeral: true });
    }
  }
}

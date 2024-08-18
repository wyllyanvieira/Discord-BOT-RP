const Discord = require("discord.js");
const { Usuario } = require("../Usuario"); // Ajuste o caminho conforme necessário

module.exports = {
  name: "remover-dinheiro", // Coloque o nome do comando
  description: "Remove uma quantia da conta bancária de um usuário", // Coloque a descrição do comando
  type: Discord.ApplicationCommandType.ChatInput,
  options:[    
    {
      name: 'usuário',
      description: 'Escolha o usuário para remover o dinheiro.',
      type: Discord.ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: 'valor',
      description: 'Defina o valor a ser removido',
      type: Discord.ApplicationCommandOptionType.Integer,
      minValue: 1,
      required: true,
    },
  ],

  run: async (client, interaction) => {
    let usuário = interaction.options.getUser("usuário");
    let valor = interaction.options.getInteger("valor");

    let embed_sucesso = new Discord.EmbedBuilder()
      .setTitle("***✅*** | ***Dinheiro Removido:***")
      .setDescription(`*${interaction.user} você removeu \`R$${valor}\` da conta bancária de ${usuário}.*`)
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

    try {
      if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.ManageGuild)) {
        return interaction.reply({ embeds: [embed_falha] });
      }

      const usuario = new Usuario(usuário.id);
      const banco = await usuario.banco();

      if (banco < valor) {
        let embed_falha_saldo = new Discord.EmbedBuilder()
          .setTitle("***❌*** | ***Remoção Negada:***")
          .setDescription(`*${interaction.user} a conta bancária de ${usuário} não possui saldo suficiente para remover \`R$${valor}\`.*`)
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
        return interaction.reply({ embeds: [embed_falha_saldo] });
      }

      await usuario.TakeMoney(valor); // Remove o dinheiro da conta bancária do usuário

      interaction.reply({ embeds: [embed_sucesso] });
    } catch (err) {
      console.error("Erro ao remover o dinheiro:", err);
      interaction.reply({ content: "Houve um erro ao remover o dinheiro.", ephemeral: true });
    }
  }
}

const Discord = require("discord.js");
const { Usuario } = require("../Usuario");
const configAcao = require('../Configs/acoes.json');

module.exports = {
  name: "acao",
  description: "Realize uma ação criminosa.",
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: "tipo",
      description: "Informe o tipo da ação.",
      type: Discord.ApplicationCommandOptionType.String,
      required: true,
      choices: Object.keys(configAcao).map(tipo => ({ name: tipo, value: tipo }))
    },
    {
      name: "local",
      description: "Informe o local da ação.",
      type: Discord.ApplicationCommandOptionType.String,
      required: true
    },
    {
      name: "bandidos",
      description: "Mencione os usuários que vão participar da ação.",
      type: Discord.ApplicationCommandOptionType.String,
      required: true
    }
  ],

  run: async (client, interaction) => {
    const tipo = interaction.options.getString("tipo");
    const local = interaction.options.getString("local");
    const bandidos = interaction.options.getString("bandidos");

    const acaoConfig = configAcao[tipo];
    if (!acaoConfig) {
      return interaction.reply({ content: "Tipo de ação inválido.", ephemeral: true });
    }

    const user = new Usuario(interaction.user.id);
    const Lockpick = await user.GetItem(1);
    
    if (Lockpick.quantity <= 0) {
      return interaction.reply({ content: "Você precisa usar uma lockpick para realizar esta ação.", ephemeral: true });
    }

    const valor = Math.floor(Math.random() * (acaoConfig.max - acaoConfig.min)) + acaoConfig.min;
    const embed_1 = new Discord.EmbedBuilder()
      .setColor("#FFC300")
      .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
      .setThumbnail(client.user.displayAvatarURL())
      .setTitle("**🛒 |** *** Ação em andamento...***")
      .setImage(acaoConfig.imagemURL)
      .addFields([{ name: "**🕓|** ***Aguarde...***", value: `*${interaction.user} está fazendo o roubo...*` }])
      .setFooter({ iconURL: client.user.displayAvatarURL(), text: `Sistema exclusivo ${client.user.username}®` })
      .setTimestamp(Date.now());

    const embed_2 = new Discord.EmbedBuilder()
      .setColor("#14F821")
      .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
      .setTitle("**🛒 |** *** Ação em andamento...***")
      .setDescription(`*Aguarde ${acaoConfig.tempo / 60000} minutos até a polícia chegar...*`)
      .setThumbnail(client.user.displayAvatarURL())
      .setImage(acaoConfig.imagemURL)
      .addFields([
        { name: "**💵 |** ***Dinheiro sujo:***", value: `*R$${valor}*`, inline: false },
        { name: "**🕓 |** ***Tempo:***", value: `*${acaoConfig.tempo / 60000} Minutos*`, inline: false },
        { name: "**🗺️ |** ***Local:***", value: `*${local}*`, inline: false },
        { name: "**👥 |** ***Bandidos:***", value: `*${bandidos}*`, inline: false }
      ])
      .setFooter({ iconURL: client.user.displayAvatarURL(), text: `Sistema exclusivo ${client.user.username}®` })
      .setTimestamp(Date.now());

    const embed_alertapm = new Discord.EmbedBuilder()
      .setColor("#FF0000")
      .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
      .setDescription(acaoConfig.mensagemAlerta)
      .setThumbnail(client.user.displayAvatarURL())
      .setImage(acaoConfig.imagemURL)
      .addFields([
        { name: "**🗺️ |** ***Local:***", value: `*${local}*`, inline: false },
        { name: "**👥 |** ***Bandidos:***", value: `*${bandidos}*`, inline: false }
      ])
      .setFooter({ iconURL: client.user.displayAvatarURL(), text: `Sistema exclusivo ${client.user.username}®` })
      .setTimestamp(Date.now());

    if (await user.TakeItem(Lockpick.item_id, 1)) {
      interaction.reply({ embeds: [embed_1] }).then(() => {
        setTimeout(() => {
          user.GiveItem(78,valor)
          interaction.editReply({ embeds: [embed_2] });

          // Envia a mensagem de alerta para o canal específico
          const alertaCargo = interaction.guild.roles.cache.get(acaoConfig.alertaCargo);
          const canalAlerta = client.channels.cache.get(acaoConfig.alertaCanal); // Usa o ID do canal do arquivo de configuração
          if (canalAlerta && alertaCargo) {
            canalAlerta.send({
              content: `${alertaCargo}`,
              embeds: [embed_alertapm]
            }).catch(err => console.error("Erro ao enviar alerta:", err));
          }
        }, 10000);
      });
    }
  }
};

const Discord = require("discord.js");
const config = require("../Configs/config.json");
const configitems = require('../Configs/items.json');
const configshops = require('../Configs/shops.json');

module.exports = {
  name: "setarloja",
  description: "Configura uma loja em um canal específico.",
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: "canal",
      description: "O canal onde a loja será configurada.",
      type: Discord.ApplicationCommandOptionType.Channel,
      required: true,
    },
    {
      name: "tipo",
      description: "O tipo de loja a ser configurada.",
      type: Discord.ApplicationCommandOptionType.String,
      required: true,
      choices: configshops.lojas.map((loja) => ({
        name: loja.tipo,
        value: loja.tipo,
      })),
    },
  ],

  run: async (client, interaction) => {
    const canal = interaction.options.getChannel("canal");
    const tipo = interaction.options.getString("tipo");
    const lojaConfig = configshops.lojas.find((loja) => loja.tipo === tipo);

    if (!lojaConfig) {
      return interaction.reply({
        content: "Tipo de loja inválido.",
        ephemeral: true,
      });
    }

    const lojaEmbed = new Discord.EmbedBuilder()
      .setTitle(`Loja: ${lojaConfig.nome}`)
      .setThumbnail(lojaConfig.logo)
      .setDescription("**Selecione um item para comprar:**")
      .setColor(lojaConfig.color);

      const fields = lojaConfig.itens.map((item) => {
        const itemInfo = config.items.find((i) => i.id === item.id);
        return {
          name: itemInfo.name,
          value: `**Preço:** ${item.preco}\n**Descrição:** ${itemInfo.description}`,
          inline: true, 
        };
      });
  
      lojaEmbed.addFields(fields);

    const selectMenu = new Discord.StringSelectMenuBuilder()
      .setCustomId("select_loja")
      .setPlaceholder("🛒 | Selecione um item")
      .addOptions(
        lojaConfig.itens.map((item) => {
          const itemInfo = configitems.items.find((i) => i.id === item.id);
          return {
            label: itemInfo.name,
            description: `Preço: ${item.preco} - ${itemInfo.description}`,
            value: `${item.id}`,
          };
        })
      );

    const row = new Discord.ActionRowBuilder().addComponents(selectMenu);

    try {
      await canal.send({ embeds: [lojaEmbed], components: [row] });
      interaction.reply({
        content: "Loja configurada com sucesso!",
        ephemeral: true,
      });
    } catch (err) {
      console.error(err);
      interaction.reply({
        content: "Ocorreu um erro ao configurar a loja.",
        ephemeral: true,
      });
    }
  },
};

const Discord = require('discord.js');
const config = require('../Configs/config.json');
const configitems = require('../Configs/items.json');
const configcraft = require('../Configs/craft.json');
const { Usuario, GetItemName } = require("../Usuario");

module.exports = {
  name: 'fabricar',
  description: 'Mostra as opções de fabricação que você possui.',
  type: Discord.ApplicationCommandType.ChatInput,

  run: async (client, interaction) => {
    const userId = interaction.user.id;
    const usuario = new Usuario(userId);
    const userRoles = interaction.member.roles.cache.map(role => role.id);
    const craftsAvailable = configcraft.crafts.filter(craft => 
      craft.roles.some(role => userRoles.includes(role))
    );

    if (craftsAvailable.length === 0) {
      return interaction.reply('Você não tem permissão para fabricar nenhum item.');
    }

    let currentPage = 0;
    const craftsPerPage = 1;

    const createCraftEmbed = (craft, pageIndex) => {
      const embed = new Discord.EmbedBuilder()
        .setTitle(`Opções de Craft - Página ${pageIndex + 1}`)
        .setDescription(`Craft: **${craft.name}**\nItens Necessários: ${craft.items_required.map(item => `${GetItemName(item.id)} x${item.quantity}`).join(', ')}\nResultado: ${GetItemName(craft.result.id)} x${craft.result.quantity}`);
      
      return embed;
    };

    const row = new Discord.ActionRowBuilder()
      .addComponents(
        new Discord.ButtonBuilder()
          .setCustomId('prev_craft')
          .setLabel('↩')
          .setStyle(Discord.ButtonStyle.Primary)
          .setDisabled(currentPage === 0),
        new Discord.ButtonBuilder()
          .setCustomId('craft')
          .setLabel('Fabricar')
          .setStyle(Discord.ButtonStyle.Success),
        new Discord.ButtonBuilder()
          .setCustomId('next_craft')
          .setLabel('↪')
          .setStyle(Discord.ButtonStyle.Primary)
          .setDisabled(craftsAvailable.length <= 1 || currentPage === craftsAvailable.length - 1)
      );

    const embedMessage = await interaction.reply({
      embeds: [createCraftEmbed(craftsAvailable[currentPage], currentPage)],
      components: [row],
      fetchReply: true,
      ephemeral: true
    });

    const filter = i => i.user.id === userId;
    const collector = embedMessage.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async i => {
      if (i.customId === 'prev_craft') {
        currentPage--;
      } else if (i.customId === 'next_craft') {
        currentPage++;
      } else if (i.customId === 'craft') {
        const craft = craftsAvailable[currentPage];
        const hasItems = await usuario.hasItems(craft.items_required);

        if (hasItems) {
          await usuario.useItems(craft.items_required);
          await usuario.GiveItem(craft.result.id, craft.result.quantity);
          await i.reply({content: `Você craftou **${GetItemName(craft.result.id)} x${craft.result.quantity}** com sucesso!`, ephemeral: true});
        } else {
          const missingItems = craft.items_required.filter(async item => (await usuario.GetItem(item.id)).quantity < item.quantity);
          await i.reply({content: `Você não possui todos os itens necessários. Faltam: ${missingItems.map(item => `${GetItemName(item.id)} x${item.quantity}`).join(', ')}`, ephemeral: true});
        }
        return;
      }

      row.components[0].setDisabled(currentPage === 0);
      row.components[2].setDisabled(currentPage === craftsAvailable.length - 1);

      await i.update({
        embeds: [createCraftEmbed(craftsAvailable[currentPage], currentPage)],
        components: [row],
        ephemeral: true 
      });
    });
  }
};

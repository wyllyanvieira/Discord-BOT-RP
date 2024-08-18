const Discord = require('discord.js');
const { Usuario } = require('../Usuario.js');
const configitems = require('../Configs/items.json');

module.exports = {
  name: 'giveitem',
  description: 'Adiciona um item ao inventário do jogador.',
  options: [
    {
      name: 'user',
      description: 'O usuário que receberá o item.',
      type: Discord.ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: 'quantity',
      description: 'Quantidade do item a ser adicionado.',
      type: Discord.ApplicationCommandOptionType.Integer,
      required: false,
    },
  ],
  type: Discord.ApplicationCommandType.ChatInput,

  run: async (client, interaction) => {
    try {
      const user = interaction.options.getUser('user');
      const quantity = interaction.options.getInteger('quantity') || 1;
      const itemsPerPage = 3;
      let currentPage = 0;

      const generateItemList = (page) => {
        const start = page * itemsPerPage;
        const end = start + itemsPerPage;
        return configitems.items.slice(start, end).map((item, index) => `${start + index + 1} - ${item.name}`).join('\n');
      };

      const generateButtons = (page) => {
        const buttons = configitems.items.slice(page * itemsPerPage, (page + 1) * itemsPerPage).map((item, index) => 
          new Discord.ButtonBuilder()
            .setCustomId(`gitem_${item.id}`)
            .setLabel((page * itemsPerPage + index + 1).toString())
            .setStyle(Discord.ButtonStyle.Primary)
        );

        if (page > 0) {
          buttons.unshift(new Discord.ButtonBuilder()
            .setCustomId('previous_page_gitem')
            .setLabel('↩')
            .setStyle(Discord.ButtonStyle.Secondary));
        }

        if ((page + 1) * itemsPerPage < configitems.items.length) {
          buttons.push(new Discord.ButtonBuilder()
            .setCustomId('next_page_gitem')
            .setLabel('↪')
            .setStyle(Discord.ButtonStyle.Secondary));
        }

        return new Discord.ActionRowBuilder().addComponents(buttons);
      };

      let embed_giveitem = new Discord.EmbedBuilder()
      .setTitle("***🟢*** | ***Adicionar Item:***")
      .setDescription(`*${interaction.user} Escolha um item (Página ${currentPage + 1}):*\n*${generateItemList(currentPage)}*`)
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

      const message = await interaction.reply({
        embeds: [embed_giveitem],
        components: [generateButtons(currentPage)],
        ephemeral: true,
        fetchReply: true,
      });

      const collector = message.createMessageComponentCollector({ componentType: Discord.ComponentType.Button, time: 60000 });

      collector.on('collect', async i => {
        if (i.customId === 'previous_page_gitem') {
          currentPage--;
        } else if (i.customId === 'next_page_gitem') {
          currentPage++;
        } else {
          const itemId = parseInt(i.customId.split('_')[1], 10);
          const item = configitems.items.find(item => item.id === itemId);

          if (!item) {
            return i.reply({ content: 'Item não encontrado.', ephemeral: true });
          }

          const userId = user.id;
          const usuario = new Usuario(userId);
          const responseMessage = await usuario.GiveItem(item.id, quantity);
          await i.reply(responseMessage);
          collector.stop();
          return;
        }

        await i.update({
          embeds:[embed_giveitem],
          components: [generateButtons(currentPage)],
        });
      });

      collector.on('end', collected => {
        message.edit({ components: [] });
      });
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      await interaction.reply({ content: 'Houve um erro ao adicionar o item.', ephemeral: true });
    }
  },
};

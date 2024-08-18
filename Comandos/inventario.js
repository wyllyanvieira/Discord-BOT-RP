const Discord = require('discord.js');
const config = require('../Configs/config.json');
const configitems = require('../Configs/items.json');
const { Usuario } = require("../Usuario");// Importe a classe Usuario

module.exports = {
  name: 'inventario',
  description: 'Mostra o inventário do jogador.',
  type: Discord.ApplicationCommandType.ChatInput,

  run: async (client, interaction) => {
    const userId = interaction.user.id;

    try {
      // Criação da instância do usuário
      const usuario = new Usuario(userId);

      // Recuperar inventário, capacidade e dinheiro
      const inventory = await usuario.inventario();
      const capacity = await usuario.capacidade() || config.defaultCapacity;
      const carteira = await usuario.carteira() || 0;

      let currentWeight = 0;
      const fields = Object.entries(inventory)
        .map(([itemId, quantity]) => {
          const item = configitems.items.find((i) => i.id === parseInt(itemId));
          if (item) {
            currentWeight += item.weight * quantity;
            return {
              name: item.name,
              value: `Quantidade: ${quantity}`,
              inline: true,
            };
          }
        })
        .filter(Boolean);

        let description = ''; 

        Object.entries(inventory).forEach(([itemId, quantity]) => {
          const item = configitems.items.find((i) => i.id === parseInt(itemId));
          if (item) {
            currentWeight += item.weight * quantity;
            description += `***${quantity} |*** *${item.name}*\n\n`;
          }
        });
        
        let embed_falha1 = new Discord.EmbedBuilder()
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

        const embed = new Discord.EmbedBuilder()
        .setTitle("***🎒*** | ***Inventário:***")
          .setDescription(description || `*${interaction.user} Seu inventário está vazio.*`)
          .setTimestamp(Date.now())
          .addFields(
            {
              name: '*💵Carteira:*',
              value: `\`R$${carteira}\``,
              inline: true,
            },
            {
            name: '*🧳Peso Atual*:',
            value: `\`${currentWeight}Kg/${capacity}Kg\``,
            inline: true,
            })
          .setThumbnail(interaction.user.displayAvatarURL())
          .setColor(config.embedColor)
          .setAuthor({
            name: client.user.username,
            iconURL: client.user.displayAvatarURL({ dynamic: true })
          })
          .setFooter({
            iconURL: client.user.displayAvatarURL(),
            text: `Sistema exclusivo ${client.user.username}`
          });

      // Cria opções de seleção
      const options = Object.entries(inventory)
        .map(([itemId, quantity]) => {
          const item = configitems.items.find((i) => i.id === parseInt(itemId));
          if (item) {
            return {
              label: item.name,
              description: `Quantidade: ${quantity}`,
              value: `${itemId}`,
            };
          }
        })
        .filter(Boolean);

      // Verifica se há opções para adicionar
      const selectMenu =
        options.length > 0
          ? new Discord.StringSelectMenuBuilder()
              .setCustomId('UseItem')
              .setPlaceholder('Selecione um item para usá-lo')
              .addOptions(options)
          : new Discord.StringSelectMenuBuilder()
              .setCustomId('EmptyInventory')
              .setPlaceholder('Inventário vazio')
              .addOptions([
                {
                  label: '*Seu inventário está vazio*',
                  emoji: '❌',
                  value: 'empty',
                },
              ]);

      const rowAction = new Discord.ActionRowBuilder().addComponents(selectMenu);

      await interaction.reply({
        embeds: [embed],
        components: [rowAction],
        ephemeral: false,
      });
    } catch (err) {
      console.error(err);
      await interaction.reply('Ocorreu um erro ao acessar o inventário.');
    }
  },
};

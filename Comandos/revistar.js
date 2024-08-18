const Discord = require('discord.js');
const config = require('../Configs/config.json');
const configitems = require('../Configs/items.json');
const { Usuario } = require("../Usuario");// Importe a classe Usuario

module.exports = {
  name: 'revistar',
  description: 'Revista o inventário de um jogador.',
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'user',
      description: 'O usuário a ser revistado.',
      type: Discord.ApplicationCommandOptionType.User,
      required: true,
    },
  ],

  run: async (client, interaction) => {
    const targetUser = interaction.options.getUser('user');
    const executor = interaction.user;

    if (targetUser.id === interaction.user.id) {
      return interaction.reply({
        content: 'Você não pode revistar a si próprio.',
        ephemeral: true,
      });
    }

    // Verifica se o executor tem um cargo específico
    const hasRole = interaction.member.roles.cache.some((role) =>
      config.revistar.permissao.includes(role.id)
    );

    if (!hasRole) {
      // Se não tiver o cargo, envia uma solicitação de confirmação
      const confirmationRow = new Discord.ActionRowBuilder().addComponents(
        new Discord.ButtonBuilder()
          .setCustomId('confirmRevista')
          .setLabel('Confirmar')
          .setStyle(Discord.ButtonStyle.Primary),
        new Discord.ButtonBuilder()
          .setCustomId('denyRevista')
          .setLabel('Negar')
          .setStyle(Discord.ButtonStyle.Danger)
      );

      await interaction.reply({
        content: `${targetUser}, você permite ser revistado por ${executor}?`,
        components: [confirmationRow],
      });

      const filter = (i) =>
        ['confirmRevista', 'denyRevista'].includes(i.customId) && i.user.id === targetUser.id;

      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        time: 60000,
      });

      collector.on('collect', async (i) => {
        if (i.customId === 'confirmRevista') {
          await i.update({ content: `Revista confirmada por ${targetUser}.`, components: [] });
          await retrieveAndDisplayInventory(targetUser, executor, interaction);
        } else {
          await i.update({ content: `Revista negada por ${targetUser}.`, components: [] });
        }
      });

      collector.on('end', (collected) => {
        if (collected.size === 0) {
          interaction.editReply({
            content: 'Tempo para confirmação expirou.',
            components: [],
          });
        }
      });
    } else {
      // Se tiver o cargo, prossegue sem confirmação
      await interaction.reply({ content: 'Revistando o inventário...', ephemeral: true });
      await retrieveAndDisplayInventory(targetUser, executor, interaction);
    }
  },
};

// Função para recuperar e exibir o inventário
const retrieveAndDisplayInventory = async (targetUser, executor, interaction) => {
  try {
    // Criação da instância do usuário
    const targetUsuario = new Usuario(targetUser.id);
    const executorUsuario = new Usuario(executor.id);

    // Recuperar o inventário e a capacidade
    const inventory = await targetUsuario.inventario();
    const capacity = await targetUsuario.capacidade() || config.defaultCapacity;
    const carteira = await executorUsuario.carteira() || 0;

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
          description += `**${item.name}**\nQuantidade: ${quantity}\n\n`;
        }
      });

    const embed = new Discord.EmbedBuilder()
      .setTitle(`Inventário de ${targetUser.username}`)
      .setDescription(description || 'Seu inventário está vazio.')
      .addFields({
        name: '🎒 Peso Atual',
        value: `${currentWeight}/${capacity}`,
        inline: false,
      })
      .addFields({
        name: '💵 Dinheiro na Carteira',
        value: `${carteira}`,
        inline: false,
      })
      .setColor(config.embedColor);

    // Cria opções de seleção
    const options = Object.entries(inventory).length > 0
      ? Object.entries(inventory)
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
        .filter(Boolean)
      : [{ label: 'Inventário Vazio', value: 'empty', description: 'Nenhum item no inventário.' }];

    const selectMenu = new Discord.StringSelectMenuBuilder()
      .setCustomId('TakeSelectItemRevista')
      .setPlaceholder('Selecione um item para removê-lo')
      .addOptions(options);

    const rowAction = new Discord.ActionRowBuilder().addComponents(selectMenu);

    await interaction.followUp({
      embeds: [embed],
      components: [rowAction],
      ephemeral: true,
    });

    const filter = (i) =>
      i.customId === 'TakeSelectItemRevista' && i.user.id === executor.id;

    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 60000,
    });

    collector.on('collect', async (i) => {
      const selectedItemId = i.values[0];
      if (selectedItemId === 'empty') {
        return i.update({ content: 'O inventário está vazio.', components: [] });
      }

      const selectedItem = configitems.items.find(
        (item) => item.id === parseInt(selectedItemId)
      );

      // Usando a classe Usuario para remover e dar itens
      const takeResult = await targetUsuario.TakeItem(selectedItemId, 1);
      if (takeResult.includes('Quantidade insuficiente')) {
        return i.update({ content: takeResult, components: [] });
      }

      await executorUsuario.GiveItem(selectedItemId, 1);

      await i.update({
        content: `Você removeu ${selectedItem.name} do inventário de ${targetUser.username} e adicionou ao seu inventário.`,
        components: [],
      });

      // Atualiza a lista de itens no selectMenu
      const updatedInventory = await targetUsuario.inventario();
      const newOptions = Object.entries(updatedInventory).length > 0
        ? Object.entries(updatedInventory)
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
          .filter(Boolean)
        : [{ label: 'Inventário Vazio', emoji: '❌', value: 'empty', description: 'Nenhum item no inventário.' }];

      const newSelectMenu = new Discord.StringSelectMenuBuilder()
        .setCustomId('TakeSelectItemRevista')
        .setPlaceholder('Selecione um item para removê-lo')
        .addOptions(newOptions);

      const newRowAction = new Discord.ActionRowBuilder().addComponents(newSelectMenu);

      await interaction.followUp({
        content: `Selecione outro item do inventário de ${targetUser.username}:`,
        components: [newRowAction],
        ephemeral: true,
      });
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        await interaction.editReply({
          content: 'Tempo para seleção de item expirou.',
          components: [],
        });
      }
    });
  } catch (error) {
    console.error('Erro ao recuperar o inventário:', error);
    await interaction.followUp({
      content: 'Ocorreu um erro ao recuperar o inventário.',
      ephemeral: true,
    });
  }
};

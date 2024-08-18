const { Client, GatewayIntentBits, Events, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');
const { Database } = require('sqlite3');
const config = require('../Configs/config.json');
const configitems = require('../Configs/items.json');
const client = require('../index'); // Certifique-se de que está importando o cliente corretamente
const { Usuario } = require("../Usuario");// Importe a classe Usuario

const db = new Database('./dados.db');

// Função para executar ações baseadas no ID do item
const handleItemAction = async (user, itemId, quantity) => {
  const item = configitems.items.find(item => item.id === parseInt(itemId));

  if (!item) {
    return 'Item desconhecido.';
  }

  let responseMessage = '';

  switch (item.id) {
    case 1: // Lockpick
        responseMessage = `Você está usando x${quantity} ${item.name}.`;
        await user.TakeItem(itemId, quantity);
        await lockpickUse()
        break;
    case 2: // C4
        responseMessage = `Você está usando x${quantity} ${item.name}.`;
        await user.TakeItem(itemId, quantity);
        await C4Use()
        break;
    case 11: // Pistola de Combate
    case 12: // Pistola .50
    case 13: // SNS Pistola
    case 14: // Pistola Pesada
    case 15: // Pistola Marcadora
    case 16: // Rifle de Assalto
    case 17: // Rifle Carabina
    case 18: // Rifle Avançado
    case 19: // Rifle Bullpup
    case 20: // Rifle Compacto
    case 21: // Rifle de Carabina MK II
    case 22: // Rifle de Assalto MK II
    case 23: // Micro SMG
    case 24: // SMG
    case 25: // SMG Avançada
    case 26: // SMG de Assalto
    case 27: // SMG Compacta
    case 28: // Escopeta de Cano Serrado
    case 29: // Escopeta de Assalto
    case 30: // Escopeta Pesada
    case 31: // Escopeta de Combate
    case 32: // Escopeta Bullpup
    case 33: // Escopeta de Combate MK II
    case 34: // Rifle de Precisão
    case 35: // Rifle de Precisão Pesado
    case 36: // Rifle de Precisão Avançado
    case 37: // Rifle de Precisão MK II
    case 38: // Metralhadora
    case 39: // Metralhadora Avançada
    case 40: // Metralhadora Leve
    case 41: // Faca
    case 42: // Porrete
    case 43: // Chave Inglesa
    case 44: // Fuzil de Precisão
    case 45: // Fuzil Bullpup
        responseMessage = `Você equipou x${quantity} ${item.name}.`;
        break;
    
    case 3: // Kit Médico
    case 10: // Medkit Avançado
        responseMessage = `Você usou x${quantity} ${item.name}. Sua saúde está restaurada!`;
        await user.TakeItem(itemId, quantity);
        break;
    
    case 4: // Mochila
        const currentCapacity = await user.capacidade();
        const newCapacity = currentCapacity + item.extraCapacity;
        await user.setCapacidade(newCapacity);
        await user.TakeItem(itemId, quantity);
        responseMessage = `Você usou uma Mochila. Sua capacidade de carga foi aumentada em ${item.extraCapacity} unidades para um total de ${newCapacity} unidades!`;
        break;
    
    case 5: // Garrafa d'Água
        responseMessage = `Você usou x${quantity} Garrafa(s) d'Água. Sua sede foi saciada!`;
        await user.TakeItem(itemId, quantity);
        break;
    
    case 6: // Hambúrguer
        responseMessage = `Você usou x${quantity} Hambúrguer(es). Sua fome foi saciada!`;
        await user.TakeItem(itemId, quantity);
        break;
    
    case 7: // Munição 9mm
    case 8: // Munição Rifle
    case 46: // Munição de Pistola
    case 47: // Munição de Pistola de Combate
    case 48: // Munição de Pistola .50
    case 49: // Munição de SNS Pistola
    case 50: // Munição de Pistola Pesada
    case 51: // Munição de Pistola Marcadora
    case 52: // Munição de Rifle de Assalto
    case 53: // Munição de Rifle Carabina
    case 54: // Munição de Rifle Avançado
    case 55: // Munição de Rifle Bullpup
    case 56: // Munição de Rifle Compacto
    case 57: // Munição de Rifle de Carabina MK II
    case 58: // Munição de Rifle de Assalto MK II
    case 59: // Munição de Micro SMG
    case 60: // Munição de SMG
    case 61: // Munição de SMG Avançada
    case 62: // Munição de SMG de Assalto
    case 63: // Munição de SMG Compacta
    case 64: // Munição de Escopeta de Cano Serrado
    case 65: // Munição de Escopeta de Assalto
    case 66: // Munição de Escopeta Pesada
    case 67: // Munição de Escopeta de Combate
    case 68: // Munição de Escopeta Bullpup
    case 69: // Munição de Escopeta de Combate MK II
    case 70: // Munição de Rifle de Precisão
    case 71: // Munição de Rifle de Precisão Pesado
    case 72: // Munição de Rifle de Precisão Avançado
    case 73: // Munição de Rifle de Precisão MK II
    case 74: // Munição de Metralhadora
    case 75: // Munição de Metralhadora Avançada
    case 76: // Munição de Metralhadora Leve
        responseMessage = `Você usou x${quantity} ${item.name}.`;
        await user.TakeItem(itemId, quantity);
        break;
    
    case 9: // Cerveja
        responseMessage = `Você usou x${quantity} Cerveja(s). A bebida pode afetar o seu desempenho.`;
        await user.TakeItem(itemId, quantity);
        break;

    default:
        responseMessage = `Você usou x${quantity} do item ${item.name}.`;
        break;
}


  return responseMessage;
};

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    // Verifica se a interação é um menu de seleção
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'UseItem') {
        const selectedItemId = interaction.values[0];

        // Criação do usuário
        const user = new Usuario(interaction.user.id);

        // Obtenha o inventário do usuário
        const inventory = await user.inventario();
        if (!inventory[selectedItemId]) {
          return await interaction.reply({
            content: 'Item não encontrado no seu inventário.',
            ephemeral: true,
          });
        }

        // Criação do modal com itemId no customId
        const modal = new ModalBuilder()
          .setCustomId(`useItemModal_${selectedItemId}`) // Incluindo o itemId no customId
          .setTitle(`Usar ${configitems.items.find(item => item.id === parseInt(selectedItemId)).name}`)
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('itemQuantity')
                .setLabel('Quantidade')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Insira a quantidade')
                .setRequired(true)
            )
          );

        await interaction.showModal(modal);
      }
    }

    // Verifica se a interação é um envio de modal
    if (interaction.isModalSubmit()) {
      if (interaction.customId.startsWith('useItemModal_')) {
        const itemId = interaction.customId.split('_')[1]; // Obtendo o itemId do customId do modal
        const quantity = parseInt(interaction.fields.getTextInputValue('itemQuantity'));

        // Verifica se a quantidade fornecida é válida
        if (isNaN(quantity) || quantity <= 0) {
          return await interaction.reply({
            content: 'Quantidade inválida fornecida.',
            ephemeral: true,
          });
        }

        // Criação do usuário
        const user = new Usuario(interaction.user.id);

        const responseMessage = await handleItemAction(user, itemId, quantity);

        await interaction.reply({
          content: responseMessage,
          ephemeral: true,
        });
      }
    }
  } catch (error) {
    console.error('Erro ao processar a interação:', error);
    await interaction.reply({
      content: 'Houve um erro ao processar sua interação.',
      ephemeral: true,
    });
  }
});

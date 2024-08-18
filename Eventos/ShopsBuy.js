// Arquivo onde você utiliza a classe Usuario
const {
  Events,
  ModalBuilder,
  TextInputBuilder,
  ActionRowBuilder,
  TextInputStyle,
} = require("discord.js");
const config = require("../Configs/config.json");
const configitems = require('../Configs/items.json');
const configshops = require('../Configs/shops.json');
const client = require("../index");
const { Usuario } = require("../Usuario"); // Ajuste a importação para usar desestruturação

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isStringSelectMenu()) return;
  if (interaction.customId !== "select_loja") return;

  const selectedItemId = interaction.values[0];
  const selectedItem = configitems.items.find(
    (item) => item.id.toString() === selectedItemId
  );

  const lojaConfig = configshops.lojas.find((loja) =>
    loja.itens.some((item) => item.id.toString() === selectedItemId)
  );

  const itemPrice = lojaConfig.itens.find(
    (item) => item.id.toString() === selectedItemId
  ).preco;

  
  const user = new Usuario(interaction.user.id); 

  try {
    
    const userMoney = await user.carteira(); 
    if (userMoney >= itemPrice) {
      await user.TakeMoney(itemPrice);
      await user.GiveItem(selectedItemId, 1);
      
      await interaction.reply({
        content: `Você comprou ${selectedItem.name} por ${itemPrice} moedas!`,
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "Você não tem dinheiro suficiente para comprar este item.",
        ephemeral: true,
      });
    }
  } catch (error) {
    console.error('Erro ao processar a interação:', error);
    await interaction.reply({
      content: 'Houve um erro ao processar sua compra.',
      ephemeral: true,
    });
  }
});

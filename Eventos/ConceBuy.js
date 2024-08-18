const {
  Events,
  ModalBuilder,
  TextInputBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  TextInputStyle,
  EmbedBuilder
} = require("discord.js");
const { Usuario } = require("../Usuario");
const FunctionVeh = require("../Veiculos");
const config = require("../Configs/config.json");
const configitems = require("../Configs/items.json");
const configveg = require("../Configs/veiculos.json");
const client = require("../index");
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("./dados.db");

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;

  // Check if the button click is for buying a vehicle
  if (interaction.customId.startsWith('comprarveh_')) {
    const vehicleModel = interaction.customId.split('_')[1];
    const vehicle = Object.values(configveg).flat().find(v => v.modelo === vehicleModel);

    if (!vehicle) {
      await interaction.reply({ content: 'Veículo não encontrado.', ephemeral: true });
      return;
    }

    const Comprador = new Usuario(interaction.user.id)
    if (Comprador.carteira() < vehicle.preco) {
      await interaction.reply({ content: 'Você não Possue dinheiro para comprar esse veiculo.', ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('Confirmação de Compra')
      .setDescription(`Você tem certeza que quer comprar **${vehicle.nome}** por R$ ${vehicle.preco}?`)
      .setColor('#000000');

    const confirmButton = new ButtonBuilder()
      .setCustomId(`confirmar-compra_${vehicle.modelo}`)
      .setLabel('Confirmar')
      .setStyle(ButtonStyle.Success);

    const cancelButton = new ButtonBuilder()
      .setCustomId('cancelar-compra')
      .setLabel('Cancelar')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder()
      .addComponents(confirmButton, cancelButton);

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  }

  // Handle confirmation or cancellation of the purchase
  if (interaction.customId.startsWith('confirmar-compra_')) {
    const vehicleModel = interaction.customId.split('_')[1];
    const vehicle = Object.values(configveg).flat().find(v => v.modelo === vehicleModel);
    const userId = interaction.user.id;

    
    if (!vehicle) {
      await interaction.reply({ content: 'Veículo não encontrado.', ephemeral: true });
      return;
    }
    
    try {
      const Comprador = new Usuario(interaction.user.id); 
      await Comprador.TakeMoney(vehicle.preco);
    
      const placa = await FunctionVeh.gerarPlaca();
      const chassi = await FunctionVeh.gerarChassi();
    
      await FunctionVeh.DarVeiculo(
        interaction.user.id,
        vehicle.nome,
        vehicle.modelo,
        new Date().toISOString(),
        false,
        placa, 
        'guardado',
        chassi 
      );
    
      await interaction.reply({
        content: `Compra realizada com sucesso! Você agora possui o veículo ${vehicle.nome}.`,
        ephemeral: true
      });
    } catch (error) {
      await interaction.reply({
        content: 'Houve um erro ao realizar a compra. Tente novamente mais tarde.',
        ephemeral: true
      });
      console.error(error);
    }
    
    
  }

  if (interaction.customId === 'cancelar-compra') {
    await interaction.reply({ content: 'Compra cancelada.', ephemeral: true });
  }
});

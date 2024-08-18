const Discord = require("discord.js");
const { Veiculo, RemoverVeiculo, DarVeiculo } = require("../Veiculos");
const { Usuario } = require("../Usuario");

module.exports = {
  name: "venderveiculo",
  description: "Venda um veículo para outro usuário.",
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: "user",
      description: "O usuário para quem você está vendendo o veículo.",
      type: Discord.ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "valor",
      description: "O valor pelo qual você está vendendo o veículo.",
      type: Discord.ApplicationCommandOptionType.Integer,
      required: true,
    },
  ],

  run: async (client, interaction) => {
    const vendedor = interaction.user;
    const comprador = interaction.options.getUser("user");
    const valor = interaction.options.getInteger("valor") || 0;

    if (!comprador || valor <= 0) {
      return interaction.reply({
        content: "Usuário ou valor inválido.",
        ephemeral: true,
      });
    }

    // Obter os veículos do vendedor
    const veiculos = await Veiculo.GetVehiclesByOwner(vendedor.id);
    if (veiculos.length === 0) {
      return interaction.reply({
        content: "Você não possui veículos para vender.",
        ephemeral: true,
      });
    }

    // Criar um menu de seleção com os veículos
    const vehicleOptions = veiculos.map((veiculo) => ({
      label: `${veiculo.Nome} (${veiculo.Placa})`,
      value: veiculo.Placa,
    }));

    const selectMenu = new Discord.StringSelectMenuBuilder()
      .setCustomId("veiculo_select")
      .setPlaceholder("Selecione o veículo")
      .addOptions(vehicleOptions);

    const actionRow = new Discord.ActionRowBuilder().addComponents(selectMenu);

    // Enviar mensagem para o vendedor com o menu de seleção
    await interaction.reply({
      content: "Selecione o veículo que deseja vender:",
      components: [actionRow],
      ephemeral: true,
    });

    // Criar um coletor para o menu de seleção
    const filter = (i) =>
      i.customId === "veiculo_select" && i.user.id === vendedor.id;
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 60000,
    });

    collector.on("collect", async (i) => {
      if (i.customId === "veiculo_select") {
        const placaVeiculo = i.values[0];

        // Obter os detalhes do veículo selecionado
        const veiculo = new Veiculo(vendedor.id, placaVeiculo);
        try {
          const nomeVeiculo = await veiculo.GetVehName();
          const modeloVeiculo = await veiculo.GetVehModel();
          const dataCompra = await veiculo.GetVehDataBuy();
          const seguro = await veiculo.GetVehSeguro();
          const status = await veiculo.GetStatus();
          const chassi = await veiculo.GetChassi();

          // Obter os detalhes do comprador
          const usuarioComprador = new Usuario(comprador.id);
          const saldoComprador = await usuarioComprador.carteira();

          if (saldoComprador < valor) {
            return i.reply({
              content: "O comprador não tem dinheiro suficiente.",
              ephemeral: true,
            });
          }

          // Perguntar ao comprador se ele deseja comprar o veículo
          const confirmarCompra = new Discord.ActionRowBuilder().addComponents(
            new Discord.ButtonBuilder()
              .setCustomId("confirmar_compra")
              .setLabel("Confirmar Compra")
              .setStyle(Discord.ButtonStyle.Primary),
            new Discord.ButtonBuilder()
              .setCustomId("recusar_compra")
              .setLabel("Recusar Compra")
              .setStyle(Discord.ButtonStyle.Danger)
          );

          await i.reply({
            content: `O(A) ${comprador} deseja comprar o veículo ${nomeVeiculo} por **R$${valor}**`,
            components: [confirmarCompra],
          });

          const compraFilter = (i) =>
            i.customId === "confirmar_compra" || i.customId === "recusar_compra";
          const compraCollector = i.channel.createMessageComponentCollector({
            filter: compraFilter,
            time: 60000,
          });

          compraCollector.on("collect", async (i) => {
            if (i.customId === "confirmar_compra") {
              // Realizar a transação
              await RemoverVeiculo(vendedor.id, placaVeiculo);
              await DarVeiculo(
                comprador.id,
                nomeVeiculo,
                modeloVeiculo,
                dataCompra,
                seguro,
                placaVeiculo,
                status,
                chassi
              );
              await usuarioComprador.TakeMoney(valor);
              const usuarioVendedor = new Usuario(vendedor.id);
              await usuarioVendedor.GiveMoney(valor);

              return i.reply({
                content: `Você vendeu o veículo ${nomeVeiculo} para ${comprador.tag} por ${valor} moedas!`,
                ephemeral: true,
              });
            } else if (i.customId === "recusar_compra") {
              return i.reply({
                content: `A compra do veículo ${nomeVeiculo} foi cancelada.`,
                ephemeral: true,
              });
            }
          });

          compraCollector.on("end", (collected) => {
            if (collected.size === 0) {
              i.editReply({
                content: "A confirmação da compra expirou.",
                components: [],
              });
            }
          });
        } catch (err) {
          console.error(err);
          return i.reply({
            content: "Erro ao obter os detalhes do veículo.",
            ephemeral: true,
          });
        }
      }
    });

    collector.on("end", (collected) => {
      if (collected.size === 0) {
        interaction.editReply({
          content: "A seleção do veículo expirou.",
          components: [],
        });
      }
    });
  },
};

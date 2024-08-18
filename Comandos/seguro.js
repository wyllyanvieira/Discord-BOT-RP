const Discord = require("discord.js");
const { Veiculo } = require("../Veiculos");
const { Usuario } = require("../Usuario");
const config = require("../Configs/config.json");
const configveh = require("../Configs/veiculos.json");

module.exports = {
  name: "seguro",
  description: "Realize a aplicação do seguro em seus veículos.",
  type: Discord.ApplicationCommandType.ChatInput,

  run: async (client, interaction) => {
    const userId = interaction.user.id;

    try {
      // Obtenha todos os veículos do usuário
      const vehicles = await Veiculo.GetVehiclesByOwner(userId);

      if (!vehicles.length) {
        return interaction.reply("Você não possui veículos.");
      }

      // Crie uma lista de opções para os veículos do usuário
      const vehicleOptions = vehicles.map((vehicle) => ({
        label: `${vehicle.Nome} (${vehicle.Placa})`,
        value: vehicle.Placa
      }));

      const vehicleSelectMenu = new Discord.StringSelectMenuBuilder()
        .setCustomId("select_vehicle")
        .setPlaceholder("Selecione um veículo para aplicar o seguro")
        .addOptions(vehicleOptions);

      const row = new Discord.ActionRowBuilder().addComponents(vehicleSelectMenu);

      await interaction.reply({
        content: "Selecione um veículo para aplicar o seguro:",
        components: [row]
      });

      const filter = (i) => i.customId === "select_vehicle" && i.user.id === userId;
      const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

      collector.on("collect", async (i) => {
        const selectedPlaca = i.values[0];
        const veiculo = new Veiculo(userId, selectedPlaca);

        const nome = await veiculo.GetVehName();
        const modelo = await veiculo.GetVehModel();
        const seguro = await veiculo.GetVehSeguro();
         
        // Encontre o valor do veículo no arquivo configveh
        let valorVeiculo = null;
        for (const category in configveh) {
          const vehiclesInCategory = configveh[category];
          for (const vehicle of vehiclesInCategory) {
            if (vehicle.modelo === modelo) {
              valorVeiculo = vehicle.preco;
              break;
            }
          }
          if (valorVeiculo) break;
        }

        if (seguro) {
          return i.reply({ content: "Este veículo já possui seguro.", ephemeral: true });
        }

        if (!valorVeiculo) {
          return i.reply({ content: "Não foi possível encontrar o valor do veículo.", ephemeral: true });
        }

        const porcentagemSeguro = config["porcentagem-seguro"] / 100;
        const valorSeguro = valorVeiculo * porcentagemSeguro;

        const usuario = new Usuario(userId);
        const carteira = await usuario.carteira();

        if (carteira < valorSeguro) {
          return i.reply({ content: "Você não tem dinheiro suficiente para aplicar o seguro.", ephemeral: true });
        }

        // Deduzir o valor do seguro da carteira do usuário
        await usuario.TakeMoney(valorSeguro);
        await veiculo.SetSeguro(true);

        i.reply({
          content: `Seguro aplicado com sucesso ao veículo ${nome} (${selectedPlaca}). Valor do seguro: $${valorSeguro}.`,
          ephemeral: true
        });
      });

      collector.on("end", (collected) => {
        if (collected.size === 0) {
          interaction.followUp({ content: "Tempo esgotado. Nenhum veículo foi selecionado.", ephemeral: true });
        }
      });

    } catch (err) {
      console.error("Erro ao executar o comando seguro:", err);
      interaction.reply({ content: "Ocorreu um erro ao tentar aplicar o seguro.", ephemeral: true });
    }
  }
};

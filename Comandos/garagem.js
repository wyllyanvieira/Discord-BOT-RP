const Discord = require("discord.js");
const { Veiculo } = require("../Veiculos");
const config = require("../Configs/config.json");

module.exports = {
  name: "garagem",
  description: "Veja os veículos que você possui em sua garagem.",
  type: Discord.ApplicationCommandType.ChatInput,

  run: async (client, interaction) => {
    const createPaginationButtons = (currentPage, totalPages, vehicle) => {
      return new Discord.ActionRowBuilder().addComponents(
        new Discord.ButtonBuilder()
          .setCustomId("previous-page-garage")
          .setLabel("⬅️")
          .setStyle(Discord.ButtonStyle.Primary)
          .setDisabled(currentPage === 0),
        new Discord.ButtonBuilder()
          .setCustomId(`alterar-status_${vehicle.Placa}`)
          .setLabel(vehicle.Status === "guardado" ? "Retirar" : "Guardar")
          .setStyle(Discord.ButtonStyle.Success),
        new Discord.ButtonBuilder()
          .setCustomId("next-page-garage")
          .setLabel("➡️")
          .setStyle(Discord.ButtonStyle.Primary)
          .setDisabled(currentPage === totalPages - 1)
      );
    };

    const createVehiclesEmbed = (vehicle) => {
      return new Discord.EmbedBuilder()
        .setTitle(`***🏬*** | ***Garagem:***`)
        .setImage(`https://docs.fivem.net/vehicles/${vehicle.Modelo}.webp`)
        .setThumbnail(`https://cdn.discordapp.com/attachments/605152859155333163/1259152427857477643/New_Project_20_B8DAF5B.png?ex=668b4d54&is=6689fbd4&hm=c2a8ef8b2684465975124108c977cc4a2933460afc3fcd7d0970243c9f2848e2&`)
        .setDescription(`
          ***Veículo:***\n\`\`\`${vehicle.Nome}\`\`\`
          ***Status:***\n\`\`\`${vehicle.Status}\`\`\`
          ***Placa:***\n\`\`\`${vehicle.Placa}\`\`\`
          ***Chassi:***\n\`\`\`${vehicle.Chassi}\`\`\`
          ***Seguro:***\n\`\`\`${vehicle.Seguro === 0 ? "Veiculo Sem Seguro" : "Veiculo Assegurado"}\`\`\`
        `)
        .setColor(config.embedColor);
    };

    const userId = interaction.user.id;
    const userVehicles = await Veiculo.GetVehiclesByOwner(userId);
    if (userVehicles.length === 0) {
      await interaction.reply({
        content: "Você não possui veículos em sua garagem.",
        ephemeral: true,
      });
      return;
    }

    let currentPage = 0;
    const totalPages = userVehicles.length;

    const embed = createVehiclesEmbed(userVehicles[currentPage]);
    const buttons = createPaginationButtons(
      currentPage,
      totalPages,
      userVehicles[currentPage]
    );

    await interaction.reply({
      content: `*${interaction.user}*`,
      embeds: [embed],
      components: [buttons],
    });

    const filter = (i) => i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 60000,
    });

    collector.on("collect", async (i) => {
      if (i.customId === "previous-page-garage" || i.customId === "next-page-garage") {
        if (i.customId === "previous-page-garage" && currentPage > 0) {
          currentPage--;
        } else if (i.customId === "next-page-garage" && currentPage < totalPages - 1) {
          currentPage++;
        }
      } else if (i.customId.startsWith("alterar-status_")) {
        const placa = i.customId.split("_")[1];
        const vehicle = userVehicles.find((v) => v.Placa === placa);
        const newStatus = vehicle.Status === "guardado" ? "retirado" : "guardado";

        const veiculoInstance = new Veiculo(userId, placa);
        await veiculoInstance.SetStatus(newStatus);

        vehicle.Status = newStatus;
      }

      const updatedEmbed = createVehiclesEmbed(userVehicles[currentPage]);
      const updatedButtons = createPaginationButtons(
        currentPage,
        totalPages,
        userVehicles[currentPage]
      );

      await i.update({ embeds: [updatedEmbed], components: [updatedButtons] });
    });

    collector.on("end", (collected) => {
      if (collected.size === 0) {
        interaction.followUp({
          content: "Tempo esgotado para visualizar os veículos.",
          ephemeral: true,
        });
      }
    });
  },
};

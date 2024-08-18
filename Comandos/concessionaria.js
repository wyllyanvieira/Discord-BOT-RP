const Discord = require("discord.js");
const configveh = require("../Configs/veiculos.json");
const config = require("../Configs/config.json");

module.exports = {
  name: "concessionaria",
  description: "Conheça os veículos da concessionária.",
  type: Discord.ApplicationCommandType.ChatInput,

  run: async (client, interaction) => {
    // Função para criar o menu de seleção de categorias
    const createCategorySelectMenu = () => {
      const selectMenu = new Discord.StringSelectMenuBuilder()
        .setCustomId("select-category-conce")
        .setPlaceholder("Selecione uma categoria");

        Object.keys(configveh).forEach((category) => {
          let emoji;
          switch (category) {
              case 'SUV':
                  emoji = '🚙';
                  break;
              case 'Motos':
                  emoji = '🏍️';
                  break;
              case 'Carros':
                  emoji = '🚗';
                  break;
              case 'Esportivos':
                  emoji = '🏎️';
                  break;
              case 'Vans':
                  emoji = '🚐';
                  break;
              default:
                  emoji = '🚗';
                  break;
          }
      
          selectMenu.addOptions({
              label: category,
              value: category,
              emoji: emoji,
          });
      });

      return new Discord.ActionRowBuilder().addComponents(selectMenu);
    };

    // Função para criar os botões de paginação e compra
    const createPaginationButtons = (currentPage, totalPages, vehicle) => {
      return new Discord.ActionRowBuilder().addComponents(
        new Discord.ButtonBuilder()
          .setCustomId("previous-page-conce")
          .setLabel("↩")
          .setStyle(Discord.ButtonStyle.Primary)
          .setDisabled(currentPage === 0),
        new Discord.ButtonBuilder()
          .setCustomId(`comprarveh_${vehicle.modelo}`)
          .setLabel("Comprar")
          .setStyle(Discord.ButtonStyle.Success),
        new Discord.ButtonBuilder()
          .setCustomId("next-page-conce")
          .setLabel("↪")
          .setStyle(Discord.ButtonStyle.Primary)
          .setDisabled(currentPage === totalPages - 1),
      );
    };

    // Função para criar o embed de veículos
    const createVehiclesEmbed = (category, page) => {
      const vehicles = configveh[category];
      const vehicle = vehicles[page];

      return new Discord.EmbedBuilder()
        .setThumbnail('https://cdn.discordapp.com/attachments/605152859155333163/1259152427857477643/New_Project_20_B8DAF5B.png?ex=668aa494&is=66895314&hm=b9e92463be5c7135829c8357f1b7a6fe9d36c7e2bdc46d7bc583d5645031944a&')
        .setTitle("***🏢*** | ***Concessionária***")
        .setDescription(`*Veja as informações do veículo abaixo:*`)
        .addFields([{
          name:"***Veículo:***",
          value: `*${vehicle.nome}*`},
          {
            name:"***Preço:***",
            value: `*R$${vehicle.preco}*`}])
        .setImage(vehicle.imagem)
        .setColor("#000000");
    };

    let embed1 = new Discord.EmbedBuilder()
    .setTitle("***🏢*** | ***Concessionária***")
    .setDescription("***Selecione uma categoria abaixo para visualizar os veículos disponíveis:***")
    .setTimestamp(Date.now())
    .setColor("#000000")
    .setThumbnail(interaction.user.displayAvatarURL())
    .setAuthor({ 
        name: client.user.username,
        iconURL: client.user.displayAvatarURL({ dynamic: true }) })
    .setFooter({
        iconURL: client.user.displayAvatarURL(),
        text: `Sistema exclusivo ${client.user.username}`
    });
    // Enviar o menu de seleção de categorias
    await interaction.reply({
      embeds: [embed1],
      components: [createCategorySelectMenu()],
    });

    // Coletor para a seleção de categoria
    const filter = (i) => i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 60000,
    });

    let currentPage = 0;
    let selectedCategory = null;

    collector.on("collect", async (i) => {
      if (i.customId === "select-category-conce") {
        selectedCategory = i.values[0];
        currentPage = 0;
        const totalPages = configveh[selectedCategory].length;
        const embed = createVehiclesEmbed(selectedCategory, currentPage);
        const buttons = createPaginationButtons(
          currentPage,
          totalPages,
          configveh[selectedCategory][currentPage]
        );

        await i.update({ embeds: [embed], components: [buttons] });
      } else if (i.customId === "previous-page-conce" || i.customId === "next-page-conce") {
        const totalPages = configveh[selectedCategory].length;
        if (i.customId === "previous-page-conce" && currentPage > 0) {
          currentPage--;
        } else if (i.customId === "next-page-conce" && currentPage < totalPages - 1) {
          currentPage++;
        }
        const embed = createVehiclesEmbed(selectedCategory, currentPage);
        const buttons = createPaginationButtons(
          currentPage,
          totalPages,
          configveh[selectedCategory][currentPage]
        );

        await i.update({ embeds: [embed], components: [buttons] });
      }
    });

    collector.on("end", (collected) => {
      if (collected.size === 0) {
        interaction.followUp({
          content: "Tempo esgotado para selecionar uma categoria.",
          ephemeral: true,
        });
      }
    });
  },
};

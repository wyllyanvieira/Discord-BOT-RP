const Discord = require("discord.js");
const { Usuario } = require("../Usuario");
const { Veiculo, RemoverVeiculo, BuscarVeh } = require("../Veiculos");
const configveh = require("../Configs/veiculos.json");
const config = require("../Configs/config.json");

module.exports = {
  name: "desmanchar",
  description: "Utilize esse comando para desmanchar veiculo.",
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: "placa",
      description: "Informe a placa do veiuclo que vai ser desmanchado.",
      type: Discord.ApplicationCommandOptionType.String,
      required: true,
    },
  ],

  run: async (client, interaction) => {
    const placa = interaction.options.getString("placa");
    const userId = interaction.user.id;

    try {
      const veiculoRows = await BuscarVeh("Placa", placa);
      if (veiculoRows.length === 0) {
        return interaction.reply({content: "Veículo não encontrado.", ephemeral: true });
      }

      const veiculo = veiculoRows[0];
      const VeiculoObjeto = new Veiculo(veiculo.OwnerID, placa);
      const temSeguro = veiculo.Seguro;
      const modeloVeiculo = veiculo.Modelo;

      // Função auxiliar para buscar o veículo pelo modelo
      function buscarVeiculoPorModelo(modelo) {
        for (let categoria in configveh) {
          for (let veiculo of configveh[categoria]) {
            if (veiculo.modelo === modelo) {
              return veiculo;
            }
          }
        }
        return null;
      }

      const veiculoConfig = buscarVeiculoPorModelo(modeloVeiculo);
      if (!veiculoConfig) {
        return interaction.reply({content: "Modelo de veículo não encontrado na configuração.", ephemeral: true });
      }

      // Calcula o valor de desmanche
      const porcentagem = config["porcentagem-desmanche"] / 100; // Ajuste a porcentagem conforme necessário
      const valorRecebido = veiculoConfig.preco * porcentagem;
      const itemId = 78; // ID do item que será dado ao usuário

      if (temSeguro) {
        // Atualiza o seguro e status do veículo
        await VeiculoObjeto.SetSeguro(0);
      } else {
        await RemoverVeiculo(veiculo.OwnerID, placa);
      }

      // Função para criar a barra de progresso
      function createProgressBar(currentTime, totalTime) {
        const totalBlocks = 10; // Total de blocos na barra de progresso
        const filledBlocks = Math.round((currentTime / totalTime) * totalBlocks);
        const emptyBlocks = totalBlocks - filledBlocks;
      
        const progressBar = '🟩'.repeat(filledBlocks) + '⬛'.repeat(emptyBlocks);
        return progressBar;
      }

      const totalTime = 30; // Tempo total em segundos para completar o desmanche
      let currentTime = 0;

      const embed = new Discord.EmbedBuilder()
        .setTitle('Desmanchando veículo...')
        .setDescription(createProgressBar(currentTime, totalTime))
        .setColor(config.embedColor);

      const message = await interaction.reply({ embeds: [embed], fetchReply: true });

      const interval = setInterval(async () => {
        currentTime += 1;
        const updatedEmbed = new Discord.EmbedBuilder()
          .setTitle('Desmanchando veículo...')
          .setDescription(createProgressBar(currentTime, totalTime))
          .setColor(config.embedColor);
        
        await message.edit({ embeds: [updatedEmbed]});

        if (currentTime >= totalTime) {
          clearInterval(interval);
          await message.delete(); // Deleta a mensagem de progresso
          const usuario = new Usuario(userId);
          await usuario.GiveItem(itemId, valorRecebido);
          await interaction.followUp({content: `Você desmanchou o veículo com a placa ${placa} e recebeu ${valorRecebido} de Dinheiro sujo.`, ephemeral: true});
        }
      }, 1000);
    } catch (err) {
      console.error(err);
      return interaction.reply({content: "Ocorreu um erro ao tentar desmanchar o veículo.", ephemeral: true });
    }
  }
};

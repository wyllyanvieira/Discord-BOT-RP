const Discord = require("discord.js");
const { Usuario, EnviarLogEmprego } = require("../Usuario"); // Ajuste o caminho conforme necessário
const config = require('../Configs/config.json');
const { Flood } = require('discord-gamecord');
// Função para criar a barra de progresso
function createProgressBar(currentTime, totalTime) {
  const totalBlocks = 10; // Total de blocos na barra de progresso
  const filledBlocks = Math.round((currentTime / totalTime) * totalBlocks);
  const emptyBlocks = totalBlocks - filledBlocks;

  const progressBar = '🟩'.repeat(filledBlocks) + '⬛'.repeat(emptyBlocks);
  return progressBar;
}

module.exports = {
  name: "lavardinheiro", 
  description: "Comando referente a lavagem de dinheiro", 
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'quantidade',
      description: 'Descreva a quantidade de dinheiro sujo a ser limpo.',
      type: Discord.ApplicationCommandOptionType.Number,
      required: true,
    },
  ],

  run: async (client, interaction) => {
    const user =  new Usuario(interaction.user.id)
    const quantidade = interaction.options.getNumber('quantidade');
    const itemquantidade = await user.GetItem(78)
    if (itemquantidade.quantity <= quantidade)  {
      interaction.reply({content: "Você não possue essa quantidade de dinheiro sujo", ephemeral: true })
    }
    const Game = new Flood({
      message: interaction,
      isSlashGame: false,
      embed: {
        title: 'lavagem de Dinheiro',
        color: '#5865F2',
        description: 'Complete as Cores usando os botões abaixo quanto maior o turnos feitos maior o desconto de dinheiro'
      },
      difficulty: 6,
      timeoutTime: 60000,
      buttonStyle: 'PRIMARY',
      emojis: ['🟥', '🟦', '🟧', '🟪', '🟩'],
      winMessage: `Você Finalizou com **{turns}** turnos e limpou ${quantidade}.`,
      loseMessage: `Você nao finalizou porem fez **{turns}** turno comsegui-o limpar ${quantidade/2}.`,
      playerOnlyMessage: 'Apenas {player} Pode Utilizar esses botões.'
    });

Game.startGame();
Game.on('gameOver', async result => {
  console.log(result);  // =>  { result... }
  if (result.result === 'win') {
    
    await user.TakeItem(78, quantidade)
    await user.GiveMoney(quantidade)
      
  } else if (result.result === 'lose') {
    await user.TakeItem(78, quantidade)
    await user.GiveMoney(quantidade / 2) 
   }
});

  }
};

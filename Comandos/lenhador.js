const Discord = require("discord.js");
const { Usuario, EnviarLogEmprego } = require("../Usuario"); // Ajuste o caminho conforme necessário
const config = require('../Configs/config.json');
const configjob = require('../Configs/empregos.json'); // Importa o arquivo empregos.json

// Função para criar a barra de progresso
function createProgressBar(currentTime, totalTime) {
  const totalBlocks = 10; // Total de blocos na barra de progresso
  const filledBlocks = Math.round((currentTime / totalTime) * totalBlocks);
  const emptyBlocks = totalBlocks - filledBlocks;

  const progressBar = '🟩'.repeat(filledBlocks) + '⬛'.repeat(emptyBlocks);
  return progressBar;
}

module.exports = {
  name: "lenhador", // Coloque o nome do comando
  description: "Comando referente ao trabalho de lenhador", // Coloque a descrição do comando
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'prova',
      description: 'Anexe a prova que você está no trabalho de lenhador.',
      type: Discord.ApplicationCommandOptionType.Attachment,
      required: false,
    },
  ],

  run: async (client, interaction) => {
    const prova = interaction.options.getAttachment('prova');
    const usuario = interaction.member; // Pega o membro que usou o comando
    const voiceChannel = usuario.voice.channel; // Canal de voz em que o usuário está

   // Verifica se o usuário está no canal de voz especificado
   if (!voiceChannel || voiceChannel.id !== configjob.lenhador.callEmprego) {
     return interaction.reply({ content: "Você precisa estar no canal de voz correto para executar este comando.", ephemeral: true });
   }

    const totalTime = 10; // Tempo total da barra de progresso em segundos
    let currentTime = totalTime;
    let emojiIndex = 0;
    const emojis = ['🪵🪓', '🌲🪓'];

    // Seleciona uma árvore aleatória do array do configjob
    const arvores = configjob.lenhador.trees;
    const arvore = arvores[Math.floor(Math.random() * arvores.length)];

    const progressMessage = await interaction.reply({ 
      content: `${emojis[emojiIndex]}\nDerrubando Arvore...\n${createProgressBar(currentTime, totalTime)} ${currentTime}s`,
      fetchReply: true
    });

    const interval = setInterval(async () => {
      currentTime--;
      emojiIndex = (emojiIndex + 1) % emojis.length;

      if (currentTime >= 0) {
        await progressMessage.edit(`${emojis[emojiIndex]} ${interaction.user}\nDerrubando Arvore...\n${createProgressBar(currentTime, totalTime)} ${currentTime}s`);
      } else {
        clearInterval(interval);
        const usuario = new Usuario(interaction.user.id);
        await usuario.GiveMoney(arvore.valor)
        await progressMessage.edit(`${interaction.user} Trabalho de lenhador concluído! Foi derrubada uma árvore de ${arvore.tipo} e você ganhou ${arvore.valor}!`);
        
        // Chama a função EnviarLog ao final
        await EnviarLogEmprego(
          configjob.lenhador.logChannelId, // Usa o ID do canal de log do configjob
          `O Usuario ${interaction} cortou uma árvore de ${arvore.tipo} e você ganhou ${arvore.valor} realzie alaise da prova que le derrubou a arvore e aprove ou rejeite a mesma!`,
          prova ? prova.url : null,
          client,
          interaction.user,
          arvore.valor
        );
      }
    }, 1000);
  }
};

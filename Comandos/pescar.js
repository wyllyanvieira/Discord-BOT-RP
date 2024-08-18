const Discord = require("discord.js");
const { Usuario, EnviarLogEmprego  } = require("../Usuario"); // Ajuste o caminho conforme necessário
const { MatchPairs } = require('discord-gamecord');
const config = require('../Configs/config.json');
const configjob = require('../Configs/empregos.json');

async function EnviarLog(channelId, mensagem, prova, client, usuario, valor) {
  const channel = await client.channels.fetch(channelId);
  if (!channel) {
    console.error("Canal não encontrado!");
    return;
  }

  const row = new Discord.ActionRowBuilder()
    .addComponents(
      new Discord.ButtonBuilder()
        .setCustomId(`jobaprovar_${valor}_${usuario.id}`)
        .setLabel('Aprovar')
        .setStyle(Discord.ButtonStyle.Success),
      new Discord.ButtonBuilder()
        .setCustomId(`jobreprovar_${valor}_${usuario.id}`)
        .setLabel('Reprovar')
        .setStyle(Discord.ButtonStyle.Danger)
    );

  const embed = new Discord.EmbedBuilder()
    .setColor(config.embedColor)
    .setDescription(mensagem)
    .setTitle("Log de Prova de Trabalho")
    .setImage(prova || null);

  await channel.send({ embeds: [embed], components: [row] });
}

module.exports = {
  name: "pescar", // Coloque o nome do comando
  description: "Comando referente ao trabalho de pescador", // Coloque a descrição do comando
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'prova',
      description: 'Anexe a prova que você está no trabalho de pescador.',
      type: Discord.ApplicationCommandOptionType.Attachment,
      required: true,
    },
  ],

  run: async (client, interaction) => {
    const prova = interaction.options.getAttachment('prova');

    if (!voiceChannel || voiceChannel.id !== configjob.PESCADOR.callEmprego) {
      return interaction.reply({ content: "Você precisa estar no canal de voz correto para executar este comando.", ephemeral: true });
    }

    const Game = new MatchPairs({
      message: interaction,
      isSlashGame: false,
      embed: {
        title: 'Pescaria',
        color: config.embedColor,
        description: '**Clique nos botões para combinar os emojis com seus pares.**'
      },
      emojis: ['🐟', '🐠', '🐡', '🦈', '🐬', '🐋', '🦭', '🦦', '🦑', '🦐', '🦀', '🐙', '🐚', '🐳', '🐢', '🐊'],
      winMessage: '**Você foi bem achou `{tilesTurned}` turnos diferentes.**',
      loseMessage: '**Você não conseguiu pescar todos os peixes, fez `{tilesTurned}` turnos diferentes.**',
      playerOnlyMessage: 'Apenas {player} pode usar esses botões.'
    });

    Game.startGame();
    Game.on('gameOver', async result => {
      const userId = result.player.id;
      const usuario = new Usuario(userId);
      let mensagem;
      let valor;

      if (result.result === 'win') {
        valor = configjob.PESCADOR.pagamento.win;
        usuario.GiveMoney(parseInt(valor));
        mensagem = `O Usuario ${result.player}, completou a pescaria com sucesso com ${result.tilesTurned} turnos diferentes abaixo a foto de prova anexada para avaliação.`;
      } else {
        valor = configjob.PESCADOR.pagamento.lose;
        usuario.GiveMoney(parseInt(valor));
        mensagem = `O Usuario ${result.player}, não completou a pescaria mas obteve ${result.tilesTurned} turnos diferentes abaixo a foto de prova anexada para avaliação.`;
      }

     
      await EnviarLogEmprego(configjob.PESCADOR.logChannel, mensagem, prova ? prova.url : null, client, usuario, valor);
    });
  }
};



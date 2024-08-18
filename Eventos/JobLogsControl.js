const Discord = require("discord.js");
const { Usuario } = require("../Usuario"); // Ajuste o caminho conforme necessário
const { MatchPairs } = require('discord-gamecord');
const config = require('../Configs/config.json');
const configjob = require('../Configs/empregos.json');
const client = require('../index');

client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  const [action, valor, userId] = interaction.customId.split('_');
  const usuario = new Usuario(userId);
  if (action === 'jobaprovar') {
    await interaction.update({ content: `Trabalho bem feito e aprovado por ${interaction.user}! `, components: [] });
  } else if (action === 'jobreprovar') {
    usuario.TakeMoney(parseInt(valor));
    await interaction.update({ content: `Fraude Trabalhista encontrada por ${interaction.user}, valor pago foi removido! `, components: [] });
  }
});
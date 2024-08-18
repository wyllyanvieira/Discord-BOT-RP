const {
  PermissionsBitField,
  ChannelType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageCollector,
  EmbedBuilder,
} = require("discord.js");
const { Database } = require("sqlite3");
const config = require("../Configs/config.json");
const configwhitelist = require("../Configs/whitelist.json");
const client = require("../index"); // Certifique-se de que está importando o cliente corretamente
const { Usuario, InicializarUsuario } = require("../Usuario"); // Importe a classe Usuario

const db = new Database("./dados.db");

client.on("interactionCreate", async (interaction) => {
  if (interaction.isButton() && interaction.customId === "fazerwl") {
    const user = interaction.user;
    const channelName = `WL-${user.username}`;

    const channel = await interaction.guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: PermissionsBitField.Flags.ViewChannel,
        },
        {
          id: user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
          ],
        },
      ],
    });

    const buttonchannel = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Ver Canal")
        .setStyle(ButtonStyle.Link)
        .setURL(`https://discord.com/channels/${interaction.guild.id}/${channel.id}`)
    );
    await interaction.reply({
      content: `Olá ${interaction.user} sua whitelist foi aberta no canal ${channel}.`, ephemeral: true, components: [buttonchannel]
    });
    let questionIndex = 0;
    let score = 0;
    let essayAnswers = [];

    const sendQuestion = async () => {
      if (questionIndex < configwhitelist.questions.length) {
        const question = configwhitelist.questions[questionIndex];
        const options = ["A", "B", "C", "D"].map((label, index) => ({
          label: label,
          customId: `option_${index}`,
          style: ButtonStyle.Primary,
        }));

        const row = new ActionRowBuilder().addComponents(
          options.map((option) =>
            new ButtonBuilder()
              .setCustomId(option.customId)
              .setLabel(option.label)
              .setStyle(option.style)
          )
        );

        const embed = new EmbedBuilder()
        .setTitle(`***📃*** | ***Pergunta ${questionIndex + 1}:***`)
        .setTimestamp(Date.now())
        .setColor(config.embedColor)
        .setThumbnail("https://cdn.discordapp.com/attachments/605152859155333163/1259152427857477643/New_Project_20_B8DAF5B.png?ex=668b4d54&is=6689fbd4&hm=c2a8ef8b2684465975124108c977cc4a2933460afc3fcd7d0970243c9f2848e2&")
        .setAuthor({
          name: client.user.username,
          iconURL: client.user.displayAvatarURL({ dynamic: true })
        })
        .setFooter({
          iconURL: client.user.displayAvatarURL(),
          text: `Sistema exclusivo ${client.user.username}`
        })
        .setDescription(`***${question.question}***\n*${question.options.join("\n")}*\n\n*🕗 Você tem 1 minuto para responder esta pergunta.*\n*💬 Responda digitando a letra correspondente a resposta correta.*`
          );

        const message = await channel.send({
          embeds: [embed],
          components: [row],
        });

        const filter = (i) => i.user.id === user.id;
        const collector = channel.createMessageComponentCollector({
          filter,
          max: 1,
          time: 60000,
        });

        collector.on("collect", async (i) => {
          if (i.customId.startsWith("option_")) {
            const selectedOption = parseInt(i.customId.split("_")[1]);
            if (selectedOption === question.correctOption) {
              score++;
            }
            questionIndex++;
            await i.update({ components: [] }); // Remove os botões da mensagem
            await message.delete();
            await sendQuestion();
          }
        });

        collector.on("end", (collected) => {
          if (collected.size === 0) {
            channel.send(
              "Você não respondeu a tempo. Por favor, clique no botão novamente para reiniciar o processo."
            );
          }
        });
      } else {
        await sendEssayQuestions();
      }
    };

    const sendEssayQuestions = async () => {
      const askEssayQuestion = async (index) => {
        if (index < configwhitelist.essayQuestions.length) {
          const question = configwhitelist.essayQuestions[index];
          await channel.send(question);

          const filter = (m) => m.author.id === user.id;
          const collector = new MessageCollector(channel, {
            filter,
            max: 1,
            time: 60000,
          });

          collector.on("collect", (m) => {
            essayAnswers.push(m.content);
          });

          collector.on("end", async (collected) => {
            if (collected.size === 0) {
              await channel.send(
                "Você não respondeu a tempo. Por favor, responda a pergunta novamente."
              );
              await askEssayQuestion(index).catch(console.error);
            } else {
              if (index + 1 < configwhitelist.essayQuestions.length) {
                await askEssayQuestion(index + 1).catch(console.error);
              } else {
                const resultChannel = interaction.guild.channels.cache.find(
                  (channel) => channel.id === configwhitelist.channelresult
                );

                if (!resultChannel) {
                  await channel.send(
                    "O canal de resultados não foi encontrado."
                  );
                  return;
                }

                const resultEmbed = new EmbedBuilder()
                  .setTitle("Resultados da Whitelist")
                  .addFields(
                    {
                      name: "Usuário",
                      value: interaction.user.username,
                      inline: true,
                    },
                    {
                      name: "Pontuação",
                      value: `${score}/${configwhitelist.questions.length}`,
                      inline: true,
                    },
                    {
                      name: "Respostas Discursivas",
                      value: essayAnswers
                        .map(
                          (answer, idx) =>
                            `**Pergunta ${idx + 1}:** ${
                              configwhitelist.essayQuestions[idx]
                            }\n**Resposta:** ${answer}`
                        )
                        .join("\n\n"),
                    }
                  );

                const approveButton = new ButtonBuilder()
                  .setCustomId(
                    `aprovar_${user.id}_${essayAnswers[0]}_${essayAnswers[1]}`
                  )
                  .setLabel("Aprovar")
                  .setStyle(ButtonStyle.Success);

                const rejectButton = new ButtonBuilder()
                  .setCustomId(
                    `reprovar_${user.id}_${essayAnswers[0]}_${essayAnswers[1]}`
                  )
                  .setLabel("Reprovar")
                  .setStyle(ButtonStyle.Danger);

                const row = new ActionRowBuilder().addComponents(
                  approveButton,
                  rejectButton
                );

                await resultChannel.send({
                  embeds: [resultEmbed],
                  components: [row],
                });

                // Contagem regressiva de 5 segundos
                setTimeout(async () => {
                  await channel.delete();
                  await user.send(
                    "Você concluiu a whitelist! Seus resultados foram enviados para análise. Aguarde que em breve você receberá uma mensagem referente à sua aprovação no COMANDO/PSN."
                  );
                }, 5000);
              }
            }
          });
        }
      };

      await askEssayQuestion(0);
    };

    await sendQuestion();
  } else if (
    interaction.isButton() &&
    interaction.customId.startsWith("aprovar_")
  ) {
    const parts = interaction.customId.split("_");
    const userId = parts[1];
    const response1 = parts[2];
    const response2 = parts[3];
    const role = interaction.guild.roles.cache.find(
      (r) => r.id === configwhitelist.roleaproved
    );
    const member = await interaction.guild.members.fetch(userId);
    member.roles.add(role);
    member.setNickname(`${response1} | ${response2}`);
    InicializarUsuario(Number(userId));
    await interaction.reply({
      content: `Usuário ${member} foi aprovado!`,
      ephemeral: true,
    });
    await member.send({
      content: `Olá ${member}, parabéns! Você foi aprovado na Whitelist. Bem-vindo ao servidor! Se tiver alguma dúvida ou precisar de ajuda, sinta-se à vontade para entrar em contato com a administração.`,
    });
  } else if (
    interaction.isButton() &&
    interaction.customId.startsWith("reprovar_")
  ) {
    const parts = interaction.customId.split("_");
    const userId = parts[1];
    const response1 = parts[2];
    const response2 = parts[3];
    const role = interaction.guild.roles.cache.find(
      (r) => r.id === configwhitelist.roleaproved
    );
    const member = await interaction.guild.members.fetch(userId);
    // Adicione a lógica para reprovar o usuário aqui
    await interaction.reply({
      content: `Usuário ${member} foi reprovado na whitelist!`,
      ephemeral: true,
    });
    await member.send({
      content: `Olá ${member}, lamentamos informar que você foi reprovado na Whitelist. Caso tenha alguma dúvida ou deseje tentar novamente, por favor, entre em contato com a administração.`,
    });
  }
});

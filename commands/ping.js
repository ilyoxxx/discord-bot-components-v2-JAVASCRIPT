'use strict';

const {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Vérifie la latence du bot'),

  cooldownMs: 5000,

  async execute(interaction) {
    const sentAt = Date.now();

    // Réponse différée (defer) pour éviter tout timeout d'interaction
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const roundTripMs = Date.now() - sentAt;
    const wsPing = Math.round(interaction.client.ws.ping);

    const container = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent('## 🏓 Pong !')
      )
      .addSeparatorComponents(new SeparatorBuilder())
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          [
            `**Latence API (WebSocket) :** \`${wsPing}ms\``,
            `**Temps d'aller-retour :** \`${roundTripMs}ms\``,
          ].join('\n')
        )
      );

    await interaction.editReply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  },
};

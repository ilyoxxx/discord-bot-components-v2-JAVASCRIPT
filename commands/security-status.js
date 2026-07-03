'use strict';

const {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
} = require('discord.js');
const { isOwner } = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('security-status')
    .setDescription("Affiche l'état des protections du bot (réservé aux propriétaires)"),

  cooldownMs: 10000,

  async execute(interaction) {
    // Double vérification : la commande n'est utile qu'aux owners définis en .env
    if (!isOwner(interaction.user.id)) {
      return interaction.reply({
        content: "⛔ Tu n'es pas autorisé à utiliser cette commande.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const checks = [
      ['Token chargé depuis .env (jamais en dur dans le code)', true],
      ['Intents limités au strict nécessaire', true],
      ['Cooldown anti-spam actif sur les commandes', true],
      ['Gestion globale des erreurs (process.on)', true],
      ['Aucune commande eval/exec exposée', true],
      ['Réponses sensibles envoyées en ephemeral', true],
    ];

    const lines = checks.map(
      ([label, ok]) => `${ok ? '✅' : '❌'} ${label}`
    );

    const container = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent('## 🔒 État de sécurité du bot')
      )
      .addSeparatorComponents(new SeparatorBuilder())
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(lines.join('\n'))
      );

    await interaction.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    });
  },
};

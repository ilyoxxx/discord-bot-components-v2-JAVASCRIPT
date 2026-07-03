'use strict';

const {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SectionBuilder,
  ThumbnailBuilder,
  MessageFlags,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Affiche les informations du serveur')
    .setDMPermission(false),

  cooldownMs: 5000,

  async execute(interaction) {
    const guild = interaction.guild;
    if (!guild) {
      return interaction.reply({
        content: 'Cette commande doit être utilisée sur un serveur.',
        flags: MessageFlags.Ephemeral,
      });
    }

    // On s'assure d'avoir les données fraîches (owner, memberCount, etc.)
    const owner = await guild.fetchOwner().catch(() => null);

    const infoText = new TextDisplayBuilder().setContent(
      [
        `## 📊 ${guild.name}`,
        `**Membres :** ${guild.memberCount}`,
        `**Propriétaire :** ${owner ? owner.user.tag : 'Inconnu'}`,
        `**Créé le :** <t:${Math.floor(guild.createdTimestamp / 1000)}:D>`,
        `**Salons :** ${guild.channels.cache.size}`,
        `**Rôles :** ${guild.roles.cache.size}`,
        `**Niveau de vérification :** ${guild.verificationLevel}`,
      ].join('\n')
    );

    const container = new ContainerBuilder();

    if (guild.iconURL()) {
      const section = new SectionBuilder()
        .addTextDisplayComponents(infoText)
        .setThumbnailAccessory(
          new ThumbnailBuilder().setURL(guild.iconURL({ size: 256 }))
        );
      container.addSectionComponents(section);
    } else {
      container.addTextDisplayComponents(infoText);
    }

    container
      .addSeparatorComponents(new SeparatorBuilder())
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `-# Demandé par ${interaction.user.tag}`
        )
      );

    await interaction.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  },
};

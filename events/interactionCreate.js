'use strict';

const { MessageFlags } = require('discord.js');
const logger = require('../utils/logger');
const { checkCooldown } = require('../utils/cooldown');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
      logger.warn(`Commande inconnue reçue : ${interaction.commandName}`);
      return;
    }

    // Anti-spam : un utilisateur ne peut pas exécuter la même commande
    // en boucle sans délai.
    const { allowed, retryAfterMs } = checkCooldown(
      interaction.user.id,
      command.data.name,
      command.cooldownMs
    );

    if (!allowed) {
      return interaction.reply({
        content: `⏳ Merci de patienter encore ${Math.ceil(retryAfterMs / 1000)}s avant de réutiliser cette commande.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      // On ne renvoie JAMAIS le détail de l'erreur (stack trace) à l'utilisateur :
      // cela pourrait exposer des chemins de fichiers ou des infos internes.
      logger.error(`Erreur dans la commande "${command.data.name}" :`, error);

      const errorPayload = {
        content: "❌ Une erreur est survenue lors de l'exécution de cette commande.",
        flags: MessageFlags.Ephemeral,
      };

      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(errorPayload).catch(() => null);
      } else {
        await interaction.reply(errorPayload).catch(() => null);
      }
    }
  },
};

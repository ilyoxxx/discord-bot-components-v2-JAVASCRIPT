'use strict';

const { ActivityType } = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    logger.info(`Connecté en tant que ${client.user.tag} (${client.commands.size} commandes chargées)`);

    client.user.setPresence({
      activities: [{ name: '/ping', type: ActivityType.Listening }],
      status: 'online',
    });
  },
};

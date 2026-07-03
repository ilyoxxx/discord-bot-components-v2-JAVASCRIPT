'use strict';

require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { REST, Routes } = require('discord.js');
const logger = require('./utils/logger');

const REQUIRED_ENV = ['DISCORD_TOKEN', 'CLIENT_ID'];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
  logger.error(`Variables d'environnement manquantes : ${missing.join(', ')}`);
  process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command?.data) commands.push(command.data.toJSON());
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    logger.info(`Déploiement de ${commands.length} commande(s)...`);

    const route = process.env.GUILD_ID
      ? Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
      : Routes.applicationCommands(process.env.CLIENT_ID);

    await rest.put(route, { body: commands });

    logger.info(
      process.env.GUILD_ID
        ? '✅ Commandes déployées sur le serveur de test (instantané).'
        : '✅ Commandes déployées globalement (propagation possible jusqu\'à 1h).'
    );
  } catch (error) {
    logger.error('Échec du déploiement des commandes :', error);
    process.exit(1);
  }
})();

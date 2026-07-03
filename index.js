'use strict';

require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const logger = require('./utils/logger');

// --- Validation stricte des variables d'environnement au démarrage ---
// Un bot ne doit jamais démarrer silencieusement avec une config incomplète.
const REQUIRED_ENV = ['DISCORD_TOKEN', 'CLIENT_ID'];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
  logger.error(`Variables d'environnement manquantes : ${missing.join(', ')}`);
  logger.error('Copie .env.example vers .env et remplis les valeurs requises.');
  process.exit(1);
}

// --- Principe du moindre privilège : uniquement les intents nécessaires ---
// N'ajoute GuildMessages / MessageContent que si tes commandes en ont
// réellement besoin (par ex. modération de texte). Pour de simples
// commandes slash + Components V2, ce n'est pas nécessaire.
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.commands = new Collection();

// --- Chargement dynamique des commandes ---
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  if (!command?.data?.name || typeof command.execute !== 'function') {
    logger.warn(`Commande invalide ignorée : ${file}`);
    continue;
  }

  client.commands.set(command.data.name, command);
}

// --- Chargement dynamique des événements ---
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);

  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

// --- Gestion globale des erreurs pour éviter un crash brutal du process ---
// (protège contre un déni de service accidentel provoqué par une erreur
// non interceptée dans une commande ou une dépendance)
process.on('unhandledRejection', (reason) => {
  logger.error('Promesse rejetée non gérée :', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Exception non interceptée :', error);
});

client.login(process.env.DISCORD_TOKEN).catch((error) => {
  logger.error("Échec de connexion à Discord. Vérifie ton token dans .env :", error.message);
  process.exit(1);
});

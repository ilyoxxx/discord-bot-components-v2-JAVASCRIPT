# 🤖 Discord Bot — Components V2

Un bot Discord moderne construit avec **discord.js v14** et les nouveaux **Components V2**, conçu selon des bonnes pratiques de sécurité strictes (gestion des secrets, permissions, anti-spam, gestion d'erreurs).

![Node](https://img.shields.io/badge/node-%3E%3D18.17-339933?logo=node.js&logoColor=white)
![discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?logo=discord&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

> ⚠️ **Note honnête** : aucun logiciel n'est "100% sécurisé". Ce projet applique un ensemble de bonnes pratiques reconnues (moindre privilège, secrets hors du code, validation, gestion d'erreurs) pour réduire au maximum la surface d'attaque — mais la sécurité reste un processus continu (mises à jour des dépendances, rotation du token, etc.), pas un état figé.

C'est l'équivalent Python du [bot py / discord.py](https://github.com/ilyoxxx/discord-bot-components-v2-PYTHON) — même structure, mêmes fonctionnalités, mêmes principes de sécurité.
---

## ✨ Fonctionnalités

- Interface moderne avec **Components V2** (`Container`, `Section`, `TextDisplay`, `Separator`, `Thumbnail`)
- Commandes slash : `/ping`, `/serverinfo`, `/security-status`
- Chargement dynamique des commandes et des événements
- Cooldown anti-spam par utilisateur et par commande
- Gestion globale des erreurs (aucune stack trace exposée aux utilisateurs)
- Logger avec redaction automatique des tokens
- Vérification stricte des variables d'environnement au démarrage

## 🔒 Sécurité — ce qui est mis en place

| Mesure | Détail |
|---|---|
| Secrets hors du code | Token & IDs chargés via `.env` (jamais commités, voir `.gitignore`) |
| Moindre privilège | Seul l'intent `Guilds` est activé par défaut |
| Anti-spam | Cooldown configurable par commande (`utils/cooldown.js`) |
| Contrôle d'accès | Vérification `OWNER_IDS` côté serveur pour les commandes sensibles |
| Gestion d'erreurs | `try/catch` sur chaque commande + handlers globaux `uncaughtException` / `unhandledRejection` |
| Logs sûrs | Les tokens sont automatiquement masqués (`[REDACTED_TOKEN]`) dans les logs |
| Pas de code arbitraire | Aucune commande `eval`/`exec` n'est exposée |
| Réponses privées | Les informations sensibles sont envoyées en `ephemeral` |

### Recommandations complémentaires (à faire toi-même)
- Active la **2FA** sur ton compte Discord Developer.
- Régénère immédiatement le token si tu penses qu'il a fuité (Developer Portal → Bot → Reset Token).
- Garde `discord.js` et `dotenv` à jour (`npm outdated` / `npm audit`).
- Héberge le bot sur une plateforme qui gère les variables d'environnement de façon sécurisée (Railway, Fly.io, VPS avec `.env` non exposé, etc.).
- Ne donne au bot que les **permissions Discord** strictement nécessaires lors de l'invitation (voir plus bas).

---

## 📦 Prérequis

- [Node.js](https://nodejs.org/) ≥ 18.17
- Un compte sur le [Discord Developer Portal](https://discord.com/developers/applications)

## 🚀 Installation

```bash
git clone https://github.com/ton-utilisateur/ton-repo.git
cd ton-repo
npm install
```

## ⚙️ Configuration

1. Copie le fichier d'exemple :

```bash
cp .env.example .env
```

2. Remplis `.env` :

```env
DISCORD_TOKEN=le_token_de_ton_bot
CLIENT_ID=id_de_ton_application
GUILD_ID=id_de_ton_serveur_de_test   # optionnel, pour un déploiement instantané
OWNER_IDS=ton_id_discord              # optionnel, pour les commandes admin
```

3. Sur le [Developer Portal](https://discord.com/developers/applications), section **Bot** :
   - Récupère ton token (bouton **Reset Token**)
   - Active uniquement les intents dont tu as réellement besoin

## 🔗 Inviter le bot sur ton serveur

Génère un lien d'invitation depuis l'onglet **OAuth2 → URL Generator** :
- Scopes : `bot`, `applications.commands`
- Permissions : uniquement celles requises par tes commandes (par défaut, aucune permission spéciale n'est nécessaire pour `/ping`, `/serverinfo`, `/security-status`)

## 📤 Déployer les commandes slash

```bash
npm run deploy
```

> Avec `GUILD_ID` renseigné, les commandes apparaissent instantanément sur ce serveur (idéal pour le développement). Sans `GUILD_ID`, elles sont déployées globalement (jusqu'à 1h de propagation).

## ▶️ Lancer le bot

```bash
npm start
```

---

## 📁 Structure du projet

```
discord-bot-v2/
├── commands/
│   ├── ping.js              # /ping — latence, exemple Container + Separator
│   ├── serverinfo.js        # /serverinfo — exemple Section + Thumbnail
│   └── security-status.js   # /security-status — commande protégée (owners uniquement)
├── events/
│   ├── ready.js              # Connexion du bot
│   └── interactionCreate.js  # Routage des commandes + cooldown + erreurs
├── utils/
│   ├── logger.js             # Logs avec redaction des secrets
│   ├── cooldown.js           # Anti-spam par utilisateur
│   └── permissions.js        # Vérification owners / permissions Discord
├── index.js                  # Point d'entrée
├── deploy-commands.js        # Enregistrement des slash commands
├── .env.example
├── .gitignore
└── package.json
```

## 🧩 Ajouter une nouvelle commande

Crée un fichier dans `commands/`, par exemple `commands/hello.js` :

```js
const { SlashCommandBuilder, ContainerBuilder, TextDisplayBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hello')
    .setDescription('Dit bonjour'),

  cooldownMs: 3000,

  async execute(interaction) {
    const container = new ContainerBuilder()
      .addTextDisplayComponents(new TextDisplayBuilder().setContent('👋 Salut !'));

    await interaction.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  },
};
```

Puis relance `npm run deploy` pour l'enregistrer auprès de Discord.

---

## 🤝 Contribution

Les pull requests sont les bienvenues. Pour un changement majeur, ouvre d'abord une issue afin d'en discuter.

## 📄 Licence

Distribué sous licence [MIT](./LICENSE).

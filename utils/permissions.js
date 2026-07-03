'use strict';

/**
 * Vérifie si un utilisateur fait partie des "owners" définis dans .env
 * (OWNER_IDS). Utilisé pour protéger les commandes sensibles/admin,
 * en plus des permissions Discord natives.
 */
function isOwner(userId) {
  const owners = (process.env.OWNER_IDS || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
  return owners.includes(userId);
}

/**
 * Vérifie qu'un membre possède bien une permission Discord donnée
 * sur le serveur courant (jamais confiance uniquement au client).
 */
function memberHasPermission(interaction, permissionFlag) {
  if (!interaction.inGuild()) return false;
  return interaction.memberPermissions?.has(permissionFlag) ?? false;
}

module.exports = { isOwner, memberHasPermission };

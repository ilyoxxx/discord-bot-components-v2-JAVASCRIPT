'use strict';

/**
 * Système de cooldown en mémoire pour limiter le taux d'utilisation
 * des commandes par utilisateur (protection anti-spam / anti-flood).
 *
 * Pour un bot multi-instance à grande échelle, remplacer ce store
 * mémoire par Redis afin de partager l'état entre processus.
 */

const cooldowns = new Map();

const DEFAULT_COOLDOWN_MS = 3000;

/**
 * Vérifie si un utilisateur peut exécuter une commande.
 * @returns {{allowed: boolean, retryAfterMs: number}}
 */
function checkCooldown(userId, commandName, cooldownMs = DEFAULT_COOLDOWN_MS) {
  const key = `${userId}:${commandName}`;
  const now = Date.now();
  const expiresAt = cooldowns.get(key);

  if (expiresAt && expiresAt > now) {
    return { allowed: false, retryAfterMs: expiresAt - now };
  }

  cooldowns.set(key, now + cooldownMs);
  return { allowed: true, retryAfterMs: 0 };
}

// Nettoyage périodique pour éviter une fuite mémoire sur le long terme
setInterval(() => {
  const now = Date.now();
  for (const [key, expiresAt] of cooldowns.entries()) {
    if (expiresAt <= now) cooldowns.delete(key);
  }
}, 60_000).unref();

module.exports = { checkCooldown };

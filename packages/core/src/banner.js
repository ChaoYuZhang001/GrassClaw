export function createBanner(config) {
  return [
    '╔══════════════════════════════════════════════════════════════╗',
    `║                    🦞  GrassClaw v${String(config.version).padEnd(9)}      ║`,
    '║               草台班子版超级龙虾，准备接管。               ║',
    '╚══════════════════════════════════════════════════════════════╝',
    `Founder: ${config.founder}`,
    `Trust: ${config.trustLevel} | Mood: ${config.currentMood} | Mode: ${config.mode}`,
    `Slogan: ${config.slogan}`
  ].join('\n');
}

/** Normalize Vercel / dashboard env aliases and treat empty strings as unset. */
export function normalizeRuntimeEnv(env: NodeJS.ProcessEnv = process.env): void {
  const aliases: Array<[target: string, ...sources: string[]]> = [
    ["MONGODB_URI", "MongoDB", "MONGODB_URL", "MONGO_URI"],
    ["JWT_SECRET", "AUTH_SECRET"],
    ["API_URL", "NEXT_PUBLIC_API_URL"],
    ["NEXT_PUBLIC_SOCKET_URL", "SOCKET_URL"],
  ];

  for (const [target, ...sources] of aliases) {
    if (env[target]?.trim()) continue;
    for (const source of sources) {
      const value = env[source]?.trim();
      if (value) {
        env[target] = value;
        break;
      }
    }
  }

  for (const key of Object.keys(env)) {
    if (env[key] === "") {
      delete env[key];
    }
  }
}

normalizeRuntimeEnv();

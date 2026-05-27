/** Build a MongoDB URI with URL-encoded credentials (handles @, #, etc. in passwords). */
export function buildMongoUri(input: {
  user: string;
  password: string;
  host: string;
  database?: string;
  protocol?: "mongodb" | "mongodb+srv";
}): string {
  const protocol = input.protocol ?? "mongodb+srv";
  const user = encodeURIComponent(input.user.trim());
  const password = encodeURIComponent(input.password);
  const host = input.host.trim().replace(/^\/+/, "");
  const database = (input.database ?? "medinova").trim() || "medinova";
  return `${protocol}://${user}:${password}@${host}/${database}`;
}

export function resolveMongoUri(
  env: NodeJS.ProcessEnv = process.env
): string {
  const direct = env.MONGODB_URI?.trim();
  const atlasHost = env.MONGODB_ATLAS_CLUSTER?.trim();
  const user = env.MONGODB_ATLAS_USER?.trim();
  const password = env.MONGODB_ATLAS_PASSWORD;

  if (atlasHost && user && password !== undefined) {
    return buildMongoUri({
      user,
      password,
      host: atlasHost,
      database: env.MONGODB_DB?.trim() || "medinova",
    });
  }

  if (direct) {
    return direct;
  }

  return "mongodb://127.0.0.1:27017/medinova";
}

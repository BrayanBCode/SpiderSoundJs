import { ShardingManager } from "discord.js";
import { join } from "node:path";
import { loadProcessErrorHandlers } from "./core/handler/error/processErrorHandler.js";
import logger from "./core/client/logger.js";

// Bun carga el .env por su cuenta (y los shards heredan process.env): no hace falta dotenv.
loadProcessErrorHandlers();

logger.info(`[Shards] Iniciando Araña Sound con Bun ${Bun.version}`);

if (!process.env.token) {
    throw new Error("[Shards] Falta la variable token en el .env (token del bot de Discord).");
}

const manager = new ShardingManager(join(import.meta.dir, "index.ts"), {
    token: process.env.token,
});

manager.on("shardCreate", shard => {
    logger.info(`[Shards] Shard ${shard.id} lanzado`);
});

try {
    await manager.spawn();
} catch (error: unknown) {
    throw new Error(`[Shards] No se pudieron lanzar los shards: ${(error as Error).message}`);
}

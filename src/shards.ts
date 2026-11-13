import { ShardingManager } from "discord.js";
import { loadProcessErrorHandlers } from "./core/handler/error/processErrorHandler.js";
import { formatLogTimestamp } from "./utils/logUtils.js";
import { config } from "dotenv";

config();

loadProcessErrorHandlers();

if (!process.env.token) {
    throw new Error("DISCORD_TOKEN environment variable is not set.");
}

const manager = new ShardingManager("./dist/index.js", {
    token: process.env.token,

});

manager.on("shardCreate", shard => {
    console.log(`${formatLogTimestamp()} [INFO] Shard ${shard.id} launched`);
});

try {
    await manager.spawn();
} catch (error: unknown) {
    throw new Error(`Failed to spawn shards: ${(error as Error).message}`);
}
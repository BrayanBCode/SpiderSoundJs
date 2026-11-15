import logger from "../../client/logger.js";
import { errorText, notifyError } from "./errorText.js";

/** Cuánto se espera al aviso antes de cerrar el proceso */
const NOTIFY_TIMEOUT = 3000;

export default {
    name: "uncaughtException",
    execute(error: unknown) {
        const text = errorText(error);
        logger.error(`Uncaught Exception - ${text}`);

        // Se cierra el proceso porque el estado puede haber quedado roto (el ShardingManager lo vuelve a lanzar),
        // pero antes se intenta avisar al dev
        Promise.race([notifyError("Excepción no controlada (el shard se reinicia)", text), Bun.sleep(NOTIFY_TIMEOUT)])
            .finally(() => process.exit(1));
    },
};

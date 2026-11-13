import { inspect } from "util";
import logger from "../../client/logger.js";


export default {
    name: "uncaughtException",
    execute(error: Error) {

        let errorMessage = "";

        if (error instanceof Error) {
            errorMessage = error.stack || error.message;
        } else if (typeof error === "object" && error !== null) {
            errorMessage = inspect(error, { depth: 5 });
        } else {
            errorMessage = String(error);
        }

        logger.error(`Uncaught Exception - ${errorMessage}`);
        // It is recommended to exit the process after an uncaught exception
        // as the application state might be corrupted.
        process.exit(1);
    },
};
import { inspect } from "util";
import logger from "../../client/logger.js";
export default {
    name: "unhandledRejection",
    execute(reason: any, promise: Promise<any>) {

        let errorMessage = "";

        logger.error(`Unhandled Rejection - ${errorMessage}`);
    },
};
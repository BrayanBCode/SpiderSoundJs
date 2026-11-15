import logger from "../../client/logger.js";
import { errorText, notifyError } from "./errorText.js";

export default {
    name: "unhandledRejection",
    execute(reason: unknown, _promise: Promise<unknown>) {
        const text = errorText(reason);
        logger.error(`Unhandled Rejection - ${text}`);
        notifyError("Promesa rechazada sin manejar", text);
    },
};

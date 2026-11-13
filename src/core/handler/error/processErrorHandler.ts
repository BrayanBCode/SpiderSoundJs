import * as unhandledRejectionEvent from "../../events/error/unhandledRejection.js";
import * as uncaughtExceptionEvent from "../../events/error/uncaughtException.js";


export function loadProcessErrorHandlers() {
    process.on('uncaughtException', (error: Error) => uncaughtExceptionEvent.default.execute(error));
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => unhandledRejectionEvent.default.execute(reason, promise));
}
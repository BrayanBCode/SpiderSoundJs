import { BClient } from "./core/client/BClient.js";
import { loadProcessErrorHandlers } from "./core/handler/error/processErrorHandler.js";

// Cada shard es un proceso aparte: también necesita los manejadores (y así los errores llegan al canal del dev)
loadProcessErrorHandlers();

const client = new BClient();

client.init();

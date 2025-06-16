import { config } from '@/config/config.js';
import { createLogger, format, transports, addColors } from 'winston';

const { combine, timestamp, printf, colorize } = format;

// Define colores personalizados para cada nivel de log
const customColors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'cyan',
    debug: 'magenta',
};

// Agregar colores personalizados a winston
addColors(customColors);

// Formato personalizado para los logs
const logFormat = printf(({ level, message, timestamp }) => {
    return `[${timestamp}] [ ${level} ] ${message}`;
});

// Configuración del logger
const logger = createLogger({
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        debug: 4,
    },
    level: config.bot.debugMode ? "debug" : "info", // Cambia a 'info' en producción si quieres menos detalles
    format: combine(
        timestamp({ format: 'DD-MM-YYYY HH:mm' }), // " HH:mm:ss " para incluir segundos
        colorize({ all: true }),
        logFormat
    ),
    transports: [
        new transports.Console(), // Imprime en la consola con colores
        new transports.File({ filename: 'logs/error.log' }), // Guarda errores en un archivo
        new transports.File({ filename: 'logs/combined.log' }), // Guarda todos los logs
    ],
});

// Exporta el logger para usarlo en otras partes del proyecto
export default logger;
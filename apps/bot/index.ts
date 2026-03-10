import { config } from "dotenv";
import MusicClient from "./client/MusicClient";

config();

const bot = new MusicClient().init();
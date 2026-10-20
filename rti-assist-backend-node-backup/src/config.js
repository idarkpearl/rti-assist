import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const config = {
  get port() {
    return process.env.PORT || 8000;
  },
  get geminiApiKey() {
    // Re-check .env file dynamically if not present
    if (!process.env.GEMINI_API_KEY) {
      dotenv.config({ path: path.resolve(__dirname, '../.env'), override: true });
    }
    return (process.env.GEMINI_API_KEY || '').trim();
  },
  get geminiModel() {
    return (process.env.GEMINI_MODEL || 'gemini-1.5-flash').trim();
  },
  get jwtSecret() {
    return process.env.JWT_SECRET || 'rti_assist_dev_jwt_secret_2026';
  },
  get frontendUrl() {
    return process.env.FRONTEND_URL || 'http://localhost:5173';
  },
};

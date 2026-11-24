package org.rtiassist.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Configuration;

import java.io.File;

@Configuration
public class DotenvConfig {

    private static final Dotenv dotenv;

    static {
        Dotenv loaded = null;
        try {
            // Check project root or current working dir
            File envFile = new File(".env");
            if (envFile.exists()) {
                loaded = Dotenv.configure().ignoreIfMissing().load();
            } else {
                File parentEnv = new File("../.env");
                if (parentEnv.exists()) {
                    loaded = Dotenv.configure().directory("..").ignoreIfMissing().load();
                } else {
                    loaded = Dotenv.configure().ignoreIfMissing().load();
                }
            }
        } catch (Exception e) {
            System.err.println("[DotenvConfig] Warning: Could not load .env file: " + e.getMessage());
        }
        dotenv = loaded;

        // Set server.port from .env if present
        String port = get("PORT", "8000");
        System.setProperty("server.port", port);

        // Export DB_URL, DB_USER, DB_PASSWORD, DB_DRIVER environment placeholders for application.properties
        String dbUrl = get("DB_URL", null);
        if (dbUrl != null && !dbUrl.isBlank() && System.getProperty("DB_URL") == null) {
            System.setProperty("DB_URL", dbUrl);
            if (dbUrl.startsWith("jdbc:postgresql:") && get("DB_DRIVER", null) == null && System.getProperty("DB_DRIVER") == null) {
                System.setProperty("DB_DRIVER", "org.postgresql.Driver");
            }
        }
        String dbDriver = get("DB_DRIVER", null);
        if (dbDriver != null && !dbDriver.isBlank() && System.getProperty("DB_DRIVER") == null) {
            System.setProperty("DB_DRIVER", dbDriver);
        }
        String dbUser = get("DB_USER", null);
        if (dbUser != null && !dbUser.isBlank() && System.getProperty("DB_USER") == null) {
            System.setProperty("DB_USER", dbUser);
        }
        String dbPass = get("DB_PASSWORD", null);
        if (dbPass != null && !dbPass.isBlank() && System.getProperty("DB_PASSWORD") == null) {
            System.setProperty("DB_PASSWORD", dbPass);
        }
    }

    public static String get(String key, String defaultValue) {
        String val = null;
        if (dotenv != null) {
            val = dotenv.get(key);
        }
        if (val == null || val.isBlank()) {
            val = System.getenv(key);
        }
        if (val == null || val.isBlank()) {
            val = System.getProperty(key);
        }
        return (val != null && !val.isBlank()) ? val.trim() : defaultValue;
    }

    public static String get(String key) {
        return get(key, "");
    }

    public int getPort() {
        try {
            return Integer.parseInt(get("PORT", "8000"));
        } catch (NumberFormatException e) {
            return 8000;
        }
    }

    public String getGeminiApiKey() {
        return get("GEMINI_API_KEY", "");
    }

    public String getGeminiModel() {
        return get("GEMINI_MODEL", "gemini-3.1-flash-lite");
    }

    public String getJwtSecret() {
        return get("JWT_SECRET", "rti_assist_jwt_dev_secret_key_2026");
    }

    public String getFrontendUrl() {
        return get("FRONTEND_URL", "http://localhost:5173");
    }

    public String getBrevoApiKey() {
        return get("BREVO_API_KEY", "");
    }

    public String getBrevoSenderEmail() {
        return get("BREVO_SENDER_EMAIL", "darkpearl251103@gmail.com");
    }

    public String getBrevoSenderName() {
        return get("BREVO_SENDER_NAME", "RTI Assist Verification");
    }

    public String getDbUrl() {
        return get("DB_URL", "jdbc:h2:file:./data/rti_assist_db;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH");
    }

    public String getDbDriver() {
        String driver = get("DB_DRIVER", "");
        if (!driver.isBlank()) return driver;
        return getDbUrl().startsWith("jdbc:postgresql:") ? "org.postgresql.Driver" : "org.h2.Driver";
    }

    public String getDbUser() {
        return get("DB_USER", "postgres");
    }

    public String getDbPassword() {
        return get("DB_PASSWORD", "postgres");
    }

    public boolean isAppDevMode() {
        return "true".equalsIgnoreCase(get("APP_DEV_MODE", "true"));
    }

    public String getReminderCron() {
        return get("REMINDER_CRON", "0 0 9 * * ?");
    }

    public String getUploadDir() {
        return get("UPLOAD_DIR", "uploads");
    }

    public boolean isOcrEnabled() {
        return "true".equalsIgnoreCase(get("OCR_ENABLED", "false"));
    }
}

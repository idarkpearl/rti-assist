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
}

package org.rtiassist;

import org.rtiassist.config.DotenvConfig;
import org.rtiassist.repository.JsonDataStore;
import org.rtiassist.service.GeminiService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class RtiAssistBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(RtiAssistBackendApplication.class, args);
    }

    @Bean
    public CommandLineRunner runner(DotenvConfig dotenvConfig, JsonDataStore dataStore, GeminiService geminiService) {
        return args -> {
            int port = dotenvConfig.getPort();
            System.out.println("================================================================");
            System.out.println("🚀 RTI ASSIST BACKEND RUNNING ON http://localhost:" + port);
            System.out.println("   Framework: Java Spring Boot 3.4.2");
            System.out.println("================================================================");
            System.out.println("📡 Base API URL:      http://localhost:" + port + "/api");
            System.out.println("🔑 Gemini AI Key:     " + (geminiService.isConfigured() ? "✅ Configured (" + geminiService.getModel() + ")" : "⚠️  Not Set (Using Smart Legal Engine fallback)"));
            System.out.println("📂 Pre-seeded Records: " + dataStore.getAuthorities(null, null, null).size() + " Authorities | " + dataStore.getCases(null, null).size() + " Cases");
            System.out.println("----------------------------------------------------------------");
            System.out.println("💡 Quick Tips:");
            System.out.println("   - To edit Gemini key or port, edit: rti-assist-backend/.env");
            System.out.println("   - Frontend connects automatically to http://localhost:" + port + "/api");
            System.out.println("================================================================");
        };
    }
}

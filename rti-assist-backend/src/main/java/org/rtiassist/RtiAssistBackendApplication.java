package org.rtiassist;

import org.rtiassist.config.DotenvConfig;
import org.rtiassist.service.AuthorityService;
import org.rtiassist.service.CaseService;
import org.rtiassist.service.GeminiService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.time.Clock;

@SpringBootApplication
@EnableScheduling
public class RtiAssistBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(RtiAssistBackendApplication.class, args);
    }

    /**
     * Provide a Clock bean so that automated reminder scheduler tests can simulate days passing.
     */
    @Bean
    public Clock clock() {
        return Clock.systemDefaultZone();
    }

    @Bean
    public CommandLineRunner runner(DotenvConfig dotenvConfig, AuthorityService authorityService, CaseService caseService, GeminiService geminiService) {
        return args -> {
            int port = dotenvConfig.getPort();
            String dbEngine = dotenvConfig.getDbUrl().startsWith("jdbc:postgresql:")
                    ? "PostgreSQL"
                    : "H2 Embedded SQL (PostgreSQL Mode)";
            System.out.println("================================================================");
            System.out.println("🚀 RTI ASSIST BACKEND RUNNING ON http://localhost:" + port);
            System.out.println("   Framework: Java Spring Boot 3.4.2 (" + dbEngine + " / JPA + Flyway)");
            System.out.println("================================================================");
            System.out.println("📡 Base API URL:      http://localhost:" + port + "/api");
            System.out.println("🔑 Gemini AI Key:     " + (geminiService.isConfigured() ? "✅ Configured (" + geminiService.getModel() + ")" : "⚠️  Not Set (Using Smart Legal Engine fallback)"));
            System.out.println("📂 Database Records:  " + authorityService.count() + " Authorities | " + caseService.count() + " Cases");
            System.out.println("----------------------------------------------------------------");
            System.out.println("💡 Quick Tips:");
            System.out.println("   - To edit Gemini key, DB, or port, edit: rti-assist-backend/.env");
            System.out.println("   - Frontend connects automatically to http://localhost:" + port + "/api");
            System.out.println("================================================================");
        };
    }
}

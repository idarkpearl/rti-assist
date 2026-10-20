package org.rtiassist.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.rtiassist.config.DotenvConfig;
import org.rtiassist.dto.AuthResponse;
import org.rtiassist.model.OtpRecord;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class BrevoService {

    private final DotenvConfig dotenvConfig;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private final Map<String, OtpRecord> otpStore = new ConcurrentHashMap<>();
    private final SecureRandom secureRandom = new SecureRandom();

    public BrevoService(DotenvConfig dotenvConfig) {
        this.dotenvConfig = dotenvConfig;
    }

    public String generateOtp() {
        int code = 100000 + secureRandom.nextInt(900000);
        return String.valueOf(code);
    }

    public AuthResponse createAndSendOtp(String email, String name) {
        String normalizedEmail = email.toLowerCase().trim();
        long now = System.currentTimeMillis();

        // Rate limit: 30 seconds
        OtpRecord existing = otpStore.get(normalizedEmail);
        if (existing != null && (now - existing.getCreatedAt()) < 30 * 1000) {
            long waitSeconds = ((30 * 1000 - (now - existing.getCreatedAt())) / 1000) + 1;
            AuthResponse resp = new AuthResponse();
            resp.setSuccess(false);
            resp.setMessage("Please wait " + waitSeconds + " seconds before requesting a new OTP code.");
            return resp;
        }

        String otp = generateOtp();
        long expiresInMinutes = 10;
        long expiresAt = now + expiresInMinutes * 60 * 1000;

        otpStore.put(normalizedEmail, new OtpRecord(otp, expiresAt, 0, now));
        System.out.println("[Brevo Service] \uD83D\uDD11 [OTP DISPATCH] Email: " + normalizedEmail + " | Code: " + otp);

        boolean sent = sendOtpEmail(normalizedEmail, (name != null && !name.isBlank()) ? name : "Citizen", otp, expiresInMinutes);

        AuthResponse resp = new AuthResponse();
        resp.setSuccess(true);
        resp.setSentViaBrevo(sent);
        resp.setDevOtp(otp); // Available in development/demo mode
        resp.setMessage(sent
                ? "Verification OTP sent to " + normalizedEmail
                : "OTP generated for " + normalizedEmail + " (logged to backend console)");
        return resp;
    }

    public boolean sendOtpEmail(String toEmail, String toName, String otp, long expiresInMinutes) {
        String apiKey = dotenvConfig.getBrevoApiKey();
        String senderEmail = dotenvConfig.getBrevoSenderEmail();
        String senderName = dotenvConfig.getBrevoSenderName();

        if (apiKey == null || apiKey.isBlank() || apiKey.contains("your_brevo")) {
            System.out.println("[Brevo Service] ⚠️ BREVO_API_KEY is not configured. Running in DEV mode.");
            System.out.println("[Brevo Service] 🔑 [DEV OTP CODE] =================================");
            System.out.println("[Brevo Service] 👉 EMAIL: " + toEmail);
            System.out.println("[Brevo Service] 👉 OTP CODE: " + otp + " (Valid for " + expiresInMinutes + " mins)");
            System.out.println("[Brevo Service] ====================================================");
            return false;
        }

        String htmlContent = "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"utf-8\"><title>RTI Assist OTP Verification</title>"
                + "<style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;margin:0;padding:24px;color:#0f172a}"
                + ".container{max-width:560px;margin:0 auto;background:#fff;border:2px solid #0f172a;box-shadow:6px 6px 0 #0f172a;border-radius:8px;overflow:hidden}"
                + ".header{background:#2563eb;padding:24px 32px;color:#fff;border-bottom:2px solid #0f172a}"
                + ".header h1{margin:0;font-size:22px;font-weight:800}.content{padding:32px}"
                + ".otp-box{background:#eff6ff;border:2px dashed #2563eb;border-radius:8px;padding:24px;text-align:center;margin:24px 0}"
                + ".otp-code{font-family:monospace;font-size:36px;font-weight:900;letter-spacing:10px;color:#1e40af;margin:0}"
                + ".notice{background:#fffbeb;border-left:4px solid #f59e0b;padding:12px 16px;font-size:13px;color:#92400e;margin:20px 0}"
                + ".footer{background:#f1f5f9;padding:20px 32px;font-size:12px;color:#64748b;border-top:2px solid #0f172a;text-align:center}</style></head>"
                + "<body><div class=\"container\"><div class=\"header\"><h1>RTI Assist Verification</h1><p>Right to Information Intelligence & Tracking Portal</p></div>"
                + "<div class=\"content\"><div>Hello " + toName + ",</div>"
                + "<p>You requested a verification code to access your citizen account on <strong>RTI Assist</strong>. Use the One-Time Password (OTP) below to complete your verification:</p>"
                + "<div class=\"otp-box\"><div class=\"otp-code\">" + otp + "</div><div>Valid for " + expiresInMinutes + " minutes • Single Use Only</div></div>"
                + "<div class=\"notice\"><strong>Security Notice:</strong> Never share this OTP with anyone. If you did not request this, please ignore this email.</div></div>"
                + "<div class=\"footer\">&copy; 2026 RTI Assist. Empowering Indian Citizens under Section 6(1) of the RTI Act.</div></div></body></html>";

        try {
            Map<String, Object> body = new HashMap<>();
            body.put("sender", Map.of("name", senderName, "email", senderEmail));
            body.put("to", Collections.singletonList(Map.of("email", toEmail, "name", toName)));
            body.put("subject", otp + " is your RTI Assist Verification Code");
            body.put("htmlContent", htmlContent);

            String jsonPayload = objectMapper.writeValueAsString(body);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                    .header("accept", "application/json")
                    .header("content-type", "application/json")
                    .header("api-key", apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .timeout(Duration.ofSeconds(10))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                System.out.println("[Brevo Service] ✅ Email delivered to " + toEmail + " via Brevo! Response: " + response.body());
                return true;
            } else {
                System.err.println("[Brevo Service] ❌ Brevo API error (" + response.statusCode() + "): " + response.body());
                System.out.println("[Brevo Service] 🔑 [FALLBACK DEV OTP CODE] -> " + otp);
                return false;
            }
        } catch (Exception e) {
            System.err.println("[Brevo Service] ❌ Network error contacting Brevo API: " + e.getMessage());
            System.out.println("[Brevo Service] 🔑 [FALLBACK DEV OTP CODE] -> " + otp);
            return false;
        }
    }

    public Map<String, Object> verifyOtp(String email, String enteredOtp) {
        String normalizedEmail = email.toLowerCase().trim();
        OtpRecord record = otpStore.get(normalizedEmail);

        Map<String, Object> result = new HashMap<>();
        if (record == null) {
            result.put("valid", false);
            result.put("message", "No active OTP found for this email. Please request a new code.");
            return result;
        }

        if (System.currentTimeMillis() > record.getExpiresAt()) {
            otpStore.remove(normalizedEmail);
            result.put("valid", false);
            result.put("message", "This OTP has expired. Please request a new one.");
            return result;
        }

        if (record.getAttempts() >= 5) {
            otpStore.remove(normalizedEmail);
            result.put("valid", false);
            result.put("message", "Too many incorrect attempts. Please request a new OTP code.");
            return result;
        }

        String cleanEntered = (enteredOtp != null) ? enteredOtp.trim() : "";
        if (!cleanEntered.equals(record.getOtp())) {
            record.setAttempts(record.getAttempts() + 1);
            int remaining = 5 - record.getAttempts();
            result.put("valid", false);
            result.put("message", "Invalid OTP code. " + remaining + " attempt" + (remaining != 1 ? "s" : "") + " remaining.");
            return result;
        }

        // Successfully verified
        otpStore.remove(normalizedEmail);
        result.put("valid", true);
        result.put("message", "OTP verified successfully.");
        return result;
    }
}

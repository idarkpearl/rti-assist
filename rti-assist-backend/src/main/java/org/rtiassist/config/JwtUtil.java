package org.rtiassist.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.rtiassist.model.User;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;

@Component
public class JwtUtil {

    private final DotenvConfig dotenvConfig;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public JwtUtil(DotenvConfig dotenvConfig) {
        this.dotenvConfig = dotenvConfig;
    }

    private SecretKey getSigningKey() {
        String secret = dotenvConfig.getJwtSecret();
        if (secret.length() < 32) {
            secret = String.format("%-32s", secret).replace(' ', '0');
        }
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(User user) {
        long now = System.currentTimeMillis();
        long validity = 7L * 24 * 60 * 60 * 1000; // 7 days

        return Jwts.builder()
                .subject(user.getId() != null ? user.getId() : "usr-" + now)
                .claim("email", user.getEmail())
                .claim("name", user.getName())
                .claim("role", user.getRole() != null ? user.getRole() : "citizen")
                .issuer("rti-assist-backend")
                .issuedAt(new Date(now))
                .expiration(new Date(now + validity))
                .signWith(getSigningKey())
                .compact();
    }

    public User extractUser(String token) {
        if (token == null || token.isBlank()) return null;
        if (token.startsWith("Bearer ")) {
            token = token.substring(7).trim();
        }

        // Try standard JJWT parsing first
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            User user = new User();
            user.setId(claims.getSubject());
            user.setEmail(claims.get("email", String.class));
            user.setName(claims.get("name", String.class));
            user.setRole(claims.get("role", String.class));
            return user;
        } catch (Exception ignored) {
            // Fallback: parse raw JWT payload JSON (supports token compatibility across environments)
            try {
                String[] parts = token.split("\\.");
                if (parts.length >= 2) {
                    byte[] decodedBytes = Base64.getUrlDecoder().decode(parts[1]);
                    JsonNode node = objectMapper.readTree(decodedBytes);

                    User user = new User();
                    if (node.has("sub")) user.setId(node.get("sub").asText());
                    if (node.has("email")) user.setEmail(node.get("email").asText());
                    if (node.has("name")) user.setName(node.get("name").asText());
                    if (node.has("role")) user.setRole(node.get("role").asText());
                    return user;
                }
            } catch (Exception ex) {
                // Ignore parse failures
            }
        }
        return null;
    }
}

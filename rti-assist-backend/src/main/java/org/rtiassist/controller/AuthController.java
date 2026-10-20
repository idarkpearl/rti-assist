package org.rtiassist.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.rtiassist.config.JwtUtil;
import org.rtiassist.dto.*;
import org.rtiassist.exception.ApiException;
import org.rtiassist.model.User;
import org.rtiassist.repository.JsonDataStore;
import org.rtiassist.service.BrevoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final JsonDataStore dataStore;
    private final BrevoService brevoService;
    private final JwtUtil jwtUtil;

    public AuthController(JsonDataStore dataStore, BrevoService brevoService, JwtUtil jwtUtil) {
        this.dataStore = dataStore;
        this.brevoService = brevoService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/send-otp")
    public ResponseEntity<AuthResponse> sendOtp(@RequestBody SendOtpRequest req) {
        if (req == null || req.getEmail() == null || !req.getEmail().contains("@")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "A valid email address is required to receive the OTP.");
        }

        AuthResponse resp = brevoService.createAndSendOtp(req.getEmail(), req.getName());
        if (!resp.isSuccess()) {
            HttpStatus status = resp.getMessage().contains("Please wait") ? HttpStatus.TOO_MANY_REQUESTS : HttpStatus.INTERNAL_SERVER_ERROR;
            throw new ApiException(status, "RATE_LIMITED", resp.getMessage());
        }
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/check-email")
    public ResponseEntity<CheckEmailResponse> checkEmail(@RequestBody CheckEmailRequest req) {
        if (req == null || req.getEmail() == null || req.getEmail().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Email is required");
        }

        User user = dataStore.findUserByEmail(req.getEmail());
        CheckEmailResponse resp = new CheckEmailResponse(
                user != null,
                user != null && Boolean.TRUE.equals(user.getHasPassword()),
                user != null ? user.getName() : null
        );
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(@RequestBody VerifyOtpRequest req) {
        if (req == null || req.getEmail() == null || req.getOtp() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Both email and OTP code are required.");
        }

        Map<String, Object> verification = brevoService.verifyOtp(req.getEmail(), req.getOtp());
        if (!Boolean.TRUE.equals(verification.get("valid"))) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_OTP", (String) verification.get("message"));
        }

        // Find or auto-create citizen account
        User user = dataStore.findUserByEmail(req.getEmail());
        boolean isNewUser = false;
        if (user == null) {
            isNewUser = true;
            String namePart = (req.getName() != null && !req.getName().isBlank())
                    ? req.getName()
                    : req.getEmail().split("@")[0].replaceAll("[._-]", " ");
            String formattedName = namePart.substring(0, 1).toUpperCase() + (namePart.length() > 1 ? namePart.substring(1) : "");

            user = new User();
            user.setEmail(req.getEmail());
            user.setName(formattedName.isBlank() ? "Citizen User" : formattedName);
            user.setRole("citizen");
            user.setPassword("");
            user.setHasPassword(false);
            user = dataStore.createUser(user);
        }

        String token = jwtUtil.generateToken(user);
        boolean requiresPasswordSetup = !Boolean.TRUE.equals(user.getHasPassword());

        AuthResponse resp = new AuthResponse();
        resp.setSuccess(true);
        resp.setMessage("Email successfully verified!");
        resp.setRequiresPasswordSetup(requiresPasswordSetup);
        resp.setIsNewUser(isNewUser);
        resp.setToken(token);
        resp.setUser(user);

        return ResponseEntity.ok(resp);
    }

    @PostMapping("/set-password")
    public ResponseEntity<AuthResponse> setPassword(@RequestBody SetPasswordRequest req, HttpServletRequest request) {
        String userEmail = null;

        // Try getting user from auth token
        User authUser = (User) request.getAttribute("currentUser");
        if (authUser != null && authUser.getEmail() != null) {
            userEmail = authUser.getEmail();
        } else if (req != null && req.getEmail() != null && !req.getEmail().isBlank()) {
            userEmail = req.getEmail();
        }

        if (userEmail == null || userEmail.isBlank()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Authentication session expired. Please verify your email again.");
        }

        if (req == null || req.getPassword() == null || req.getPassword().length() < 6) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Password must be at least 6 characters long.");
        }

        User updatedUser = dataStore.updateUserPassword(userEmail, req.getPassword());
        if (updatedUser == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User account not found. Please verify your email first.");
        }

        System.out.println("[Auth] 🔑 Password created for user: " + userEmail);

        AuthResponse resp = new AuthResponse();
        resp.setSuccess(true);
        resp.setMessage("Password created successfully! You can now sign in using your email and password.");
        resp.setUser(updatedUser);
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {
        if (req == null || req.getEmail() == null || req.getPassword() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Both email and password are required.");
        }

        User user = dataStore.findUserByEmail(req.getEmail());
        if (user == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "No account found with this email. Please verify with OTP to create your account.");
        }

        if (!Boolean.TRUE.equals(user.getHasPassword())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "PASSWORD_NOT_SET", "You have not created a password yet. Please sign in via Email OTP to set your password.");
        }

        if (!req.getPassword().equals(user.getPassword())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Incorrect password. Please try again or sign in with Email OTP.");
        }

        String token = jwtUtil.generateToken(user);

        AuthResponse resp = new AuthResponse();
        resp.setSuccess(true);
        resp.setMessage("Signed in successfully!");
        resp.setToken(token);
        resp.setUser(user);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(HttpServletRequest request) {
        User authUser = (User) request.getAttribute("currentUser");
        if (authUser == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Authentication token is required");
        }

        User persisted = dataStore.findUserByEmail(authUser.getEmail());
        return ResponseEntity.ok(Map.of("user", persisted != null ? persisted : authUser));
    }
}

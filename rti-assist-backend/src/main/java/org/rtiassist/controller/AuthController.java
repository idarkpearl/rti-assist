package org.rtiassist.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.rtiassist.config.JwtUtil;
import org.rtiassist.config.PasswordUtil;
import org.rtiassist.dto.*;
import org.rtiassist.entity.UserEntity;
import org.rtiassist.exception.ApiException;
import org.rtiassist.model.User;
import org.rtiassist.repository.UserRepository;
import org.rtiassist.service.BrevoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final BrevoService brevoService;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepository, BrevoService brevoService, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
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

        User user = userRepository.findByEmailIgnoreCase(req.getEmail().trim())
                .map(UserEntity::toModel)
                .orElse(null);

        boolean hasUsablePassword = user != null
                && Boolean.TRUE.equals(user.getHasPassword())
                && user.getPassword() != null
                && !user.getPassword().isBlank();
        CheckEmailResponse resp = new CheckEmailResponse(
                user != null,
                hasUsablePassword,
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
        User user = userRepository.findByEmailIgnoreCase(req.getEmail().trim())
                .map(UserEntity::toModel)
                .orElse(null);
        boolean isNewUser = false;
        if (user == null) {
            isNewUser = true;
            String namePart = (req.getName() != null && !req.getName().isBlank())
                    ? req.getName()
                    : req.getEmail().split("@")[0].replaceAll("[._-]", " ");
            String formattedName = namePart.substring(0, 1).toUpperCase() + (namePart.length() > 1 ? namePart.substring(1) : "");

            user = new User();
            user.setId("usr-" + System.currentTimeMillis());
            user.setEmail(req.getEmail().trim().toLowerCase());
            user.setName(formattedName.isBlank() ? "Citizen User" : formattedName);
            user.setRole("citizen");
            user.setPassword("");
            user.setHasPassword(false);
            user.setEmailVerified(true);
            user.setCreatedAt(Instant.now().toString());
            user.setUpdatedAt(Instant.now().toString());

            UserEntity saved = userRepository.save(new UserEntity(user));
            user = saved.toModel();
        }

        String token = jwtUtil.generateToken(user);
        boolean requiresPasswordSetup = !Boolean.TRUE.equals(user.getHasPassword())
                || user.getPassword() == null
                || user.getPassword().isBlank();

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

        Optional<UserEntity> opt = userRepository.findByEmailIgnoreCase(userEmail.trim());
        if (opt.isEmpty()) {
            throw new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User account not found. Please verify your email first.");
        }

        UserEntity ue = opt.get();
        ue.setPassword(PasswordUtil.hash(req.getPassword()));
        ue.setHasPassword(true);
        ue.setEmailVerified(true);
        ue.setUpdatedAt(Instant.now().toString());
        userRepository.save(ue);
        User updatedUser = ue.toModel();

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

        UserEntity userEntity = userRepository.findByEmailIgnoreCase(req.getEmail().trim()).orElse(null);
        if (userEntity == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "No account found with this email. Please verify with OTP to create your account.");
        }

        if (!Boolean.TRUE.equals(userEntity.getHasPassword())
                || userEntity.getPassword() == null
                || userEntity.getPassword().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "PASSWORD_NOT_SET", "You have not created a password yet. Please sign in via Email OTP to set your password.");
        }

        if (!PasswordUtil.matches(req.getPassword(), userEntity.getPassword())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Incorrect password. Please try again or sign in with Email OTP.");
        }

        // Upgrade legacy plaintext password to PBKDF2 hash transparently
        if (!PasswordUtil.isHashed(userEntity.getPassword())) {
            userEntity.setPassword(PasswordUtil.hash(req.getPassword()));
            userEntity.setUpdatedAt(Instant.now().toString());
            userRepository.save(userEntity);
        }

        User user = userEntity.toModel();
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

        User persisted = userRepository.findByEmailIgnoreCase(authUser.getEmail().trim())
                .map(UserEntity::toModel)
                .orElse(authUser);
        return ResponseEntity.ok(Map.of("user", persisted));
    }
}

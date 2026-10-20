package org.rtiassist;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.rtiassist.dto.*;
import org.rtiassist.model.CaseItem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class RtiAssistBackendApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testRootEndpoint() throws Exception {
        mockMvc.perform(get("/"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ONLINE"))
                .andExpect(jsonPath("$.name").exists())
                .andExpect(jsonPath("$.counts.authorities", greaterThanOrEqualTo(9)));
    }

    @Test
    void testHealthEndpoint() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ok"))
                .andExpect(jsonPath("$.authoritiesCount", greaterThanOrEqualTo(9)));
    }

    @Test
    void testListAuthorities() throws Exception {
        mockMvc.perform(get("/api/authorities"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(9))))
                .andExpect(jsonPath("$[?(@.id == 'auth-9')].name").value(hasItem("Delhi Skill and Entrepreneurship University (DSEU)")));
    }

    @Test
    void testFilterAuthoritiesByJurisdiction() throws Exception {
        mockMvc.perform(get("/api/authorities").param("jurisdiction", "Delhi NCT"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(4))));
    }

    @Test
    void testAuthorityRecommendationForDseu() throws Exception {
        mockMvc.perform(post("/api/recommend-authority")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"draftText\": \"Inquiry regarding DSEU Okhla campus college fund and laboratory fees\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authority.id").value("auth-9"))
                .andExpect(jsonPath("$.authority.name").value("Delhi Skill and Entrepreneurship University (DSEU)"))
                .andExpect(jsonPath("$.filingChannel.portalUrl").exists());
    }

    @Test
    void testDraftRtiRequest() throws Exception {
        mockMvc.perform(post("/api/draft-request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"concern\": \"I want certified copies of college fund audit reports for DSEU Okhla-II campus.\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.draftText", containsStringIgnoringCase("section 6(1)")))
                .andExpect(jsonPath("$.category").exists());
    }

    @Test
    void testClassifyResponseContract() throws Exception {
        String payload = """
                {
                  "responseText": "With reference to your RTI query regarding faculty selection committee minutes, disclosure is hereby denied as it contains third party personal evaluations exempted under Section 8(1)(j) of the RTI Act, 2005.",
                  "requestContext": {
                    "originalRequestText": "Certified copies of faculty selection committee minutes.",
                    "filingDate": "2026-08-14",
                    "authorityName": "Department of Higher Education"
                  }
                }
                """;

        mockMvc.perform(post("/api/classify-response")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DENIED"))
                .andExpect(jsonPath("$.sectionCited").value("8(1)(j)"))
                .andExpect(jsonPath("$.suggestedNextStep").value("Consider First Appeal"))
                .andExpect(jsonPath("$.confidence").value("high"))
                .andExpect(jsonPath("$.disclaimer").exists());
    }

    @Test
    void testCreateCaseAndStatutoryDeadlines() throws Exception {
        CaseItem newCase = new CaseItem();
        newCase.setTitle("Hostel Fee Transparency");
        newCase.setSubjectCategory("Higher Education");
        newCase.setAuthorityId("auth-9");

        mockMvc.perform(post("/api/cases")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newCase)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.trackingNumber").exists())
                .andExpect(jsonPath("$.deadlines", hasSize(1)))
                .andExpect(jsonPath("$.deadlines[0].calculatedDays").value(30))
                .andExpect(jsonPath("$.deadlines[0].actSectionReference").value("RTI Act Sec 7(1)"));
    }

    @Test
    void testAuthCheckEmailAndOtpVerificationFlow() throws Exception {
        String testEmail = "testcitizen_" + System.currentTimeMillis() + "@example.com";

        // 1. Send OTP
        String sendResp = mockMvc.perform(post("/api/auth/send-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\": \"" + testEmail + "\", \"name\": \"Test Citizen\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.devOtp").exists())
                .andReturn().getResponse().getContentAsString();

        AuthResponse authResp = objectMapper.readValue(sendResp, AuthResponse.class);
        String otp = authResp.getDevOtp();

        // 2. Verify OTP
        String verifyResp = mockMvc.perform(post("/api/auth/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\": \"" + testEmail + "\", \"otp\": \"" + otp + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.user.email").value(testEmail))
                .andReturn().getResponse().getContentAsString();

        AuthResponse verified = objectMapper.readValue(verifyResp, AuthResponse.class);
        String token = verified.getToken();

        // 3. Set Password
        mockMvc.perform(post("/api/auth/set-password")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\": \"" + testEmail + "\", \"password\": \"StrongPass2026!\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // 4. Login with Password
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\": \"" + testEmail + "\", \"password\": \"StrongPass2026!\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.token").exists());

        // 5. Check /api/auth/me
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.email").value(testEmail));
    }
}

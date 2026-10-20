package org.rtiassist.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.rtiassist.config.DotenvConfig;
import org.rtiassist.dto.*;
import org.rtiassist.model.Authority;
import org.rtiassist.repository.JsonDataStore;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;

@Service
public class GeminiService {

    private final DotenvConfig dotenvConfig;
    private final JsonDataStore dataStore;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    private static final List<String> ALLOWED_STATUSES = Arrays.asList(
            "FULLY_ANSWERED", "PARTIALLY_ANSWERED", "DENIED", "EVASIVE_VAGUE", "TRANSFERRED", "NO_RESPONSE"
    );

    private static final List<String> ALLOWED_NEXT_STEPS = Arrays.asList(
            "No action needed",
            "Consider First Appeal",
            "File First Appeal — response is overdue",
            "Consider Second Appeal",
            "Request clarification"
    );

    public GeminiService(DotenvConfig dotenvConfig, JsonDataStore dataStore) {
        this.dotenvConfig = dotenvConfig;
        this.dataStore = dataStore;
    }

    public boolean isConfigured() {
        String key = dotenvConfig.getGeminiApiKey();
        return key != null && !key.isBlank() && !key.contains("your_");
    }

    public String getModel() {
        return dotenvConfig.getGeminiModel();
    }

    /**
     * Call Gemini API with model fallback sequence
     */
    public String callGeminiApi(String systemPrompt, String userPrompt, double temperature) {
        String apiKey = dotenvConfig.getGeminiApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            throw new RuntimeException("NO_API_KEY");
        }

        List<String> models = new ArrayList<>();
        models.add(dotenvConfig.getGeminiModel());
        models.add("gemini-3.1-flash-lite");
        models.add("gemini-3.8-flash");
        models.add("gemini-2.5-flash-lite");
        models.add("gemini-1.5-flash");

        // Deduplicate
        Set<String> seen = new LinkedHashSet<>(models);
        Exception lastError = null;

        for (String model : seen) {
            try {
                String endpoint = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;

                Map<String, Object> part = Map.of("text", systemPrompt + "\n\nUSER INPUT:\n" + userPrompt);
                Map<String, Object> content = Map.of("role", "user", "parts", Collections.singletonList(part));
                Map<String, Object> genConfig = Map.of("temperature", temperature, "maxOutputTokens", 2048);

                Map<String, Object> payload = Map.of(
                        "contents", Collections.singletonList(content),
                        "generationConfig", genConfig
                );

                String jsonPayload = objectMapper.writeValueAsString(payload);

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(endpoint))
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                        .timeout(Duration.ofSeconds(20))
                        .build();

                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                if (response.statusCode() >= 200 && response.statusCode() < 300) {
                    JsonNode root = objectMapper.readTree(response.body());
                    JsonNode candidates = root.get("candidates");
                    if (candidates != null && candidates.isArray() && !candidates.isEmpty()) {
                        JsonNode textNode = candidates.get(0).path("content").path("parts").get(0).path("text");
                        if (!textNode.isMissingNode()) {
                            return textNode.asText();
                        }
                    }
                } else {
                    System.err.println("[GeminiService] Model " + model + " returned status " + response.statusCode() + ": " + response.body());
                }
            } catch (Exception e) {
                lastError = e;
                System.err.println("[GeminiService] Model " + model + " call failed: " + e.getMessage());
            }
        }

        throw new RuntimeException("All Gemini models failed: " + (lastError != null ? lastError.getMessage() : "Unknown error"));
    }

    /**
     * 1. RTI Application Formulation (Section 6(1))
     */
    public DraftRequestDto draftRtiRequest(String concern) {
        String query = (concern != null) ? concern.trim() : "";
        if (query.isBlank()) {
            throw new IllegalArgumentException("Concern description cannot be blank");
        }

        boolean isEmergency = query.toLowerCase().contains("emergency") ||
                query.toLowerCase().contains("life") ||
                query.toLowerCase().contains("death") ||
                query.toLowerCase().contains("arrest") ||
                query.toLowerCase().contains("hospital");

        if (isConfigured()) {
            try {
                String systemPrompt = "You are an expert Indian Right to Information Act (RTI Act, 2005) legal draftsman.\n"
                        + "Convert the citizen's grievance into an impeccably crafted RTI application under Section 6(1) of RTI Act, 2005.\n"
                        + "Rules:\n"
                        + "1. Target specific competent Public Information Officer (PIO).\n"
                        + "2. Convert grievances into precise, numbered documentary queries (certified copies, statements, work orders).\n"
                        + "3. Statutory timeframe: 30 days under Sec 7(1) (or 48h for life/liberty).\n"
                        + "Output strictly valid JSON without markdown fences:\n"
                        + "{\n"
                        + "  \"category\": \"Category name\",\n"
                        + "  \"suggestedAuthority\": \"Authority name\",\n"
                        + "  \"suggestedAuthorityType\": \"central | state | municipal\",\n"
                        + "  \"draftText\": \"Complete formal RTI letter\"\n"
                        + "}";

                String raw = callGeminiApi(systemPrompt, query, 0.2);
                String cleaned = cleanJsonFences(raw);
                try {
                    JsonNode node = objectMapper.readTree(cleaned);
                    String category = node.has("category") ? node.get("category").asText() : "Public Administration";
                    String draftText = node.has("draftText") ? node.get("draftText").asText() : cleaned;
                    String authType = node.has("suggestedAuthorityType") ? node.get("suggestedAuthorityType").asText() : "state";
                    return new DraftRequestDto(category, draftText, authType,
                            "Generated via Google Gemini (" + getModel() + "). Formatted under Section 6(1) of RTI Act, 2005.");
                } catch (Exception parseEx) {
                    return new DraftRequestDto("Public Administration", cleaned, "state",
                            "Generated via Google Gemini (" + getModel() + ").");
                }
            } catch (Exception e) {
                System.err.println("[GeminiService] Gemini API drafting failed, using fallback engine: " + e.getMessage());
            }
        }

        return fallbackDraftRtiRequest(query, isEmergency);
    }

    /**
     * 2. Recommend Authority
     */
    public AuthorityRecommendationResponse recommendAuthority(String draftText) {
        String text = (draftText != null) ? draftText.toLowerCase() : "";
        List<Authority> authorities = dataStore.getAuthorities(null, null, null);

        Authority selected = authorities.stream().filter(a -> "auth-9".equals(a.getId())).findFirst().orElse(
                !authorities.isEmpty() ? authorities.get(0) : null
        );
        String rationale = "Competent public authority for inquiries.";

        if (text.contains("dseu") || text.contains("okhla") || text.contains("polytechnic") ||
                text.contains("diploma") || text.contains("college fund") || text.contains("skill university")) {
            selected = authorities.stream().filter(a -> "auth-9".equals(a.getId())).findFirst().orElse(selected);
            rationale = "Competent State University public authority for DSEU campus inquiries, academic finances, college fund allocations, and student fee utilization in Delhi NCT.";
        } else if (text.contains("toll") || text.contains("highway") || text.contains("road") ||
                text.contains("nhai") || text.contains("transport") || text.contains("expressway")) {
            selected = authorities.stream().filter(a -> "auth-2".equals(a.getId())).findFirst().orElse(selected);
            rationale = "Jurisdiction over national highway asset development, concessionaire toll agreements, road quality inspection, and transport infrastructure.";
        } else if (text.contains("water") || text.contains("drain") || text.contains("sewage") ||
                text.contains("pipeline") || text.contains("jal")) {
            selected = authorities.stream().filter(a -> "auth-7".equals(a.getId())).findFirst().orElse(selected);
            rationale = "Jurisdiction over drinking water supply, pipeline contamination audits, and sewage infrastructure in Delhi NCT.";
        } else if (text.contains("school") || text.contains("ews") || text.contains("admission") ||
                text.contains("teacher") || text.contains("edudel")) {
            selected = authorities.stream().filter(a -> "auth-5".equals(a.getId())).findFirst().orElse(selected);
            rationale = "Jurisdiction over recognized private schools, EWS quota admissions, and school education regulatory compliance in Delhi NCT.";
        } else if (text.contains("police") || text.contains("fir") || text.contains("chowki") ||
                text.contains("traffic") || text.contains("challan")) {
            selected = authorities.stream().filter(a -> "auth-4".equals(a.getId())).findFirst().orElse(selected);
            rationale = "Jurisdiction over law enforcement, FIR status inquiries, crime records, and traffic regulation in Delhi NCT.";
        } else if (text.contains("dda") || text.contains("housing") || text.contains("land") ||
                text.contains("allotment") || text.contains("flat")) {
            selected = authorities.stream().filter(a -> "auth-3".equals(a.getId())).findFirst().orElse(selected);
            rationale = "Jurisdiction over urban land development, housing lottery schemes, and master plan zoning in Delhi NCT.";
        } else if (text.contains("rail") || text.contains("train") || text.contains("station") || text.contains("coach")) {
            selected = authorities.stream().filter(a -> "auth-8".equals(a.getId())).findFirst().orElse(selected);
            rationale = "Jurisdiction over Indian Railways operations, passenger amenities, track safety, and ticketing systems.";
        } else if (text.contains("food") || text.contains("fssai") || text.contains("adulteration") || text.contains("sample")) {
            selected = authorities.stream().filter(a -> "auth-6".equals(a.getId())).findFirst().orElse(selected);
            rationale = "Statutory authority responsible for science-based food standards, adulteration testing, and business licensing.";
        } else if (text.contains("higher education") || text.contains("ugc") || text.contains("central university")) {
            selected = authorities.stream().filter(a -> "auth-1".equals(a.getId())).findFirst().orElse(selected);
            rationale = "Primary administrative jurisdiction for central higher educational and academic institutional inquiries.";
        }

        AuthorityRecommendationResponse resp = new AuthorityRecommendationResponse();
        resp.setAuthority(selected);

        FilingChannelDto channel = new FilingChannelDto();
        if (selected != null) {
            channel.setType("state".equalsIgnoreCase(selected.getLevel()) ? "State Portal / Postal Order" : "Online Central Portal");
            channel.setPortalName(selected.getPortalUrl() != null ? URI.create(selected.getPortalUrl()).getHost() : "rtionline.gov.in");
            channel.setPortalUrl(selected.getPortalUrl() != null ? selected.getPortalUrl() : "https://rtionline.gov.in");
            channel.setFee(selected.getApplicationFee() != null ? selected.getApplicationFee() : 10);
            channel.setPaymentModes(selected.getPaymentModes() != null ? selected.getPaymentModes() : Arrays.asList("Online Gateway", "UPI", "Postal Order"));
        }
        resp.setFilingChannel(channel);
        resp.setStatutoryTimeframe("30 calendar days under Section 7(1) of RTI Act, 2005 (or 48 hours for life & liberty)");
        resp.setRationale(rationale);
        resp.setConfidenceScore(0.95);
        return resp;
    }

    /**
     * 3. RTI Appeal Drafting (First Appeal Sec 19(1) or Second Appeal Sec 19(3))
     */
    public DraftAppealDto draftAppealPetition(Object caseDetails, String appealType) {
        boolean isSecond = appealType != null && appealType.toLowerCase().contains("second");
        String typeLabel = isSecond ? "Second Appeal (Sec 19(3))" : "First Appeal (Sec 19(1))";

        if (isConfigured()) {
            try {
                String systemPrompt = "You are an expert Indian RTI Act legal advocate drafting a formal " + typeLabel + ".\n"
                        + "Compose a formal petition containing header, appellant/authority details, chronological facts, legal grounds under RTI Act 2005 (Sec 7(1), 7(2), 7(6), and Sec 20 penalties if Second Appeal), and prayer for relief.";

                String userPrompt = objectMapper.writeValueAsString(caseDetails);
                String generated = callGeminiApi(systemPrompt, userPrompt, 0.2);

                return new DraftAppealDto(generated, "Drafted via Google Gemini (" + typeLabel + "). Review and sign before official filing.");
            } catch (Exception e) {
                System.err.println("[GeminiService] Appeal drafting via Gemini failed, falling back: " + e.getMessage());
            }
        }

        return fallbackDraftAppeal(caseDetails, isSecond);
    }

    /**
     * 4. Classify Government RTI Response
     */
    public ClassificationResult classifyResponse(String responseText, RequestContextDto requestContext) {
        if (responseText == null || responseText.isBlank()) {
            throw new IllegalArgumentException("Response text is required and must be a non-empty string.");
        }
        if (responseText.length() > 5000) {
            throw new IllegalArgumentException("Response text exceeds maximum allowed length of 5000 characters.");
        }

        if (isConfigured()) {
            String baseSystemPrompt = "You are an expert Indian Right to Information Act (RTI Act, 2005) response analyzer.\n"
                    + "Analyze the government response and classify into EXACTLY ONE OF: "
                    + "\"FULLY_ANSWERED\", \"PARTIALLY_ANSWERED\", \"DENIED\", \"EVASIVE_VAGUE\", \"TRANSFERRED\", \"NO_RESPONSE\".\n"
                    + "If exemption cited, identify subclause (e.g. \"8(1)(j)\", \"8(1)(a)\", \"8(1)(d)\", \"8(1)(e)\", \"8(1)(h)\", \"Section 6(3)\").\n"
                    + "Suggest next step from: \"No action needed\", \"Consider First Appeal\", \"File First Appeal — response is overdue\", \"Consider Second Appeal\", \"Request clarification\".\n"
                    + "Respond strictly in JSON without markdown fences:\n"
                    + "{\n"
                    + "  \"status\": \"...\",\n"
                    + "  \"sectionCited\": \"... | null\",\n"
                    + "  \"reason\": \"...\",\n"
                    + "  \"suggestedNextStep\": \"...\",\n"
                    + "  \"confidence\": \"high | medium | low\"\n"
                    + "}";

            String contextStr = "";
            if (requestContext != null) {
                contextStr = "\nRequest Context:\n- Original: " + requestContext.getOriginalRequestText()
                        + "\n- Filing Date: " + requestContext.getFilingDate()
                        + "\n- Authority: " + requestContext.getAuthorityName();
            }

            try {
                String raw = callGeminiApi(baseSystemPrompt, "Government Response Text:\n\"" + responseText + "\"" + contextStr, 0.1);
                String cleaned = cleanJsonFences(raw);
                JsonNode node = objectMapper.readTree(cleaned);

                String status = node.has("status") ? node.get("status").asText().toUpperCase().trim() : "PARTIALLY_ANSWERED";
                if (!ALLOWED_STATUSES.contains(status)) status = "PARTIALLY_ANSWERED";

                String sectionCited = (node.has("sectionCited") && !node.get("sectionCited").isNull()) ? node.get("sectionCited").asText() : null;
                String reason = node.has("reason") ? node.get("reason").asText() : "Response analyzed according to RTI Act, 2005 provisions.";
                String nextStep = node.has("suggestedNextStep") ? node.get("suggestedNextStep").asText() : "Consider First Appeal";
                if (!ALLOWED_NEXT_STEPS.contains(nextStep)) {
                    nextStep = "FULLY_ANSWERED".equals(status) ? "No action needed" : "Consider First Appeal";
                }
                String confidence = node.has("confidence") ? node.get("confidence").asText().toLowerCase() : "medium";

                return new ClassificationResult(status, sectionCited, reason, nextStep, confidence);
            } catch (Exception e) {
                System.err.println("[GeminiService] Live AI classify failed, using fallback rule engine: " + e.getMessage());
            }
        }

        return fallbackClassifyResponse(responseText, requestContext);
    }

    // =========================================================================
    // FALLBACK ENGINES
    // =========================================================================

    private DraftRequestDto fallbackDraftRtiRequest(String concern, boolean isEmergency) {
        String lower = concern.toLowerCase();
        String category = "Public Administration";
        String pioHeader = "The Public Information Officer (PIO),\nDepartment of Higher Education,\nGovt. of India, Shastri Bhawan, New Delhi - 110001";
        String authType = "central";

        if (lower.contains("dseu") || lower.contains("okhla") || lower.contains("college fund") || lower.contains("polytechnic")) {
            category = "Higher & Technical Education (DSEU / State University)";
            pioHeader = "The Public Information Officer (PIO),\nDelhi Skill and Entrepreneurship University (DSEU) / Respective Campus,\nGovt. of NCT of Delhi, Okhla Phase-II Campus, New Delhi - 110020";
            authType = "state";
        } else if (lower.contains("toll") || lower.contains("highway") || lower.contains("road") || lower.contains("nhai")) {
            category = "Highways & Transport Infrastructure";
            pioHeader = "The Public Information Officer (PIO),\nNational Highways Authority of India (NHAI),\nG-5 & 6, Sector-10, Dwarka, New Delhi - 110075";
            authType = "central";
        } else if (lower.contains("school") || lower.contains("ews") || lower.contains("admission")) {
            category = "School Education (GNCTD)";
            pioHeader = "The Public Information Officer (PIO),\nDirectorate of Education, Govt. of NCT of Delhi,\nOld Secretariat, Civil Lines, Delhi - 110054";
            authType = "state";
        } else if (lower.contains("water") || lower.contains("sewer") || lower.contains("drain")) {
            category = "Urban Water & Sanitation";
            pioHeader = "The Public Information Officer (PIO),\nDelhi Jal Board, Varunalaya Phase-II, Karol Bagh, New Delhi - 110005";
            authType = "state";
        }

        String timeframe = isEmergency
                ? "48 HOURS as this request directly concerns the life and liberty of an individual under the proviso to Section 7(1) of the RTI Act, 2005."
                : "30 calendar days as stipulated under Section 7(1) of the RTI Act, 2005.";

        String draftText = "APPLICATION UNDER SECTION 6(1) OF THE RIGHT TO INFORMATION ACT, 2005\n\n"
                + "To,\n" + pioHeader + "\n\n"
                + "Subject: Request for certified documentary information under Section 6(1) of the RTI Act, 2005.\n\n"
                + "Sir/Madam,\n"
                + "I, a citizen of India, respectfully request you to furnish certified true copies and records regarding the subject matter under Section 6(1) and Section 2(j) of the Right to Information Act, 2005:\n\n"
                + "1. Certified true copy of the audited financial statements, ledger entries, and fund disbursement receipts concerning: " + concern + ".\n"
                + "2. Itemized expenditure schedule and utilization certificates submitted to the competent authority for the relevant academic/financial years.\n"
                + "3. Certified copies of the administrative sanction orders, procurement tenders, and vendor contracts approved for the works/services.\n"
                + "4. Certified copy of the Action Taken Report (ATR) and inspection reports recorded on citizen grievances submitted to date.\n"
                + "5. Names, official designations, and contact particulars of the Drawing and Disbursing Officer (DDO) and designated First Appellate Authority (FAA).\n\n"
                + "Statutory Period for Furnishing Information:\n"
                + "The requested information must be supplied within " + timeframe + "\n\n"
                + "Filing Fee:\n"
                + "Statutory application fee of Rs. 10/- has been remitted as prescribed by law.\n\n"
                + "Yours faithfully,\n[Applicant Name]\n[Citizen Address / Contact]\nDate: " + new Date();

        return new DraftRequestDto(category, draftText, authType,
                "Formulated under Section 6(1) of the RTI Act, 2005 using built-in legal drafting engine.");
    }

    private DraftAppealDto fallbackDraftAppeal(Object caseDetails, boolean isSecondAppeal) {
        String title = isSecondAppeal
                ? "SECOND APPEAL UNDER SECTION 19(3) OF THE RIGHT TO INFORMATION ACT, 2005\nBEFORE THE CENTRAL / STATE INFORMATION COMMISSION"
                : "FIRST APPEAL UNDER SECTION 19(1) OF THE RIGHT TO INFORMATION ACT, 2005\nBEFORE THE FIRST APPELLATE AUTHORITY";

        String relief = isSecondAppeal
                ? "1. Direct the Public Authority to furnish certified records immediately free of charge under Section 7(6).\n2. Initiate penal proceedings against the PIO under Section 20(1) and disciplinary action under Section 20(2)."
                : "1. Direct the CPIO to immediately furnish certified point-wise copies of all requested documents free of charge under Section 7(6).\n2. Censure the CPIO for failure to adhere to the 30-day statutory timeline.";

        String draft = title + "\n\n"
                + "To,\n" + (isSecondAppeal ? "The Hon'ble Chief Information Commissioner" : "The First Appellate Authority (FAA)") + "\n\n"
                + "1. Appellant Name: Vikramaditya Roy\n"
                + "2. Public Authority: Concerned Public Authority\n"
                + "3. Date of Section 6(1) RTI Application: Within statutory 30-day window\n\n"
                + "GROUNDS OF APPEAL:\n"
                + "1. Deemed Refusal under Section 7(2): The CPIO has failed to furnish the requested records within 30 days.\n"
                + "2. Statutory Right to Free Information under Section 7(6): The applicant is entitled to information free of cost.\n"
                + "3. The requested records are of vital public interest and do not attract exemptions under Section 8(1).\n\n"
                + "PRAYER / RELIEF SOUGHT:\n" + relief + "\n\n"
                + "Verification:\n"
                + "I, the appellant, verify that the contents stated above are true to the best of my knowledge.\n\n"
                + "Yours faithfully,\n[Appellant Signature]";

        return new DraftAppealDto(draft, "Generated via Legal Engine. Review and verify details before submission.");
    }

    public ClassificationResult fallbackClassifyResponse(String responseText, RequestContextDto requestContext) {
        String text = (responseText != null) ? responseText.toLowerCase() : "";

        String status = "PARTIALLY_ANSWERED";
        String sectionCited = null;
        String reason = "";
        String suggestedNextStep = "Consider First Appeal";
        String confidence = "high";

        if (text.contains("8(1)(j)") || text.contains("8 (1) (j)") || text.contains("personal information") || text.contains("privacy") || text.contains("third party")) {
            status = "DENIED";
            sectionCited = "8(1)(j)";
            reason = "The authority denied disclosure invoking Section 8(1)(j), citing personal information or privacy of individuals without demonstrating larger public interest.";
            suggestedNextStep = "Consider First Appeal";
        } else if (text.contains("8(1)(a)") || text.contains("security of india") || text.contains("sovereignty") || text.contains("strategic interest")) {
            status = "DENIED";
            sectionCited = "8(1)(a)";
            reason = "The authority refused disclosure citing Section 8(1)(a) claiming potential prejudice to sovereignty, security, or strategic interests of the state.";
            suggestedNextStep = "Consider First Appeal";
        } else if (text.contains("8(1)(d)") || text.contains("commercial confidence") || text.contains("trade secret") || text.contains("intellectual property")) {
            status = "DENIED";
            sectionCited = "8(1)(d)";
            reason = "Information was withheld under Section 8(1)(d) citing commercial confidence or trade secrets of third parties.";
            suggestedNextStep = "Consider First Appeal";
        } else if (text.contains("8(1)(e)") || text.contains("fiduciary")) {
            status = "DENIED";
            sectionCited = "8(1)(e)";
            reason = "Disclosure was denied citing fiduciary relationship under Section 8(1)(e).";
            suggestedNextStep = "Consider First Appeal";
        } else if (text.contains("8(1)(h)") || text.contains("investigation") || text.contains("prosecution") || text.contains("impede")) {
            status = "DENIED";
            sectionCited = "8(1)(h)";
            reason = "Information was refused under Section 8(1)(h) on grounds that disclosure would impede ongoing investigation or prosecution of offenders.";
            suggestedNextStep = "Consider First Appeal";
        } else if (text.contains("6(3)") || text.contains("transferred") || text.contains("forwarded") || text.contains("another public authority") || text.contains("does not pertain to this department")) {
            status = "TRANSFERRED";
            sectionCited = "Section 6(3)";
            reason = "Your application has been transferred under Section 6(3) to another public authority deemed to hold the requested records.";
            suggestedNextStep = "Request clarification";
        } else if (text.contains("rejected") || text.contains("denied") || text.contains("cannot be provided") || text.contains("cannot be shared") || text.contains("not permissible") || text.contains("regret to inform")) {
            status = "DENIED";
            sectionCited = null;
            reason = "The authority denied the requested information but cited no specific exemption section under Section 8(1) (no section cited in the reply).";
            suggestedNextStep = "Consider First Appeal";
        } else if (text.contains("not compiled") || text.contains("bulky") || text.contains("disproportionate") || text.contains("create information") || text.contains("clarification") || text.contains("opinion") || text.contains("scattered")) {
            status = "EVASIVE_VAGUE";
            sectionCited = null;
            reason = "The PIO gave an evasive or deflective reply stating records are not compiled or voluminous, without providing accessible documents.";
            suggestedNextStep = "Consider First Appeal";
        } else if (text.contains("enclosed") || text.contains("attached") || text.contains("herewith") || text.contains("as requested") || text.contains("certified copy") || text.contains("furnished below") || text.contains("point wise information")) {
            status = "FULLY_ANSWERED";
            sectionCited = null;
            reason = "The authority furnished substantive point-wise information and documents corresponding to the Section 6(1) queries.";
            suggestedNextStep = "No action needed";
        } else {
            status = "PARTIALLY_ANSWERED";
            sectionCited = null;
            reason = "The response provides preliminary or incomplete remarks regarding the requested matter; certain aspects remain unresolved.";
            suggestedNextStep = "Consider First Appeal";
            confidence = "medium";
        }

        return new ClassificationResult(status, sectionCited, reason, suggestedNextStep, confidence);
    }

    private String cleanJsonFences(String raw) {
        if (raw == null) return "";
        return raw.replaceAll("(?i)```json", "").replaceAll("```", "").trim();
    }
}

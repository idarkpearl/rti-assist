package org.rtiassist.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.rtiassist.exception.ApiException;
import org.rtiassist.model.Appeal;
import org.rtiassist.model.CaseItem;
import org.rtiassist.model.User;
import org.rtiassist.service.AppealService;
import org.rtiassist.service.CaseService;
import org.rtiassist.service.PdfExportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appeals")
public class AppealController {

    private final AppealService appealService;
    private final CaseService caseService;
    private final PdfExportService pdfExportService;

    public AppealController(AppealService appealService, CaseService caseService, PdfExportService pdfExportService) {
        this.appealService = appealService;
        this.caseService = caseService;
        this.pdfExportService = pdfExportService;
    }

    private String getUserId(HttpServletRequest request) {
        User authUser = (User) request.getAttribute("currentUser");
        return (authUser != null) ? authUser.getId() : null;
    }

    @GetMapping
    public ResponseEntity<List<Appeal>> listAppeals(
            @RequestParam(required = false) String caseId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(appealService.getAppeals(caseId, getUserId(request)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Appeal> getAppeal(@PathVariable String id, HttpServletRequest request) {
        Appeal a = appealService.getAppealById(id, getUserId(request));
        if (a == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Appeal draft not found with id: " + id);
        }
        return ResponseEntity.ok(a);
    }

    @PostMapping
    public ResponseEntity<Appeal> createAppeal(@RequestBody Appeal data, HttpServletRequest request) {
        Appeal created = appealService.createAppeal(data, getUserId(request));
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Appeal> updateAppeal(
            @PathVariable String id,
            @RequestBody Appeal updates,
            HttpServletRequest request
    ) {
        Appeal updated = appealService.updateAppeal(id, updates, getUserId(request));
        if (updated == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Appeal draft not found with id: " + id);
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteAppeal(@PathVariable String id, HttpServletRequest request) {
        boolean removed = appealService.deleteAppeal(id, getUserId(request));
        if (!removed) {
            throw new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Appeal draft not found with id: " + id);
        }
        return ResponseEntity.ok(Map.of("success", true, "message", "Appeal deleted successfully"));
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> exportAppealPdf(@PathVariable String id, HttpServletRequest request) {
        String userId = getUserId(request);
        Appeal a = appealService.getAppealById(id, userId);
        if (a == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Appeal draft not found with id: " + id);
        }
        CaseItem parent = a.getCaseId() != null ? caseService.getCaseById(a.getCaseId(), userId) : null;
        byte[] pdf = pdfExportService.generateAppealPdf(a, parent);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"Appeal_" + id + ".pdf\"")
                .body(pdf);
    }
}

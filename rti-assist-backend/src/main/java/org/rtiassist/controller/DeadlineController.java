package org.rtiassist.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.rtiassist.exception.ApiException;
import org.rtiassist.model.Deadline;
import org.rtiassist.model.User;
import org.rtiassist.service.DeadlineService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/deadlines")
public class DeadlineController {

    private final DeadlineService deadlineService;

    public DeadlineController(DeadlineService deadlineService) {
        this.deadlineService = deadlineService;
    }

    private String getUserId(HttpServletRequest request) {
        User authUser = (User) request.getAttribute("currentUser");
        return (authUser != null) ? authUser.getId() : null;
    }

    @GetMapping
    public ResponseEntity<List<Deadline>> listDeadlines(
            @RequestParam(required = false) String caseId,
            @RequestParam(required = false) String status,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(deadlineService.getDeadlines(caseId, status, getUserId(request)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Deadline> getDeadline(@PathVariable String id) {
        Deadline d = deadlineService.getDeadlineById(id);
        if (d == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Deadline not found with id: " + id);
        }
        return ResponseEntity.ok(d);
    }

    @PostMapping
    public ResponseEntity<Deadline> createDeadline(@RequestBody Deadline data) {
        Deadline created = deadlineService.createDeadline(data);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Deadline> updateDeadline(@PathVariable String id, @RequestBody Deadline updates) {
        Deadline updated = deadlineService.updateDeadline(id, updates);
        if (updated == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Deadline not found with id: " + id);
        }
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<Deadline> completeDeadline(@PathVariable String id) {
        Deadline completed = deadlineService.completeDeadline(id);
        if (completed == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Deadline not found with id: " + id);
        }
        return ResponseEntity.ok(completed);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteDeadline(@PathVariable String id) {
        boolean removed = deadlineService.deleteDeadline(id);
        if (!removed) {
            throw new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Deadline not found with id: " + id);
        }
        return ResponseEntity.ok(Map.of("success", true, "message", "Deadline deleted successfully"));
    }
}

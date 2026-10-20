package org.rtiassist.controller;

import org.rtiassist.exception.ApiException;
import org.rtiassist.model.Deadline;
import org.rtiassist.repository.JsonDataStore;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/deadlines")
public class DeadlineController {

    private final JsonDataStore dataStore;

    public DeadlineController(JsonDataStore dataStore) {
        this.dataStore = dataStore;
    }

    @GetMapping
    public ResponseEntity<List<Deadline>> listDeadlines(
            @RequestParam(required = false) String caseId,
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(dataStore.getDeadlines(caseId, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Deadline> getDeadline(@PathVariable String id) {
        Deadline d = dataStore.getDeadlineById(id);
        if (d == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Deadline not found with id: " + id);
        }
        return ResponseEntity.ok(d);
    }

    @PostMapping
    public ResponseEntity<Deadline> createDeadline(@RequestBody Deadline data) {
        Deadline created = dataStore.createDeadline(data);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Deadline> updateDeadline(@PathVariable String id, @RequestBody Deadline updates) {
        Deadline updated = dataStore.updateDeadline(id, updates);
        if (updated == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Deadline not found with id: " + id);
        }
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<Deadline> completeDeadline(@PathVariable String id) {
        Deadline completed = dataStore.completeDeadline(id);
        if (completed == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Deadline not found with id: " + id);
        }
        return ResponseEntity.ok(completed);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteDeadline(@PathVariable String id) {
        boolean removed = dataStore.deleteDeadline(id);
        if (!removed) {
            throw new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Deadline not found with id: " + id);
        }
        return ResponseEntity.ok(Map.of("success", true, "message", "Deadline deleted successfully"));
    }
}

package org.rtiassist.controller;

import org.rtiassist.exception.ApiException;
import org.rtiassist.model.Appeal;
import org.rtiassist.repository.JsonDataStore;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appeals")
public class AppealController {

    private final JsonDataStore dataStore;

    public AppealController(JsonDataStore dataStore) {
        this.dataStore = dataStore;
    }

    @GetMapping
    public ResponseEntity<List<Appeal>> listAppeals(@RequestParam(required = false) String caseId) {
        return ResponseEntity.ok(dataStore.getAppeals(caseId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Appeal> getAppeal(@PathVariable String id) {
        Appeal a = dataStore.getAppealById(id);
        if (a == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Appeal draft not found with id: " + id);
        }
        return ResponseEntity.ok(a);
    }

    @PostMapping
    public ResponseEntity<Appeal> createAppeal(@RequestBody Appeal data) {
        Appeal created = dataStore.createAppeal(data);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Appeal> updateAppeal(@PathVariable String id, @RequestBody Appeal updates) {
        Appeal updated = dataStore.updateAppeal(id, updates);
        if (updated == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Appeal draft not found with id: " + id);
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteAppeal(@PathVariable String id) {
        boolean removed = dataStore.deleteAppeal(id);
        if (!removed) {
            throw new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Appeal draft not found with id: " + id);
        }
        return ResponseEntity.ok(Map.of("success", true, "message", "Appeal deleted successfully"));
    }
}

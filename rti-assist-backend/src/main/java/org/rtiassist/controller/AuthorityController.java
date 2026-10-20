package org.rtiassist.controller;

import org.rtiassist.exception.ApiException;
import org.rtiassist.model.Authority;
import org.rtiassist.repository.JsonDataStore;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/authorities")
public class AuthorityController {

    private final JsonDataStore dataStore;

    public AuthorityController(JsonDataStore dataStore) {
        this.dataStore = dataStore;
    }

    @GetMapping
    public ResponseEntity<List<Authority>> listAuthorities(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String jurisdiction,
            @RequestParam(required = false) String level
    ) {
        List<Authority> list = dataStore.getAuthorities(search, jurisdiction, level);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Authority> getAuthority(@PathVariable String id) {
        Authority auth = dataStore.getAuthorityById(id);
        if (auth == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Authority not found with id: " + id);
        }
        return ResponseEntity.ok(auth);
    }
}

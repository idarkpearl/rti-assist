package org.rtiassist.service;

import org.rtiassist.entity.AuthorityEntity;
import org.rtiassist.model.Authority;
import org.rtiassist.repository.AuthorityRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthorityService {

    private final AuthorityRepository authorityRepository;

    public AuthorityService(AuthorityRepository authorityRepository) {
        this.authorityRepository = authorityRepository;
    }

    public List<Authority> getAuthorities(String search, String jurisdiction, String level) {
        List<AuthorityEntity> entities = authorityRepository.findAll();
        return entities.stream()
                .map(AuthorityEntity::toModel)
                .filter(a -> {
                    if (jurisdiction != null && !jurisdiction.isBlank()) {
                        if (a.getJurisdiction() == null || !a.getJurisdiction().equalsIgnoreCase(jurisdiction.trim())) {
                            return false;
                        }
                    }
                    if (level != null && !level.isBlank()) {
                        if (a.getLevel() == null || !a.getLevel().equalsIgnoreCase(level.trim())) {
                            return false;
                        }
                    }
                    if (search != null && !search.isBlank()) {
                        String q = search.toLowerCase().trim();
                        boolean matchesName = a.getName() != null && a.getName().toLowerCase().contains(q);
                        boolean matchesMinistry = a.getMinistry() != null && a.getMinistry().toLowerCase().contains(q);
                        boolean matchesDept = a.getDepartment() != null && a.getDepartment().toLowerCase().contains(q);
                        boolean matchesPio = a.getPio() != null && a.getPio().getName() != null && a.getPio().getName().toLowerCase().contains(q);
                        boolean matchesTag = a.getCategoryTags() != null && a.getCategoryTags().stream().anyMatch(t -> t.toLowerCase().contains(q));
                        return matchesName || matchesMinistry || matchesDept || matchesPio || matchesTag;
                    }
                    return true;
                })
                .collect(Collectors.toList());
    }

    public Authority getAuthorityById(String id) {
        if (id == null) return null;
        return authorityRepository.findById(id).map(AuthorityEntity::toModel).orElse(null);
    }

    public long count() {
        return authorityRepository.count();
    }
}

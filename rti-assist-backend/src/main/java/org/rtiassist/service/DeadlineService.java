package org.rtiassist.service;

import org.rtiassist.entity.CaseEntity;
import org.rtiassist.entity.DeadlineEntity;
import org.rtiassist.model.Deadline;
import org.rtiassist.repository.CaseRepository;
import org.rtiassist.repository.DeadlineRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class DeadlineService {

    private final DeadlineRepository deadlineRepository;
    private final CaseRepository caseRepository;

    public DeadlineService(DeadlineRepository deadlineRepository, CaseRepository caseRepository) {
        this.deadlineRepository = deadlineRepository;
        this.caseRepository = caseRepository;
    }

    public List<Deadline> getDeadlines(String caseId, String status, String userId) {
        List<DeadlineEntity> list = (caseId != null && !caseId.isBlank())
                ? (status != null && !status.isBlank())
                    ? deadlineRepository.findByCaseIdAndStatusIgnoreCase(caseId, status)
                    : deadlineRepository.findByCaseId(caseId)
                : deadlineRepository.findAll();

        Set<String> allowedCaseIds = null;
        if (userId != null && !userId.isBlank()) {
            allowedCaseIds = caseRepository.findByUserId(userId).stream()
                    .map(CaseEntity::getId)
                    .collect(Collectors.toSet());
        }

        final Set<String> finalAllowed = allowedCaseIds;
        return list.stream()
                .filter(d -> finalAllowed == null || finalAllowed.contains(d.getCaseId()))
                .map(DeadlineEntity::toModel)
                .filter(d -> {
                    if (status != null && !status.isBlank()) {
                        return status.equalsIgnoreCase(d.getStatus());
                    }
                    return true;
                })
                .collect(Collectors.toList());
    }

    public Deadline getDeadlineById(String id) {
        if (id == null) return null;
        return deadlineRepository.findById(id).map(DeadlineEntity::toModel).orElse(null);
    }

    @Transactional
    public Deadline createDeadline(Deadline d) {
        if (d.getId() == null) d.setId("dl-" + System.currentTimeMillis());
        if (d.getCreatedAt() == null) d.setCreatedAt(Instant.now().toString());
        if (d.getStatus() == null) d.setStatus("pending");
        if (d.getCalculatedDays() == null) d.setCalculatedDays(30);
        if (d.getDaysRemaining() == null) d.setDaysRemaining(d.getCalculatedDays());

        DeadlineEntity entity = new DeadlineEntity(d);
        deadlineRepository.save(entity);
        return entity.toModel();
    }

    @Transactional
    public Deadline updateDeadline(String id, Deadline updates) {
        DeadlineEntity entity = deadlineRepository.findById(id).orElse(null);
        if (entity == null) return null;

        if (updates.getTitle() != null) entity.setTitle(updates.getTitle());
        if (updates.getStatus() != null) entity.setStatus(updates.getStatus());
        if (updates.getDueDate() != null) entity.setDueDate(updates.getDueDate());
        if (updates.getDaysRemaining() != null) entity.setDaysRemaining(updates.getDaysRemaining());
        if (updates.getNotes() != null) entity.setNotes(updates.getNotes());
        if (updates.getCompletedAt() != null) entity.setCompletedAt(updates.getCompletedAt());
        if (updates.getReminderSent() != null) entity.setReminderSent(updates.getReminderSent());
        entity.setUpdatedAt(Instant.now().toString());

        deadlineRepository.save(entity);
        return entity.toModel();
    }

    @Transactional
    public Deadline completeDeadline(String id) {
        DeadlineEntity entity = deadlineRepository.findById(id).orElse(null);
        if (entity == null) return null;
        entity.setStatus("completed");
        entity.setDaysRemaining(0);
        entity.setCompletedAt(Instant.now().toString());
        entity.setUpdatedAt(Instant.now().toString());
        deadlineRepository.save(entity);
        return entity.toModel();
    }

    @Transactional
    public boolean deleteDeadline(String id) {
        if (deadlineRepository.existsById(id)) {
            deadlineRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public long count() {
        return deadlineRepository.count();
    }
}

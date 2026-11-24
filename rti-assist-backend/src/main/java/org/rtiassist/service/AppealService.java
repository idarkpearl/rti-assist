package org.rtiassist.service;

import org.rtiassist.entity.AppealEntity;
import org.rtiassist.entity.CaseEntity;
import org.rtiassist.model.Appeal;
import org.rtiassist.repository.AppealRepository;
import org.rtiassist.repository.CaseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class AppealService {

    private final AppealRepository appealRepository;
    private final CaseRepository caseRepository;

    public AppealService(AppealRepository appealRepository, CaseRepository caseRepository) {
        this.appealRepository = appealRepository;
        this.caseRepository = caseRepository;
    }

    public List<Appeal> getAppeals(String caseId, String userId) {
        List<AppealEntity> list;
        if (caseId != null && !caseId.isBlank()) {
            list = appealRepository.findByCaseId(caseId);
        } else if (userId != null && !userId.isBlank()) {
            list = appealRepository.findByUserId(userId);
        } else {
            list = appealRepository.findAll();
        }

        return list.stream()
                .filter(a -> userId == null || userId.isBlank() || a.getUserId() == null || userId.equals(a.getUserId()))
                .map(AppealEntity::toModel)
                .collect(Collectors.toList());
    }

    public Appeal getAppealById(String id, String userId) {
        if (id == null) return null;
        Optional<AppealEntity> opt = appealRepository.findById(id);
        if (opt.isEmpty()) return null;
        AppealEntity entity = opt.get();
        if (userId != null && !userId.isBlank() && entity.getUserId() != null && !userId.equals(entity.getUserId())) {
            return null;
        }
        return entity.toModel();
    }

    @Transactional
    public Appeal createAppeal(Appeal a, String userId) {
        if (a.getId() == null || a.getId().isBlank()) a.setId("appeal-" + System.currentTimeMillis());
        String now = Instant.now().toString();
        if (a.getCreatedAt() == null) a.setCreatedAt(now);
        if (a.getUpdatedAt() == null) a.setUpdatedAt(now);
        if (a.getStatus() == null || a.getStatus().isBlank()) a.setStatus("ready_to_send");
        if (a.getAppealNumber() == null || a.getAppealNumber().isBlank()) {
            a.setAppealNumber("FAA-2026-" + (1000 + new Random().nextInt(9000)));
        }

        String effectiveUser = (userId != null && !userId.isBlank()) ? userId : a.getUserId();
        if ((effectiveUser == null || effectiveUser.isBlank()) && a.getCaseId() != null) {
            effectiveUser = caseRepository.findById(a.getCaseId()).map(CaseEntity::getUserId).orElse(CaseService.DEFAULT_DEMO_USER_ID);
        }
        a.setUserId(effectiveUser != null ? effectiveUser : CaseService.DEFAULT_DEMO_USER_ID);

        AppealEntity entity = new AppealEntity(a);
        appealRepository.save(entity);

        // Update case status to first_appeal_pending or second_appeal_pending
        if (a.getCaseId() != null) {
            caseRepository.findById(a.getCaseId()).ifPresent(c -> {
                String nextStatus = "second_appeal".equalsIgnoreCase(a.getType())
                        ? "second_appeal_pending"
                        : "first_appeal_pending";
                c.setStatus(nextStatus);
                c.setUpdatedAt(Instant.now().toString());
                caseRepository.save(c);
            });
        }

        return entity.toModel();
    }

    @Transactional
    public Appeal updateAppeal(String id, Appeal updates, String userId) {
        AppealEntity entity = appealRepository.findById(id).orElse(null);
        if (entity == null) return null;
        if (userId != null && !userId.isBlank() && entity.getUserId() != null && !userId.equals(entity.getUserId())) {
            return null;
        }

        if (updates.getStatus() != null) entity.setStatus(updates.getStatus());
        if (updates.getDraftContent() != null) entity.setDraftContent(updates.getDraftContent());
        if (updates.getGroundOfAppeal() != null) entity.setGroundOfAppeal(updates.getGroundOfAppeal());
        if (updates.getGroundsSummary() != null) entity.setGroundsSummary(updates.getGroundsSummary());
        if (updates.getReliefSought() != null) entity.setReliefSought(updates.getReliefSought());
        if (updates.getSubmissionDate() != null) entity.setSubmissionDate(updates.getSubmissionDate());
        entity.setUpdatedAt(Instant.now().toString());

        appealRepository.save(entity);
        return entity.toModel();
    }

    @Transactional
    public boolean deleteAppeal(String id, String userId) {
        AppealEntity entity = appealRepository.findById(id).orElse(null);
        if (entity == null) return false;
        if (userId != null && !userId.isBlank() && entity.getUserId() != null && !userId.equals(entity.getUserId())) {
            return false;
        }
        appealRepository.deleteById(id);
        return true;
    }

    public long count() {
        return appealRepository.count();
    }
}

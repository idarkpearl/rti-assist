package org.rtiassist.repository;

import org.rtiassist.entity.ReminderLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReminderLogRepository extends JpaRepository<ReminderLogEntity, Long> {
    boolean existsByCaseIdAndReminderType(String caseId, String reminderType);
    Optional<ReminderLogEntity> findByCaseIdAndReminderType(String caseId, String reminderType);
}

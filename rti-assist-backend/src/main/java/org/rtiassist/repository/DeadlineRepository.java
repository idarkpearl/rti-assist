package org.rtiassist.repository;

import org.rtiassist.entity.DeadlineEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeadlineRepository extends JpaRepository<DeadlineEntity, String> {
    List<DeadlineEntity> findByCaseId(String caseId);
    List<DeadlineEntity> findByCaseIdAndStatusIgnoreCase(String caseId, String status);
}

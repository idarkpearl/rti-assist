package org.rtiassist.repository;

import org.rtiassist.entity.CaseEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CaseRepository extends JpaRepository<CaseEntity, String> {
    List<CaseEntity> findByUserId(String userId);
    List<CaseEntity> findByUserIdAndStatusIgnoreCase(String userId, String status);
    Optional<CaseEntity> findByIdAndUserId(String id, String userId);
    List<CaseEntity> findByStatusNotInIgnoreCase(List<String> statuses);
}

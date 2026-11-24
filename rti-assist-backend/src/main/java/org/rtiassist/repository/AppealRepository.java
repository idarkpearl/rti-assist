package org.rtiassist.repository;

import org.rtiassist.entity.AppealEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AppealRepository extends JpaRepository<AppealEntity, String> {
    List<AppealEntity> findByCaseId(String caseId);
    List<AppealEntity> findByUserId(String userId);
    Optional<AppealEntity> findByIdAndUserId(String id, String userId);
}

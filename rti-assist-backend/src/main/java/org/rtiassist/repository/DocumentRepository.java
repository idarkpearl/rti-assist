package org.rtiassist.repository;

import org.rtiassist.entity.DocumentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<DocumentEntity, String> {
    List<DocumentEntity> findByCaseId(String caseId);
}

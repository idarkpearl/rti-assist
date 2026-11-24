package org.rtiassist.repository;

import org.rtiassist.entity.AuthorityEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuthorityRepository extends JpaRepository<AuthorityEntity, String> {
    List<AuthorityEntity> findByJurisdictionIgnoreCase(String jurisdiction);
    List<AuthorityEntity> findByLevelIgnoreCase(String level);
}

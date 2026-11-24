package org.rtiassist.repository;

import org.rtiassist.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, String> {
    Optional<UserEntity> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
}

package org.rtiassist.repository;

import org.rtiassist.entity.OtpRecordEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OtpRecordRepository extends JpaRepository<OtpRecordEntity, String> {
}

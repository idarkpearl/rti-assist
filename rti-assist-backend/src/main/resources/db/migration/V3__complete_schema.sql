-- Flyway Migration V3: Complete Schema (OTP persistence, Response Classification, Full Appeal Metadata, Indexes)

ALTER TABLE cases ADD COLUMN IF NOT EXISTS applicant_is_bpl BOOLEAN DEFAULT FALSE;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS last_response_status VARCHAR(64);
ALTER TABLE cases ADD COLUMN IF NOT EXISTS response_classification TEXT;

ALTER TABLE deadlines ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE;

ALTER TABLE appeals ADD COLUMN IF NOT EXISTS user_id VARCHAR(64);
ALTER TABLE appeals ADD COLUMN IF NOT EXISTS appellate_authority_name VARCHAR(255);
ALTER TABLE appeals ADD COLUMN IF NOT EXISTS appellate_authority_designation VARCHAR(255);
ALTER TABLE appeals ADD COLUMN IF NOT EXISTS appellant_json TEXT;
ALTER TABLE appeals ADD COLUMN IF NOT EXISTS original_application_date VARCHAR(64);
ALTER TABLE appeals ADD COLUMN IF NOT EXISTS original_pio_name VARCHAR(255);
ALTER TABLE appeals ADD COLUMN IF NOT EXISTS detailed_grounds TEXT;
ALTER TABLE appeals ADD COLUMN IF NOT EXISTS relief_sought TEXT;
ALTER TABLE appeals ADD COLUMN IF NOT EXISTS submission_date VARCHAR(64);

CREATE TABLE IF NOT EXISTS otp_records (
    email VARCHAR(255) PRIMARY KEY,
    otp VARCHAR(16) NOT NULL,
    expires_at BIGINT NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    created_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cases_user_id ON cases(user_id);
CREATE INDEX IF NOT EXISTS idx_cases_authority_id ON cases(authority_id);
CREATE INDEX IF NOT EXISTS idx_deadlines_case_id ON deadlines(case_id);
CREATE INDEX IF NOT EXISTS idx_appeals_case_id ON appeals(case_id);
CREATE INDEX IF NOT EXISTS idx_appeals_user_id ON appeals(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_case_id ON documents(case_id);

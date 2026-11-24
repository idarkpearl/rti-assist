-- Flyway Migration V2: Initial Seeds (Users, Authorities, Sample Case)
-- Standard ANSI SQL compatible with both PostgreSQL and H2 (PostgreSQL mode)

INSERT INTO users (id, name, email, role, password, has_password, email_verified, created_at, updated_at)
SELECT 'usr_demo', 'Demo Citizen', 'demo@rtiassist.local', 'citizen', '', false, true, '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'usr_demo');

INSERT INTO authorities (id, name, code, ministry, department, level, jurisdiction, category_tags, portal_url, application_fee, payment_modes, pio_name, pio_designation, pio_email, pio_phone, pio_address, faa_name, faa_designation, faa_email, faa_phone, faa_address, created_at)
SELECT 'auth-1', 'Department of Higher Education', 'DHE-EDU', 'Ministry of Education', 'Higher Education & Central Universities', 'central', 'Central', '["Higher Education","Central Universities","Faculty Recruitment","UGC","College","Professor"]', 'https://rtionline.gov.in', '10', '["Online Banking","UPI","Demand Draft","Postal Order"]', 'Shri R. K. Sharma', 'Director & CPIO', 'cpio.dhe@gov.in', '+91-11-2338-4567', 'Room 214, C-Wing, Shastri Bhawan, New Delhi - 110001', 'Dr. Anita Karwal', 'Joint Secretary (FAA)', 'faa.dhe@gov.in', '+91-11-2338-1122', 'Room 112, Shastri Bhawan, New Delhi - 110001', '2026-01-10T09:00:00Z'
WHERE NOT EXISTS (SELECT 1 FROM authorities WHERE id = 'auth-1');

INSERT INTO authorities (id, name, code, ministry, department, level, jurisdiction, category_tags, portal_url, application_fee, payment_modes, pio_name, pio_designation, pio_email, pio_phone, pio_address, faa_name, faa_designation, faa_email, faa_phone, faa_address, created_at)
SELECT 'auth-2', 'National Highways Authority of India (NHAI)', 'NHAI-HQ', 'Ministry of Road Transport and Highways', 'Expressways & Highway Auditing', 'central', 'Central', '["Highways","Expressways","Toll Audits","Infrastructure Quality","Roads","Potholes"]', 'https://nhai.gov.in/rti', '10', '["Online Gateway","SBI Challan","Postal Order"]', 'Smt. Priya Sundaram', 'General Manager (Tech) & CPIO', 'pio.highway@nhai.gov.in', '+91-11-2507-4100', 'G-5 & 6, Sector-10, Dwarka, New Delhi - 110075', 'Shri Manoj Kumar', 'Chief General Manager & FAA', 'faa@nhai.gov.in', '+91-11-2507-4200', 'Sector-10, Dwarka, New Delhi - 110075', '2026-01-12T10:30:00Z'
WHERE NOT EXISTS (SELECT 1 FROM authorities WHERE id = 'auth-2');

INSERT INTO authorities (id, name, code, ministry, department, level, jurisdiction, category_tags, portal_url, application_fee, payment_modes, pio_name, pio_designation, pio_email, pio_phone, pio_address, faa_name, faa_designation, faa_email, faa_phone, faa_address, created_at)
SELECT 'auth-3', 'Delhi Development Authority (DDA)', 'DDA-DELHI', 'Ministry of Housing and Urban Affairs / LG Delhi', 'Housing & Land Allotment', 'state', 'Delhi NCT', '["Urban Planning","Housing Schemes","Land Demarcation","Master Plan 2041","Plot Allotment"]', 'https://dda.gov.in/rti-online', '10', '["Net Banking","Debit Card","Postal Order"]', 'Shri Arvind Aggarwal', 'Deputy Director (System) & CPIO', 'cpio.dda@dda.gov.in', '+91-11-2469-8123', 'B-Block, Vikas Sadan, INA, New Delhi - 110023', 'Ms. Rachna Mohan', 'Commissioner (Housing) & FAA', 'faa.housing@dda.gov.in', '+91-11-2469-8800', 'Vikas Sadan, INA Colony, New Delhi - 110023', '2026-01-14T10:00:00Z'
WHERE NOT EXISTS (SELECT 1 FROM authorities WHERE id = 'auth-3');

INSERT INTO authorities (id, name, code, ministry, department, level, jurisdiction, category_tags, portal_url, application_fee, payment_modes, pio_name, pio_designation, pio_email, pio_phone, pio_address, faa_name, faa_designation, faa_email, faa_phone, faa_address, created_at)
SELECT 'auth-4', 'Delhi Police Headquarters (PHQ)', 'DP-PHQ', 'Ministry of Home Affairs (MHA)', 'Vigilance, Crime Records & Traffic Police', 'state', 'Delhi NCT', '["Public Safety","FIR Inquiries","Traffic Challans","Police Verification","Emergency"]', 'https://delhipolice.gov.in/rti', '10', '["Court Fee Stamp","IPO","Online Gateway"]', 'Shri Harsh Vardhan, IPS', 'DCP (Headquarters) & CPIO', 'cpio.phq@delhipolice.gov.in', '+91-11-2349-0200', 'Jai Singh Road, Connaught Place, New Delhi - 110001', 'Shri Dependra Pathak, IPS', 'Special Commissioner of Police & FAA', 'splcp.adm@delhipolice.gov.in', NULL, 'Police Headquarters, Jai Singh Road, New Delhi - 110001', '2026-01-18T12:00:00Z'
WHERE NOT EXISTS (SELECT 1 FROM authorities WHERE id = 'auth-4');

INSERT INTO authorities (id, name, code, ministry, department, level, jurisdiction, category_tags, portal_url, application_fee, payment_modes, pio_name, pio_designation, pio_email, pio_phone, pio_address, faa_name, faa_designation, faa_email, faa_phone, faa_address, created_at)
SELECT 'auth-5', 'Directorate of Education, GNCTD', 'EDUDEL-GNCTD', 'Department of Education, GNCTD', 'School Education & Private School Fees', 'state', 'Delhi NCT', '["School Education","EWS Admissions","Teacher Recruitment","Fee Regulation","Schools"]', 'https://edudel.nic.in/rti', '10', '["Postal Order","Online Gateway","SBI Challan"]', 'Dr. Rita Sharma', 'Additional Director of Education & CPIO', 'cpio.education@delhi.gov.in', '+91-11-2389-0112', 'Old Secretariat, Civil Lines, Delhi - 110054', 'Shri Himanshu Gupta, IAS', 'Director of Education & FAA', 'diredu@nic.in', NULL, 'Room 12, Old Secretariat, Delhi - 110054', '2026-01-20T09:00:00Z'
WHERE NOT EXISTS (SELECT 1 FROM authorities WHERE id = 'auth-5');

INSERT INTO authorities (id, name, code, ministry, department, level, jurisdiction, category_tags, portal_url, application_fee, payment_modes, pio_name, pio_designation, pio_email, pio_phone, pio_address, faa_name, faa_designation, faa_email, faa_phone, faa_address, created_at)
SELECT 'auth-6', 'Food Safety and Standards Authority of India (FSSAI)', 'FSSAI-REG', 'Ministry of Health and Family Welfare', 'Quality Assurance & Regulatory Compliance', 'central', 'Central', '["Food Quality","Adulteration Testing","Food Business Licenses","Standards"]', 'https://fssai.gov.in/rti.php', '10', '["Online NetBanking","IPO","Demand Draft"]', 'Dr. Alok Agrawal', 'Assistant Director (QA) & CPIO', 'cpio@fssai.gov.in', '+91-11-2323-7435', 'FDA Bhawan, Kotla Road, New Delhi - 110002', 'Ms. Inoshi Sharma', 'Executive Director (FAA)', 'faa@fssai.gov.in', NULL, 'FDA Bhawan, Kotla Road, New Delhi - 110002', '2026-02-01T08:00:00Z'
WHERE NOT EXISTS (SELECT 1 FROM authorities WHERE id = 'auth-6');

INSERT INTO authorities (id, name, code, ministry, department, level, jurisdiction, category_tags, portal_url, application_fee, payment_modes, pio_name, pio_designation, pio_email, pio_phone, pio_address, faa_name, faa_designation, faa_email, faa_phone, faa_address, created_at)
SELECT 'auth-7', 'Delhi Jal Board (DJB)', 'DJB-GNCTD', 'Department of Urban Development, GNCTD', 'Water Supply, Sewers & Water Treatment', 'state', 'Delhi NCT', '["Water Quality","Sewage Works","Pipeline Tenders","Water Billing","Flooding","Drains"]', 'https://delhijalboard.delhi.gov.in', '10', '["Counter Payment","IPO","Online Portal"]', 'Er. Rajesh Bansal', 'Director (Revenue) & CPIO', 'cpio.revenue@djb.gov.in', '+91-11-2353-8495', 'Varunalaya Phase-II, Jhandewalan, Karol Bagh, New Delhi - 110005', 'Shri A. K. Singh', 'Member (Administration) & FAA', 'member.adm@djb.nic.in', NULL, 'Varunalaya Phase-II, Jhandewalan, New Delhi - 110005', '2026-02-05T11:00:00Z'
WHERE NOT EXISTS (SELECT 1 FROM authorities WHERE id = 'auth-7');

INSERT INTO authorities (id, name, code, ministry, department, level, jurisdiction, category_tags, portal_url, application_fee, payment_modes, pio_name, pio_designation, pio_email, pio_phone, pio_address, faa_name, faa_designation, faa_email, faa_phone, faa_address, created_at)
SELECT 'auth-8', 'Railway Board (Ministry of Railways)', 'MOR-RB', 'Ministry of Railways', 'Passenger Services, Safety & Tenders', 'central', 'Central', '["Railways","Train Safety","Station Modernization","Ticket Concessions"]', 'https://rtionline.gov.in', '10', '["Online NetBanking","UPI","Postal Order"]', 'Shri V. K. Tripathi', 'Executive Director (RTI) & CPIO', 'cpio.railwayboard@rb.railnet.gov.in', '+91-11-2338-8931', 'Rail Bhawan, Raisina Road, New Delhi - 110001', 'Shri S. K. Saha', 'Principal Executive Director & FAA', 'faa.railways@rb.railnet.gov.in', NULL, 'Rail Bhawan, New Delhi - 110001', '2026-02-10T10:00:00Z'
WHERE NOT EXISTS (SELECT 1 FROM authorities WHERE id = 'auth-8');

INSERT INTO authorities (id, name, code, ministry, department, level, jurisdiction, category_tags, portal_url, application_fee, payment_modes, pio_name, pio_designation, pio_email, pio_phone, pio_address, faa_name, faa_designation, faa_email, faa_phone, faa_address, created_at)
SELECT 'auth-9', 'Delhi Skill and Entrepreneurship University (DSEU)', 'DSEU-GNCTD', 'Department of Training and Technical Education (TTE), GNCTD', 'State University & Technical Campuses', 'state', 'Delhi NCT', '["DSEU","College Funds","Okhla Campus","Polytechnic","State University","Campus Facilities","Student Fees","Technical Education"]', 'https://dseu.ac.in/rti', '10', '["Online Portal (e-RTI Delhi)","Postal Order","Demand Draft"]', 'Dr. Ashwani Kumar', 'Assistant Registrar & Designated PIO', 'pio@dseu.ac.in', '+91-11-2530-1400', 'DSEU Head Office / Okhla Campus-II, New Delhi - 110020', 'Prof. (Dr.) Ashok Kumar K.', 'Registrar & First Appellate Authority (FAA)', 'registrar@dseu.ac.in', '+91-11-2530-1401', 'DSEU Head Office, Integrated Institute of Technology Complex, Sector-9, Dwarka, New Delhi - 110077', '2026-02-01T09:00:00Z'
WHERE NOT EXISTS (SELECT 1 FROM authorities WHERE id = 'auth-9');

INSERT INTO cases (id, user_id, tracking_number, title, subject_category, summary, description, queries, applicant_name, applicant_email, applicant_phone, applicant_address, authority_id, status, is_life_and_liberty, filing_date, submission_mode, fee_paid, payment_reference, tags, pio_response_summary, pio_response_date, created_at, updated_at)
SELECT
    'case-3641',
    'usr_demo',
    'REG-DSAEU/R/2026/60207',
    'Computer Science Lab Infrastructure & Equipment Allocation',
    'State University & Technical Campuses',
    'Inquiry regarding CS lab systems and GPU workstation procurement at DSEU Okhla-II campus.',
    'Application filed under Section 6(1) of the RTI Act, 2005 for academic infrastructure transparency.',
    '["Certified copy of purchase orders for 60 computer terminals in CS Lab 3.","Details of warranty and vendor maintenance SLA for high-performance servers.","Fund sanction letter and utilization certificate for technical campus upgrades."]',
    'Vikramaditya Roy',
    'demo@rtiassist.local',
    '+91-98765-43210',
    'New Delhi, India',
    'auth-9',
    'submitted',
    false,
    '2026-10-13T00:00:00.000Z',
    'online_portal',
    '10',
    'REG-DSAEU/R/2026/60207',
    '["State University & Technical Campuses"]',
    NULL,
    NULL,
    '2026-10-13T00:00:00.000Z',
    '2026-10-13T18:41:11.249Z'
WHERE NOT EXISTS (SELECT 1 FROM cases WHERE id = 'case-3641');

INSERT INTO deadlines (id, case_id, title, type, due_date, calculated_days, days_remaining, status, is_life_and_liberty, act_section_reference, notes, created_at, completed_at, updated_at)
SELECT
    'dl-1791916663646',
    'case-3641',
    'PIO 30-Day Mandatory Response Window',
    'pio_response',
    '2026-11-12T18:37:43.646Z',
    30,
    30,
    'pending',
    false,
    'RTI Act Sec 7(1)',
    'Mandatory 30-day statutory response period from date of receipt by CPIO under Section 7(1).',
    '2026-10-13T00:00:00.000Z',
    NULL,
    NULL
WHERE NOT EXISTS (SELECT 1 FROM deadlines WHERE id = 'dl-1791916663646');

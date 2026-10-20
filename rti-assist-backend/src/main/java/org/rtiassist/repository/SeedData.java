package org.rtiassist.repository;

import org.rtiassist.model.Authority;
import org.rtiassist.model.FaaInfo;
import org.rtiassist.model.PioInfo;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class SeedData {

    public static List<Authority> getInitialAuthorities() {
        List<Authority> list = new ArrayList<>();

        // auth-1: Department of Higher Education
        Authority a1 = new Authority();
        a1.setId("auth-1");
        a1.setName("Department of Higher Education");
        a1.setCode("DHE-EDU");
        a1.setMinistry("Ministry of Education");
        a1.setDepartment("Higher Education & Central Universities");
        a1.setLevel("central");
        a1.setJurisdiction("Central");
        a1.setCategoryTags(Arrays.asList("Higher Education", "Central Universities", "Faculty Recruitment", "UGC", "College", "Professor"));
        a1.setPortalUrl("https://rtionline.gov.in");
        a1.setApplicationFee(10);
        a1.setPaymentModes(Arrays.asList("Online Banking", "UPI", "Demand Draft", "Postal Order"));
        a1.setPio(new PioInfo("Shri R. K. Sharma", "Director & CPIO", "cpio.dhe@gov.in", "+91-11-2338-4567", "Room 214, C-Wing, Shastri Bhawan, New Delhi - 110001"));
        a1.setFirstAppellateAuthority(new FaaInfo("Dr. Anita Karwal", "Joint Secretary (FAA)", "faa.dhe@gov.in", "+91-11-2338-1122", "Room 112, Shastri Bhawan, New Delhi - 110001"));
        a1.setCreatedAt("2026-01-10T09:00:00Z");
        list.add(a1);

        // auth-2: NHAI
        Authority a2 = new Authority();
        a2.setId("auth-2");
        a2.setName("National Highways Authority of India (NHAI)");
        a2.setCode("NHAI-HQ");
        a2.setMinistry("Ministry of Road Transport and Highways");
        a2.setDepartment("Expressways & Highway Auditing");
        a2.setLevel("central");
        a2.setJurisdiction("Central");
        a2.setCategoryTags(Arrays.asList("Highways", "Expressways", "Toll Audits", "Infrastructure Quality", "Roads", "Potholes"));
        a2.setPortalUrl("https://nhai.gov.in/rti");
        a2.setApplicationFee(10);
        a2.setPaymentModes(Arrays.asList("Online Gateway", "SBI Challan", "Postal Order"));
        a2.setPio(new PioInfo("Smt. Priya Sundaram", "General Manager (Tech) & CPIO", "pio.highway@nhai.gov.in", "+91-11-2507-4100", "G-5 & 6, Sector-10, Dwarka, New Delhi - 110075"));
        a2.setFirstAppellateAuthority(new FaaInfo("Shri Manoj Kumar", "Chief General Manager & FAA", "faa@nhai.gov.in", "+91-11-2507-4200", "Sector-10, Dwarka, New Delhi - 110075"));
        a2.setCreatedAt("2026-01-12T10:30:00Z");
        list.add(a2);

        // auth-3: DDA
        Authority a3 = new Authority();
        a3.setId("auth-3");
        a3.setName("Delhi Development Authority (DDA)");
        a3.setCode("DDA-DELHI");
        a3.setMinistry("Ministry of Housing and Urban Affairs / LG Delhi");
        a3.setDepartment("Housing & Land Allotment");
        a3.setLevel("state");
        a3.setJurisdiction("Delhi NCT");
        a3.setCategoryTags(Arrays.asList("Urban Planning", "Housing Schemes", "Land Demarcation", "Master Plan 2041", "Plot Allotment"));
        a3.setPortalUrl("https://dda.gov.in/rti-online");
        a3.setApplicationFee(10);
        a3.setPaymentModes(Arrays.asList("Net Banking", "Debit Card", "Postal Order"));
        a3.setPio(new PioInfo("Shri Arvind Aggarwal", "Deputy Director (System) & CPIO", "cpio.dda@dda.gov.in", "+91-11-2469-8123", "B-Block, Vikas Sadan, INA, New Delhi - 110023"));
        a3.setFirstAppellateAuthority(new FaaInfo("Ms. Rachna Mohan", "Commissioner (Housing) & FAA", "faa.housing@dda.gov.in", "+91-11-2469-8800", "Vikas Sadan, INA Colony, New Delhi - 110023"));
        a3.setCreatedAt("2026-01-14T10:00:00Z");
        list.add(a3);

        // auth-4: Delhi Police
        Authority a4 = new Authority();
        a4.setId("auth-4");
        a4.setName("Delhi Police Headquarters (PHQ)");
        a4.setCode("DP-PHQ");
        a4.setMinistry("Ministry of Home Affairs (MHA)");
        a4.setDepartment("Vigilance, Crime Records & Traffic Police");
        a4.setLevel("state");
        a4.setJurisdiction("Delhi NCT");
        a4.setCategoryTags(Arrays.asList("Public Safety", "FIR Inquiries", "Traffic Challans", "Police Verification", "Emergency"));
        a4.setPortalUrl("https://delhipolice.gov.in/rti");
        a4.setApplicationFee(10);
        a4.setPaymentModes(Arrays.asList("Court Fee Stamp", "IPO", "Online Gateway"));
        a4.setPio(new PioInfo("Shri Harsh Vardhan, IPS", "DCP (Headquarters) & CPIO", "cpio.phq@delhipolice.gov.in", "+91-11-2349-0200", "Jai Singh Road, Connaught Place, New Delhi - 110001"));
        a4.setFirstAppellateAuthority(new FaaInfo("Shri Dependra Pathak, IPS", "Special Commissioner of Police & FAA", "splcp.adm@delhipolice.gov.in", null, "Police Headquarters, Jai Singh Road, New Delhi - 110001"));
        a4.setCreatedAt("2026-01-18T12:00:00Z");
        list.add(a4);

        // auth-5: Directorate of Education
        Authority a5 = new Authority();
        a5.setId("auth-5");
        a5.setName("Directorate of Education, GNCTD");
        a5.setCode("EDUDEL-GNCTD");
        a5.setDepartment("School Education & Private School Fees");
        a5.setLevel("state");
        a5.setJurisdiction("Delhi NCT");
        a5.setCategoryTags(Arrays.asList("School Education", "EWS Admissions", "Teacher Recruitment", "Fee Regulation", "Schools"));
        a5.setPortalUrl("https://edudel.nic.in/rti");
        a5.setApplicationFee(10);
        a5.setPaymentModes(Arrays.asList("Postal Order", "Online Gateway", "SBI Challan"));
        a5.setPio(new PioInfo("Dr. Rita Sharma", "Additional Director of Education & CPIO", "cpio.education@delhi.gov.in", "+91-11-2389-0112", "Old Secretariat, Civil Lines, Delhi - 110054"));
        a5.setFirstAppellateAuthority(new FaaInfo("Shri Himanshu Gupta, IAS", "Director of Education & FAA", "diredu@nic.in", null, "Room 12, Old Secretariat, Delhi - 110054"));
        a5.setCreatedAt("2026-01-20T09:00:00Z");
        list.add(a5);

        // auth-6: FSSAI
        Authority a6 = new Authority();
        a6.setId("auth-6");
        a6.setName("Food Safety and Standards Authority of India (FSSAI)");
        a6.setCode("FSSAI-REG");
        a6.setMinistry("Ministry of Health and Family Welfare");
        a6.setDepartment("Quality Assurance & Regulatory Compliance");
        a6.setLevel("central");
        a6.setJurisdiction("Central");
        a6.setCategoryTags(Arrays.asList("Food Quality", "Adulteration Testing", "Food Business Licenses", "Standards"));
        a6.setPortalUrl("https://fssai.gov.in/rti.php");
        a6.setApplicationFee(10);
        a6.setPaymentModes(Arrays.asList("Online NetBanking", "IPO", "Demand Draft"));
        a6.setPio(new PioInfo("Dr. Alok Agrawal", "Assistant Director (QA) & CPIO", "cpio@fssai.gov.in", "+91-11-2323-7435", "FDA Bhawan, Kotla Road, New Delhi - 110002"));
        a6.setFirstAppellateAuthority(new FaaInfo("Ms. Inoshi Sharma", "Executive Director (FAA)", "faa@fssai.gov.in", null, "FDA Bhawan, Kotla Road, New Delhi - 110002"));
        a6.setCreatedAt("2026-02-01T08:00:00Z");
        list.add(a6);

        // auth-7: DJB
        Authority a7 = new Authority();
        a7.setId("auth-7");
        a7.setName("Delhi Jal Board (DJB)");
        a7.setCode("DJB-GNCTD");
        a7.setDepartment("Water Supply, Sewers & Water Treatment");
        a7.setLevel("state");
        a7.setJurisdiction("Delhi NCT");
        a7.setCategoryTags(Arrays.asList("Water Quality", "Sewage Works", "Pipeline Tenders", "Water Billing", "Flooding", "Drains"));
        a7.setPortalUrl("https://delhijalboard.delhi.gov.in");
        a7.setApplicationFee(10);
        a7.setPaymentModes(Arrays.asList("Counter Payment", "IPO", "Online Portal"));
        a7.setPio(new PioInfo("Er. Rajesh Bansal", "Director (Revenue) & CPIO", "cpio.revenue@djb.gov.in", "+91-11-2353-8495", "Varunalaya Phase-II, Jhandewalan, Karol Bagh, New Delhi - 110005"));
        a7.setFirstAppellateAuthority(new FaaInfo("Shri A. K. Singh", "Member (Administration) & FAA", "member.adm@djb.nic.in", null, "Varunalaya Phase-II, Jhandewalan, New Delhi - 110005"));
        a7.setCreatedAt("2026-02-05T11:00:00Z");
        list.add(a7);

        // auth-8: Railway Board
        Authority a8 = new Authority();
        a8.setId("auth-8");
        a8.setName("Railway Board (Ministry of Railways)");
        a8.setCode("MOR-RB");
        a8.setMinistry("Ministry of Railways");
        a8.setDepartment("Passenger Services, Safety & Tenders");
        a8.setLevel("central");
        a8.setJurisdiction("Central");
        a8.setCategoryTags(Arrays.asList("Railways", "Train Safety", "Station Modernization", "Ticket Concessions"));
        a8.setPortalUrl("https://rtionline.gov.in");
        a8.setApplicationFee(10);
        a8.setPaymentModes(Arrays.asList("Online NetBanking", "UPI", "Postal Order"));
        a8.setPio(new PioInfo("Shri V. K. Tripathi", "Executive Director (RTI) & CPIO", "cpio.railwayboard@rb.railnet.gov.in", "+91-11-2338-8931", "Rail Bhawan, Raisina Road, New Delhi - 110001"));
        a8.setFirstAppellateAuthority(new FaaInfo("Shri S. K. Saha", "Principal Executive Director & FAA", "faa.railways@rb.railnet.gov.in", null, "Rail Bhawan, New Delhi - 110001"));
        a8.setCreatedAt("2026-02-10T10:00:00Z");
        list.add(a8);

        // auth-9: DSEU
        Authority a9 = new Authority();
        a9.setId("auth-9");
        a9.setName("Delhi Skill and Entrepreneurship University (DSEU)");
        a9.setCode("DSEU-GNCTD");
        a9.setMinistry("Department of Training and Technical Education (TTE), GNCTD");
        a9.setDepartment("State University & Technical Campuses");
        a9.setLevel("state");
        a9.setJurisdiction("Delhi NCT");
        a9.setCategoryTags(Arrays.asList("DSEU", "College Funds", "Okhla Campus", "Polytechnic", "State University", "Campus Facilities", "Student Fees", "Technical Education"));
        a9.setPortalUrl("https://dseu.ac.in/rti");
        a9.setApplicationFee(10);
        a9.setPaymentModes(Arrays.asList("Online Portal (e-RTI Delhi)", "Postal Order", "Demand Draft"));
        a9.setPio(new PioInfo("Dr. Ashwani Kumar", "Assistant Registrar & Designated PIO", "pio@dseu.ac.in", "+91-11-2530-1400", "DSEU Head Office / Okhla Campus-II, New Delhi - 110020"));
        a9.setFirstAppellateAuthority(new FaaInfo("Prof. (Dr.) Ashok Kumar K.", "Registrar & First Appellate Authority (FAA)", "registrar@dseu.ac.in", "+91-11-2530-1401", "DSEU Head Office, Integrated Institute of Technology Complex, Sector-9, Dwarka, New Delhi - 110077"));
        a9.setCreatedAt("2026-02-01T09:00:00Z");
        list.add(a9);

        return list;
    }
}

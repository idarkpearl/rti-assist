-- Update DSEU (auth-9) CPIO and First Appellate Authority details from official DSEU RTI disclosure
UPDATE authorities
SET
    portal_url = 'https://dseu.ac.in/grievance-form',
    pio_name = 'Ms. Bindu Nair',
    pio_designation = 'CPIO',
    pio_email = 'rti@dseu.ac.in',
    faa_name = 'Sh. Shailendra Singh Parihar, IAS',
    faa_designation = 'First Appellate Authority (FAA)',
    faa_email = 'rti@dseu.ac.in'
WHERE id = 'auth-9';

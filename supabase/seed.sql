-- Seed file for Niko Healthcare Platform
-- Sample hospitals across Nepal with departments and doctors

-- Hospitals
INSERT INTO hospitals (name, latitude, longitude, contact_number, email, province, district, city) VALUES
-- Province 1
('Koshi Hospital', 26.8065, 87.2846, '+977-21-520111', 'info@koshihospital.gov.np', 'Province 1', 'Morang', 'Biratnagar'),
('B.P. Koirala Institute of Health Sciences', 26.8147, 87.2857, '+977-21-525555', 'info@bpkihs.edu', 'Province 1', 'Sunsari', 'Dharan'),
('Mechi Zonal Hospital', 26.6664, 87.9833, '+977-23-520111', 'info@mechihospital.gov.np', 'Province 1', 'Jhapa', 'Bhadrapur'),
('Nobel Medical College', 26.8088, 87.2809, '+977-21-460114', 'info@nobelmedical.edu.np', 'Province 1', 'Morang', 'Biratnagar'),

-- Madhesh Province
('Narayani Hospital', 27.0657, 84.8819, '+977-56-520111', 'info@narayanihospital.gov.np', 'Madhesh Province', 'Parsa', 'Birgunj'),
('Janaki Medical College', 26.7318, 85.9332, '+977-41-520333', 'info@janakimedical.edu.np', 'Madhesh Province', 'Dhanusha', 'Janakpur'),
('Provincial Hospital Janakpur', 26.7288, 85.9261, '+977-41-520222', 'info@provincialhospital.gov.np', 'Madhesh Province', 'Dhanusha', 'Janakpur'),

-- Bagmati Province
('Tribhuvan University Teaching Hospital', 27.7350, 85.3281, '+977-1-4412404', 'info@tuth.edu.np', 'Bagmati Province', 'Kathmandu', 'Kathmandu'),
('Bir Hospital', 27.7054, 85.3127, '+977-1-4221988', 'info@birhospital.gov.np', 'Bagmati Province', 'Kathmandu', 'Kathmandu'),
('Patan Hospital', 27.6681, 85.3206, '+977-1-5522266', 'info@patanhospital.gov.np', 'Bagmati Province', 'Lalitpur', 'Lalitpur'),
('Kathmandu Medical College', 27.6802, 85.3423, '+977-1-4476105', 'info@kmc.edu.np', 'Bagmati Province', 'Kathmandu', 'Kathmandu'),
('Nepal Medical College', 27.7382, 85.3372, '+977-1-4911008', 'info@nmc.edu.np', 'Bagmati Province', 'Kathmandu', 'Kathmandu'),
('KIST Medical College', 27.6677, 85.4416, '+977-1-6636199', 'info@kist.edu.np', 'Bagmati Province', 'Lalitpur', 'Imadol'),
('Civil Service Hospital', 27.6935, 85.3206, '+977-1-4107000', 'info@civilhospital.gov.np', 'Bagmati Province', 'Kathmandu', 'Kathmandu'),
('Grande International Hospital', 27.6868, 85.3328, '+977-1-5159266', 'info@grandehospital.com', 'Bagmati Province', 'Kathmandu', 'Kathmandu'),
('Norvic International Hospital', 27.6902, 85.3194, '+977-1-4258554', 'info@norvichospital.com', 'Bagmati Province', 'Kathmandu', 'Kathmandu'),
('Om Hospital', 27.6781, 85.3186, '+977-1-5260404', 'info@omhospital.com.np', 'Bagmati Province', 'Lalitpur', 'Chabahil'),
('Bharatpur Hospital', 27.6766, 84.4322, '+977-56-520111', 'info@bharatpurhospital.gov.np', 'Bagmati Province', 'Chitwan', 'Bharatpur'),
('College of Medical Sciences', 27.6678, 84.4301, '+977-56-524326', 'info@coms.edu.np', 'Bagmati Province', 'Chitwan', 'Bharatpur'),
('Chitwan Medical College', 27.6588, 84.4677, '+977-56-532933', 'info@cmcnepal.edu.np', 'Bagmati Province', 'Chitwan', 'Bharatpur'),

-- Gandaki Province
('Gandaki Medical College', 28.2140, 83.9856, '+977-61-561497', 'info@gmc.edu.np', 'Gandaki Province', 'Kaski', 'Pokhara'),
('Western Regional Hospital', 28.2096, 83.9856, '+977-61-520066', 'info@westernhospital.gov.np', 'Gandaki Province', 'Kaski', 'Pokhara'),
('Manipal Teaching Hospital', 28.2180, 83.9750, '+977-61-526416', 'info@manipal.edu.np', 'Gandaki Province', 'Kaski', 'Pokhara'),
('Fishtail Hospital', 28.2200, 83.9880, '+977-61-465068', 'info@fishtailhospital.com', 'Gandaki Province', 'Kaski', 'Pokhara'),

-- Lumbini Province
('Bheri Zonal Hospital', 28.4907, 81.6438, '+977-81-520111', 'info@bherihospital.gov.np', 'Lumbini Province', 'Banke', 'Nepalgunj'),
('Lumbini Medical College', 27.4934, 83.4628, '+977-71-440100', 'info@lmc.edu.np', 'Lumbini Province', 'Rupandehi', 'Palpa'),
('Universal College of Medical Sciences', 27.6888, 83.4628, '+977-71-583111', 'info@ucms.edu.np', 'Lumbini Province', 'Rupandehi', 'Bhairahawa'),
('Lumbini Provincial Hospital', 27.5142, 83.4633, '+977-71-520111', 'info@lumbinihospital.gov.np', 'Lumbini Province', 'Rupandehi', 'Butwal'),

-- Karnali Province
('Karnali Academy of Health Sciences', 29.2990, 81.6110, '+977-89-520166', 'info@kahs.edu.np', 'Karnali Province', 'Surkhet', 'Jumla'),
('Mid-Western Regional Hospital', 28.6002, 81.6303, '+977-83-520111', 'info@midwesternhospital.gov.np', 'Karnali Province', 'Surkhet', 'Birendranagar'),

-- Sudurpashchim Province
('Seti Zonal Hospital', 28.6974, 80.5892, '+977-91-521100', 'info@setihospital.gov.np', 'Sudurpashchim Province', 'Kailali', 'Dhangadhi'),
('Far Western Regional Hospital', 28.9631, 80.1659, '+977-99-520111', 'info@farwesternhospital.gov.np', 'Sudurpashchim Province', 'Kanchanpur', 'Mahendranagar');

-- Hospital Departments (for selected major hospitals)
DO $$
DECLARE
    hospital_record RECORD;
    dept_id UUID;
BEGIN
    FOR hospital_record IN SELECT id, name FROM hospitals WHERE name IN (
        'Tribhuvan University Teaching Hospital',
        'Bir Hospital',
        'Patan Hospital',
        'B.P. Koirala Institute of Health Sciences',
        'Gandaki Medical College',
        'Western Regional Hospital'
    ) LOOP
        -- Emergency
        INSERT INTO hospital_departments (hospital_id, name) VALUES (hospital_record.id, 'Emergency') RETURNING id INTO dept_id;
        INSERT INTO doctors (hospital_department_id, name, daily_capacity) VALUES
            (dept_id, 'Dr. Ram Sharma', 20),
            (dept_id, 'Dr. Sita Adhikari', 20);

        -- General Medicine
        INSERT INTO hospital_departments (hospital_id, name) VALUES (hospital_record.id, 'General Medicine') RETURNING id INTO dept_id;
        INSERT INTO doctors (hospital_department_id, name, daily_capacity) VALUES
            (dept_id, 'Dr. Krishna Poudel', 15),
            (dept_id, 'Dr. Maya Gurung', 15);

        -- Cardiology
        INSERT INTO hospital_departments (hospital_id, name) VALUES (hospital_record.id, 'Cardiology') RETURNING id INTO dept_id;
        INSERT INTO doctors (hospital_department_id, name, daily_capacity) VALUES
            (dept_id, 'Dr. Binod Thapa', 10),
            (dept_id, 'Dr. Sunita Rai', 10);

        -- Orthopedics
        INSERT INTO hospital_departments (hospital_id, name) VALUES (hospital_record.id, 'Orthopedics') RETURNING id INTO dept_id;
        INSERT INTO doctors (hospital_department_id, name, daily_capacity) VALUES
            (dept_id, 'Dr. Prakash Shrestha', 12),
            (dept_id, 'Dr. Anita Tamang', 12);

        -- Pediatrics
        INSERT INTO hospital_departments (hospital_id, name) VALUES (hospital_record.id, 'Pediatrics') RETURNING id INTO dept_id;
        INSERT INTO doctors (hospital_department_id, name, daily_capacity) VALUES
            (dept_id, 'Dr. Bikash Lama', 18),
            (dept_id, 'Dr. Kamala Khadka', 18);

        -- Gynecology
        INSERT INTO hospital_departments (hospital_id, name) VALUES (hospital_record.id, 'Gynecology & Obstetrics') RETURNING id INTO dept_id;
        INSERT INTO doctors (hospital_department_id, name, daily_capacity) VALUES
            (dept_id, 'Dr. Gita Basnet', 15),
            (dept_id, 'Dr. Sarita Magar', 15);

        -- Surgery
        INSERT INTO hospital_departments (hospital_id, name) VALUES (hospital_record.id, 'General Surgery') RETURNING id INTO dept_id;
        INSERT INTO doctors (hospital_department_id, name, daily_capacity) VALUES
            (dept_id, 'Dr. Nabin Karki', 8),
            (dept_id, 'Dr. Pramila Bhandari', 8);

        -- Neurology
        INSERT INTO hospital_departments (hospital_id, name) VALUES (hospital_record.id, 'Neurology') RETURNING id INTO dept_id;
        INSERT INTO doctors (hospital_department_id, name, daily_capacity) VALUES
            (dept_id, 'Dr. Deepak Pandey', 8);

        -- Dermatology
        INSERT INTO hospital_departments (hospital_id, name) VALUES (hospital_record.id, 'Dermatology') RETURNING id INTO dept_id;
        INSERT INTO doctors (hospital_department_id, name, daily_capacity) VALUES
            (dept_id, 'Dr. Rejina KC', 12);

        -- ENT
        INSERT INTO hospital_departments (hospital_id, name) VALUES (hospital_record.id, 'ENT') RETURNING id INTO dept_id;
        INSERT INTO doctors (hospital_department_id, name, daily_capacity) VALUES
            (dept_id, 'Dr. Suresh Bhattarai', 10);

        -- Ophthalmology
        INSERT INTO hospital_departments (hospital_id, name) VALUES (hospital_record.id, 'Ophthalmology') RETURNING id INTO dept_id;
        INSERT INTO doctors (hospital_department_id, name, daily_capacity) VALUES
            (dept_id, 'Dr. Asmita Neupane', 12);

        -- Psychiatry
        INSERT INTO hospital_departments (hospital_id, name) VALUES (hospital_record.id, 'Psychiatry') RETURNING id INTO dept_id;
        INSERT INTO doctors (hospital_department_id, name, daily_capacity) VALUES
            (dept_id, 'Dr. Rajesh Joshi', 10);
    END LOOP;
END $$;

-- Add basic departments to remaining hospitals
DO $$
DECLARE
    hospital_record RECORD;
    dept_id UUID;
BEGIN
    FOR hospital_record IN SELECT id FROM hospitals WHERE name NOT IN (
        'Tribhuvan University Teaching Hospital',
        'Bir Hospital',
        'Patan Hospital',
        'B.P. Koirala Institute of Health Sciences',
        'Gandaki Medical College',
        'Western Regional Hospital'
    ) LOOP
        -- Emergency
        INSERT INTO hospital_departments (hospital_id, name) VALUES (hospital_record.id, 'Emergency') RETURNING id INTO dept_id;
        INSERT INTO doctors (hospital_department_id, name, daily_capacity) VALUES
            (dept_id, 'Dr. General Physician', 15);

        -- General Medicine
        INSERT INTO hospital_departments (hospital_id, name) VALUES (hospital_record.id, 'General Medicine') RETURNING id INTO dept_id;
        INSERT INTO doctors (hospital_department_id, name, daily_capacity) VALUES
            (dept_id, 'Dr. Medicine Specialist', 10);

        -- Pediatrics
        INSERT INTO hospital_departments (hospital_id, name) VALUES (hospital_record.id, 'Pediatrics') RETURNING id INTO dept_id;
        INSERT INTO doctors (hospital_department_id, name, daily_capacity) VALUES
            (dept_id, 'Dr. Child Specialist', 12);

        -- Gynecology
        INSERT INTO hospital_departments (hospital_id, name) VALUES (hospital_record.id, 'Gynecology & Obstetrics') RETURNING id INTO dept_id;
        INSERT INTO doctors (hospital_department_id, name, daily_capacity) VALUES
            (dept_id, 'Dr. OB-GYN Specialist', 12);
    END LOOP;
END $$;

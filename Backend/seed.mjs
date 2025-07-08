// seed.mjs

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs'; // If you hash passwords
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
// Ensure your .env file is in the root of your project
dotenv.config({ path: join(__dirname, '../.env') }); // Adjust path if .env is not in the same directory as seed.mjs

// --- Import your Mongoose Models (ensure they are .mjs files too!) ---
import User from './models/User.mjs';
import Dr from './models/Dr.mjs';
import Appointment from './models/Appointment.mjs';

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MongoDB, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected for seeding...');

        // --- OPTIONAL: Clear existing data ---
        // CAUTION: Uncomment these lines only if you want to completely
        // reset your database each time you run the seeder.
        // DO NOT use this on a production database!
        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Dr.deleteMany({});
        await Appointment.deleteMany({});
        console.log('Existing data cleared.');

        // --- Define your seed data ---

        // 1. Create Users
        console.log('Creating users...');
        const hashedPassword1 = await bcrypt.hash('patientpass', 10);
        const userPatient1 = await User.create({
            username: 'patient_alice',
            email: 'alice@example.com',
            password: hashedPassword1,
            role: 'patient',
            image: 'https://randomuser.me/api/portraits/women/1.jpg'
        });

        const hashedPassword2 = await bcrypt.hash('doctorpass', 10);
        const userDoctor1 = await User.create({
            username: 'dr_john',
            email: 'john.doe@example.com',
            password: hashedPassword2,
            role: 'doctor',
            image: 'https://randomuser.me/api/portraits/men/10.jpg'
        });

        const hashedPassword3 = await bcrypt.hash('patientpass2', 10);
        const userPatient2 = await User.create({
            username: 'patient_bob',
            email: 'bob@example.com',
            password: hashedPassword3,
            role: 'patient',
            image: 'https://randomuser.me/api/portraits/men/2.jpg'
        });

        const hashedPassword4 = await bcrypt.hash('doctorpass2', 10);
        const userDoctor2 = await User.create({
            username: 'dr_mary',
            email: 'mary.smith@example.com',
            password: hashedPassword4,
            role: 'doctor',
            image: 'https://randomuser.me/api/portraits/women/15.jpg'
        });
        console.log('Users created.');

        // 2. Create Doctor Profiles (linked to User IDs)
        console.log('Creating doctor profiles...');
        const doctorProfile1 = await Dr.create({
            user_id: userDoctor1._id,
            specialization: 'Pediatrics',
            // Example availability for a few days
            availability: [
                { date: new Date('2025-07-01T00:00:00.000Z'), slots: ['09:00', '10:00', '11:00'] },
                { date: new Date('2025-07-02T00:00:00.000Z'), slots: ['01:00', '02:00'] }
            ]
        });

        const doctorProfile2 = await Dr.create({
            user_id: userDoctor2._id,
            specialization: 'Dermatology',
            availability: [
                { date: new Date('2025-07-03T00:00:00.000Z'), slots: ['09:30', '10:30'] },
                { date: new Date('2025-07-04T00:00:00.000Z'), slots: ['02:00'] }
            ]
        });
        console.log('Doctor profiles created.');

        // 3. Create Appointments (linked to Doctor Profile IDs and Patient User IDs)
        console.log('Creating appointments...');
        await Appointment.create({
            dr_id: doctorProfile1._id,
            patient_Id: userPatient1._id,
            date: new Date('2025-07-01T10:00:00Z'), // Example specific datetime
            time: '10:00',
            notes: 'First check-up for child.',
            status: 'booked',
            duration: 30
        });

        await Appointment.create({
            dr_id: doctorProfile2._id,
            patient_Id: userPatient1._id,
            date: new Date('2025-07-03T09:30:00Z'),
            time: '09:30',
            notes: 'Skin rash consultation.',
            status: 'pending',
            duration: 20
        });

        await Appointment.create({
            dr_id: doctorProfile1._id,
            patient_Id: userPatient2._id,
            date: new Date('2025-07-02T13:00:00Z'),
            time: '01:00',
            notes: 'Vaccination follow-up.',
            status: 'completed',
            duration: 15
        });
        console.log('Appointments created.');

        console.log('Database seeded successfully!');
        mongoose.disconnect(); // Disconnect after seeding

    } catch (error) {
        console.error('Error seeding database:', error);
        mongoose.disconnect();
        process.exit(1); // Exit with an error code
    }
};

// Run the seeding function
seedDatabase();
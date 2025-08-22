const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
// require("dotenv").config();
require("dotenv").config({ path: __dirname + "/../.env" });

// Import models
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const Secretary = require("../models/Secretary");

const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!uri) {
  throw new Error("❌ No MongoDB URI found in environment variables");
}

// Connect to database
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Clear existing data
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    await Secretary.deleteMany({});

    console.log("🗑️  Cleared existing data");

    // Create admin user
    const adminUser = await User.create({
      firstName: "Admin",
      lastName: "User",
      email: "admin@doktor.com",
      password: "Admin123!@#",
      phoneNumber: "+216123456789",
      role: "admin",
      isEmailVerified: true,
      isPhoneVerified: true,
    });

    console.log("👑 Created admin user");

    // Create sample doctor
    const doctorUser = await User.create({
      firstName: "Dr. Ahmed",
      lastName: "Ben Ahmed",
      email: "doctor@doktor.com",
      password: "Doctor123!@#",
      phoneNumber: "+216987654321",
      role: "doctor",
      isEmailVerified: true,
      isPhoneVerified: true,
    });

    const doctorProfile = await Doctor.create({
      user: doctorUser._id,
      licenseNumber: "LIC-001",
      specialization: "General Practice",
      experience: 10,
      consultationFee: 75,
      clinicInfo: {
        name: "Ahmed Medical Center",
        address: {
          street: "123 Medical Street",
          city: "Tunis",
          state: "Tunis",
          zipCode: "1000",
          country: "Tunisia",
        },
        phoneNumber: "+216123456789",
        email: "clinic@doktor.com",
      },
      workingHours: {
        monday: { start: "09:00", end: "17:00", isWorking: true },
        tuesday: { start: "09:00", end: "17:00", isWorking: true },
        wednesday: { start: "09:00", end: "17:00", isWorking: true },
        thursday: { start: "09:00", end: "17:00", isWorking: true },
        friday: { start: "09:00", end: "17:00", isWorking: true },
        saturday: { start: "09:00", end: "13:00", isWorking: true },
        sunday: { start: "00:00", end: "00:00", isWorking: false },
      },
      services: [
        {
          name: "General Consultation",
          description: "General medical consultation",
          price: 75,
          duration: 30,
          isActive: true,
        },
        {
          name: "Follow-up Visit",
          description: "Follow-up consultation",
          price: 50,
          duration: 20,
          isActive: true,
        },
      ],
      isVerified: true,
    });

    doctorUser.doctorProfile = doctorProfile._id;
    await doctorUser.save();

    console.log("👨‍⚕️ Created doctor user and profile");

    // Create sample patient
    const patientUser = await User.create({
      patientId: `PAT-001`,
      firstName: "Mohamed",
      lastName: "Ben Mohamed",
      email: "patient@doktor.com",
      password: "Patient123!@#",
      phoneNumber: "+216555666777",
      role: "patient",
      isEmailVerified: true,
      isPhoneVerified: true,
    });

    const patientProfile = await Patient.create({
      patientId: `PAT-001`,
      user: patientUser._id,
      dateOfBirth: new Date("1990-05-15"),
      gender: "male",
      bloodType: "O+",
      height: { value: 175, unit: "cm" },
      weight: { value: 70, unit: "kg" },
      fitzpatrickType: "3",
      emergencyContact: {
        name: "Fatima Ben Mohamed",
        relationship: "Wife",
        phoneNumber: "+216555666778",
        email: "fatima@example.com",
      },
      address: {
        street: "456 Patient Street",
        city: "Tunis",
        state: "Tunis",
        zipCode: "1001",
        country: "Tunisia",
      },
      insuranceInfo: {
        provider: "CNAM",
        policyNumber: "POL123456",
        coverageType: "Full Coverage",
      },
      doctors: [
        {
          doctor: doctorProfile._id,
          status: "active",
          connectedAt: new Date(),
          isPrimary: true,
        },
      ],
    });

    patientUser.patientProfile = patientProfile._id;
    await patientUser.save();

    // Add patient to doctor's list
    doctorProfile.patients.push({
      patient: patientProfile._id,
      status: "active",
      connectedAt: new Date(),
    });
    await doctorProfile.save();

    console.log("👤 Created patient user and profile");

    // Create sample secretary
    const secretaryUser = await User.create({
      employeeId: "EMP-001",
      firstName: "Marwa",
      lastName: "Saidi",
      email: "secretary@doktor.com",
      password: "Secretary123!@#",
      phoneNumber: "+216444555666",
      role: "secretary",
      isEmailVerified: true,
      isPhoneVerified: true,
    });

    const secretaryProfile = await Secretary.create({
      employeeId: "EMP-001",
      user: secretaryUser._id,
      doctor: doctorProfile._id,
      jobTitle: "Medical Secretary",
      department: "Administration",
      hireDate: new Date(),
      salary: {
        amount: 1200,
        currency: "TND",
        paymentFrequency: "monthly",
      },
      permissions: {
        appointments: { view: true, edit: true, manage: true },
        patients: { view: true, edit: false, manage: false },
        billing: { view: true, edit: true, manage: false },
        consultations: { view: true, edit: false, manage: false },
        medicalRecords: { view: true, edit: false, manage: false },
      },
      workSchedule: {
        monday: { start: "08:00", end: "16:00", isWorking: true },
        tuesday: { start: "08:00", end: "16:00", isWorking: true },
        wednesday: { start: "08:00", end: "16:00", isWorking: true },
        thursday: { start: "08:00", end: "16:00", isWorking: true },
        friday: { start: "08:00", end: "16:00", isWorking: true },
        saturday: { start: "00:00", end: "00:00", isWorking: false },
        sunday: { start: "00:00", end: "00:00", isWorking: false },
      },
    });

    secretaryUser.secretaryProfile = secretaryProfile._id;
    await secretaryUser.save();

    // Add secretary to doctor's list
    doctorProfile.secretaries.push({
      secretary: secretaryProfile._id,
      permissions: secretaryProfile.permissions,
      addedAt: new Date(),
    });
    await doctorProfile.save();

    console.log("👩‍💼 Created secretary user and profile");

    console.log("✅ Database seeding completed successfully!");
    console.log("\n📋 Sample Accounts Created:");
    console.log("Admin: admin@doktor.com / Admin123!@#");
    console.log("Doctor: doctor@doktor.com / Doctor123!@#");
    console.log("Patient: patient@doktor.com / Patient123!@#");
    console.log("Secretary: secretary@doktor.com / Secretary123!@#");

    process.exit(0);
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
    process.exit(1);
  }
};

seedDatabase();

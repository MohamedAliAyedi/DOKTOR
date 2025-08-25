const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: __dirname + "/../.env" });

// Import models
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const Secretary = require("../models/Secretary");
const Appointment = require("../models/Appointment");
const Consultation = require("../models/Consultation");
const Prescription = require("../models/Prescription");
const Bill = require("../models/Bill");
const MedicalRecord = require("../models/MedicalRecord");
const { Chat, Message } = require("../models/Chat");

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
    await Appointment.deleteMany({});
    await Consultation.deleteMany({});
    await Prescription.deleteMany({});
    await Bill.deleteMany({});
    await MedicalRecord.deleteMany({});
    await Chat.deleteMany({});
    await Message.deleteMany({});

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

    // Create multiple doctors
    const doctorsData = [
      {
        firstName: "Dr. Ahmed",
        lastName: "Ben Ahmed",
        email: "doctor@doktor.com",
        password: "Doctor123!@#",
        phoneNumber: "+216987654321",
        specialization: "General Practice",
        experience: 10,
        consultationFee: 75,
        licenseNumber: "LIC-001",
      },
      {
        firstName: "Dr. Marwen",
        lastName: "Said",
        email: "marwen.said@doktor.com",
        password: "Doctor123!@#",
        phoneNumber: "+216987654322",
        specialization: "Cardiology",
        experience: 15,
        consultationFee: 120,
        licenseNumber: "LIC-002",
      },
      {
        firstName: "Dr. Mariem",
        lastName: "Routi",
        email: "mariem.routi@doktor.com",
        password: "Doctor123!@#",
        phoneNumber: "+216987654323",
        specialization: "Dermatology",
        experience: 8,
        consultationFee: 90,
        licenseNumber: "LIC-003",
      },
      {
        firstName: "Dr. Ahmed",
        lastName: "Bourat",
        email: "ahmed.bourat@doktor.com",
        password: "Doctor123!@#",
        phoneNumber: "+216987654324",
        specialization: "Neurology",
        experience: 12,
        consultationFee: 150,
        licenseNumber: "LIC-004",
      },
      {
        firstName: "Dr. Hassen",
        lastName: "Louati",
        email: "hassen.louati@doktor.com",
        password: "Doctor123!@#",
        phoneNumber: "+216987654325",
        specialization: "Orthopedics",
        experience: 20,
        consultationFee: 130,
        licenseNumber: "LIC-005",
      },
      {
        firstName: "Dr. Laila",
        lastName: "Hamza",
        email: "laila.hamza@doktor.com",
        password: "Doctor123!@#",
        phoneNumber: "+216987654326",
        specialization: "Pediatrics",
        experience: 7,
        consultationFee: 85,
        licenseNumber: "LIC-006",
      },
      {
        firstName: "Dr. Sami",
        lastName: "Ouni",
        email: "sami.ouni@doktor.com",
        password: "Doctor123!@#",
        phoneNumber: "+216987654327",
        specialization: "Psychiatry",
        experience: 14,
        consultationFee: 110,
        licenseNumber: "LIC-007",
      },
      {
        firstName: "Dr. Sofien",
        lastName: "Jlassi",
        email: "sofien.jlassi@doktor.com",
        password: "Doctor123!@#",
        phoneNumber: "+216987654328",
        specialization: "Ophthalmology",
        experience: 9,
        consultationFee: 95,
        licenseNumber: "LIC-008",
      },
      {
        firstName: "Dr. Nada",
        lastName: "Haji",
        email: "nada.haji@doktor.com",
        password: "Doctor123!@#",
        phoneNumber: "+216987654329",
        specialization: "Gynecology",
        experience: 11,
        consultationFee: 105,
        licenseNumber: "LIC-009",
      },
      {
        firstName: "Dr. Youssef",
        lastName: "Mansouri",
        email: "youssef.mansouri@doktor.com",
        password: "Doctor123!@#",
        phoneNumber: "+216987654330",
        specialization: "Radiology",
        experience: 16,
        consultationFee: 140,
        licenseNumber: "LIC-010",
      },
    ];

    const doctors = [];
    for (const doctorData of doctorsData) {
      const doctorUser = await User.create({
        firstName: doctorData.firstName,
        lastName: doctorData.lastName,
        email: doctorData.email,
        password: doctorData.password,
        phoneNumber: doctorData.phoneNumber,
        role: "doctor",
        isEmailVerified: true,
        isPhoneVerified: true,
      });

      const doctorProfile = await Doctor.create({
        user: doctorUser._id,
        licenseNumber: doctorData.licenseNumber,
        specialization: doctorData.specialization,
        experience: doctorData.experience,
        consultationFee: doctorData.consultationFee,
        clinicInfo: {
          name: `${doctorData.firstName} ${doctorData.lastName} Medical Center`,
          address: {
            street: "123 Medical Street",
            city: "Tunis",
            state: "Tunis",
            zipCode: "1000",
            country: "Tunisia",
          },
          phoneNumber: doctorData.phoneNumber,
          email: doctorData.email,
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
            price: doctorData.consultationFee,
            duration: 30,
            isActive: true,
          },
          {
            name: "Follow-up Visit",
            description: "Follow-up consultation",
            price: doctorData.consultationFee * 0.7,
            duration: 20,
            isActive: true,
          },
          {
            name: "Urgent Care",
            description: "Emergency consultation",
            price: doctorData.consultationFee * 1.5,
            duration: 45,
            isActive: true,
          },
        ],
        unavailability: [
          {
            startDate: new Date("2025-01-15"),
            endDate: new Date("2025-01-15"),
            startTime: "12:00",
            endTime: "13:00",
            reason: "Lunch break",
            isRecurring: true,
            recurringPattern: "daily",
          },
          {
            startDate: new Date("2025-01-20"),
            endDate: new Date("2025-01-22"),
            startTime: "00:00",
            endTime: "23:59",
            reason: "Medical conference",
            isRecurring: false,
          },
        ],
        isVerified: true,
        rating: {
          average: 4.0 + Math.random() * 1.0, // Random rating between 4.0-5.0
          count: Math.floor(Math.random() * 100) + 10, // Random count between 10-110
        },
      });

      doctorUser.doctorProfile = doctorProfile._id;
      await doctorUser.save();
      doctors.push({ user: doctorUser, profile: doctorProfile });
    }

    console.log("👨‍⚕️ Created multiple doctors");

    // Create multiple patients
    const patientsData = [
      {
        patientId: `PAT-001`,
        firstName: "Mohamed",
        lastName: "Ben Mohamed",
        email: "patient@doktor.com",
        password: "Patient123!@#",
        phoneNumber: "+216555666777",
        dateOfBirth: new Date("1990-05-15"),
        gender: "male",
        bloodType: "O+",
      },
      {
        patientId: `PAT-002`,
        firstName: "Mokhtar Amine",
        lastName: "Ghannouchi",
        email: "mokhtar.ghannouchi@doktor.com",
        password: "Patient123!@#",
        phoneNumber: "+216555666778",
        dateOfBirth: new Date("1985-03-20"),
        gender: "male",
        bloodType: "A+",
      },
      {
        patientId: `PAT-003`,
        firstName: "Fatima",
        lastName: "Zahra",
        email: "fatima.zahra@doktor.com",
        password: "Patient123!@#",
        phoneNumber: "+216555666779",
        dateOfBirth: new Date("1992-08-10"),
        gender: "female",
        bloodType: "B+",
      },
      {
        patientId: `PAT-004`,
        firstName: "Ali",
        lastName: "Mouradi",
        email: "ali.mouradi@doktor.com",
        password: "Patient123!@#",
        phoneNumber: "+216555666780",
        dateOfBirth: new Date("1988-12-05"),
        gender: "male",
        bloodType: "AB+",
      },
      {
        patientId: `PAT-010`,
        firstName: "Sirine",
        lastName: "Jablon",
        email: "sirine.jablon@doktor.com",
        password: "Patient123!@#",
        phoneNumber: "+216555666781",
        dateOfBirth: new Date("1995-07-25"),
        gender: "female",
        bloodType: "O-",
      },
      {
        patientId: `PAT-009`,
        firstName: "Amira",
        lastName: "Ben Salem",
        email: "amira.bensalem@doktor.com",
        password: "Patient123!@#",
        phoneNumber: "+216555666782",
        dateOfBirth: new Date("1987-11-12"),
        gender: "female",
        bloodType: "A-",
      },
      {
        patientId: `PAT-008`,
        firstName: "Karim",
        lastName: "Trabelsi",
        email: "karim.trabelsi@doktor.com",
        password: "Patient123!@#",
        phoneNumber: "+216555666783",
        dateOfBirth: new Date("1993-04-18"),
        gender: "male",
        bloodType: "B-",
      },
      {
        patientId: `PAT-007`,
        firstName: "Leila",
        lastName: "Khouja",
        email: "leila.khouja@doktor.com",
        password: "Patient123!@#",
        phoneNumber: "+216555666784",
        dateOfBirth: new Date("1991-09-30"),
        gender: "female",
        bloodType: "AB-",
      },
      {
        patientId: `PAT-006`,
        firstName: "Omar",
        lastName: "Bouazizi",
        email: "omar.bouazizi@doktor.com",
        password: "Patient123!@#",
        phoneNumber: "+216555666785",
        dateOfBirth: new Date("1989-02-14"),
        gender: "male",
        bloodType: "O+",
      },
      {
        patientId: `PAT-005`,
        firstName: "Salma",
        lastName: "Gharbi",
        email: "salma.gharbi@doktor.com",
        password: "Patient123!@#",
        phoneNumber: "+216555666786",
        dateOfBirth: new Date("1994-06-22"),
        gender: "female",
        bloodType: "A+",
      },
    ];

    const patients = [];
    for (let i = 0; i < patientsData.length; i++) {
      const patientData = patientsData[i];
      const patientUser = await User.create({
        patientId: patientData.patientId,
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        email: patientData.email,
        password: patientData.password,
        phoneNumber: patientData.phoneNumber,
        role: "patient",
        isEmailVerified: true,
        isPhoneVerified: true,
      });

      const patientProfile = await Patient.create({
        patientId: patientData.patientId,
        user: patientUser._id,
        dateOfBirth: patientData.dateOfBirth,
        gender: patientData.gender,
        bloodType: patientData.bloodType,
        height: { value: 170 + Math.random() * 20, unit: "cm" },
        weight: { value: 60 + Math.random() * 30, unit: "kg" },
        fitzpatrickType: Math.floor(Math.random() * 6 + 1).toString(),
        emergencyContact: {
          name: `Emergency Contact ${i + 1}`,
          relationship: "Family",
          phoneNumber: `+21655566677${i + 2}`,
          email: `emergency${i + 1}@example.com`,
        },
        address: {
          street: `${456 + i} Patient Street`,
          city: "Tunis",
          state: "Tunis",
          zipCode: `100${i + 1}`,
          country: "Tunisia",
        },
        insuranceInfo: {
          provider: i % 2 === 0 ? "CNAM" : "CNRPS",
          policyNumber: `POL12345${i}`,
          coverageType: "Full Coverage",
        },
        medicalHistory: {
          allergies: [
            {
              allergen: "Penicillin",
              severity: "moderate",
              reaction: "Rash",
              diagnosedDate: new Date("2020-01-01"),
            },
          ],
          chronicConditions: [
            {
              condition: "Hypertension",
              diagnosedDate: new Date("2019-06-15"),
              status: "managed",
            },
          ],
        },
        doctors: [],
      });

      patientUser.patientProfile = patientProfile._id;
      await patientUser.save();
      patients.push({ user: patientUser, profile: patientProfile });
    }

    console.log("👤 Created multiple patients");

    // Connect patients to doctors and create appointments
    for (let i = 0; i < patients.length; i++) {
      const patient = patients[i];
      const doctor = doctors[i % doctors.length]; // Distribute patients among doctors

      // Connect patient to doctor
      patient.profile.doctors.push({
        doctor: doctor.profile._id,
        status: "active",
        connectedAt: new Date(),
        isPrimary: true,
      });
      await patient.profile.save();

      doctor.profile.patients.push({
        patient: patient.profile._id,
        status: "active",
        connectedAt: new Date(),
      });
      await doctor.profile.save();

      // Create appointments
      const appointmentDates = [
        new Date("2025-01-15"),
        new Date("2025-01-16"),
        new Date("2025-01-17"),
      ];

      // for (let j = 0; j < appointmentDates.length; j++) {
      //   const appointment = await Appointment.create({
      //     patient: patient.profile._id,
      //     doctor: doctor.profile._id,
      //     appointmentType: ["consultation", "follow-up", "routine-checkup"][
      //       j % 3
      //     ],
      //     scheduledDate: appointmentDates[j],
      //     scheduledTime: {
      //       start: `${9 + j * 2}:00`,
      //       end: `${9 + j * 2 + 1}:00`,
      //     },
      //     duration: 60,
      //     reason: ["General checkup", "Follow-up visit", "Routine examination"][
      //       j % 3
      //     ],
      //     status: j === 0 ? "completed" : "scheduled",
      //     createdBy: patient.user._id,
      //   });

      //   // Create consultation for completed appointments
      //   if (j === 0) {
      //     const consultation = await Consultation.create({
      //       appointment: appointment._id,
      //       patient: patient.profile._id,
      //       doctor: doctor.profile._id,
      //       startTime: new Date(
      //         appointmentDates[j].getTime() + 9 * 60 * 60 * 1000
      //       ),
      //       endTime: new Date(
      //         appointmentDates[j].getTime() + 10 * 60 * 60 * 1000
      //       ),
      //       duration: 60,
      //       type: "in-person",
      //       chiefComplaint: "General health checkup",
      //       symptoms: [
      //         { name: "Headache", severity: "mild" },
      //         { name: "Fatigue", severity: "moderate" },
      //       ],
      //       vitalSigns: {
      //         bloodPressure: { systolic: 120, diastolic: 80 },
      //         heartRate: 72,
      //         temperature: 36.5,
      //         weight: patient.profile.weight.value,
      //         height: patient.profile.height.value,
      //       },
      //       diagnosis: {
      //         primary: {
      //           code: "Z00.00",
      //           description: "General health examination",
      //         },
      //       },
      //       treatmentPlan: {
      //         immediate: "Continue current lifestyle, follow-up in 6 months",
      //         longTerm: "Regular exercise and healthy diet",
      //       },
      //       status: "completed",
      //     });

      //     appointment.consultation = consultation._id;
      //     await appointment.save();

      //     // Create prescription
      //     const prescription = await Prescription.create({
      //       patient: patient.profile._id,
      //       doctor: doctor.profile._id,
      //       consultation: consultation._id,
      //       medications: [
      //         {
      //           name: "Paracetamol",
      //           genericName: "Acetaminophen",
      //           dosage: { amount: 500, unit: "mg" },
      //           frequency: "three-times",
      //           timing: {
      //             afterBreakfast: true,
      //             afterLunch: true,
      //             afterDinner: true,
      //           },
      //           duration: {
      //             startDate: new Date(),
      //             endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      //             totalDays: 7,
      //           },
      //           instructions: "Take with food",
      //           isActive: true,
      //         },
      //       ],
      //       status: "active",
      //     });

      //     consultation.prescriptions.push(prescription._id);
      //     await consultation.save();

      //     // Add to patient's current medications
      //     patient.profile.currentMedications.push({
      //       medication: prescription._id,
      //       startDate: new Date(),
      //       endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      //       isActive: true,
      //     });
      //     await patient.profile.save();

      //     // Create medical records
      //     const labRecord = await MedicalRecord.create({
      //       patient: patient.profile._id,
      //       doctor: doctor.profile._id,
      //       consultation: consultation._id,
      //       recordType: "lab-result",
      //       title: "Complete Blood Count",
      //       description: "Routine blood work",
      //       labResults: {
      //         testName: "Complete Blood Count",
      //         testType: "blood",
      //         results: [
      //           {
      //             parameter: "Hemoglobin",
      //             value: "14.5",
      //             unit: "g/dL",
      //             referenceRange: "12.0-16.0",
      //             status: "normal",
      //           },
      //           {
      //             parameter: "White Blood Cells",
      //             value: "7.2",
      //             unit: "K/uL",
      //             referenceRange: "4.0-11.0",
      //             status: "normal",
      //           },
      //           {
      //             parameter: "Platelets",
      //             value: "250",
      //             unit: "K/uL",
      //             referenceRange: "150-450",
      //             status: "normal",
      //           },
      //         ],
      //         interpretation: "All values within normal limits",
      //         recommendations: "Continue current health regimen",
      //       },
      //       status: "final",
      //     });

      //     const xrayRecord = await MedicalRecord.create({
      //       patient: patient.profile._id,
      //       doctor: doctor.profile._id,
      //       consultation: consultation._id,
      //       recordType: "imaging",
      //       title: "Chest X-Ray",
      //       description: "Routine chest imaging",
      //       imagingResults: {
      //         imagingType: "x-ray",
      //         bodyPart: "Chest",
      //         findings: "Clear lung fields, normal heart size",
      //         impression: "Normal chest X-ray",
      //         recommendations: "No further imaging needed",
      //       },
      //       status: "final",
      //     });

      //     // Create bill
      //     const bill = await Bill.create({
      //       patient: patient.profile._id,
      //       doctor: doctor.profile._id,
      //       appointment: appointment._id,
      //       consultation: consultation._id,
      //       billType: "consultation",
      //       items: [
      //         {
      //           description: "General Consultation",
      //           serviceCode: "CONS-001",
      //           quantity: 1,
      //           unitPrice: doctor.profile.consultationFee,
      //           totalPrice: doctor.profile.consultationFee,
      //         },
      //       ],
      //       dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      //       paymentStatus: i % 2 === 0 ? "paid" : "pending",
      //       paymentMethod: i % 2 === 0 ? "card" : undefined,
      //       paymentDetails:
      //         i % 2 === 0
      //           ? {
      //               paymentDate: new Date(),
      //               paidAmount: doctor.profile.consultationFee,
      //               remainingAmount: 0,
      //             }
      //           : {},
      //       createdBy: doctor.user._id,
      //     });

      //     appointment.billing = bill._id;
      //     await appointment.save();
      //   }
      // }

      // Create chat between patient and doctor
      //   const chat = await Chat.create({
      //     participants: [
      //       {
      //         user: patient.user._id,
      //         role: "patient",
      //         joinedAt: new Date(),
      //         isActive: true,
      //       },
      //       {
      //         user: doctor.user._id,
      //         role: "doctor",
      //         joinedAt: new Date(),
      //         isActive: true,
      //       },
      //     ],
      //     chatType: "direct",
      //     lastActivity: new Date(),
      //   });

      //   // Create some messages
      //   const messages = [
      //     {
      //       chat: chat._id,
      //       sender: patient.user._id,
      //       messageType: "text",
      //       content: {
      //         text: "Hello Doctor, I have a question about my medication.",
      //       },
      //     },
      //     {
      //       chat: chat._id,
      //       sender: doctor.user._id,
      //       messageType: "text",
      //       content: {
      //         text: "Hello! I'm here to help. What would you like to know?",
      //       },
      //     },
      //   ];

      //   for (const messageData of messages) {
      //     const message = await Message.create(messageData);
      //     chat.lastMessage = message._id;
      //   }
      //   await chat.save();
    }

    // Create secretary
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
      doctor: doctors[0].profile._id,
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

    doctors[0].profile.secretaries.push({
      secretary: secretaryProfile._id,
      permissions: secretaryProfile.permissions,
      addedAt: new Date(),
    });
    await doctors[0].profile.save();

    console.log("👩‍💼 Created secretary");

    console.log("✅ Database seeding completed successfully!");
    console.log("\n📋 Sample Accounts Created:");
    console.log("Admin: admin@doktor.com / Admin123!@#");
    console.log("Doctors:");
    doctorsData.forEach((d) => console.log(`  ${d.email} / Doctor123!@#`));
    console.log("Patients:");
    patientsData.forEach((p) => console.log(`  ${p.email} / Patient123!@#`));
    console.log("Secretary: secretary@doktor.com / Secretary123!@#");

    process.exit(0);
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
    process.exit(1);
  }
};

seedDatabase();

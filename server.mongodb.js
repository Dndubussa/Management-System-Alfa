import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import connectDB from './src/config/db.js';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import models
import {
  Patient,
  MedicalRecord,
  Prescription,
  LabOrder,
  Appointment,
  User,
  Notification,
  ServicePrice,
  Bill,
  Department,
  Referral,
  InsuranceClaim,
  SurgeryRequest,
  OTSlot,
  OTResource,
  OTChecklist,
  SurgeryProgress,
  OTReport
} from './src/models/index.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'dist')));

// API Routes

// Patients
app.get('/api/patients', async (req, res) => {
  try {
    const patients = await Patient.find();
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/patients/:id', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (patient) {
      res.json(patient);
    } else {
      res.status(404).json({ error: 'Patient not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/patients', async (req, res) => {
  try {
    const patient = new Patient(req.body);
    const savedPatient = await patient.save();
    res.status(201).json(savedPatient);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/patients/:id', async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (patient) {
      res.json(patient);
    } else {
      res.status(404).json({ error: 'Patient not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/patients/:id', async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (patient) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Patient not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Medical Records
app.get('/api/medical-records', async (req, res) => {
  try {
    const records = await MedicalRecord.find();
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/medical-records/:id', async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (record) {
      res.json(record);
    } else {
      res.status(404).json({ error: 'Medical record not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/medical-records', async (req, res) => {
  try {
    const record = new MedicalRecord(req.body);
    const savedRecord = await record.save();
    res.status(201).json(savedRecord);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/medical-records/:id', async (req, res) => {
  try {
    const record = await MedicalRecord.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (record) {
      res.json(record);
    } else {
      res.status(404).json({ error: 'Medical record not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Prescriptions
app.get('/api/prescriptions', async (req, res) => {
  try {
    const prescriptions = await Prescription.find();
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/prescriptions/:id', async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (prescription) {
      res.json(prescription);
    } else {
      res.status(404).json({ error: 'Prescription not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/prescriptions/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const prescription = await Prescription.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (prescription) {
      res.json(prescription);
    } else {
      res.status(404).json({ error: 'Prescription not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Lab Orders
app.get('/api/lab-orders', async (req, res) => {
  try {
    const orders = await LabOrder.find();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/lab-orders/:id', async (req, res) => {
  try {
    const order = await LabOrder.findById(req.params.id);
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ error: 'Lab order not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/lab-orders/:id/status', async (req, res) => {
  try {
    const { status, results } = req.body;
    const updateData = { status };
    if (results) updateData.results = results;
    if (status === 'completed') updateData.completedAt = new Date();
    
    const order = await LabOrder.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ error: 'Lab order not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Appointments
app.get('/api/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/appointments/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (appointment) {
      res.json(appointment);
    } else {
      res.status(404).json({ error: 'Appointment not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/appointments', async (req, res) => {
  try {
    const appointment = new Appointment(req.body);
    const savedAppointment = await appointment.save();
    res.status(201).json(savedAppointment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/appointments/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (appointment) {
      res.json(appointment);
    } else {
      res.status(404).json({ error: 'Appointment not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const user = new User(req.body);
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (user) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Notifications
app.get('/api/notifications', async (req, res) => {
  try {
    const notifications = await Notification.find();
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/notifications/:id', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (notification) {
      res.json(notification);
    } else {
      res.status(404).json({ error: 'Notification not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/notifications', async (req, res) => {
  try {
    const notification = new Notification(req.body);
    const savedNotification = await notification.save();
    res.status(201).json(savedNotification);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    const { userId } = req.body;
    const notification = await Notification.findById(req.params.id);
    if (notification) {
      // Track read status per user
      const isRead = typeof notification.isRead === 'boolean' 
        ? { [userId]: true } 
        : { ...notification.isRead, [userId]: true };
        
      const updatedNotification = await Notification.findByIdAndUpdate(
        req.params.id, 
        { isRead }, 
        { new: true }
      );
      res.json(updatedNotification);
    } else {
      res.status(404).json({ error: 'Notification not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Service Prices
app.get('/api/service-prices', async (req, res) => {
  try {
    const servicePrices = await ServicePrice.find();
    res.json(servicePrices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/service-prices/:id', async (req, res) => {
  try {
    const servicePrice = await ServicePrice.findById(req.params.id);
    if (servicePrice) {
      res.json(servicePrice);
    } else {
      res.status(404).json({ error: 'Service price not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/service-prices', async (req, res) => {
  try {
    const servicePrice = new ServicePrice(req.body);
    const savedServicePrice = await servicePrice.save();
    res.status(201).json(savedServicePrice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/service-prices/:id', async (req, res) => {
  try {
    const servicePrice = await ServicePrice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (servicePrice) {
      res.json(servicePrice);
    } else {
      res.status(404).json({ error: 'Service price not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Bills
app.get('/api/bills', async (req, res) => {
  try {
    const bills = await Bill.find();
    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/bills/:id', async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (bill) {
      res.json(bill);
    } else {
      res.status(404).json({ error: 'Bill not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/bills', async (req, res) => {
  try {
    const bill = new Bill(req.body);
    const savedBill = await bill.save();
    res.status(201).json(savedBill);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/bills/:id/status', async (req, res) => {
  try {
    const { status, paymentMethod } = req.body;
    const updateData = { status };
    if (paymentMethod) updateData.paymentMethod = paymentMethod;
    if (status === 'paid') updateData.paidAt = new Date();
    
    const bill = await Bill.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (bill) {
      res.json(bill);
    } else {
      res.status(404).json({ error: 'Bill not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Departments
app.get('/api/departments', async (req, res) => {
  try {
    const departments = await Department.find();
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/departments/:id', async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (department) {
      res.json(department);
    } else {
      res.status(404).json({ error: 'Department not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/departments', async (req, res) => {
  try {
    const department = new Department(req.body);
    const savedDepartment = await department.save();
    res.status(201).json(savedDepartment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/departments/:id', async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (department) {
      res.json(department);
    } else {
      res.status(404).json({ error: 'Department not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Referrals
app.get('/api/referrals', async (req, res) => {
  try {
    const referrals = await Referral.find();
    res.json(referrals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/referrals/:id', async (req, res) => {
  try {
    const referral = await Referral.findById(req.params.id);
    if (referral) {
      res.json(referral);
    } else {
      res.status(404).json({ error: 'Referral not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/referrals', async (req, res) => {
  try {
    const referral = new Referral(req.body);
    const savedReferral = await referral.save();
    res.status(201).json(savedReferral);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/referrals/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const referral = await Referral.findByIdAndUpdate(
      req.params.id, 
      { status, updatedAt: new Date() }, 
      { new: true }
    );
    if (referral) {
      res.json(referral);
    } else {
      res.status(404).json({ error: 'Referral not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Insurance Claims
app.get('/api/insurance-claims', async (req, res) => {
  try {
    const claims = await InsuranceClaim.find();
    res.json(claims);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/insurance-claims/:id', async (req, res) => {
  try {
    const claim = await InsuranceClaim.findById(req.params.id);
    if (claim) {
      res.json(claim);
    } else {
      res.status(404).json({ error: 'Insurance claim not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/insurance-claims', async (req, res) => {
  try {
    const claim = new InsuranceClaim(req.body);
    const savedClaim = await claim.save();
    res.status(201).json(savedClaim);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/insurance-claims/:id/status', async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const updateData = { status, rejectionReason };
    if (status === 'approved') updateData.approvalDate = new Date();
    
    const claim = await InsuranceClaim.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (claim) {
      res.json(claim);
    } else {
      res.status(404).json({ error: 'Insurance claim not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Surgery Requests
app.get('/api/surgery-requests', async (req, res) => {
  try {
    const requests = await SurgeryRequest.find();
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/surgery-requests/:id', async (req, res) => {
  try {
    const request = await SurgeryRequest.findById(req.params.id);
    if (request) {
      res.json(request);
    } else {
      res.status(404).json({ error: 'Surgery request not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/surgery-requests', async (req, res) => {
  try {
    const request = new SurgeryRequest(req.body);
    const savedRequest = await request.save();
    res.status(201).json(savedRequest);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/surgery-requests/:id', async (req, res) => {
  try {
    const request = await SurgeryRequest.findByIdAndUpdate(
      req.params.id, 
      { ...req.body, updatedAt: new Date() }, 
      { new: true }
    );
    if (request) {
      res.json(request);
    } else {
      res.status(404).json({ error: 'Surgery request not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// OT Slots
app.get('/api/ot-slots', async (req, res) => {
  try {
    const slots = await OTSlot.find();
    res.json(slots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/ot-slots/:id', async (req, res) => {
  try {
    const slot = await OTSlot.findById(req.params.id);
    if (slot) {
      res.json(slot);
    } else {
      res.status(404).json({ error: 'OT slot not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ot-slots', async (req, res) => {
  try {
    const slot = new OTSlot(req.body);
    const savedSlot = await slot.save();
    res.status(201).json(savedSlot);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/ot-slots/:id', async (req, res) => {
  try {
    const slot = await OTSlot.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (slot) {
      res.json(slot);
    } else {
      res.status(404).json({ error: 'OT slot not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// OT Resources
app.get('/api/ot-resources', async (req, res) => {
  try {
    const resources = await OTResource.find();
    res.json(resources);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/ot-resources/:id', async (req, res) => {
  try {
    const resource = await OTResource.findById(req.params.id);
    if (resource) {
      res.json(resource);
    } else {
      res.status(404).json({ error: 'OT resource not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ot-resources', async (req, res) => {
  try {
    const resource = new OTResource(req.body);
    const savedResource = await resource.save();
    res.status(201).json(savedResource);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/ot-resources/:id', async (req, res) => {
  try {
    const resource = await OTResource.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (resource) {
      res.json(resource);
    } else {
      res.status(404).json({ error: 'OT resource not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// OT Checklists
app.get('/api/ot-checklists', async (req, res) => {
  try {
    const checklists = await OTChecklist.find();
    res.json(checklists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/ot-checklists/:id', async (req, res) => {
  try {
    const checklist = await OTChecklist.findById(req.params.id);
    if (checklist) {
      res.json(checklist);
    } else {
      res.status(404).json({ error: 'OT checklist not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ot-checklists', async (req, res) => {
  try {
    const checklist = new OTChecklist(req.body);
    const savedChecklist = await checklist.save();
    res.status(201).json(savedChecklist);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/ot-checklists/:id', async (req, res) => {
  try {
    const checklist = await OTChecklist.findByIdAndUpdate(
      req.params.id, 
      { ...req.body, updatedAt: new Date() }, 
      { new: true }
    );
    if (checklist) {
      res.json(checklist);
    } else {
      res.status(404).json({ error: 'OT checklist not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Surgery Progress
app.get('/api/surgery-progress', async (req, res) => {
  try {
    const progressRecords = await SurgeryProgress.find();
    res.json(progressRecords);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/surgery-progress/:id', async (req, res) => {
  try {
    const progress = await SurgeryProgress.findById(req.params.id);
    if (progress) {
      res.json(progress);
    } else {
      res.status(404).json({ error: 'Surgery progress not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/surgery-progress', async (req, res) => {
  try {
    const progress = new SurgeryProgress(req.body);
    const savedProgress = await progress.save();
    res.status(201).json(savedProgress);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/surgery-progress/:id', async (req, res) => {
  try {
    const progress = await SurgeryProgress.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (progress) {
      res.json(progress);
    } else {
      res.status(404).json({ error: 'Surgery progress not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// OT Reports
app.get('/api/ot-reports', async (req, res) => {
  try {
    const reports = await OTReport.find();
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/ot-reports/:id', async (req, res) => {
  try {
    const report = await OTReport.findById(req.params.id);
    if (report) {
      res.json(report);
    } else {
      res.status(404).json({ error: 'OT report not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ot-reports', async (req, res) => {
  try {
    const report = new OTReport(req.body);
    const savedReport = await report.save();
    res.status(201).json(savedReport);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/ot-reports/:id', async (req, res) => {
  try {
    const report = await OTReport.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (report) {
      res.json(report);
    } else {
      res.status(404).json({ error: 'OT report not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API endpoints are available at http://localhost:${PORT}/api`);
});
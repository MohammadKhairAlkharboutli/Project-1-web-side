const STORAGE_KEY = "tabibi.doctorMockWorkflow.v1";

function dateString(offset = 0) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateTime(date, time) {
  return new Date(`${date}T${String(time).slice(0, 5)}:00`);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function patient(id, fullName, phone, email) {
  return { id, user: { full_name: fullName, phone, email } };
}

function createInitialWorkflow() {
  const clinic = { id: 1, name: "Downtown Clinic" };
  const doctor = { id: 1, user: { full_name: "Dr. Sarah Jenkins" } };
  const appointments = [
    {
      id: 2001,
      patientId: 1,
      doctorId: 1,
      clinicId: 1,
      referralId: null,
      type: "Initial Visit",
      priority: "1",
      status: "confirmed",
      requestedDate: dateString(),
      startTime: "09:30:00",
      endTime: "10:00:00",
      actualStartTime: null,
      actualEndTime: null,
      reasonForVisit: "Intermittent chest discomfort after exertion.",
      symptoms: "Shortness of breath and mild pressure.",
      cancellationReason: null,
      cancelledAt: null,
      checkinTime: null,
      notes: "Bring previous ECG results.",
      patient: patient(1, "Ahmad Mohammad Ali", "+963 933 123 456", "ahmad.ali@example.com"),
      doctor,
      clinic,
      referral: null,
      queue: null,
    },
    {
      id: 2002,
      patientId: 2,
      doctorId: 1,
      clinicId: 1,
      referralId: null,
      type: "Return Visit",
      priority: "2",
      status: "confirmed",
      requestedDate: dateString(),
      startTime: "10:15:00",
      endTime: "10:45:00",
      actualStartTime: null,
      actualEndTime: null,
      reasonForVisit: "Blood pressure follow-up.",
      symptoms: "Lightheadedness in the morning.",
      cancellationReason: null,
      cancelledAt: null,
      checkinTime: new Date().toISOString(),
      notes: null,
      patient: patient(2, "Fatima Hassan Ibrahim", "+963 944 987 654", "fatima.hassan@example.com"),
      doctor,
      clinic,
      referral: null,
      queue: { id: 601, queueNumber: 1, status: "waiting" },
    },
    {
      id: 2003,
      patientId: 3,
      doctorId: 1,
      clinicId: 1,
      referralId: 401,
      type: "Return Visit",
      priority: "1",
      status: "confirmed",
      requestedDate: dateString(-1),
      startTime: "14:00:00",
      endTime: "14:30:00",
      actualStartTime: null,
      actualEndTime: null,
      reasonForVisit: "Type 2 diabetes review.",
      symptoms: "Fatigue over the last week.",
      cancellationReason: null,
      cancelledAt: null,
      checkinTime: null,
      notes: null,
      patient: patient(3, "Omar Khaled Al-Mahmoud", "+963 955 456 789", "omar.mahmoud@example.com"),
      doctor,
      clinic,
      referral: { id: 401, reason: "Follow-up after blood work" },
      queue: null,
    },
    {
      id: 2004,
      patientId: 1,
      doctorId: 1,
      clinicId: 1,
      referralId: null,
      type: "Return Visit",
      priority: "1",
      status: "completed",
      requestedDate: dateString(-14),
      startTime: "13:00:00",
      endTime: "13:30:00",
      actualStartTime: `${dateString(-14)}T13:04:00.000Z`,
      actualEndTime: `${dateString(-14)}T13:31:00.000Z`,
      reasonForVisit: "Medication response review.",
      symptoms: "Chest symptoms are improving.",
      cancellationReason: null,
      cancelledAt: null,
      checkinTime: `${dateString(-14)}T12:45:00.000Z`,
      notes: "Medication plan adjusted and recorded in the consultation.",
      patient: patient(1, "Ahmad Mohammad Ali", "+963 933 123 456", "ahmad.ali@example.com"),
      doctor,
      clinic,
      referral: null,
      queue: { id: 602, queueNumber: 1, status: "completed" },
    },
    {
      id: 2005,
      patientId: 4,
      doctorId: 1,
      clinicId: 1,
      referralId: null,
      type: "Initial Visit",
      priority: "2",
      status: "confirmed",
      requestedDate: dateString(2),
      startTime: "11:00:00",
      endTime: "11:30:00",
      actualStartTime: null,
      actualEndTime: null,
      reasonForVisit: "New headache assessment.",
      symptoms: "Recurring headache and dizziness.",
      cancellationReason: null,
      cancelledAt: null,
      checkinTime: null,
      notes: null,
      patient: patient(4, "Sara Abdullah Khoury", "+963 988 321 654", "sara.khoury@example.com"),
      doctor,
      clinic,
      referral: null,
      queue: null,
    },
    {
      id: 2006,
      patientId: 5,
      doctorId: 1,
      clinicId: 1,
      referralId: null,
      type: "Return Visit",
      priority: "1",
      status: "cancelled",
      requestedDate: dateString(-4),
      startTime: "15:00:00",
      endTime: "15:30:00",
      actualStartTime: null,
      actualEndTime: null,
      reasonForVisit: "Asthma medication follow-up.",
      symptoms: "No acute symptoms reported.",
      cancellationReason: "Patient was unable to attend.",
      cancelledAt: `${dateString(-5)}T16:00:00.000Z`,
      checkinTime: null,
      notes: null,
      patient: patient(5, "Samer Tarek Al-Abdullah", "+963 991 789 123", "samer.abdullah@example.com"),
      doctor,
      clinic,
      referral: null,
      queue: null,
    },
  ];

  return {
    appointments,
    queue: [{ id: 601, appointmentId: 2002, position: 1, status: "waiting", estimatedWaitMinutes: 0 }],
    consultations: [],
  };
}

function isWorkflow(value) {
  return value && Array.isArray(value.appointments) && Array.isArray(value.queue) && Array.isArray(value.consultations);
}

export function getMockDoctorWorkflow() {
  if (typeof window === "undefined") return createInitialWorkflow();

  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    const workflow = stored ? JSON.parse(stored) : null;
    if (isWorkflow(workflow)) return clone(workflow);
  } catch {
    // A new in-memory fixture still keeps the doctor portal usable.
  }

  const workflow = createInitialWorkflow();
  saveMockDoctorWorkflow(workflow);
  return workflow;
}

export function saveMockDoctorWorkflow(workflow) {
  if (typeof window === "undefined") return clone(workflow);
  const next = clone(workflow);
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("tabibi:doctor-mock-workflow"));
  } catch {
    // Mock persistence is optional; callers still receive the updated state.
  }
  return next;
}

export function resetMockDoctorWorkflow() {
  return saveMockDoctorWorkflow(createInitialWorkflow());
}

export function getMockDoctorAppointments() {
  return getMockDoctorWorkflow().appointments;
}

export function getMockDoctorAppointment(appointmentId) {
  return getMockDoctorAppointments().find((appointment) => String(appointment.id) === String(appointmentId)) || null;
}

export function getMockDoctorQueue() {
  const workflow = getMockDoctorWorkflow();
  return workflow.queue
    .map((entry) => ({ ...entry, appointment: workflow.appointments.find((appointment) => appointment.id === entry.appointmentId) }))
    .filter((entry) => entry.appointment)
    .sort((left, right) => left.position - right.position);
}

function updateAppointment(workflow, appointmentId, updater) {
  const index = workflow.appointments.findIndex((appointment) => String(appointment.id) === String(appointmentId));
  if (index === -1) throw new Error("Mock appointment not found.");
  const updated = updater(workflow.appointments[index]);
  workflow.appointments[index] = updated;
  return updated;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export function checkInMockAppointment(appointmentId) {
  const workflow = getMockDoctorWorkflow();
  const appointment = workflow.appointments.find((item) => String(item.id) === String(appointmentId));
  assert(appointment, "Mock appointment not found.");
  assert(appointment.status === "confirmed", "Only confirmed appointments can be checked in.");
  assert(appointment.requestedDate === dateString(), "Mock check-in is available only on the appointment date.");
  assert(!workflow.queue.some((entry) => entry.appointmentId === appointment.id), "This patient is already in the queue.");

  const position = workflow.queue.filter((entry) => ["waiting", "calling", "in_progress"].includes(entry.status)).length + 1;
  const queueEntry = { id: Date.now(), appointmentId: appointment.id, position, status: "waiting", estimatedWaitMinutes: (position - 1) * 20 };
  workflow.queue.push(queueEntry);
  updateAppointment(workflow, appointment.id, (item) => ({
    ...item,
    checkinTime: new Date().toISOString(),
    queue: { id: queueEntry.id, queueNumber: position, status: "waiting" },
  }));
  return saveMockDoctorWorkflow(workflow);
}

export function cancelMockAppointment(appointmentId, cancellationReason = "") {
  const workflow = getMockDoctorWorkflow();
  const appointment = workflow.appointments.find((item) => String(item.id) === String(appointmentId));
  assert(appointment, "Mock appointment not found.");
  assert(["pending", "confirmed"].includes(appointment.status), "Only scheduled appointments can be cancelled.");
  assert(!workflow.queue.some((entry) => entry.appointmentId === appointment.id && ["waiting", "calling", "in_progress"].includes(entry.status)), "A checked-in appointment must be managed from the queue.");
  updateAppointment(workflow, appointment.id, (item) => ({ ...item, status: "cancelled", cancellationReason: cancellationReason.trim() || null, cancelledAt: new Date().toISOString() }));
  return saveMockDoctorWorkflow(workflow);
}

export function canMarkMockNoShow(appointment) {
  return appointment?.status === "confirmed" && dateTime(appointment.requestedDate, appointment.endTime) < new Date() && !appointment.queue;
}

export function markMockAppointmentNoShow(appointmentId) {
  const workflow = getMockDoctorWorkflow();
  const appointment = workflow.appointments.find((item) => String(item.id) === String(appointmentId));
  assert(appointment && canMarkMockNoShow(appointment), "Only a missed, unchecked-in confirmed appointment can be marked as no-show.");
  updateAppointment(workflow, appointment.id, (item) => ({ ...item, status: "no_show", notes: item.notes || "Marked no-show after the missed appointment window." }));
  return saveMockDoctorWorkflow(workflow);
}

export function callNextMockPatient() {
  const workflow = getMockDoctorWorkflow();
  assert(!workflow.queue.some((entry) => ["calling", "in_progress"].includes(entry.status)), "Finish the current patient before calling the next one.");
  const entry = workflow.queue.filter((item) => item.status === "waiting").sort((a, b) => a.position - b.position)[0];
  assert(entry, "No patients are waiting.");
  entry.status = "calling";
  updateAppointment(workflow, entry.appointmentId, (item) => ({ ...item, queue: { ...item.queue, status: "calling" } }));
  return saveMockDoctorWorkflow(workflow);
}

export function startMockConsultation(queueId) {
  const workflow = getMockDoctorWorkflow();
  const entry = workflow.queue.find((item) => String(item.id) === String(queueId));
  assert(entry && entry.status === "calling", "Only the patient currently being called can start a consultation.");
  assert(!workflow.queue.some((item) => item.status === "in_progress"), "Another consultation is already in progress.");
  entry.status = "in_progress";
  updateAppointment(workflow, entry.appointmentId, (item) => ({ ...item, status: "in_progress", actualStartTime: item.actualStartTime || new Date().toISOString(), queue: { ...item.queue, status: "in_progress" } }));
  return saveMockDoctorWorkflow(workflow);
}

export function skipMockPatient(queueId) {
  const workflow = getMockDoctorWorkflow();
  const entry = workflow.queue.find((item) => String(item.id) === String(queueId));
  assert(entry && ["waiting", "calling"].includes(entry.status), "Only waiting or called patients can be skipped.");
  entry.status = "skipped";
  updateAppointment(workflow, entry.appointmentId, (item) => ({ ...item, queue: { ...item.queue, status: "skipped" } }));
  return saveMockDoctorWorkflow(workflow);
}

export function getMockConsultationRecords() {
  return getMockDoctorWorkflow().consultations;
}

export function saveMockConsultationRecord(record) {
  const workflow = getMockDoctorWorkflow();
  const index = workflow.consultations.findIndex((item) => String(item.appointmentId) === String(record.appointmentId));
  if (index >= 0) workflow.consultations[index] = record;
  else workflow.consultations.push(record);
  return saveMockDoctorWorkflow(workflow);
}

export function completeMockConsultation(appointmentId) {
  const workflow = getMockDoctorWorkflow();
  const record = workflow.consultations.find((item) => String(item.appointmentId) === String(appointmentId));
  assert(record, "Save the mock clinical record before completing the consultation.");
  const entry = workflow.queue.find((item) => item.appointmentId === Number(appointmentId));
  assert(entry?.status === "in_progress", "This appointment is not in an active consultation.");
  record.completed = true;
  entry.status = "completed";
  updateAppointment(workflow, appointmentId, (item) => ({ ...item, status: "completed", actualEndTime: new Date().toISOString(), queue: { ...item.queue, status: "completed" } }));
  return saveMockDoctorWorkflow(workflow);
}

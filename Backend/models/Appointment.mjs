import mongoose from "mongoose";
const appointSchema = new mongoose.Schema({
  dr_id: { type: mongoose.Schema.Types.ObjectId, ref: "Dr" },
  patient_Id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: Date,
  time: String,
  duration: Number,
  status: {
    type: String,
    enum: ["pending", "booked", "cancelled", "completed"],
    default: "pending",
  },
  notes: String,
});
appointmentSchema.index({ dr_id: 1, date: 1, time: 1 });
appointmentSchema.index({ patient_Id: 1, date: -1 });
appointmentSchema.index({ status: 1 });

const Appointment = mongoose.model("Appointment", appointSchema);

export default Appointment;

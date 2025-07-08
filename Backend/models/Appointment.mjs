import mongoose from "mongoose";
const appointSchema = new mongoose.Schema({
  dr_id: { type: mongoose.Schema.Types.ObjectId, ref: "Dr" },
  patient_Id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: Date,
  time: String,
  duration: Number,
  status: { type: String, enum: ["pending", "booked", "cancelled","completed"], default : "pending" }, 
  notes: String,
});

const Appointment = mongoose.model("Appointment", appointSchema);

export default Appointment;
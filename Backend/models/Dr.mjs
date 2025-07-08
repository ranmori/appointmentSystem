import mongoose from "mongoose";

const drSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  specialization: String,
  availability: [
    {
      date: Date,
      slots:  [{ type: String, required: true }],
    },
  ],
  image: { type: String, default: "https://via.placeholder.com/150/cccccc/ffffff?text=U" }
});

const Dr = mongoose.model("Dr", drSchema);
export default Dr;

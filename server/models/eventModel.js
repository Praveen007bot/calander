// models/Event.js
import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: String, required: true },
  time: { type: String, required: true },
  duration: { type: Number, required: true },
  googleEventId: { type: String },
});

const Event = mongoose.model("Event", eventSchema);

export default Event;
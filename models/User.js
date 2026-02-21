import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  lastfmUsername: { type: String, required: true, unique: true },
  sessionKey: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);

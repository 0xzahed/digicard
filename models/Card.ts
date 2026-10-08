import mongoose, { Schema } from "mongoose";

const LinkSchema = new Schema(
  { label: String, url: String },
  { _id: false },
);

const CardSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    title: { type: String, default: "" },
    phone: { type: String, default: "" },
    whatsapp: { type: String, default: "" },
    email: { type: String, default: "" },
    address: { type: String, default: "" },
    bio: { type: String, default: "" },
    theme: { type: String, default: "emerald" },
    links: { type: [LinkSchema], default: [] },
    views: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

export const Card = mongoose.models.Card ?? mongoose.model("Card", CardSchema);

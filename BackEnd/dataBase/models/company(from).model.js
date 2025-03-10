import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: [3, "Company name must be at least 3 characters long"],
      maxLength: [30, "Company name must be at most 30 characters long"],
    },
    phone: {
      type: String,
      required: true,
      index: false, // Explicitly disable indexing on phone
    },
    address: {
      type: String,
      minLength: [3, "Address must be at least 3 characters long"],
      maxLength: [300, "Address must be at most 300 characters long"],
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: false, // Explicitly disable indexing on email
    },
    logo: {
      type: String,
      trim: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      unique: true, // Ensure one company per user
    },
  },
  { timestamps: true }
);

// Drop existing indexes before creating new ones
companySchema.index({ phone: 1 }, { unique: false });
companySchema.index({ email: 1 }, { unique: false });

// Add logo URL when retrieving company data
companySchema.post("init", (doc) => {
  if (doc.logo) {
    doc.logo = `http://localhost:3000/uploads/company/${doc.logo}`;
  }
});

// Drop existing indexes when the model is initialized
companySchema.on("index", function (err) {
  if (err) {
    console.error("Error creating indexes:", err);
  } else {
    // Drop the unique index on phone if it exists
    this.collection.dropIndex("phone_1", function (err) {
      if (err && err.code !== 26) {
        // Ignore error if index doesn't exist
        console.error("Error dropping phone index:", err);
      }
    });
  }
});

export const companyModel = mongoose.model("company", companySchema);

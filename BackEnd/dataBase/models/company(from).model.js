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
    },
    address: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    logo: {
      type: String,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      unique: true,
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

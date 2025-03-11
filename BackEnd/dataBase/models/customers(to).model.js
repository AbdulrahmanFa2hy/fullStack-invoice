import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: [3, "Product name must be at least 3 characters long"],
      maxLength: [30, "Product name must be at most 30 characters long"],
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      minLength: [3, "Address must be at least 3 characters long"],
      maxLength: [30, "Address must be at most 300 characters long"],
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true }
);

customerSchema.post("init", (doc) => {
  console.log(doc);
  doc.logo = "http://localhost:3000/customer/" + doc.logo;
});

export const customerModel = mongoose.model("customer", customerSchema);

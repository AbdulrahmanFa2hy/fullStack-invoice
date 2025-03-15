import { companyModel } from "../../../dataBase/models/company(from).model.js";
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";

// Add or update company
const saveCompany = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id; // Get userId from authenticated user

  // Create company data object
  const companyData = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address,
    user_id: userId,
  };

  // Handle logo file
  if (req.file) {
    companyData.logo = req.file.filename;
  }
  
  // Check if logo should be deleted
  if (req.body.deleteLogo === "true") {
    companyData.logo = null; // Set logo to null to remove it
  }

  try {
    // Try to find and update existing company
    let company = await companyModel.findOneAndUpdate(
      { user_id: userId },
      { $set: companyData },
      { new: true, runValidators: true, upsert: true }
    );

    if (!company) {
      return next(new AppError("Failed to save company", 500));
    }

    res.status(200).json({
      message:
        company.createdAt === company.updatedAt
          ? "Company added successfully"
          : "Company updated successfully",
      company,
    });
  } catch (error) {
    // Handle specific MongoDB errors
    if (error.code === 11000 && error.keyPattern && error.keyPattern.user_id) {
      // This is a duplicate user_id error, but we're using upsert so this shouldn't happen
      // If it does, it means there's a race condition or other issue
      return next(
        new AppError("Error updating company. Please try again.", 500)
      );
    } else if (error.code === 11000) {
      // Some other duplicate key error
      return next(
        new AppError("A company with this information already exists", 409)
      );
    }
    return next(error);
  }
});

// Get company for user
const getCompany = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id; // Get userId from authenticated user

  let company = await companyModel.findOne({ user_id: userId });
  if (!company) {
    return next(new AppError("No company found for this user", 404));
  }

  res.status(200).json({ message: "Company fetched successfully", company });
});

// Delete company
const deleteCompany = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id; // Get userId from authenticated user

  let company = await companyModel.findOneAndDelete({ user_id: userId });
  if (!company) {
    return next(new AppError("Company not found", 404));
  }

  res.status(200).json({ message: "Company deleted successfully", company });
});

// Exporting the company controllers
export { saveCompany, getCompany, deleteCompany };

import ApiErrorResponse from "../../utils/ApiErrorResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import Contact from "../../models/contact.js";

export const createContact = asyncHandler(async (req, res, next) => {
  const contactInfo = await Contact.create(req.body);
  if (!contactInfo) {
    return next(new ApiErrorResponse("Contact form submission failed", 400));
  }
  return res.status(201).json({
    success: true,
    message: "Contact form submitted successfully",
    data: contactInfo,
  });
});

export const getAllContacts = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page ? req.query.page.toString() : "1");
  const limit = parseInt(req.query.limit ? req.query.limit.toString() : "5");
  const skip = (page - 1) * limit;

  const totalContacts = await Contact.countDocuments();
  const contacts = await Contact.find().skip(skip).limit(limit);

  if (!contacts || contacts.length === 0) {
    return next(new ApiErrorResponse("No contacts found", 404));
  }

  const totalPages = Math.ceil(totalContacts / limit);
  //   const pagesArray = Array.from({ length: totalPages }, (_, i) => i + 1);
  // Build pages array
  let pagesArray = [];

  // Add first page
  pagesArray.push(1);

  // Add pages based on the current page
  if (totalPages > 3) {
    if (page > 2) {
      pagesArray.push(page - 1); // Previous page
    }

    // Always add the current page
    pagesArray.push(page);

    if (page < totalPages - 1) {
      pagesArray.push(page + 1); // Next page
    }

    // Add last page only if it's not already in the array
    if (!pagesArray.includes(totalPages)) {
      pagesArray.push(totalPages);
    }
  } else {
    // If there are 3 or fewer pages, just add all
    for (let i = 2; i <= totalPages; i++) {
      pagesArray.push(i);
    }
  }

  // Remove duplicates and sort
  pagesArray = [...new Set(pagesArray)].sort((a, b) => a - b);
  return res.status(200).json({
    success: true,
    message: "Contacts retrieved successfully",
    pagination: {
      count: totalContacts,
      current_page: page,
      limit,
      next: page < totalPages ? page + 1 : null,
      prev: page > 1 ? page - 1 : null,
      pages: pagesArray,
    },
    data: contacts,
  });
});

export const deleteContact = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const contact = await Contact.findByIdAndDelete(id);

  if (!contact) {
    return next(
      new ApiErrorResponse("Contact not found or already deleted", 404)
    );
  }

  return res.status(200).json({
    success: true,
    message: "Contact deleted successfully",
  });
});

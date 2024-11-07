import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath);
    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
      asset_id: result.asset_id,
    };
  } catch (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

export const uploadFileToCloudinary = async (files) => {
  try {
    const isMultipleImages = Array.isArray(files);
    const imageFiles = isMultipleImages ? files : [files];
    const uploadPromises = imageFiles.map((file) => uploadImage(file?.path));
    const uploadResults = await Promise.all(uploadPromises);

    return uploadResults;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const deleteFileFromCloudinary = async (files) => {
  const publicIds = Array.isArray(files)
    ? files.map((file) => file.public_id) // Map public_id from the array
    : [files.public_id]; // If single object, wrap public_id in an array

  try {
    // Delete multiple files from Cloudinary using async/await
    const deleteResults = await Promise.all(
      publicIds.map(async (publicId) => {
        try {
          const result = await cloudinary.uploader.destroy(publicId);
          console.log(
            `File with public_id ${publicId} deleted from Cloudinary`
          );
          return { publicId, result }; // Return result for each file
        } catch (error) {
          console.error(
            `Error deleting file with public_id: ${publicId}:`,
            error
          );
          return { publicId, error: error.message || "Deletion failed" }; // Return error for each file
        }
      })
    );
    console.log("Deleted Result: ", deleteResults);
    // Check if there were any errors
    const failedDeletes = deleteResults.filter((res) => res.error); // response when deletion failed = {"result": "", "error": {}}
    if (failedDeletes.length > 0) {
      console.log("Failded deletes Response: ", failedDeletes);
      return {
        success: false,
        message: "Some files failed to delete",
        failedDeletes,
      };
    }

    return { success: true, result: deleteResults };
  } catch (error) {
    console.error("Error during Cloudinary deletion process:", error);
    return {
      success: false,
      message: "Error during Cloudinary deletion",
      error: error.message,
    };
  }
};

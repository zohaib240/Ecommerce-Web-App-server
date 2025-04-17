import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const uploadImageToCloudinary = async (buffer) => {

    try {
        if (!buffer) {
            console.log("No buffer found.");
            return null;
        }

        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { resource_type: "auto" },
                (error, result) => {
                    if (error) {
                        console.error("Error uploading to Cloudinary:", error);
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );

            stream.end(buffer);
        });

        console.log("Upload successful:", uploadResult.url);
        return uploadResult.url;
    } catch (error) {
        console.error("Error in Cloudinary upload:", error);
        return null;
    }
};


//  delete image on cloudinary ------>>>>

const deleteImageFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;  // Delete hone ke baad result return karo, jo ki aap log kar sakte hain
  } catch (error) {
    throw new Error('Error deleting image from Cloudinary: ' + error.message);
  }
};

export { uploadImageToCloudinary , deleteImageFromCloudinary };
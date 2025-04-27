import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'
import path from 'path'

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET// Click 'View API Keys' above to copy your API secret
});

// const uploadOnCloudinary = async (localFilePath) => {
//     try {
//         if (!localFilePath) null;
//         console.log("localFilePath", localFilePath)
//         const response = await cloudinary.uploader.upload(localFilePath, {
//             resource_type: "image",
//             folder: "ecommerce/products"
//             //file has been uploaded successfully
//         })
//         console.log("file is uploaded on cloudinary", response, response.url)
//         fs.unlinkSync(localFilePath)  //remove/unlink the file from public folder when successfully file is stored in cloudinary
//         console.log('unsynced')
//         return response
//     }
//     catch (err) {
//         fs.unlinkSync(localFilePath)   //remove the locally saved temporary file as the upload operation got failed
//     }
// }
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        console.log("localFilePath:", localFilePath);

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "image",
            folder: "ecommerce/products"
        });

        console.log("File uploaded to Cloudinary:", response.url);

        if (fs.existsSync(localFilePath)) {
            fs.unlink(localFilePath, (err) => {
                if (err) console.warn("Error deleting file:", err.message);
                else console.log("File deleted successfully:", localFilePath);
            });
        }

        return response;
    } catch (err) {
        console.error("Upload error:", err);

        if (fs.existsSync(localFilePath)) {
            fs.unlink(localFilePath, (err) => {
                if (err) console.warn("Error deleting file after failure:", err.message);
                else console.log("File deleted after failure:", localFilePath);
            });
        }
    }
};


// const singleUploadOnCloudinary = async (localFilePath) => {
//     try {
//         if (!localFilePath) null;
//         console.log("localFilePath", localFilePath)
//         const response = await cloudinary.uploader.upload(localFilePath.path, {
//             resource_type: "image",
//             folder: "ecommerce/products"
//             //file has been uploaded successfully
//         })
//         console.log("file is uploaded on cloudinary", response, response.url)
//         fs.unlinkSync(localFilePath.path)  //remove/unlink the file from public folder when successfully file is stored in cloudinary
//         console.log('unsynced')
//         return response
//     }
//     catch (err) {
//         fs.unlinkSync(localFilePath.path)   //remove the locally saved temporary file as the upload operation got failed
//     }
// }
const singleUploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath || !localFilePath.path) return null;
        console.log("localFilePath:", localFilePath.path);

        const response = await cloudinary.uploader.upload(localFilePath.path, {
            resource_type: "image",
            folder: "ecommerce/products"
        });

        console.log("File uploaded to Cloudinary:", response.url);

        if (fs.existsSync(localFilePath.path)) {
            fs.unlink(localFilePath.path, (err) => {
                if (err) console.warn("Error deleting file:", err.message);
                else console.log("File deleted successfully:", localFilePath.path);
            });
        }

        return response;
    } catch (err) {
        console.error("Upload error:", err);

        if (fs.existsSync(localFilePath.path)) {
            fs.unlink(localFilePath.path, (err) => {
                if (err) console.warn("Error deleting file after failure:", err.message);
                else console.log("File deleted after failure:", localFilePath.path);
            });
        }
    }
};


const deleteSingleImageFromCloudinary = async (publicId) => {
    try {
        if (!publicId) return 'invalid publicI';
        const result = await cloudinary.uploader.destroy(publicId)
        console.log("Delete result:", result);

        console.log("image deleted from cloudinary", publicId)

        if (result.result === 'ok') {
            console.log("Image successfully deleted from Cloudinary:", publicId);
        }
        else {
            console.log("Error deleting image from Cloudinary:", result);
        }

    } catch (error) {
        console.log('error while deleting image from cloudinary', error)
    }
}


const uploadOnCloudinaryForCategory = async (localFilePath) => {
    try {
        if (!localFilePath) null;
        console.log("localFilePath", localFilePath)
        // const normalizedFilePath = path.normalize(localFilePath).replace(/\\/g, '/');
        // console.log("normalizedFilePath", normalizedFilePath)
        console.log("before response")
        const response = await cloudinary.uploader.upload(localFilePath.path, {
            resource_type: "image",
            folder: "ecommerce/category"
            //file has been uploaded successfully
        })
        console.log("after response")

        console.log("file is uploaded on cloudinary", response, response.url)
        fs.unlinkSync(localFilePath.path)  //remove/unlink the file from public folder when successfully file is stored in cloudinary
        console.log('unsynced')
        return response
    }
    catch (err) {
        fs.unlinkSync(localFilePath.path)   //remove the locally saved temporary file as the upload operation got failed
    }
}



export { uploadOnCloudinary, singleUploadOnCloudinary, deleteSingleImageFromCloudinary, uploadOnCloudinaryForCategory }
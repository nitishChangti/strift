import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/tempFile")
    },
    filename: function (req, file, cb) {
        const now = Date.now(); // Using a timestamp for uniqueness
        const fileExtension = file.originalname.split('.').pop(); // Extract file extension
        const fileName = `${file.fieldname}-${now}.${fileExtension}`;

        console.log("Generated Filename:", fileName);
        cb(null, fileName);
    }
})

export const upload = multer({ storage })
import express from 'express'

const productrouter = express.Router()
//to serve static files 
import path from 'path';
import { fileURLToPath } from 'url';


// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

productrouter.use(express.static(path.join(__dirname, '../../../public/admin')));


import { authorization } from '../../middlewares/roleAuth.js'
import {
    createProduct,
    getAllProducts, getSingleProduct, updateProduct, deleteProduct, searchProducts
} from '../../controllers/admin/product.controllers.js'
import { upload } from '../../middlewares/multer.middlewares.js'

// productrouter.get(['/dashboard/product-lists', '/dashboard/product-edit', '/dashboard/product-create'], (req, res) => {
//     res.sendFile(path.join(__dirname, '../../../public/admin/admin.html'))
// })

// //

productrouter.get(["/dashboard/product-lists", "/dashboard/product-edit", "/dashboard/product-create"], (req, res) => {
    res.sendFile(path.join(__dirname, "../../../public/admin/admin.html"));
})
// //

// ✅ Serve the admin panel frontend for dashboard routes


productrouter.route('/dashboard/createproduct').post(authorization('admin'),
    upload.fields([
        {
            name: "image",
            maxCount: 1,
            minCount: 1
        },
        {
            name: "images",
            maxCount: 10,
            minCount: 1
        }
    ]),
    createProduct)

productrouter.route('/dashboard/getAllProducts').get(authorization('admin'), getAllProducts)

productrouter.route('/admin/getSingleProduct').get(authorization('admin'), getSingleProduct)

productrouter.route('/dashboard/editproduct').post(authorization('admin'),
    upload.fields([
        {
            name: "image",
            maxCount: 1,
            minCount: 1
        },
        {
            name: "images",
            maxCount: 10,
            minCount: 1
        }
    ]),
    updateProduct)

productrouter.route('/dashboard/deleteproduct/:id').delete(authorization('admin'), deleteProduct)

productrouter.route('/admin/searchProducts').get(authorization('admin'), searchProducts)
export default productrouter
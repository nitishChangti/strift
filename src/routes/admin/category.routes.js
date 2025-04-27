import express from 'express'

const categoryrouter = express.Router();
//to serve static files 
import path from 'path';
import { fileURLToPath } from 'url';


// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

categoryrouter.use(express.static(path.join(__dirname, '../../../public/admin')));


import { authorization } from "../../middlewares/roleAuth.js"
categoryrouter.get('/admin/category', async (req, res) => {
    res.send('admin category')
})
import { upload } from '../../middlewares/multer.middlewares.js'

import {
    createCategory, getAllCategory, getSingleCategory, updatecategory, updateSubCategory, deleteSubCategory, deleteCategory, searchCategory, createSubCategory
} from '../../controllers/admin/category.controllers.js';

categoryrouter.route('/dashboard/createcategory').post(authorization('admin'),
    upload.single('image'),
    createCategory
);

categoryrouter.route('/dashboard/updatecategory').post(authorization('admin'),
    upload.single('image'),
    updatecategory
);

categoryrouter.get(['/dashboard/category-lists', '/dashboard/category-edit', '/dashboard/category-create'], (req, res) => {
    res.sendFile(path.join(__dirname, '../../../public/admin/admin.html'))
    // res.sendFile(path.join(__dirname, '../../../public/user/home/header.html'));
    // res.send('dashboard category')
})
categoryrouter.route('/dashboard/updatesubcategory').post(authorization('admin'), updateSubCategory)

//delete sub category
categoryrouter.route('/dashboard/deletesubcategory').delete(authorization('admin'), deleteSubCategory)

// get all category
categoryrouter.route('/dashboard/getallcategory').get(authorization('admin'), getAllCategory)

//create sub category
categoryrouter.route('/dashboard/createsubcategory').post(authorization('admin'), createSubCategory)

categoryrouter.route('/dashboard/deletecategory').delete(authorization('admin'), deleteCategory)

categoryrouter.route('/admin/getsinglecategory/:catId').post(authorization('admin'), getSingleCategory)



categoryrouter.route('/admin/searchcategory').get(authorization('admin'), searchCategory)

//get all category route to existing category in create product form 
categoryrouter.route('/dashboard/getallcategoryforcreateproduct').get(authorization('admin'), getAllCategory)
export default categoryrouter;

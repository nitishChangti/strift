import { asyncHandler } from "../../utils/asyncHandler.js";
import { User } from "../../models/user.models.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiRes.js";
import { Category } from "../../models/category.js";
import mongoose, { Error } from "mongoose";
import { uploadOnCloudinaryForCategory } from '../../utils/cloudinary.js';

const createCategory = asyncHandler(async (req, res) => {
    try {

        console.log('this is  a create controller of create routes')
        console.log('req body of category create', req.body)
        const { categoryName, createdBy, TagId, description } = req.body;
        console.log('categoryName', categoryName)
        console.log('createdBy', createdBy)
        console.log('TagId', TagId)
        console.log('description', description)
        console.log('req of files', req.file)
        const cat = await Category.findOne(
            {
                $or: [
                    { name: req.body.categoryName },
                    { TagId: TagId }
                ]
            }
        );
        console.log('cat', cat)
        if (cat) {
            console.log("cat exists already")
            return res.status(200).json(
                new ApiResponse(
                    200,
                    { cat },
                    'Category Already exists in a Db.'
                )
            )
        }
        const image = req.file ? req.file : null;
        console.log('image before save in cloudinary', image)
        const categoryImage = await uploadOnCloudinaryForCategory(image);
        console.log("productImage after saved in cloudinary", categoryImage)
        console.log(categoryName, createdBy, TagId, description)
        const category = new Category({
            name: categoryName,
            createdBy: createdBy,
            TagId: TagId,
            CategoryThumbnail: categoryImage.url,
            description: description
        })

        const data = await category.save()
        console.log(data, 'category', category)

        return res.status(200).json(new ApiResponse(
            200,
            { data },
            "category created successfully",
            true
        ))
    }
    catch (err) {
        res.status(400).json(new ApiError(
            400,
            'category could not bes created',
            err
        ))
    }
})

const getAllCategory = asyncHandler(async (req, res) => {
    try {
        console.log('retrive all categories')
        // res.send('retrive all categories')

        const category = await Category.find()
        if (category.length === 0) {
            return res.status(404).json({
                status: 404,
                message: 'No categories available'
            });
        }
        return res.status(200).json({
            status: 200,
            message: 'Categories retrieved successfully',
            data: category
        });

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: 500,
            message: 'An error occurred while retrieving categories',
            error: error.message
        });
    }
})


const getSingleCategory = asyncHandler(async (req, res) => {
    try {
        console.log('retrieve single category')
        // console.log(req.params.catId)
        if (!mongoose.Types.ObjectId.isValid(req.params.catId)) {
            return res.status(400).json(new ApiResponse(
                400,
                null,
                "Invalid category ID format",
                false
            ));
        }

        const category = await Category.findById(req.params.catId)
        if (!category) {
            return res.status(404).json(new ApiResponse(
                404,
                null,
                "Category not found",
                false
            ))
        }
        return res.status(200).json(new ApiResponse(
            200,
            category,
            "Category retrieved or found successfully",
            true
        ))
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: 500,
            message: 'An error occurred while retrieving categories',
            error: error.message
        });
    }
})

const updatecategory = asyncHandler(async (req, res) => {
    try {
        console.log('this is  a update controller of update routes')

        console.log('req body of category create', req.body)
        const { categoryName, createdBy, TagId, description } = req.body;
        console.log('categoryName', categoryName)
        console.log('createdBy', createdBy)
        console.log('TagId', TagId)
        console.log('description', description)
        console.log('req of files', req.file, req.body.image)
        const pattern = /^https?:\/\/res\.cloudinary\.com\/.*\.(?:jpg|jpeg|png|gif|bmp|webp)$/i
        if (pattern.test(req.body.image)) {
            console.log('Valid image URL!');
            const updatedCategory = await Category.findOneAndUpdate(
                { $or: [{ name: req.body.categoryName }, { TagId: TagId }] },
                {
                    name: categoryName,
                    createdBy: createdBy,
                    CategoryThumbnail: req.body.image,
                    description: description
                },
                { new: true }
            );

            if (!updatedCategory) {
                return res.status(404).json(new ApiResponse(
                    404,
                    null,
                    'Category not found'
                ));
            }

            const savedCategory = await updatedCategory.save();
            console.log('category is updated in database and saved returned data in savedCategory')
            return res.status(200).json(new ApiResponse(
                200,
                { savedCategory },
                "Category updated successfully",
                true
            ));

        } else {
            console.log('Invalid image URL.');
            const category = await Category.findOne(
                {
                    $or: [
                        { name: req.body.categoryName },
                        { TagId: TagId }
                    ]
                }
            );

            console.log('category', category)
            if (!category) {
                console.log("cat not exists in db")
                return res.status(200).json(
                    new ApiResponse(
                        200,
                        { category },
                        'Category not exists in a Db.'
                    )
                )
            }

            const image = req.file ? req.file : null;
            console.log('image before save in cloudinary', image)
            const categoryImage = await uploadOnCloudinaryForCategory(image);
            console.log("productImage after saved in cloudinary", categoryImage)
            console.log(categoryName, createdBy, TagId, description)

            category.name = categoryName;
            category.createdBy = createdBy;
            category.CategoryThumbnail = categoryImage.url;
            category.description = description;

            const data = await category.save()
            console.log(data, 'category', category)

            return res.status(200).json(new ApiResponse(
                200,
                { data },
                "category updated successfully",
                true
            ))
        }
    }
    catch (err) {
        res.status(400).json(new ApiError(
            400,
            'category could not bes created',
            err
        ))
    }
})

const deleteCategory = asyncHandler(async (req, res) => {
    try {
        console.log('this is a delete category controller ')

        const { catId } = req.body;

        if (!catId) {
            return res.status(400).json(new ApiResponse(
                400,
                null,
                "Category ID is required"
            ));
        }

        const category = await Category.findByIdAndDelete(catId)
        if (!category) {
            return res.status(404).json(new ApiResponse(
                404,
                null,
                "Category not found"
            ));
        }

        return res.status(200).json(new ApiResponse(
            200,
            category,
            `category' deleted successfully`
        ));
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error)
        }
        console.log(error)
        return res.status(500).json({
            status: 500,
            message: 'An error occurred while retrieving categories',
            error: error.message
        });
    }
})

const searchCategory = asyncHandler(async (req, res) => {
    try {
        // console.log(req.query.search)
        const query = `${req.query.search}`
        // console.log("query", query)
        if (!query || query === '') {
            return res.status(400).json(new ApiResponse(
                400,
                null,
                "search query is required"
            ))
        }
        const category = await Category.find({
            $or: [
                { name: { $regex: query, $options: "i" } },
                { "subCategoriesname": { $regex: query, $options: "i" } }
            ]
        })
        if (category.length === 0) {
            return res.status(400).json(new ApiError(
                400,
                null,
                "No Matching Category or subCategory not found"
            ))
        }
        return res.status(200).json(new ApiResponse(
            200,
            category,
            "matching category found successfully "
        ))

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: 500,
            message: 'An error occurred while retrieving categories',
            error: error.message
        });
    }
})


const createSubCategory = asyncHandler(async (req, res) => {
    try {
        console.log('this is a createsubcategory controller of createsubCategory')
        console.log('sub category', req.body)
        const { categoryTagId, subCategoryName, description, TagId } = req.body;
        console.log(typeof categoryTagId)
        const category = await Category.findOne({
            TagId: categoryTagId,
        });
        console.log('category is found')
        if (!category) {
            return res.status(400).json(new ApiError(
                400,
                null,
                "Category not found",
                true
            ))
        }
        const subCategory = category.subCategories.find(subCat => subCat.name === subCategoryName && subCat.TagId === TagId);
        if (subCategory) {
            return res.status(400).json(new ApiError(
                400,
                null,
                "Subcategory already exists",
                true
            ));
        }
        console.log('subcategory is found')
        const createdSubcategory = category.subCategories.push({
            name: subCategoryName,
            TagId: TagId,
            description: description
        });

        const savedCreatedSubCategory = await category.save();

        return res.status(200).json(new ApiResponse(
            200,
            { savedCreatedSubCategory },
            "Subcategory created successfully",
            true
        ));
    }
    catch (error) {
        console.log(error)
        return res.status(500).json(new ApiResponse(
            500,
            null,
            "An error occurred while creating sub category",
            false
        ))
    }
});

const updateSubCategory = asyncHandler(async (req, res) => {
    try {
        console.log(req.body.categoryTagId, req.body)
        let subCatName = req.body.subCategoryName;
        let description = req.body.description;
        let subCatTagId = req.body.TagId;

        let subCatData = {};
        if (subCatName && subCatName.length !== 0) subCatData.name = subCatName
        if (description) subCatData.description = description
        if (subCatTagId) subCatData.TagId = subCatTagId
        console.log(subCatData)
        console.log(subCatName, description, subCatTagId)

        const category = await Category.findOne({
            TagId: req.body.categoryTagId
        })
        if (!category) {
            return res.status(404).json(new ApiResponse(
                404,
                null,
                'Category not found'
            ))
        }
        console.log('category is found')
        // Check if subCategory is provided
        if (subCatTagId && subCatTagId.length != 0) {
            // Check if the subcategory with the given TagId exists
            const existingSubCat = category.subCategories.find(sc => sc.TagId === subCatTagId);
            const existingSubCatIndex = category.subCategories.findIndex(sc => sc.TagId === subCatTagId);
            console.log('exists subcat', existingSubCatIndex, existingSubCat)
            if (existingSubCatIndex != -1) {
                // If the subcategory exists, log that it exists
                console.log('Subcategory already exists:', existingSubCatIndex);

                // Update the existing subcategory properties
                if (subCatName) {
                    category.subCategories[existingSubCatIndex].name = subCatName;
                }
                if (subCatTagId) {
                    category.subCategories[existingSubCatIndex].TagId = subCatTagId;
                }
                if (description) {
                    category.subCategories[existingSubCatIndex].description = description;
                }

                // Add more properties to update as needed

                // Save the updated category
                const updatedCategory = await category.save();
                return res.status(200).json({
                    status: 200,
                    message: 'Subcategory updated successfully',
                    data: updatedCategory,
                });
                // return res.status(200).json(new ApiResponse(200, null, 'Subcategory already exists.'));
            } else {
                // If the subcategory does not exist, add it to the array
                console.log('Subcategory does not exist, adding:');
                category.subCategories.push(subCatData); // Add the new subcategory
                const createdSubCat = await category.save();
                return res.status(200).json({
                    status: 200,
                    message: 'Subcategory updated successfully',
                    data: createdSubCat,
                });
            }
        }
        else {
            console.log('sub category is not provided')
            // If no subcategory is provided, return an error
            return res.status(400).json(new ApiResponse(400, null, 'Subcategory is required'));
        }
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({
            status: 500,
            message: 'An error occurred while retrieving categories',
            error: error.message
        });
    }
})
const deleteSubCategory = asyncHandler(async (req, res) => {
    try {
        console.log('this is delete sub category ')
        const { mainCategoryTagId, subCategoryName, tagId } = req.body;
        console.log(mainCategoryTagId, subCategoryName, tagId)
        const category = await Category.findOne({ TagId: mainCategoryTagId });
        if (!category) {
            return res.status(404).json(new ApiResponse(404, null, 'Category not found'));
        }
        console.log('category is found', category)
        const existingSubCatIndex = category.subCategories.findIndex((subCat) => subCat.name ===
            subCategoryName);
        console.log('subcategory is found', existingSubCatIndex)

        if (existingSubCatIndex !== -1) {
            category.subCategories.splice(existingSubCatIndex, 1);
            const updatedCategory = await category.save();
            console.log('subcategory is deleted')
            return res.status(200).json({
                status: 200,
                message: 'Subcategory deleted successfully',
                data: updatedCategory,
            });
        } else {
            return res.status(404).json(new ApiResponse(404, null, 'Subcategory not found'));
        }

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'An error occurred while deleting subcategory',
            error: error.message
        });
    }
})
export {
    createCategory,
    getAllCategory,
    getSingleCategory,
    updatecategory,
    deleteCategory,
    searchCategory,
    createSubCategory,
    updateSubCategory,
    deleteSubCategory
}        
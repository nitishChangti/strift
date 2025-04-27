import { asyncHandler } from "../../utils/asyncHandler.js";
// import { product } from "../../models/product.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiRes.js";
import mongoose from "mongoose";
import { uploadOnCloudinary, singleUploadOnCloudinary, deleteSingleImageFromCloudinary } from '../../utils/cloudinary.js'
import { product } from '../../models/product.js'
import { Category } from "../../models/category.js";
import { query } from "express";


const createProduct = asyncHandler(async (req, res) => {
    try {
        console.log('this is a create product controller of a create product route')
        let { productName, category, subCategory, TagId, gender, description, selectedSizes, selectedColors, discount, ...productDetails } = req.body;
        // Extract images
        const mainImageFile = req.files?.image ? req.files.image[0] : null;
        const additionalImageFiles = req.files?.images || [];
        console.log('req', req.body, mainImageFile, additionalImageFiles)
        console.log(productName, category, subCategory, gender, description, selectedSizes, selectedColors, discount, TagId, 'product details', productDetails)
        if (subCategory === undefined) {
            subCategory
        }
        // Validate required fields
        if (!productName || !category || !description || !selectedSizes || !selectedColors || !discount || !TagId) {
            return res.status(400).json({ message: "All required fields must be provided." });
        }

        const findCategory = await Category.findOne({ name: category });
        if (!findCategory) {
            return res.status(404).json({ message: "Category not found" });
        }
        let subCategoryData, subCatTagId;
        if (subCategory !== undefined) {
            subCategoryData = findCategory.subCategories.find(subCat => subCat.name === subCategory);
            if (!subCategoryData) {
                return res.status(404).json({ message: "SubCategory not found in the specified category" });
            }
            console.log(findCategory.TagId, subCategoryData)
            subCatTagId = subCategoryData.TagId
        }
        else {
            subCategoryData = null
            subCategory = null
            subCatTagId = null
        }
        if (productDetails === undefined) {
            productDetails = {}
        }
        const findProduct = await product.findOne({
            $or: [
                { productName },
                { TagId: TagId }
            ]
        });
        if (findProduct) {
            return res.status(404).json({ message: 'product already exists in db' })
        }
        console.log(findProduct)
        // // const productImage = await uploadOnCloudinary(image);
        const productImage = await singleUploadOnCloudinary(mainImageFile);
        console.log("productImage after saved in cloudinary", productImage)
        const productImages = await Promise.all(
            additionalImageFiles.map((localFilePath) => uploadOnCloudinary(localFilePath.path))
        );
        console.log('productImages', productImages[0])
        if (!productImage) {
            return res.status(400).json({ message: 'Single image is required.' });
        }

        if (productImages.length === 0) {
            return res.status(400).json({ message: 'At least one additional image is required.' });
        }

        // // Filter out any null or undefined URLs in case some uploads failed
        const validProductImages = productImages.filter((url) => url !== null);
        let mulImages = validProductImages.map(val => val.url)
        console.log('mulImages', mulImages)
        const sizesArray = JSON.parse(selectedSizes);
        const colorsArray = JSON.parse(selectedColors);

        if (!Array.isArray(sizesArray) || !Array.isArray(colorsArray)) {
            return res.status(400).json({ message: "Sizes and colors must be arrays." });
        }

        // Create the variants object
        const variants = {
            size: sizesArray,
            color: colorsArray
        };

        console.log("Variants:", variants);

        // if (!Array.isArray(variants)) {
        //     console.log('variants is not valid')
        //     return res.status(400).json({ message: "Invalid variant data format" });
        // }


        const newProduct = new product({
            name: productName,
            CategoryName: category,
            CategoryTagId: findCategory.TagId,
            subCategoryName: subCategory,
            subCategoryTagId: subCatTagId,
            gender: gender,
            TagId: TagId,
            description: description,
            discount: discount,
            image: productImage.url,
            images: mulImages,
            variants: variants,
            productDetails: productDetails
        });
        await newProduct.save();
        console.log('product is created in db', newProduct)
        if (!newProduct) {
            return res.status(500).json({ message: 'Product creation failed.' });
        }

        return res.status(200).json(new ApiResponse(
            200,
            { product: newProduct },
            "product created successfully",
        ));
    }
    catch (err) {
        if (err instanceof Error) {
            console.error('Error stack trace:', err.stack);  // Log the stack trace for deeper debugging
        }
        return res.status(500).json(new ApiError(
            500,
            {},
            'something went wrong in createproduct api while requesting',
            false,
            err
        ))
    }
})

const getAllProducts = asyncHandler(async (req, res) => {
    try {
        console.log('this is controller of get all products')
        console.log(typeof req.query.skip)
        console.log(typeof req.query.limit)
        const skip = req.query.skip
        const limit = req.query.limit
        if (typeof skip === 'string'
            && typeof limit === 'string'
        ) {
            // skip = parseInt(skip)
            // limit = parseInt(limit)
            console.log('validation is done')
        }
        else {
            console.log('validation failed')
            return res.status(400).json(new ApiResponse(
                400,
                { error: 'Invalid query parameters' },
                "Invalid query parameters",
            ))
        }
        const products = await product.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('-__V')
        if (!products.length > 0) {
            return res.status(404).json(new ApiResponse(
                404,
                { error: 'No products found' },
                "No products found",
            ))
        }
        console.log('products', products)
        const totalProducts = await product.countDocuments()
        console.log('totalProducts', totalProducts)

        const hasMore = skip + limit < totalProducts
        console.log('has more', hasMore)

        return res.status(200).json(new ApiResponse(
            200,
            { products, hasMore },
            "products retrieved successfully",
            'true'
        ))
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error stack trace:', error.stack);  // Log the stack trace for deeper debugging
        }
        return res.status(500).json(new ApiResponse(
            500,
            { error },
            "internal server error",
            'false'
        ))
    }
})

const getSingleProduct = asyncHandler(async (req, res) => {
    const { name, cat, description } = req.query;
    console.log(name, cat, description)
    if ((name && name.length !== 0 && typeof name === 'string')
        || (cat && cat.length !== 0 && typeof cat === 'string')
        || (description && description.length !== 0 && typeof description === 'string')) {
        console.log('validation is done')
    }
    else {
        console.log('validation failed')
    }

    let categoryIds = []; // Array to store matching category IDs
    if (cat && typeof cat === 'string' && cat.length > 0) {
        // Search for categories where `name` matches the query or `subCategories.name` matches
        const matchingCategories = await Category.find({
            $or: [
                { name: { $regex: `\\b${cat}\\b`, $options: 'i' } }, // Main category name
                { "subCategories.name": { $regex: `\\b${cat}\\b`, $options: 'i' } } // Subcategory name
            ]
        });

        // Extract all matching category IDs
        if (matchingCategories.length > 0) {
            matchingCategories.forEach(category => {
                categoryIds.push(category._id); // Add main category ID
                if (category.subCategories && category.subCategories.length > 0) {
                    // Add subcategory IDs that match
                    const matchingSubCategories = category.subCategories.filter(subCat =>
                        new RegExp(`\\b${cat}\\b`, 'i').test(subCat.name)
                    );
                    matchingSubCategories.forEach(subCat => {
                        categoryIds.push(subCat._id); // Add subcategory ID
                    });
                }
            });
        }
    }

    if (categoryIds.length > 0) {
        console.log('Matching category IDs:', categoryIds);
    } else {
        console.log('No matching categories found for the given query.');
    }

    //////////////////////////////////////////////
    let query = { $or: [] }; // Initialize the query object

    // Helper function to generate regex-based conditions for multiple keywords
    const generateRegexQuery = (field, keywords) => {
        return keywords.map(keyword => ({
            [field]: { $regex: `\\b${keyword}\\b`, $options: 'i' } // Case-insensitive match                from this place keyword is replaced with `\\b${keyword}\\b`
        }));
    };

    // Process 'name' if it exists in the request
    if (name && typeof name === 'string' && name.length > 0) {
        const nameKeywords = name.split(' '); // Split the name into keywords
        query.$or.push({ $and: generateRegexQuery('name', nameKeywords) });
    }

    // Process 'description' if it exists in the request
    if (description && typeof description === 'string' && description.length > 0) {
        const descriptionKeywords = description.split(' '); // Split the description into keywords
        query.$or.push({ $and: generateRegexQuery('description', descriptionKeywords) });
    }

    // Add category-based condition to the query if matching categories are found
    if (categoryIds.length > 0) {
        query.$or.push({ Category: { $in: categoryIds } }); // Match any of the category IDs
    }

    // Validate if there are any conditions in the query
    if (query.$or.length === 0) {
        return res.status(400).json(new ApiResponse(
            400,
            { error: "No valid query parameters provided" },
            "Bad request",
            'false'
        ));
    }

    // Perform the query
    const Product = await product.find(query);

    if (!Product) {
        return res.status(404).json(new ApiResponse(
            404,
            { error: "product not found" },
            "product not found",
            'false'
        ))
    }
    console.log("product", Product)
    return res.status(200).json(new ApiResponse(
        200,
        Product,
        "product found",
        'true'
    ));
})


const updateProduct = asyncHandler(async (req, res) => {
    try {

        console.log('this is a update product controller of a update product route')
        const mainImageFile = req.files?.image ? req.files.image[0] : null;
        const additionalImageFiles = req.files?.images || [];
        const { productName,
            category,
            subCategory,
            TagId,
            gender,
            description,
            selectedSizes,
            selectedColors,
            countInStock,
            price,
            discount,
            image,
            images,
            ...productDetails // Use the rest of the fields dynamically
        } = req.body;
        // Extract images
        console.log(image, images)
        console.log(mainImageFile, additionalImageFiles)
        console.log(productName,
            category,
            subCategory,
            gender,
            description,
            selectedSizes,
            selectedColors,
            countInStock,
            price,
            discount,
            TagId,
            'product details', productDetails,
        )
        // Validate required fields
        if (!productName || !category || !description || !selectedSizes || !selectedColors || !countInStock || !price || !discount || !TagId) {
            return res.status(400).json({ message: "All required fields must be provided." });
        }
        const numericCountInStock = Number(countInStock);
        if (isNaN(numericCountInStock) || numericCountInStock < 0) {
            return res.status(400).json({ message: "Invalid countInStock value" });
        }

        const findCategory = await Category.findOne({ name: category });
        if (!findCategory) {
            return res.status(404).json({ message: "Category not found" });
        }

        const subCategoryData = findCategory.subCategories.find(subCat => subCat.name === subCategory);
        if (!subCategoryData) {
            return res.status(404).json({ message: "SubCategory not found in the specified category" });
        }
        // console.log(findCategory.TagId, subCategoryData)

        // console.log(findCategory.TagId, subCategoryData)
        const findProduct = await product.findOne({
            $or: [
                { productName },
                { TagId: TagId }
            ]
        });
        if (!findProduct) {
            return res.status(404).json({ message: 'product already exists in db' })
        }
        // console.log('findProduct is', findProduct, 'image of product is', findProduct.image)



        const sizesArray = JSON.parse(selectedSizes);
        const colorsArray = JSON.parse(selectedColors);

        if (!Array.isArray(sizesArray) || !Array.isArray(colorsArray)) {
            return res.status(400).json({ message: "Sizes and colors must be arrays." });
        }

        // Create the variants object
        const variants = {
            size: sizesArray,
            color: colorsArray
        };

        // console.log("Variants:", variants);

        // console.log(name, Categories, description, price, countInStock, id, image, images)
        let query = {}
        query.name = productName,
            query.description = description,
            query.TagId = TagId,
            query.categoryName = category,
            // query.CategoryTagId
            query.subCategoryName = subCategory,
            // query.subCategoryTagId
            query.gender = gender,
            //     query.image
            // query.images
            query.price = price,
            query.countInStock = countInStock,
            query.discount = discount,
            query.variants = variants,
            query.productDetails = productDetails

        const pattern = /^https?:\/\/res\.cloudinary\.com\/.*\.(?:jpg|jpeg|png|gif|bmp|webp)$/i
        if (pattern.test(req.body.image)) {
            console.log('Valid image URL!');
            query.image = req.body.image
        }
        else {
            console.log('Invalid image URL!');

            console.log(query)

            let image = mainImageFile;
            console.log('image is', mainImageFile)
            if (findProduct.image && image) {
                console.log('findProduct.image and image both available')
                const publicId = findProduct.image?.split('upload/')[1]?.replace(/^[^/]+\//, "").split(".")[0];
                console.log('public id', publicId)
                await deleteSingleImageFromCloudinary(publicId)
                console.log('destroyed image from cloudinary')
                const productImage = await singleUploadOnCloudinary(image);
                // const productImage = await uploadOnCloudinary(image);
                console.log("productImage after saved in cloudinary", productImage)
                query.image = productImage.url
                console.log('image work is done')
            }

        }
        // const pattern = /^https?:\/\/res\.cloudinary\.com\/.*\.(?:jpg|jpeg|png|gif|bmp|webp)$/i
        if (pattern.test(req.body.images)) {
            console.log('Valid image URL!');
            query.images = req.body.images
        }
        else {
            if (findProduct.images && images && images.length > 0) {
                // console.log(findProduct.images?.length)
                for (let i = 0; i < findProduct.images?.length; i++) {
                    var publicId = findProduct.images[i].split('/upload/')[1].split('/')
                    publicId = `${publicId[1]}/${publicId[2]}/${publicId[3]}`.split('.')[0]
                    // console.log('public id multi images', publicId)
                    deleteSingleImageFromCloudinary(publicId)
                    // console.log(`destroyed image from cloudinary ${i}`)
                }
                const productImages = await Promise.all(
                    images.map((localFilePath) => uploadOnCloudinary(localFilePath))
                );
                query.images = productImages.map((img) => img.url);
                console.log('images uploaded', query.images)
            }
        }
        // console.log('product query started', findProduct._id)
        const updateProduct = await product.findOneAndUpdate(
            { name: productName },   // Filter based on product id
            { $set: query },  // Update the fields dynamically
            { new: true }
        )
        console.log("query is ended", query)
        await updateProduct.save()
        if (!updateProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({
            message: "Product updated successfully",
            product: updateProduct
        });

    } catch (error) {
        if (error instanceof Error) {
            console.error('Error stack trace:', error.stack);  // Log the stack trace for deeper debugging
        }
        return res.status(400).json(new ApiResponse(
            400,
            { error: "Invalid request" },
            "Invalid request",
            'false'
        ));
    }
})

const deleteProduct = asyncHandler(async (req, res) => {
    try {
        const id = req.params.id;
        console.log(id)
        // Validate if the ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.log('Invalid product ID format')
            return res.status(400).json({ message: 'Invalid product ID format' });
        }
        else {
            console.log('valid  product ID format')
        }

        const Product = await product.findById(id)
        if (!Product) {
            return res.status(404).json({ message: "Product not found" });
        }
        console.log(Product)
        if (Product.image) {
            console.log('findProduct.image  available')
            const publicId = Product.image?.split('upload/')[1]?.replace(/^[^/]+\//, "").split(".")[0];
            console.log('public id', publicId)
            await deleteSingleImageFromCloudinary(publicId)
            console.log('destroyed image from cloudinary')
            console.log('image work is done')
        }

        if (Product.images) {
            for (let i = 0; i < Product.images?.length; i++) {
                var publicId = Product.images[i].split('/upload/')[1].split('/')
                publicId = `${publicId[1]}/${publicId[2]}/${publicId[3]}`.split('.')[0]
                // console.log('public id multi images', publicId)
                deleteSingleImageFromCloudinary(publicId)
                // console.log(`destroyed image from cloudinary ${i}`)
            }
            console.log('images work is done')
        }

        await Product.deleteOne()
        console.log('done')
        return res.status(200).json(
            new ApiResponse(
                200,
                { message: "Product deleted successfully" },
                "Product deleted successfully",
                'true'
            )
        )
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error stack trace:', error.stack);  // Log the stack trace for deeper debugging
        }
        return res.status(400).json(new ApiResponse(
            400,
            { error: "Invalid request" },
            "Invalid request",
            'false'
        ));
    }
})

const searchProducts = asyncHandler(async (req, res) => {
    try {
        const { name, cat, description } = req.query;
        console.log(name, cat, description)
        if ((name && name.length !== 0 && typeof name === 'string')
            || (cat && cat.length !== 0 && typeof cat === 'string')
            || (description && description.length !== 0 && typeof description === 'string')) {
            console.log('validation is done')
        }
        else {
            console.log('validation failed')
        }

        let categoryIds = []; // Array to store matching category IDs
        if (cat && typeof cat === 'string' && cat.length > 0) {
            // Search for categories where `name` matches the query or `subCategories.name` matches
            const matchingCategories = await Category.find({
                $or: [
                    { name: { $regex: `\\b${cat}\\b`, $options: 'i' } }, // Main category name
                    { "subCategories.name": { $regex: `\\b${cat}\\b`, $options: 'i' } } // Subcategory name
                ]
            });

            // Extract all matching category IDs
            if (matchingCategories.length > 0) {
                matchingCategories.forEach(category => {
                    categoryIds.push(category._id); // Add main category ID
                    if (category.subCategories && category.subCategories.length > 0) {
                        // Add subcategory IDs that match
                        const matchingSubCategories = category.subCategories.filter(subCat =>
                            new RegExp(`\\b${cat}\\b`, 'i').test(subCat.name)
                        );
                        matchingSubCategories.forEach(subCat => {
                            categoryIds.push(subCat._id); // Add subcategory ID
                        });
                    }
                });
            }
        }

        if (categoryIds.length > 0) {
            console.log('Matching category IDs:', categoryIds);
        } else {
            console.log('No matching categories found for the given query.');
        }

        //////////////////////////////////////////////
        let query = { $or: [] }; // Initialize the query object

        // Helper function to generate regex-based conditions for multiple keywords
        const generateRegexQuery = (field, keywords) => {
            return keywords.map(keyword => ({
                [field]: { $regex: `\\b${keyword}\\b`, $options: 'i' } // Case-insensitive match                from this place keyword is replaced with `\\b${keyword}\\b`
            }));
        };

        // Process 'name' if it exists in the request
        if (name && typeof name === 'string' && name.length > 0) {
            const nameKeywords = name.split(' '); // Split the name into keywords
            query.$or.push({ $and: generateRegexQuery('name', nameKeywords) });
        }

        // Process 'description' if it exists in the request
        if (description && typeof description === 'string' && description.length > 0) {
            const descriptionKeywords = description.split(' '); // Split the description into keywords
            query.$or.push({ $and: generateRegexQuery('description', descriptionKeywords) });
        }

        // Add category-based condition to the query if matching categories are found
        if (categoryIds.length > 0) {
            query.$or.push({ Category: { $in: categoryIds } }); // Match any of the category IDs
        }

        // Validate if there are any conditions in the query
        if (query.$or.length === 0) {
            return res.status(400).json(new ApiResponse(
                400,
                { error: "No valid query parameters provided" },
                "Bad request",
                'false'
            ));
        }

        // Perform the query
        const Product = await product.find(query);

        if (!Product) {
            return res.status(404).json(new ApiResponse(
                404,
                { error: "product not found" },
                "product not found",
                'false'
            ))
        }
        console.log("product", Product)
        return res.status(200).json(new ApiResponse(
            200,
            Product,
            "product found",
            'true'
        ));
    } catch (error) {
        return res.status(400).json(new ApiResponse(
            400,
            { error: "Invalid request" },
            "Invalid request",
            'false'
        ));
    }
})

export {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
}
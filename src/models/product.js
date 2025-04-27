import mongoose, { Mongoose, Schema } from "mongoose";
import { Category } from "./category.js";

const productSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true
        },
        TagId: {
            type: String,
            required: true,
            trim: true
        },
        CategoryName: {
            type: String,
            required: true
        },
        CategoryTagId: {
            type: String,
            required: true,
            trim: true,
        },
        subCategoryName: {
            type: String,
            // required: true,
            default: null
        },
        subCategoryTagId: {
            type: String,
            // required: true,
            trim: true,
            default: null
        },
        gender: {
            type: String,
            required: true,
            enum: ['Male', 'Female', 'Unisex']
        },
        image: {
            type: String,
            required: true
        },
        images: [{
            type: String,
            required: true
        }],
        discount: {
            type: Number,
            required: true
        },
        ratings: {
            type: Number,
            min: 0,
            max: 5
        },
        reviews: [
            {
                userId: {
                    type: Schema.Types.ObjectId,
                    ref: 'User'
                },
                comment: {
                    type: String
                },
                ratings: {
                    type: Number,
                    min: 0,
                    max: 5
                },
                date: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        variants: {
            size: [{
                type: String,
                required: true
            }],   // ✅ Accepts an array of sizes
            color: [{
                name: {
                    type: String,
                    required: true
                },
                price: {
                    type: Number,
                    required: true
                },
                stock: {
                    type: Number,
                    required: true,
                    min: 0
                }
            }]
        }
        ,
        productDetails: {
            type: Schema.Types.Mixed // Allows dynamic key-value pairs
        }
    },
    {
        timestamps: true
    }
);



const product = mongoose.model("product", productSchema)

export { product }
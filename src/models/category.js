import mongoose, { Mongoose, Schema } from "mongoose";

const subCategorySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    TagId: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
})
const subCategory = mongoose.model('SubCategory', subCategorySchema)

const categorySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    createdBy: {
        type: String,
        required: true
    },
    TagId: {
        type: String,
        required: true
    },
    CategoryThumbnail: {
        type: String,
        required: true
    },
    // subCategories: [
    //     {
    //         type: Schema.Types.ObjectId,
    //         ref: 'subCategory'
    //     }
    // ],
    subCategories: [
        {
            name: {
                type: String,
                // required: true
            },
            TagId: {
                type: String,
                // required: true
            },
            description: {
                type: String
            }
        }
    ]
    ,
    description: {
        type: String,
        required: true
    },
},
    { timestamps: true }
)

const Category = mongoose.model("Category", categorySchema)

export { Category }
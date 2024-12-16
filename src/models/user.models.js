import mongoose, { Schema, mongo } from "mongoose";

const addressesSchema = new Schema({
    name: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
        default: ""
    },
    address: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        default: ""
    },
    city: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        default: ""
    },
    state: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        default: ""
    },
    pincode: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        default: ""
    },
    phoneNumber: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
        default: ""
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true })

const Address = mongoose.model('Address', addressesSchema)

const userOtpSchema = new Schema(
    {
        phone: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            default: "unknown",
            index: true,
            validate: [/^\+[0-9]{1,3}[0-9\s.-]{7,15}$/, 'Invalid phone number']
        },
        otp:
        {
            otpCode: {
                type: String,
                required: true,
                lowercase: true,
                trim: true,
                default: ""
            },
            otpGeneratedTime: {
                type: Date,
                default: null
            },
            otpExpirationTime: {
                type: Date,
                default: null
            }
        }
    },
    { timestamps: true })

const UserOtp = mongoose.model('UserOtp', userOtpSchema)


const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        default: "unknown"
    },
    lastName: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        default: "unknown"
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        default: "unknown",
        index: true,
        // validate: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email address']
    },
    gender: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        default: "unknown"
    },
    phone: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        default: "unknown",
        index: true,
        validate: [/^\+[0-9]{1,3}[0-9\s.-]{7,15}$/, 'Invalid phone number']
    },
    otp: [
        {
            otpCode: {
                type: String,
                required: true,
                lowercase: true,
                trim: true,
                default: ""
            },
            otpGeneratedTime: {
                type: Date,
                default: null
            },
            otpExpirationTime: {
                type: Date,
                default: null
            }
        }
    ],
    // otpAndPhone: [
    //     {
    //         type: Schema.Types.ObjectId,
    //         ref: UserOtp,

    //     }
    // ],
    updatedAt: {
        type: Date,
        default: Date.now
    },
    role: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        default: "user"
    },
    refreshToken: {
        type: String,    //cloudinary url
    },
    address: [
        {
            type: Schema.Types.ObjectId,
            ref: Address
        }
    ],

}, { timestamps: true })


const User = mongoose.model('User', userSchema)


export { User }
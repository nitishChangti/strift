import { ApiError } from "../utils/apiError.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from '../models/user.models.js';
import Jwt from "jsonwebtoken";


const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        console.log('access token available')
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "")
        console.log('token is ', token)
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
        console.log('valid token')
        const decodedToken = Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?.userId).select(
            "-password -refreshToken"
        )
        console.log(decodedToken, user)
        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }
        req.user = user;
        console.log(req.user)
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token")
    }
})

export { verifyJWT }
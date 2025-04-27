import { User } from '../models/user.models.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import Jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js"


const authorization = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "").trim();
            let correctToken = token.replace('Bearer ', '')
            console.log('token is', correctToken)
            // console.log('t', t)
            if (!token) {
                res.status(400).json(
                    new ApiError(401, "Unauthorized request")
                )
            }
            console.log('token is found')
            console.log("process", process.env.ACCESS_TOKEN_SECRET)
            const decodedToken = Jwt.verify(correctToken, process.env.ACCESS_TOKEN_SECRET)
            console.log('decoded token is', decodedToken)
            const user = await User.findById(decodedToken?.userId).select(
                "-otp -refreshToken"
            )
            console.log('authenticated to use this route')
            console.log(user)
            if (!user) {
                res.status(400).json(
                    new ApiError(401, "Invalid Access Token")
                )
            }
            req.user = user;
            console.log('here authorization is done based on roles prvoided access to the route')
            if (!allowedRoles.includes(user.role)) {
                res.status(400).json(

                    new ApiError(403, "Forbidden")
                )
            }
            next()
        } catch (error) {
            console.error(error)
            //         return res.status(500).json({ message: 'Internal server error' }); // Handle server errors
        }
    }
}
export { authorization }
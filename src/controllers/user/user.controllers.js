import { asyncHandler } from '../../utils/asyncHandler.js'
import { User, Address } from '../../models/user.models.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiRes.js';
import otpGenerator from 'otp-generator';
import { body, validationResult } from 'express-validator';
import Jwt from "jsonwebtoken";
import { product } from '../../models/product.js';

import mongoose, { Schema, mongo } from "mongoose";

import validateMobileNumber from '../../middlewares/validateMobileNumber.middlewares.js';
import { otpSender, registerOtpSender } from '../../utils/otpSend.user.js';
import session from 'express-session';
import moment from 'moment-timezone';
import { stat } from 'fs';
import { errorMonitor } from 'events';




const generateAccessAndRefreshTokens = async (userId) => {
    try {
        console.log(`user id is : ${userId}`)
        const user = await User.findById(userId);

        console.log(`user  is : ${user}`)
        const accessToken = Jwt.sign({ userId: user._id, role: user.role, phone: user.phone }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '1d',
        });
        const refreshToken = Jwt.sign({ userId: user._id, role: user.role, phone: user.phone }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: '7d',
        });
        console.log('accessToken', accessToken)
        console.log('refreshToken', refreshToken)
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    }
    catch (err) {
        throw new ApiError(500, "Something went wrong while generating refresh and access tokens")
    }
}


const userLogin = asyncHandler(async (req, res, next) => {
    // if(req.query==='/'){
    // take  the user input(mobile number) from req
    // validate the mobile number
    //  check if the user exists in the database
    //  if the user exists, then send the otp  to the user and store in database
    //  if the user does not exist, then send a message saying user does not exist and render to signup route
    // }
    // else{
    // redirect to /account/register?sigup=TRUE
    // }

    console.log(req.query.ret === "/");

    const ret = req.query.ret === "/"
    const phone = req.body.phone;
    const otp = req.body.otp;
    console.log(ret)
    if (ret === true) {
        if (!otp) {
            const result = await validateMobileNumber[0].run(req);
            if (phone.startsWith("+") && result.errors.length === 0) {
                console.log('validation is success');
                // return 'done'
                new ApiResponse(200, '', 'phone number is valid', true)
                // res.status(201).json(new ApiResponse(200, '', 'phone number is valid', true))
            }
            else {
                //             // console.log(false);
                //             console.log(result.errors);
                throw new ApiError(400, 'mobile number  is invalid ')
            }
            const user = await User.findOne({ phone: phone })
            if (user) {
                // console.log(user)   if user exists it gives userOtp data
                console.log('user is exists')
                req.session.mobileNumber = user.phone;   //here changed
                await req.session.save()
                console.log(`user mobilenumber is ${req.session.mobileNumber}`)       //here changed
                const loginOtpSender = await otpSender(user.phone)
                console.log(loginOtpSender)
                console.log('session', req.session.mobileNumber)
            }
            else {
                console.log('user doesnot exists')
                return res.json({ redirect: '/account?signup=true' });
                //             // res.redirect('/account/login?signup=true')
            }
        }
        else {
            console.log('login otp verification section')
            const phone = req.session.mobileNumber;               //here changed
            //         // const userOtpRequestCurrentTime = req.body.currentTime
            const userOtpRequestCurrentTime = moment(req.body.currentTime).tz('UTC');
            console.log(otp, userOtpRequestCurrentTime, req.session.mobileNumber)          //here changed
            const user = await User.findOne({ phone: phone });

            console.log(user, user.otp[0].otpCode, 'otpcode')
            if (user) {
                const otpExpirationTime = moment(user.otp[0].otpExpirationTime).tz('UTC'); // assume UTC timezone
                console.log(otpExpirationTime > userOtpRequestCurrentTime)
                console.log(otpExpirationTime, '\n', userOtpRequestCurrentTime)
                if (user.otp[0].otpCode === otp && otpExpirationTime > userOtpRequestCurrentTime) {
                    console.log('success');
                    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)
                    const loggedInUser = await User.findById(user._id).select("-refreshToken -otp")
                    const options = {
                        httpOnly: true,
                        secure: true
                    }
                    if (user.role === 'user') {

                        return res.status(200)
                            .cookie("accessToken", accessToken, options)
                            .cookie("refreshToken", refreshToken, options)
                            .json(
                                new ApiResponse(
                                    200,
                                    {
                                        user: user, accessToken, refreshToken, redirect: '/home',
                                    },
                                    "User logged in successfully",
                                )
                            )
                    }
                    else {
                        return res.status(200)
                            .cookie("accessToken", accessToken, options)
                            .cookie("refreshToken", refreshToken, options)
                            .json(
                                new ApiResponse(
                                    200,
                                    {
                                        user: user, accessToken, refreshToken, redirect: '/admin'
                                    },
                                    "Admin logged in successfully",

                                )
                            )
                    }
                }
                else {
                    // throw new ApiError(404, 'Login is not successfull or invalid credentials and otp is expired')
                    return res.status(400).json(400, 'login is not successfull or invalid credentials')

                }
            }
            else {
                return res.status(404).json({ error: 'User  not found' });
            }
        }

    }
    else {
        res.json({ redirect: '/account?signup=true' });
    }
})

const userRegister = asyncHandler(async (req, res) => {
    //register controller part start from here
    console.log('register controller part start from here')
    console.log(req.query, req.body)
    const signup = req.query.signup
    const phone = req.body.phone
    const otp = req.body.otp
    if (signup === 'true') {
        if (!otp) {
            const result = await validateMobileNumber[0].run(req);
            console.log(result)
            if (phone.startsWith("+") && result.errors.length === 0) {
                console.log('validation is success');
                // res.status(201).json(new ApiResponse(200, '', 'phone number is valid', true))
                new ApiResponse(200, '', 'phone number is valid', true)  // this response is not going back to frontend
            }
            else {
                console.log(false);
                console.log(result.errors);
                throw new ApiError(500, 'mobile number  is invalid ')  // this response is not goinh back to frontend
            }
            // const user = await UserOtp.findOne({ phone: phone })
            const user1 = await User.findOne({ phone: phone })  //
            console.log(user1)
            if (!user1) {
                console.log('user  is not exist , new user')
                req.session.tempMobileNumber = phone;
                await req.session.save();
                const regOtpSender = await registerOtpSender(req, phone);
                console.log(regOtpSender)
                console.log('session:-', req.session.tempMobileNumber)
            }
            else {
                console.log('user is already exist')
                // res.send(400).json(new ApiResponse(400, '', 'user already exists with this mobile number ', false))
                res.json({ redirect: '/account?ret = /' })
            }
        }
        else {
            console.log('registration otp verification section')
            const phone = req.session.tempMobileNumber;
            const userOtpRequestCurrentTime = moment(req.body.currentTime).tz('UTC');
            console.log(userOtpRequestCurrentTime, req.session)          //here changed    
            console.log(otp, req.session.tempOtp)
            const otpExpirationTime = moment(req.session.tempOtpExpirationTime).tz('UTC'); // assume UTC timezone
            console.log(otpExpirationTime > userOtpRequestCurrentTime)
            console.log(otpExpirationTime, '\n', userOtpRequestCurrentTime)

            if (req.session.tempOtp === otp && otpExpirationTime > userOtpRequestCurrentTime) {
                console.log('success otp is verified in registration');
                req.session.isLoggerIn = true;
                const newUserOtp = await User.create({
                    phone: phone,
                    otp: {
                        otpCode: otp,
                        otpGeneratedTime: req.session.tempOtpGeneratedTime,
                        otpExpirationTime: req.session.tempOtpExpirationTime
                    }
                })
                //                 req.session.userId = newUserOtp._id;
                //                 console.log(newUserOtp)
                //                 // res.json(new ApiResponse(200, '', 'registration is successfull', true))
                //                 // res.redirect('/home')
                res.json({ redirect: '/home' });
            }
            else {
                res.status(400).json(404, 'registration is not successfull or invalid credentials')
            }
        }
    }
})


const UserLogout = asyncHandler(async (req, res) => {
    console.log(1)
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        }
    )
    console.log(11)

    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ err: 'failed to logout, please try again.' })
        }
        const options = {
            httpOnly: true,
            secure: true
        }
        //clear cookies
        res.clearCookie("accessToken", options);
        res.clearCookie("refreshToken", options);
        console.log(111)

        //REDirect the user to the homepage or login page
        return res.status(200).json(new ApiResponse(200, { redirect: '/home' }, "User logged outs", true))
    }
    )
})

const resendOtp = asyncHandler(async (req, res) => {
    // console.log(req.session);
    const phone = req.session.mobileNumber       //here changed
    console.log(phone)
    const user = await User.findOne({ phone: phone })
    // console.log(user)

    if (user) {
        const userOtpRequestCurrentTime = moment(req.body.currentTime).tz('UTC');
        const otpExpirationTime = moment(user.otp[0].otpExpirationTime).tz('UTC'); // assume UTC timezone

        if (otpExpirationTime > userOtpRequestCurrentTime) {
            console.log(`otp is not expired`)
        }
        else {
            console.log(user.phone)
            console.log('otp is expired', otpSender(user.phone))
        }
    } else {
        const phone = req.session.tempMobileNumber
        console.log('user  is not found', req.session.tempMobileNumber)
        console.log(registerOtpSender(req, phone))

    }
})

const userProfile = asyncHandler(async (req, res) => {
    try {
        // logic is
        // 1.  based on authorization i will check is user is logged or not also i got user detail(token)
        // 2. i will check data coming or not in req obj if it comes  using found user(token) i will apply on that query and send response
        // 3. if data didn't come i will find user using token then send data response backs
        console.log('user profile', req.user)
        console.log('req body is ', req.body)
        const { firstName, lastName, gender, email, phone } = req.body;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        const query = {}
        if (firstName && typeof firstName === 'string' && firstName.length > 0) query.firstName = firstName
        if (lastName && typeof lastName === 'string' && lastName.length > 0) query.lastName = lastName
        if (gender && typeof gender === 'string' && gender.length > 0) query.gender = gender
        if (email && typeof email === 'string' && email.length > 0 && emailRegex.test(email)) {
            query.email = email;
            console.log("Email is valid and assigned to query:", query.email);
        } else {
            console.log("Invalid email or email does not match the gmail.com pattern.");
        }
        if (phone && typeof phone === 'string' && phone.length > 0) query.phone = phone
        console.log('before find', query)
        const user = await User.findOneAndUpdate(
            { _id: req.user._id },
            { $set: query },
            { new: true }
        ).select('-otp -__v -updatedAt -createdAt -role -refreshToken -address ')  // this is used because we don't want to send otp and other data in response
        console.log('after find', user)
        if (!user) {
            return res.status(404).json(
                new ApiResponse(
                    404,
                    null,
                    'User not found',
                    false
                )
            )
        }
        console.log('before return')

        return res.status(200).json(new ApiResponse(
            200,
            user,
            'User profile updated successfully',
            true
        ))

    } catch (error) {
        console.log('error', error)
        // Send response only once in case of error
        if (!res.headersSent) {
            return res.status(500).json(new ApiResponse(
                500,
                null,
                'Internal server error',
                false
            ));
        }

    }
})

const getUserProfileData = asyncHandler(async (req, res) => {
    try {
        console.log('before find', req.user)
        const user = await User.findOne({ _id: req.user._id }).select('-otp -__v -updatedAt -createdAt -role -refreshToken -address ')
        console.log('after find', user)
        if (!user) {
            return res.status(404).json(
                new ApiResponse(
                    404,
                    'User not found',
                    null,
                    false
                )
            )
        }
        return res.status(200).json(new ApiResponse(
            200,
            { user },
            'User profile data',
            true
        ))

    } catch (error) {
        console.log('error', error)
        // Send response only once in case of error
        if (!res.headersSent) {
            return res.status(500).json(new ApiResponse(
                500,
                'Internal server error',
                null,
                false
            ));
        }
    }
})

const userProfileAddress = asyncHandler(async (req, res) => {
    try {
        console.log('Request Body:', req.body);
        const { name, phoneNumber, address, city, state, pinCode, locality, landmark, altNumber, addressType } = req.body;
        console.log('Extracted Fields:', { name, phoneNumber, address, city, state, pinCode, locality, landmark, altNumber, addressType });

        let query = {};
        if (name && typeof name === 'string' && name.length > 0 && name != null) query.name = name;
        if (phoneNumber && typeof phoneNumber === 'string' && phoneNumber.length > 0 && /^\+[0-9]{1,3}[0-9\s.-]{7,15}$/.test(phoneNumber) && phoneNumber != null) query.phoneNumber = phoneNumber;
        if (address && typeof address === 'string' && address.length > 0 && address != null) {
            query.address = address;
            console.log('Address Field:', address);
        }
        if (city && typeof city === 'string' && city.length > 0 && city != null) query.city = city;
        if (state && typeof state === 'string' && state.length > 0 && state != null) query.state = state;
        if (pinCode && typeof pinCode === 'string' && pinCode.length > 0 && pinCode != null) {
            query.pinCode = pinCode;
            console.log('PinCode Field:', pinCode);
        }
        if (locality && typeof locality === 'string' && locality.length > 0 && locality != null) query.locality = locality;
        if (landmark && typeof landmark === 'string' && landmark.length > 0 && landmark != null) query.landmark = landmark;
        if (altNumber && typeof altNumber === 'string' && altNumber.length > 0 && altNumber != null) query.altNumber = altNumber;
        if (addressType && typeof addressType === 'string' && addressType.length > 0 && addressType != null) query.addressType = addressType;

        console.log('Query Object:', query);

        // Find the existing user by userId and add the new address to their address array
        const user = await User.findById(req.user._id);
        console.log('User Found:', user);

        if (!user) {
            return res.status(404).json(
                new ApiResponse(
                    404,
                    'User not found',
                    null,
                    false
                )
            );
        }

        console.log('Address Data Before Push:', user.address);

        // Add the new address to the address array
        user.address.push({
            ...query,
            updatedAt: new Date() // Add timestamp for the new address
        });
        console.log('Address Data After Push:', user.address);

        // Save the updated user document
        await user.save();
        console.log('User Saved:', user);

        return res.status(200).json(new ApiResponse(
            200,
            { user },
            'User address added successfully',
            true
        ));

    } catch (error) {
        console.error('Error:', error);

        // Check if it's a mongoose validation error
        if (error instanceof Error) {
            return res.status(400).json(new ApiResponse(
                400,
                error.message,
                null,
                false
            ));
        }

        // For other errors, send the error message
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message,  // Add the error message for easier debugging
            stack: error.stack,    // Log stack trace for debugging
        });
    }
});



const getUserAddress = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
        console.log(user.address)
        if (!user) {
            return res.status(404).json(new ApiResponse(
                404,
                'User not found',
                null,
            ))
        }
        const userAddress = user.address
        return res.status(200).json(new ApiResponse(
            200,
            { userAddress },
            'User address retrieved successfully',
            true
        ))

    } catch (error) {
        return res.status(500).json(new ApiResponse(
            500,
            'Internal server error',
            error,
        ))
    }
})

const delteUserAddress = asyncHandler(async (req, res) => {
    try {
        const index = req.query.index
        console.log('index', index)
        const user = await User.findById(req.user._id)
        console.log(user.address)
        if (!user) {
            return res.status(404).json(new ApiResponse(
                404,
                'User not found',
                null,
            ))
        }

        if (!Array.isArray(user.address) || index < 0 || index >= user.address.length) {
            return res.status(400).json(new ApiResponse(
                400,
                'Invalid index',
                null,
            ));
        }
        const removedAddress = user.address.splice(index, 1)[0];
        console.log('index address', removedAddress)
        await user.save()
        return res.status(200).json(new ApiResponse(
            200,
            { removedAddress },
            'User address deleted successfully',
            true
        ))
    } catch (error) {
        return res.status(500).json(new ApiResponse(
            500,
            'Internal server error',
            error.message,
        ))
    }
})


function parseSearchQuery(queryString) {
    const searchParams = {
        searchKeywords: queryString,  // Default to the full query string for text search
        maxPrice: null,
        minPrice: null,
    };

    // Check if the query contains price filters (like "under 2000")
    const priceMatch = queryString.match(/under\s*(\d+)/i);
    if (priceMatch) {
        searchParams.maxPrice = parseInt(priceMatch[1], 10); // Extract price
    }

    // Check if the query contains a range like "between 1000 and 2000"
    const priceRangeMatch = queryString.match(/between\s*(\d+)\s*and\s*(\d+)/i);
    if (priceRangeMatch) {
        searchParams.minPrice = parseInt(priceRangeMatch[1], 10);
        searchParams.maxPrice = parseInt(priceRangeMatch[2], 10);
    }

    return searchParams;
}

const searchForProductByUser = asyncHandler(async (req, res) => {
    try {
        const searchQuery = req.query.searchQuery;
        console.log(searchQuery)
        // Parse the search query for price filters (under, between, etc.)
        const { searchKeywords, maxPrice, minPrice } = parseSearchQuery(searchQuery);

        // Build the MongoDB query object
        const queryObj = {};
        // If there are search keywords, perform a text search
        if (searchKeywords) {
            queryObj.$text = { $search: searchKeywords };
        }
        // Apply price filters (if any)
        if (maxPrice) {
            queryObj.price = { $lte: maxPrice };  // e.g., under 2000
        }
        if (minPrice && maxPrice) {
            queryObj.price = { $gte: minPrice, $lte: maxPrice };  // e.g., between 1000 and 2000
        }
        // Fetch the filtered products from MongoDB
        const products = await product.find(queryObj);
        if (products.length === 0) {
            return res.status(404).json({ error: 'No products found matching your query.' });
        }


        console.log("products", products)
        // res.send('done')
        // Return the products to the frontend
        return res.status(200).json(
            new ApiResponse(
                200,
                { products },
                "Products found",
                true
            )
        )
    }
    catch (error) {
        return res.status(500).json({ error: 'Error fetching products' });
    }
})
const searchProductDetail = asyncHandler(async (req, res) => {
    try {
        const id = req.body.productId;
        console.log("id", id)
        const products = await product.findById(id);
        if (!products) {
            return res.status(404).json({ error: 'Product not found' });
        }
        console.log(products)

        return res.status(200).json(
            new ApiResponse(
                200,
                { products },
                "Product found",
                true
            )
        )
    } catch (error) {
        return res.status(500).json({ error: 'Error fetching product details' });
    }
})
const sizeMapping = {
    "small": "S",
    "medium": "M",
    "large": "L",
    "extra large": "XL",
    "extra extra large": "XXL",
    "xxl": "XXL",
    "xl": "XL",
    "l": "L",
    "m": "M",
    "s": "S"
};

const productSuggestionsForUser = asyncHandler(async (req, res) => {
    try {
        console.log('🔍 Product suggestions for user');
        const { query } = req.query;
        console.log("👉 Search Query:", query);

        if (!query) {
            return res.status(400).json({ error: '❌ Search query is required' });
        }

        // Extract words and numbers separately
        const words = query.match(/[a-zA-Z]+/g) || [];  // Extract words (keywords)
        const numbers = query.match(/\d+/g) || [];      // Extract numbers (price constraints)

        let searchKeywords = [];
        let sizes = [];
        let minPrice = null, maxPrice = null;

        // Process extracted words
        words.forEach(word => {
            let lowerWord = word.toLowerCase();
            if (sizeMapping[lowerWord]) {
                sizes.push(sizeMapping[lowerWord]); // Convert text size to stored format
            } else {
                searchKeywords.push(word);
            }
        });

        // Identify price filters
        if (query.includes("under") && numbers.length > 0) {
            maxPrice = parseInt(numbers[0]);
        } else if (query.includes("between") && numbers.length >= 2) {
            minPrice = parseInt(numbers[0]);
            maxPrice = parseInt(numbers[1]);
        }

        console.log("🔤 Extracted Keywords:", searchKeywords);
        console.log("📏 Extracted Sizes:", sizes);
        console.log("💰 Price Range:", minPrice, "-", maxPrice);

        // Build MongoDB Query
        let searchQuery = { $or: [] };

        // Add keyword-based search in multiple fields
        if (searchKeywords.length > 0) {
            searchQuery.$or = searchKeywords.flatMap(term => [
                { name: { $regex: term, $options: 'i' } },
                { description: { $regex: term, $options: 'i' } },
                { CategoryName: { $regex: term, $options: 'i' } },
                { color: { $regex: term, $options: 'i' } }
            ]);
        }

        // Add size filtering
        if (sizes.length > 0) {
            searchQuery.size = { $in: sizes }; // Match sizes in the stored format
        }

        // Apply price filter
        if (!isNaN(minPrice) || !isNaN(maxPrice)) {
            searchQuery.price = {};
            if (!isNaN(minPrice)) searchQuery.price.$gte = minPrice;
            if (!isNaN(maxPrice)) searchQuery.price.$lte = maxPrice;
        }

        console.log("📌 MongoDB Query:", JSON.stringify(searchQuery, null, 2));

        // Execute MongoDB search
        let suggestions = await product.find(searchQuery)
            .select('name CategoryName description price color size')
            .limit(10);
        let completeproductData = await product.find(searchQuery)
            .limit(10);
        console.log("✅ Results Found:", suggestions);

        return res.status(200).json(new ApiResponse(
            200,
            { suggestions, completeproductData },
            "Search results found",
            true
        ));

    } catch (error) {
        console.error("❌ Error fetching product details:", error);
        return res.status(500).json({ error: 'Server error: Unable to fetch product details' });
    }
});

const productwishlist = asyncHandler(async (req, res) => {
    try {
        console.log("✅ This is a wishlist controller of user");

        // Extract TagID from request
        const { productTagId } = req.body;

        // Find the user from the database
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json(new ApiResponse(
                404,
                'User not found',
                null,
                false
            ));
        }

        // Check if product already exists in wishlist
        const index = user.wishlist.findIndex(item => item.tagId === productTagId);

        // ✅ If product exists, REMOVE it from wishlist
        if (index !== -1) {
            user.wishlist.splice(index, 1);
            await user.save();
            console.log("❌ Product removed from wishlist");

            return res.status(200).json(new ApiResponse(
                200,
                { wishlist: user.wishlist },
                'Product removed from wishlist successfully',
                true
            ));
        }

        // ✅ If product does not exist, ADD it to wishlist
        user.wishlist.push({ tagId: productTagId });
        await user.save();
        console.log("✅ Product added to wishlist");

        return res.status(200).json(new ApiResponse(
            200,
            { wishlist: user.wishlist },
            'Product added to wishlist successfully',
            true
        ));
    } catch (error) {
        console.error("❌ Error in wishlist controller:", error);
        return res.status(500).json(new ApiResponse(
            500,
            'Internal server error',
            null,
            false
        ));
    }
});

// ✅ Handle Wishlist Fetch for Product Page
const getUserWishlist = asyncHandler(async (req, res) => {
    try {
        console.log("✅ Fetching user's wishlist for product page");

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json(new ApiResponse(
                404,
                'User not found',
                null,
                false
            ));
        }

        // Return only the wishlist TagIDs
        const wishlistTagIds = user.wishlist.map(item => item.tagId);

        return res.status(200).json(new ApiResponse(
            200,
            { wishlistTagIds },
            'Wishlist fetched successfully for product page',
            true
        ));
    } catch (error) {
        console.error("❌ Error in fetching wishlist:", error);
        return res.status(500).json(new ApiResponse(
            500,
            'Internal server error',
            null,
            false
        ));
    }
});

const AddToCartForUser = asyncHandler(async (req, res) => {
    try {
        console.log("✅ Adding product to cart for user:", req.user._id);
        console.log("Request body:", req.body);

        // Extract product details from request
        const { Name, TagId, color, price, size, productId, quantity, image } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json(new ApiResponse(
                404,
                null,
                'User not found',
                false
            ));
        }

        // Check if the product already exists in the cart with the same attributes
        const existingProduct = user.cart.find(item =>
            item.productId.equals(productId) && // Use .equals() if ObjectId
            item.productName.toLowerCase() === Name.toLowerCase() &&
            item.TagId.toLowerCase() === TagId.toLowerCase() &&
            item.price === price &&
            item.color.toLowerCase() === color.toLowerCase() &&
            item.size.toLowerCase() === size.toLowerCase()
        );

        if (existingProduct) {
            console.log("❌ Product already exists in the cart with the same data");
            return res.status(400).json(new ApiResponse(
                400,
                null,
                'Product already exists in the cart with the same data',
                false
            ));
        }

        // Add the product to the cart
        user.cart.push({
            productId,
            productName: Name,
            price,
            size,
            quantity,
            color,
            TagId,
            image
        });

        await user.save();

        console.log("✅ Product added to cart for user:", req.user._id);
        console.log("Updated cart:", user.cart);

        return res.status(200).json(new ApiResponse(
            200,
            null,
            'Product added to cart successfully',
            true
        ));

    } catch (error) {
        console.error("❌ Error in adding to cart:", error);
        return res.status(500).json(new ApiResponse(
            500,
            null,
            'Internal server error',
            false
        ));
    }
});

const syncCartForUser = asyncHandler(async (req, res) => {
    console.log("✅ Syncing cart for user:", req.user._id);

    const newCartItems = req.body.cart;
    console.log("New cart items:", newCartItems);
    const userId = req.user._id;

    // ✅ Validate request body
    if (!Array.isArray(newCartItems)) {
        return res.status(400).json(new ApiResponse(
            400,
            null,
            'Invalid cart format: Expected an array.',
            false
        ));
    }

    try {
        // ✅ Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json(new ApiResponse(
                404,
                null,
                'User not found',
                false
            ));
        }

        // ✅ Initialize cart
        let existingCart = user.cart || [];
        let newItemsAdded = false;
        console.log("Existing cart 1:", existingCart);

        // ✅ Validate each cart item and update cart
        for (const newItem of newCartItems) {
            console.log("New item:", newItem);

            // ✅ Fix: Check for 'productName' instead of 'Name'
            if (!newItem.productName) {
                console.error("❌ Error: Cart item is missing the required 'productName' field:", newItem);
                return res.status(400).json(new ApiResponse(
                    400,
                    null,
                    `Invalid cart item: 'productName' field is required.`,
                    false
                ));
            }

            const existingItem = existingCart.find(item => item.TagId === newItem.TagId);
            console.log("Existing item:", existingItem);

            if (!existingItem) {
                existingCart.push(newItem);
                newItemsAdded = true;
                console.log("✅ New item added to cart:", newItem);
            }
        }

        console.log("Existing cart 2:", existingCart);

        // ✅ If no new items, return response
        if (!newItemsAdded) {
            console.log("✅ Cart already up-to-date for user:", req.user._id);
            return res.json(new ApiResponse(
                200,
                user.cart,
                'Cart already up-to-date',
                true
            ));
        }

        // ✅ Save updated cart in user document
        user.cart = existingCart;
        await user.save();

        console.log("✅ Cart synced successfully for user:", req.user._id);
        return res.json(new ApiResponse(
            200,
            user.cart,
            'Cart updated successfully',
            true
        ));

    } catch (error) {
        console.error("❌ Error in syncing cart for user:", error);
        return res.status(500).json(new ApiResponse(
            500,
            null,
            'Internal server error',
            false
        ));
    }

})

const getUserDataForCart = asyncHandler(async (req, res) => {
    try {
        console.log("✅ Fetching user data for cart:");
        const userId = req.user._id;
        const userData = await User.findById(userId).select('_id firstName lastName phone address cart savedForLater')
        if (!userData) {
            return res.status(404).json(new ApiResponse(
                404,
                null,
                'User not found',
                false
            ));
        }
        console.log("User data:", userData);
        return res.json(new ApiResponse(
            200,
            userData,
            'User data fetched successfully',
            true
        ));
    }
    catch (err) {
        if (err instanceof Error) {
            console.error("❌ Error fetching user data for cart:", err);
        }
        return res.status(500).json(new ApiResponse(
            500,
            null,
            'Internal server error',
            false
        ));
    }
})

const updateToaddressForCart = asyncHandler(async (req, res) => {
    try {
        console.log("✅ Updating to address for cart:");
        console.log('this is a request from the user', req.body)
        const userId = req.user._id;
        const toAddress = req.body.address;
        // Step 1: Find the user by ID
        const user = await User.findById(userId);

        if (!user) {
            console.log('User not found');
            return null;
        }
        console.log('before updating the address')
        // Step 2: Iterate over the addresses to find and update the matching address
        user.address = user.address.map(addr => {

            console.log(addr.address, '==', toAddress.address)
            if (addr.address === toAddress.address) {
                // Update the address fields
                console.log('correct')
                return {
                    ...addr.toObject(), // Convert Mongoose document to plain object
                    address: toAddress.address,
                    pinCode: toAddress.pinCode,
                    addressType: toAddress.addressType,
                    updatedAt: new Date()
                };
            }
            return addr;
        });
        console.log('after updating the address')
        // Step 3: Save the updated user document back to the database
        const updatedUser = await user.save();

        console.log('Address updated successfully');
        console.log(updatedUser.address)
        return res.status(200).json(new ApiResponse(
            200,
            updatedUser,
            'Address updated successfully',
            true
        ))

    }
    catch (err) {
        if (err instanceof Error) {
            console.error("❌ Error updating to address for cart:", err);
        }
        return res.status(500).json(new ApiResponse(
            500,
            null,
            'Internal server error',
            false
        ));
    }
})
const getUserCartDataForProducts = asyncHandler(async (req, res) => {
    console.log('This is a controller of get user cart data for product');
    const userCart = req.user.cart;
    console.log('usercart', userCart)
    let cartWithImages = [];

    // Fetch all products by their IDs
    const productPromises = userCart.map(async (cart) => {
        try {
            const products = await product.findById(cart.productId).exec();
            // console.log('product', products)
            return products;
        } catch (error) {
            console.error(`Error finding product with ID ${cart.productId}:`, error);
            return null;
        }
    });

    try {
        // Wait for all promises to resolve
        const products = await Promise.all(productPromises);

        // Combine cart products with their corresponding images using productId
        userCart.forEach((cart) => {
            const Product = products.find(p => p && p._id.toString() === cart.productId.toString());
            console.log('true ', Product)
            if (Product) {
                cartWithImages.push({
                    productId: cart.productId,
                    productName: cart.productName,
                    price: cart.price,
                    size: cart.size,
                    color: cart.color,
                    TagId: cart.TagId,
                    quantity: cart.quantity,
                    image: Product.image
                });
            }
        });

        if (cartWithImages.length === 0) {
            return res.status(404).json(new ApiResponse(
                404,
                null,
                'No products found',
                false
            ));
        }
        console.log('cartwithImages', cartWithImages)
        // Send the combined data in the response
        return res.status(200).json(new ApiResponse(
            200,
            cartWithImages,
            'Cart data with product images retrieved successfully',
            true
        ));
    } catch (error) {
        console.error('Error fetching products:', error);
        return res.status(500).json(new ApiResponse(
            500,
            null,
            'Internal server error',
            false
        ));
    }
});

const removeFromCartForUser = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const productId = req.params.productId;

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json(new ApiResponse(404, null, 'User not found', false));
        }
        console.log('user', user.cart)
        user.cart = user.cart.filter(cartItem => cartItem.productId.toString() !== productId);
        // Check if the product was removed
        // if (user.cart.length === originalCartLength) {
        //     return res.status(404).json(new ApiResponse(404, null, 'Product not found in cart', false));
        // }
        // Save the updated user document
        const updatedUser = await user.save();
        return res.status(200).json(new ApiResponse(200, updatedUser, 'Product removed from user cart successfully', true));
    } catch (error) {
        console.error('Error removing product from cart:', error);
        return res.status(500).json(new ApiResponse(
            500,
            null,
            'Internal server error',
            false
        ));
    }
});

const saveForLaterProduct = asyncHandler(async (req, res) => {
    try {
        console.log('this is a controller of a save for later products')
        const userId = req.user._id;
        const { productId, productName, size, price, quantity, image } = req.body;
        const cart_Item = {
            productId: productId,
            productName: productName,
            size: size,
            price: price,
            quantity: quantity,
            image: image
        }
        console.log(productId, productName, size, price, quantity, image)
        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json(new ApiResponse(404, null, 'User not found',
                false));
        }
        // Find the product in the cart
        const cartItem = user.cart.find(item => item.productId.toString() === productId);
        if (!cartItem) {
            return res.status(404).json(new ApiResponse(404, null, 'Product not found in cart', false));
        }
        console.log('cart item', cartItem)
        // Check if the product already exists in the save for later list
        const existingProduct = user.saveForLater.find(item => item.productId.toString() === productId);
        if (existingProduct) {
            return res.status(400).json(new ApiResponse(400, null, 'Product already exists in save for later list', false));
        }
        console.log('existing product', existingProduct)
        // Remove the product from the cart
        user.cart = user.cart.filter(item => item.productId.toString() !== productId);
        console.log('cart removed ', user.cart)
        cart_Item.color = cartItem.color
        cart_Item.TagId = cartItem.TagId
        console.log('cart_Item is', cart_Item)
        // Add the product to the save for later list
        user.saveForLater.push(cart_Item);

        // Save the updated user document
        const updatedUser = await user.save();
        console.log('updated user', updatedUser.saveForLater)
        return res.status(200).json(new ApiResponse(200, updatedUser.saveForLater, 'Product added to save for later list successfully',
            true));

    } catch (error) {
        if (error instanceof Error) {
            console.error('Error saving product for later:', error);
        }
        return res.status(500).json(new ApiResponse(
            500,
            null,
            'Internal server error',
            false
        ));
    }
})

const getUserSavedForLater = asyncHandler(async (req, res) => {
    try {
        console.log(' this is a controller of  get a save for later products')
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json(new ApiResponse(404, null, 'User not found',
                false));
        }
        const saveForLater = user.saveForLater;
        console.log('save for later', saveForLater)
        if (!saveForLater) {
            return res.status(404).json(new ApiResponse(404, null, 'No products saved for later', false));
        }
        return res.status(200).json(new ApiResponse(200, saveForLater, 'Products saved for later', true));

    } catch (error) {
        if (error instanceof Error) {
            console.error('Error getting user saved for later:', error);
        }
        return res.status(500).json(new ApiResponse(
            500,
            null,
            'Internal server error',
            false
        ));
    }
})

const moveToCartForUser = asyncHandler(async (req, res) => {
    try {
        console.log('this is a controller of move to cart')
        const userId = req.user._id;
        const { productId, quantity, price, image, productName, size } = req.body;
        console.log(productId, quantity, price, image, productName, size)
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json(new ApiResponse(404, null, 'User not found',
                false));
        }

        const saveForLaterItem = user.saveForLater.find(item => item.productId.toString() === productId)
        if (!saveForLaterItem) {
            return res.status(404).json(new ApiResponse(404, null, 'Product not found in save For Later', false));
        }
        console.log('saved for later item is', saveForLaterItem)
        const productExistingInCart = user.cart.find(item => item.productId.toString() === productId)
        if (productExistingInCart) {
            return res.status(404).json(new ApiResponse(404, null, 'Product already exists in the Cart', false));
        }
        user.saveForLater = user.saveForLater.filter(item => item.productId.toString() !== productId)
        user.cart.push(saveForLaterItem);
        // Save the updated user document
        const updatedUser = await user.save();
        console.log('updated user', updatedUser.cart)
        return res.status(200).json(new ApiResponse(200, updatedUser.saveForLater, 'Product added to cart list successfully and removed from Saved For Later',
            true))

    } catch (error) {
        if (error instanceof Error) {
            console.error('Error moving product to cart:', error);
        }
        return res.status(500).json(new ApiResponse(
            500,
            null,
            'Internal server error',
            false
        ));
    }
})

const removeFromSaveForLater = asyncHandler(async (req, res) => {
    try {
        console.log('this is a controller of remove from save for later')
        const userId = req.user._id;
        const { productId, productName, color, size, quantity, image, price } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json(new ApiResponse(404, null, 'User not found',
                false));
        }
        const saveForLaterItem = user.saveForLater.find(item => item.productId.toString() === productId)
        if (!saveForLaterItem) {
            return res.status(404).json(new ApiResponse(404, null, 'Product not found in save For Later', false));
        }
        user.saveForLater = user.saveForLater.filter(item => item.productId.toString() !== productId)
        // Save the updated user document
        const updatedUser = await user.save();
        return res.status(200).json(new ApiResponse(200, user.saveForLater, 'Product removed from Saved For Later',
            true))

    } catch (error) {
        if (error instanceof Error) {
            console.error('Error removing product from save for later:', error);
        }
        return res.status(500).json(new ApiResponse(500, null, 'Internal server error',
            false));

    }
})
export {
    userLogin,
    userRegister,
    UserLogout,
    resendOtp,
    userProfile,
    getUserProfileData,
    userProfileAddress,
    getUserAddress,
    delteUserAddress,
    searchForProductByUser,
    searchProductDetail,
    productSuggestionsForUser,
    productwishlist,
    getUserWishlist,
    AddToCartForUser,
    syncCartForUser,
    getUserDataForCart,
    updateToaddressForCart,
    getUserCartDataForProducts,
    removeFromCartForUser,
    saveForLaterProduct,
    getUserSavedForLater,
    moveToCartForUser,
    removeFromSaveForLater
}

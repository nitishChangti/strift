// src/routes/user.routes.js
import express from 'express';
import { body, validationResult } from 'express-validator';
import session from 'express-session';

import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.use(express.static(path.join(__dirname, '../../../public/user/home')));
router.use(express.static(path.join(__dirname, '../../../public/user/products')));
router.use(express.static(path.join(__dirname, '../../../public/user/home/header.html')));
router.use(express.static(path.join(__dirname, '../../../public')));
router.use('/home', express.static(path.join(__dirname, '../../../public/user/home')));
router.use('/products', express.static(path.join(__dirname, '../../../public/user/products')));

// Serve header.html file
router.get('/header', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../public/user/home/header.html'));
});
router.get('/footer', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../public/user/home/footer.html'));
});

// Serve the home page
router.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../public/user/home/index.html'));
});

router.use(express.static(path.join(__dirname, '../../../public/user/loginAndRegister')));
// router.use(express.static(path.join(__dirname, '../../public/user/loginAndRegister/images')));

// serve the login and register page
router.get('/account', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../public/user/loginAndRegister/index.html'));
})

import validateMobileNumber from '../../middlewares/validateMobileNumber.middlewares.js'
import {
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
} from '../../controllers/user/user.controllers.js'
import { verifyJWT } from '../../middlewares/verifyJwt.js';
import { authorization } from '../../middlewares/roleAuth.js';

router.use(express.static(path.join(__dirname, '../../../public/user/profile')));


router.get('/account/profile', (req, res) => {
    // res.send('hello')
    res.sendFile(path.join(__dirname, '../../../public/user/profile/profile.html'));
})
router.route('/account/login').post(validateMobileNumber, userLogin);

router.route('/account/register').post(validateMobileNumber, userRegister)
// verifyJWT
router.route('/account/logout').post(verifyJWT, UserLogout)

router.route('/account/login/resend-Otp').post(session(), resendOtp)

router.route("/account/register/resend-Otp").post(session(), resendOtp)

router.get('/admin', authorization('admin'), async (req, res) => {
    res.send('This is a admin place')
})

router.route('/account/profile').put(authorization('user'), userProfile)
router.route('/account/profile/userData').get(authorization('user'), getUserProfileData)

router.route('/account/profile/address').post(authorization('user'), userProfileAddress)
router.route('/profile/fetchAddress').get(authorization('user'), getUserAddress);
router.route('/profile/deleteAddress').delete(authorization('user'), delteUserAddress)

router.route('/searchForProducts').get(searchForProductByUser)

// in home finding product suggestions for user based on user search 
router.route('/productsuggestionsforuser').get(productSuggestionsForUser)

// in products finding product suggestions for user based on user search
router.get('/products', async (req, res) => {
    res.sendFile(path.join(__dirname, '../../../public/user/products/products.html'));
})
router.get('/productdetails/:id', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../public/user/products/productDetails.html'));
})
router.route('/productdetails').post(searchProductDetail)

router.route('/productWishlist').post(authorization('user'), productwishlist);

router.route('/getuserproductWishlist').get(authorization('user'), getUserWishlist);

router.route('/addToCart').post(authorization('user'), AddToCartForUser)

router.route('/viewcart').get((req, res) => {
    res.sendFile(path.join(__dirname, '../../../public/user/cart.html'));
})

router.route('/sync-cart').post(authorization('user'), syncCartForUser)

router.route('/getuserdataforcart').get(authorization('user'), getUserDataForCart);

router.route('/updatetoaddressforcart').post(authorization('user'), updateToaddressForCart);

router.route('/getusercartdataforproducts').get(authorization('user'), getUserCartDataForProducts);

router.route('/remove-from-cart/:productId').delete(authorization('user'), removeFromCartForUser);

router.route('/saveForLater-product').post(authorization('user'), saveForLaterProduct);

router.route('/getUserSavedForLater').get(authorization('user'), getUserSavedForLater)

router.route('/moveToCart').post(authorization('user'), moveToCartForUser)

router.route('/removeFromSaveForLater').post(authorization('user'), removeFromSaveForLater)
export default router;
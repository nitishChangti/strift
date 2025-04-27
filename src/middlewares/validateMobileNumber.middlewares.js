import { body, validationResult } from 'express-validator';

const validateMobileNumber = [
    body('phone').notEmpty().isLength({ min: 12, max: 15 }).matches(/^\+[0-9]{1,3}[0-9]{10}$/)
];

export default validateMobileNumber
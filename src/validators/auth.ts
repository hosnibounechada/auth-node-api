import { body } from "express-validator";

export const signUpValidator = [
  body("firstName")
    .isLength({ min: 1, max: 25 })
    .withMessage("You must supply a valid first Name"),
  body("lastName")
    .isLength({ min: 1, max: 25 })
    .withMessage("you must supply a valid last name"),
  body("email").isEmail().withMessage("Email must be valid"),
  body("password")
    .trim()
    .notEmpty()
    .isLength({ min: 6, max: 50 })
    .withMessage("you must supply a valid password"),
];

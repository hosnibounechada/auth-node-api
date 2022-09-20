import { body, oneOf } from "express-validator";

export const signupValidator = [
  body("firstName")
    .toLowerCase()
    .isLength({ min: 1, max: 25 })
    .withMessage("Invalid first name"),
  body("lastName")
    .toLowerCase()
    .isLength({ min: 1, max: 25 })
    .withMessage("Invalid last name"),
  body("email").isEmail().normalizeEmail().withMessage("Invalid E-mail"),
  body("password")
    .notEmpty()
    .isLength({ min: 6, max: 50 })
    .withMessage("Invalid password"),
];

export const loginValidator = [
  oneOf(
    [
      [
        body("email")
          .isEmail()
          .normalizeEmail()
          .withMessage("Email must be valid"),
        body("password")
          .notEmpty()
          .isLength({ min: 6, max: 50 })
          .withMessage("Invalid password"),
        body("username").not().exists().withMessage("Invalid Input"),
      ],
      [
        body("username")
          .isLength({ min: 6, max: 25 })
          .withMessage("Invalid username"),
        body("password")
          .trim()
          .notEmpty()
          .isLength({ min: 6, max: 50 })
          .withMessage("Invalid password"),
        body("email").not().exists().withMessage("Invalid Input"),
      ],
    ],
    "Invalid Credentials"
  ),
];

export const testValidator = [
  body("email").isEmail().normalizeEmail(),
  body("text").not().isEmpty().trim().escape(),
  body("extra").not().exists(),
];

/*
export const customValidator = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("E-mail must be valid")
    .custom(async (value) => {
      const user = await User.findOne({ email: value });
      if (user) throw new Error("E-mail already in use");
      return true;
    }),
];
*/

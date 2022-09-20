import express from "express";
import {
  signup,
  login,
  updateUser,
  updateUserPassword,
  test,
} from "../controllers/auth";
import { RequestValidator } from "../middlewares";
import {
  signupValidator,
  testValidator,
  loginValidator,
} from "../validators/auth";

const router = express.Router();

router.post("/signup", signupValidator, RequestValidator, signup);
router.post("/login", loginValidator, RequestValidator, login);
router.post("/update/:id", updateUser);
router.post("/updatePassword", updateUserPassword);
router.post("/test", testValidator, RequestValidator, test);

export default router;

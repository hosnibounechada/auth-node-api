import express, { Request, Response } from "express";
import {
  register,
  verifyEmail,
  login,
  getCurrentUser,
  updateUser,
  updateUserPassword,
  checkExistence,
  updateUsername,
  sendEmailCode,
  updateEmail,
  sendPhoneSMS,
  confirmPhone,
  forgotPasswordCode,
  confirmPasswordCode,
} from "../controllers/auth";
import { RequestValidator, requireAuth } from "../middlewares";
import {
  registerValidator,
  loginValidator,
  existenceValidator,
  usernameValidator,
  updatePasswordValidator,
  sendEmailCodeValidator,
  updateEmailValidator,
  phoneValidator,
  confirmPhoneValidator,
  emailValidator,
  resetPasswordValidator,
} from "../validators/auth";

const router = express.Router();

router.post("/register", registerValidator, RequestValidator, register);
router.post("/login", loginValidator, RequestValidator, login);

router.post("/verifyEmail", verifyEmail);
router.get("/me", getCurrentUser);
router.post("/update/:id", requireAuth, updateUser);
router.post("/updatePassword", requireAuth, updatePasswordValidator, updateUserPassword);
router.post("/checkExistence", existenceValidator, RequestValidator, checkExistence);
router.post("/updateUsername", requireAuth, usernameValidator, RequestValidator, updateUsername);
router.post("/sendEmailCode", requireAuth, sendEmailCodeValidator, RequestValidator, sendEmailCode);

router.post("/updateEmail", requireAuth, updateEmailValidator, RequestValidator, updateEmail);

router.post("/sendPhoneCode", requireAuth, phoneValidator, RequestValidator, sendPhoneSMS);
router.post("/confirmPhoneCode", requireAuth, confirmPhoneValidator, RequestValidator, confirmPhone);

router.post("/forgotPasswordViaRedis", emailValidator, RequestValidator, forgotPasswordCode);
router.post("/resetPasswordViaRedis", resetPasswordValidator, RequestValidator, confirmPasswordCode);

export default router;

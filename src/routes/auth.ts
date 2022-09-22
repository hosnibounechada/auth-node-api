import express from "express";
import {
  register,
  login,
  updateUser,
  updateUserPassword,
  test,
  getCurrentUser,
} from "../controllers/auth";
import { RequestValidator, requireAuth } from "../middlewares";
import {
  registerValidator,
  testValidator,
  loginValidator,
} from "../validators/auth";

const router = express.Router();

router.get("/me", getCurrentUser);
router.post("/register", registerValidator, RequestValidator, register);
router.post("/login", loginValidator, RequestValidator, login);
router.post("/update/:id", updateUser);
router.post("/updatePassword", updateUserPassword);
router.post("/test", requireAuth, testValidator, RequestValidator, test);

export default router;

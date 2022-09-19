import express from "express";
import { foo, bar } from "../controllers/auth";
import { RequestValidator } from "../middlewares";
import { signUpValidator } from "../validators/auth";

const router = express.Router();

router.post("/foo", signUpValidator, RequestValidator, foo);
router.get("/bar", bar);

export default router;

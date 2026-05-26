import { Router } from "express";
import { AdminAuthController } from "../controllers/AdminAuthController.js";

const router = Router();

const controller = new AdminAuthController();

router.get("/health", controller.health);

router.post("/request-otp", controller.requestOtp);
router.post("/verify-otp", controller.verifyOtp);

export default router;
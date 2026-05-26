import { Router } from "express";
import { PublicAuthController } from "../controllers/PublicAuthController.js";

const router = Router();

const controller = new PublicAuthController();

router.get("/health", controller.health);

router.post("/request-otp", controller.requestOtp);
router.post("/verify-otp", controller.verifyOtp);

export default router;
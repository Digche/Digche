export class AdminAuthController {
  constructor({ requestAdminOtp, verifyAdminOtp }) {
    this.requestAdminOtp = requestAdminOtp;
    this.verifyAdminOtp = verifyAdminOtp;
  }

  health = (req, res) => {
    res.json({
      service: "auth-service",
      scope: "admin-auth",
      status: "ok"
    });
  };

  requestOtp = async (req, res, next) => {
    try {
      const result = await this.requestAdminOtp.execute({
        phone: req.body.phone
      });

      res.json({
        message: "OTP sent successfully",
        phone: result.phone,
        expiresAt: result.expiresAt
      });
    } catch (error) {
      next(error);
    }
  };

  verifyOtp = async (req, res, next) => {
    try {
      const result = await this.verifyAdminOtp.execute({
        phone: req.body.phone,
        code: req.body.code
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
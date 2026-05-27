export class AdminAuthController {
  constructor({
    requestAdminOtp,
    verifyAdminOtp,
    refreshAdminSession,
    logoutSession
  }) {
    this.requestAdminOtp = requestAdminOtp;
    this.verifyAdminOtp = verifyAdminOtp;
    this.refreshAdminSession = refreshAdminSession;
    this.logoutSession = logoutSession;
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

  refresh = async (req, res, next) => {
    try {
      const result = await this.refreshAdminSession.execute({
        refreshToken: req.body.refreshToken
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  logout = async (req, res, next) => {
    try {
      const result = await this.logoutSession.execute({
        refreshToken: req.body.refreshToken
      });

      res.json({
        message: "Logged out successfully",
        ...result
      });
    } catch (error) {
      next(error);
    }
  };

  me = async (req, res, next) => {
    try {
      res.json({
        admin: {
          id: req.auth.adminId,
          phone: req.auth.phone,
          role: req.auth.role,
          isManager: req.auth.isManager
        }
      });
    } catch (error) {
      next(error);
    }
  };
}
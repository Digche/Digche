export class PublicAuthController {
  constructor({
    requestPublicOtp,
    verifyPublicOtp,
    refreshPublicSession,
    logoutSession,
    requestPublicPhoneChangeOtp,
    verifyPublicPhoneChangeOtp
  }) {
    this.requestPublicOtp = requestPublicOtp;
    this.verifyPublicOtp = verifyPublicOtp;
    this.refreshPublicSession = refreshPublicSession;
    this.logoutSession = logoutSession;
    this.requestPublicPhoneChangeOtp = requestPublicPhoneChangeOtp;
    this.verifyPublicPhoneChangeOtp = verifyPublicPhoneChangeOtp;
  }

  health = (req, res) => {
    res.json({
      service: "auth-service",
      scope: "public-auth",
      status: "ok"
    });
  };

  requestOtp = async (req, res, next) => {
    try {
      const result = await this.requestPublicOtp.execute({
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
      const result = await this.verifyPublicOtp.execute({
        phone: req.body.phone,
        code: req.body.code,
        role: req.body.role
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req, res, next) => {
    try {
      const result = await this.refreshPublicSession.execute({
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
        user: {
          id: req.auth.userId,
          phone: req.auth.phone,
          roles: req.auth.roles,
          selectedRole: req.auth.selectedRole,
          ...(req.auth.chef ? { chef: req.auth.chef } : {})
        }
      });
    } catch (error) {
      next(error);
    }
  };

  requestPhoneChangeOtp = async (req, res, next) => {
    try {
      const result = await this.requestPublicPhoneChangeOtp.execute({
        userId: req.auth.userId,
        currentPhone: req.auth.phone,
        newPhone: req.body.newPhone
      });

      res.json({
        message: "OTP sent successfully",
        newPhone: result.newPhone,
        expiresAt: result.expiresAt
      });
    } catch (error) {
      next(error);
    }
  };

  verifyPhoneChange = async (req, res, next) => {
    try {
      const result = await this.verifyPublicPhoneChangeOtp.execute({
        userId: req.auth.userId,
        currentSelectedRole: req.auth.selectedRole,
        newPhone: req.body.newPhone,
        code: req.body.code
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
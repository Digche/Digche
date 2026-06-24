export class AdminAuthController {
  constructor({
    requestAdminOtp,
    verifyAdminOtp,
    refreshAdminSession,
    logoutSession,
    updateAdminProfileField,
    requestAdminPhoneChangeOtp,
    verifyAdminPhoneChangeOtp
  }) {
    this.requestAdminOtp = requestAdminOtp;
    this.verifyAdminOtp = verifyAdminOtp;
    this.refreshAdminSession = refreshAdminSession;
    this.logoutSession = logoutSession;
    this.updateAdminProfileField = updateAdminProfileField;
    this.requestAdminPhoneChangeOtp = requestAdminPhoneChangeOtp;
    this.verifyAdminPhoneChangeOtp = verifyAdminPhoneChangeOtp;
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
          firstName: req.auth.firstName,
          lastName: req.auth.lastName,
          username: req.auth.username,
          role: req.auth.role,
          photoUrl: req.auth.photoUrl,
          isManager: req.auth.isManager
        }
      });
    } catch (error) {
      next(error);
    }
  };

  updateFirstName = async (req, res, next) => {
    try {
      const result = await this.updateAdminProfileField.execute({
        adminId: req.auth.adminId,
        field: "firstName",
        value: req.body.firstName
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  updateLastName = async (req, res, next) => {
    try {
      const result = await this.updateAdminProfileField.execute({
        adminId: req.auth.adminId,
        field: "lastName",
        value: req.body.lastName
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  updateUsername = async (req, res, next) => {
    try {
      const result = await this.updateAdminProfileField.execute({
        adminId: req.auth.adminId,
        field: "username",
        value: req.body.username
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  updatePhotoUrl = async (req, res, next) => {
    try {
      const result = await this.updateAdminProfileField.execute({
        adminId: req.auth.adminId,
        field: "photoUrl",
        value: req.body.photoUrl ?? req.body.photo_url
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  requestPhoneChangeOtp = async (req, res, next) => {
    try {
      const result = await this.requestAdminPhoneChangeOtp.execute({
        adminId: req.auth.adminId,
        newPhone: req.body.newPhone
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  verifyPhoneChange = async (req, res, next) => {
    try {
      const result = await this.verifyAdminPhoneChangeOtp.execute({
        adminId: req.auth.adminId,
        newPhone: req.body.newPhone,
        code: req.body.code
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}

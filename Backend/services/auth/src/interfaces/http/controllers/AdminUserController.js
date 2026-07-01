export class AdminUserController {
  constructor({
    addAdminUser,
    listAdminUsers,
    disableAdminUser,
    enableAdminUser,
    changeAdminUserPhone,
    requestAdminUserPhoneOtp,
    verifyAdminUserPhoneOtp
  }) {
    this.addAdminUser = addAdminUser;
    this.listAdminUsers = listAdminUsers;
    this.disableAdminUser = disableAdminUser;
    this.enableAdminUser = enableAdminUser;
    this.changeAdminUserPhone = changeAdminUserPhone;
    this.requestAdminUserPhoneOtp = requestAdminUserPhoneOtp;
    this.verifyAdminUserPhoneOtp = verifyAdminUserPhoneOtp;
  }

  requestPhoneOtp = async (req, res, next) => {
    try {
      const result = await this.requestAdminUserPhoneOtp.execute({
        phone: req.body.phone
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  verifyPhoneOtp = async (req, res, next) => {
    try {
      const result = await this.verifyAdminUserPhoneOtp.execute({
        phone: req.body.phone,
        code: req.body.code
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  add = async (req, res, next) => {
    try {
      const result = await this.addAdminUser.execute({
        phone: req.body.phone,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        createdBy: req.auth.adminId
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  list = async (req, res, next) => {
    try {
      const result = await this.listAdminUsers.execute();

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  changePhone = async (req, res, next) => {
    try {
      const result = await this.changeAdminUserPhone.execute({
        adminId: req.params.id,
        newPhone: req.body.newPhone,
        requestedBy: req.auth.adminId
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  disable = async (req, res, next) => {
    try {
      const result = await this.disableAdminUser.execute({
        adminId: req.params.id,
        requestedBy: req.auth.adminId
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  enable = async (req, res, next) => {
    try {
      const result = await this.enableAdminUser.execute({
        adminId: req.params.id,
        requestedBy: req.auth.adminId
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}

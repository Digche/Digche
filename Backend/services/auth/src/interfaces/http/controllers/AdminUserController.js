export class AdminUserController {
  constructor({
    addAdminUser,
    listAdminUsers,
    disableAdminUser
  }) {
    this.addAdminUser = addAdminUser;
    this.listAdminUsers = listAdminUsers;
    this.disableAdminUser = disableAdminUser;
  }

  add = async (req, res, next) => {
    try {
      const result = await this.addAdminUser.execute({
        phone: req.body.phone,
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
}
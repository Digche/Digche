export class AdminUserController {
  constructor({ addAdminUser }) {
    this.addAdminUser = addAdminUser;
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
}
export class ChefAdminController {
  constructor({ listChefs, suspendChef, activateChef }) {
    this.listChefs = listChefs;
    this.suspendChef = suspendChef;
    this.activateChef = activateChef;
  }

  list = async (req, res, next) => {
    try {
      const result = await this.listChefs.execute();

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  suspend = async (req, res, next) => {
    try {
      const result = await this.suspendChef.execute({
        userId: req.params.userId
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  activate = async (req, res, next) => {
    try {
      const result = await this.activateChef.execute({
        userId: req.params.userId
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}

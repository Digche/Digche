import { ChefAccount } from "../../../src/domain/entities/ChefAccount.js";
import { CHEF_STATUS } from "../../../src/domain/constants/statuses.js";

export class FakeChefAccountRepository {
  constructor({ chefAccounts = [] } = {}) {
    this.chefAccounts = chefAccounts.map((chefAccount) => this.toChefAccount(chefAccount));
    this.createdChefAccounts = [];
    this.updatedStatuses = [];
  }

  toChefAccount(chefAccount) {
    if (chefAccount instanceof ChefAccount) {
      return chefAccount;
    }

    const domainChefAccount = new ChefAccount(chefAccount);
    domainChefAccount.user = chefAccount.user || null;

    return domainChefAccount;
  }

  async findByUserId(userId) {
    return this.chefAccounts.find((chefAccount) => chefAccount.userId === userId) || null;
  }

  async listDetailed() {
    return this.chefAccounts.map((chefAccount) => ({
      id: chefAccount.id,
      userId: chefAccount.userId,
      status: chefAccount.status,
      createdAt: chefAccount.createdAt,
      updatedAt: chefAccount.updatedAt,
      user: chefAccount.user || null
    }));
  }

  async create(chefAccount) {
    const createdChefAccount = new ChefAccount({
      id: chefAccount.id || `chef-${this.chefAccounts.length + 1}`,
      userId: chefAccount.userId,
      status: chefAccount.status || CHEF_STATUS.ACTIVE,
      createdAt: chefAccount.createdAt || new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: chefAccount.updatedAt || new Date("2026-01-01T00:00:00.000Z")
    });

    this.chefAccounts.push(createdChefAccount);
    this.createdChefAccounts.push(createdChefAccount);

    return createdChefAccount;
  }

  async updateStatus(userId, status) {
    const chefAccount = await this.findByUserId(userId);

    if (!chefAccount) {
      return null;
    }

    chefAccount.status = status;
    chefAccount.updatedAt = new Date("2026-01-02T00:00:00.000Z");
    this.updatedStatuses.push({ userId, status });

    return chefAccount;
  }
}

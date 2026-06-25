import { CHEF_STATUS } from "../constants/statuses.js";

export class ChefAccount {
  constructor({
    id = null,
    userId,
    status = CHEF_STATUS.ACTIVE,
    createdAt = null,
    updatedAt = null
  }) {
    if (!userId) {
      throw new Error("ChefAccount userId is required");
    }

    this.id = id;
    this.userId = userId;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  isActive() {
    return this.status === CHEF_STATUS.ACTIVE;
  }

  isSuspended() {
    return this.status === CHEF_STATUS.SUSPENDED;
  }

  suspend() {
    this.status = CHEF_STATUS.SUSPENDED;
  }

  activate() {
    this.status = CHEF_STATUS.ACTIVE;
  }
}
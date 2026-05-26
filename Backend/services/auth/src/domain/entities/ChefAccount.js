import { CHEF_STATUS } from "../constants/statuses.js";

export class ChefAccount {
  constructor({
    id = null,
    userId,
    status = CHEF_STATUS.PENDING,
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

  isPending() {
    return this.status === CHEF_STATUS.PENDING;
  }

  isActive() {
    return this.status === CHEF_STATUS.ACTIVE;
  }

  isRejected() {
    return this.status === CHEF_STATUS.REJECTED;
  }

  isDisabled() {
    return this.status === CHEF_STATUS.DISABLED;
  }
}
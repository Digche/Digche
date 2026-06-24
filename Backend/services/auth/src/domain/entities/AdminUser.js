import { ADMIN_STATUS } from "../constants/statuses.js";
import { ADMIN_ROLES } from "../constants/roles.js";

export class AdminUser {
  constructor({
    id = null,
    phone,
    firstName = null,
    lastName = null,
    username = null,
    role = ADMIN_ROLES.ADMIN,
    status = ADMIN_STATUS.ACTIVE,
    photoUrl = null,
    createdBy = null,
    createdAt = null,
    updatedAt = null
  }) {
    if (!phone) {
      throw new Error("Admin phone is required");
    }

    this.id = id;
    this.phone = phone;
    this.firstName = firstName;
    this.lastName = lastName;
    this.username = username;
    this.role = role;
    this.status = status;
    this.photoUrl = photoUrl;
    this.createdBy = createdBy;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  isActive() {
    return this.status === ADMIN_STATUS.ACTIVE;
  }

  isManager() {
    return this.role === ADMIN_ROLES.MANAGER;
  }
}
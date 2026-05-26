export class User {
  constructor({
    id = null,
    phone,
    roles = [],
    createdAt = null,
    updatedAt = null
  }) {
    if (!phone) {
      throw new Error("User phone is required");
    }

    this.id = id;
    this.phone = phone;
    this.roles = roles;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  hasRole(role) {
    return this.roles.includes(role);
  }
}
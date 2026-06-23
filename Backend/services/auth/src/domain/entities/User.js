export class User {
  constructor({
    id = null,
    phone,
    firstName = null,
    lastName = null,
    username = null,
    profileImageUrl = null,
    address = null,
    roles = [],
    createdAt = null,
    updatedAt = null
  }) {
    if (!phone) {
      throw new Error("User phone is required");
    }

    this.id = id;
    this.phone = phone;
    this.firstName = firstName;
    this.lastName = lastName;
    this.username = username;
    this.profileImageUrl = profileImageUrl;
    this.address = address;
    this.roles = roles;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  hasRole(role) {
    return this.roles.includes(role);
  }

  hasCompletedProfile() {
    return Boolean(this.firstName && this.lastName && this.username);
  }
}

import { User } from "../../../src/domain/entities/User.js";

export class FakeUserRepository {
  constructor({ users = [] } = {}) {
    this.users = users.map((user) => this.toUser(user));
    this.createdUsers = [];
    this.addedRoles = [];
    this.completedProfiles = [];
    this.updatedPhones = [];
    this.updatedProfileFields = [];
    this.incrementedTokenVersions = [];
  }

  toUser(user) {
    if (user instanceof User) {
      return user;
    }

    return new User(user);
  }

  async findByPhone(phone) {
    return this.users.find((user) => user.phone === phone) || null;
  }

  async findById(id) {
    return this.users.find((user) => user.id === id) || null;
  }

  async findByUsername(username) {
    return this.users.find((user) => user.username === username) || null;
  }

  async updateProfileField(userId, field, value) {
    const user = await this.findById(userId);

    if (!user) {
      return null;
    }

    user[field] = value;
    user.updatedAt = new Date("2026-01-03T00:00:00.000Z");
    this.updatedProfileFields.push({ userId, field, value });

    return user;
  }

  async create(user) {
    const createdUser = new User({
      id: user.id || `user-${this.users.length + 1}`,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      photoUrl: user.photoUrl,
      address: user.address,
      tokenVersion: user.tokenVersion || 0,
      roles: user.roles || [],
      createdAt: user.createdAt || new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: user.updatedAt || new Date("2026-01-01T00:00:00.000Z")
    });

    this.users.push(createdUser);
    this.createdUsers.push(createdUser);

    return createdUser;
  }

  async addRole(userId, role) {
    // Real repository persists the role but does not mutate the already loaded domain entity.
    // Use-cases update their in-memory user.roles after this call when needed.
    this.addedRoles.push({ userId, role });
  }

  async completeProfile(userId, { firstName, lastName, username }) {
    const user = await this.findById(userId);

    if (!user) {
      return null;
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.username = username;
    user.updatedAt = new Date("2026-01-02T00:00:00.000Z");
    this.completedProfiles.push({ userId, firstName, lastName, username });

    return user;
  }

  async updatePhone(userId, newPhone) {
    const user = await this.findById(userId);

    if (!user) {
      return null;
    }

    user.phone = newPhone;
    user.updatedAt = new Date("2026-01-02T00:00:00.000Z");
    this.updatedPhones.push({ userId, newPhone });

    return user;
  }

  async incrementTokenVersion(userId) {
    const user = await this.findById(userId);

    if (!user) {
      return null;
    }

    user.tokenVersion = Number(user.tokenVersion || 0) + 1;
    user.updatedAt = new Date("2026-01-06T00:00:00.000Z");
    this.incrementedTokenVersions.push({ userId, tokenVersion: user.tokenVersion });

    return user;
  }
}

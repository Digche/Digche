import { sequelize } from "./sequelize.js";
import { initModels } from "./models/index.js";

import { env } from "../../config/env.js";
import { PhoneNumber } from "../../domain/value-objects/PhoneNumber.js";
import { AdminUser } from "../../domain/entities/AdminUser.js";
import { ADMIN_ROLES } from "../../domain/constants/roles.js";
import { ADMIN_STATUS } from "../../domain/constants/statuses.js";
import { SequelizeAdminUserRepository } from "./repositories/SequelizeAdminUserRepository.js";

async function seedManager() {
  initModels();

  await sequelize.authenticate();

  const managerPhone = env.initialManagerPhone;

  if (!managerPhone) {
    throw new Error("INITIAL_MANAGER_PHONE is required");
  }

  const normalizedPhone = PhoneNumber.normalize(managerPhone);

  const adminUserRepository = new SequelizeAdminUserRepository();

  const existingAdmin = await adminUserRepository.findByPhone(normalizedPhone);

  if (existingAdmin) {
    console.log("Initial manager already exists", {
      phone: normalizedPhone,
      role: existingAdmin.role,
      status: existingAdmin.status
    });

    await sequelize.close();
    return;
  }

  await adminUserRepository.create(
    new AdminUser({
      phone: normalizedPhone,
      role: ADMIN_ROLES.MANAGER,
      status: ADMIN_STATUS.ACTIVE,
      createdBy: null
    })
  );

  console.log("Initial manager created successfully", {
    phone: normalizedPhone,
    role: ADMIN_ROLES.MANAGER
  });

  await sequelize.close();
}

seedManager().catch(async (error) => {
  console.error("Seed manager failed", error);

  try {
    await sequelize.close();
  } catch {}

  process.exit(1);
});
import { describe, expect, it } from "vitest";

import { AddAdminUser } from "../../../src/application/use-cases/AddAdminUser.js";
import { ADMIN_ROLES } from "../../../src/domain/constants/roles.js";
import { ADMIN_STATUS } from "../../../src/domain/constants/statuses.js";

import { FakeAdminUserRepository } from "../fakes/FakeAdminUserRepository.js";
import { expectAppError } from "../helpers/expectAppError.js";

function makeUseCase({ adminUsers = [] } = {}) {
  const adminUserRepository = new FakeAdminUserRepository({ adminUsers });
  const useCase = new AddAdminUser({ adminUserRepository });

  return { useCase, adminUserRepository };
}

describe("AddAdminUser", () => {
  it("creates a normal active admin user", async () => {
    const { useCase, adminUserRepository } = makeUseCase();

    const result = await useCase.execute({
      phone: "09121234567",
      createdBy: "manager-1"
    });

    expect(result.admin).toMatchObject({
      id: "admin-1",
      phone: "+989121234567",
      role: ADMIN_ROLES.ADMIN,
      status: ADMIN_STATUS.ACTIVE,
      createdBy: "manager-1"
    });
    expect(adminUserRepository.createdAdminUsers).toHaveLength(1);
  });

  it("rejects duplicate admin phone numbers", async () => {
    const { useCase } = makeUseCase({
      adminUsers: [
        {
          id: "admin-1",
          phone: "+989121234567",
          role: ADMIN_ROLES.ADMIN,
          status: ADMIN_STATUS.ACTIVE
        }
      ]
    });

    await expectAppError(useCase.execute({ phone: "09121234567", createdBy: "manager-1" }), {
      statusCode: 409,
      code: "ADMIN_ALREADY_EXISTS"
    });
  });

  it("requires creator admin id", async () => {
    const { useCase } = makeUseCase();

    await expectAppError(useCase.execute({ phone: "09121234567" }), {
      statusCode: 400,
      code: "CREATOR_REQUIRED"
    });
  });
});

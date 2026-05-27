import { describe, expect, it } from "vitest";

import { DisableAdminUser } from "../../../src/application/use-cases/DisableAdminUser.js";
import { ADMIN_ROLES } from "../../../src/domain/constants/roles.js";
import { ADMIN_STATUS } from "../../../src/domain/constants/statuses.js";

import { FakeAdminUserRepository } from "../fakes/FakeAdminUserRepository.js";
import { expectAppError } from "../helpers/expectAppError.js";

function makeUseCase({ adminUsers = [] } = {}) {
  const adminUserRepository = new FakeAdminUserRepository({ adminUsers });
  const useCase = new DisableAdminUser({ adminUserRepository });

  return { useCase, adminUserRepository };
}

describe("DisableAdminUser", () => {
  it("disables a normal admin user", async () => {
    const { useCase, adminUserRepository } = makeUseCase({
      adminUsers: [
        {
          id: "admin-1",
          phone: "+989121234567",
          role: ADMIN_ROLES.ADMIN,
          status: ADMIN_STATUS.ACTIVE,
          createdBy: "manager-1"
        }
      ]
    });

    const result = await useCase.execute({
      adminId: "admin-1",
      requestedBy: "manager-1"
    });

    expect(result.admin).toMatchObject({
      id: "admin-1",
      status: ADMIN_STATUS.DISABLED
    });
    expect(adminUserRepository.disabledIds).toEqual(["admin-1"]);
  });

  it("does not allow manager to disable itself", async () => {
    const { useCase } = makeUseCase();

    await expectAppError(useCase.execute({ adminId: "manager-1", requestedBy: "manager-1" }), {
      statusCode: 400,
      code: "CANNOT_DISABLE_SELF"
    });
  });

  it("does not allow disabling a manager", async () => {
    const { useCase } = makeUseCase({
      adminUsers: [
        {
          id: "manager-2",
          phone: "+989121234567",
          role: ADMIN_ROLES.MANAGER,
          status: ADMIN_STATUS.ACTIVE
        }
      ]
    });

    await expectAppError(useCase.execute({ adminId: "manager-2", requestedBy: "manager-1" }), {
      statusCode: 400,
      code: "CANNOT_DISABLE_MANAGER"
    });
  });

  it("returns not found when target admin does not exist", async () => {
    const { useCase } = makeUseCase();

    await expectAppError(useCase.execute({ adminId: "admin-missing", requestedBy: "manager-1" }), {
      statusCode: 404,
      code: "NOT_FOUND"
    });
  });
});

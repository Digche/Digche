import { describe, expect, it } from "vitest";

import { ListAdminUsers } from "../../../src/application/use-cases/ListAdminUsers.js";
import { ADMIN_ROLES } from "../../../src/domain/constants/roles.js";
import { ADMIN_STATUS } from "../../../src/domain/constants/statuses.js";

import { FakeAdminUserRepository } from "../fakes/FakeAdminUserRepository.js";

describe("ListAdminUsers", () => {
  it("maps admin users for API response", async () => {
    const adminUserRepository = new FakeAdminUserRepository({
      adminUsers: [
        {
          id: "manager-1",
          phone: "+989121111111",
          role: ADMIN_ROLES.MANAGER,
          status: ADMIN_STATUS.ACTIVE,
          createdBy: null
        },
        {
          id: "admin-1",
          phone: "+989122222222",
          role: ADMIN_ROLES.ADMIN,
          status: ADMIN_STATUS.DISABLED,
          createdBy: "manager-1"
        }
      ]
    });

    const useCase = new ListAdminUsers({ adminUserRepository });
    const result = await useCase.execute();

    expect(result.admins).toEqual([
      expect.objectContaining({
        id: "manager-1",
        phone: "+989121111111",
        role: ADMIN_ROLES.MANAGER,
        status: ADMIN_STATUS.ACTIVE,
        createdBy: null
      }),
      expect.objectContaining({
        id: "admin-1",
        phone: "+989122222222",
        role: ADMIN_ROLES.ADMIN,
        status: ADMIN_STATUS.DISABLED,
        createdBy: "manager-1"
      })
    ]);
  });
});

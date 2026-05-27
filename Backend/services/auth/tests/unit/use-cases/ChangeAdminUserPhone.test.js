import { describe, expect, it } from "vitest";

import { ChangeAdminUserPhone } from "../../../src/application/use-cases/ChangeAdminUserPhone.js";
import { ADMIN_ROLES } from "../../../src/domain/constants/roles.js";
import { ADMIN_STATUS } from "../../../src/domain/constants/statuses.js";
import { TOKEN_OWNER_TYPES } from "../../../src/domain/constants/tokenOwnerTypes.js";

import { FakeAdminUserRepository } from "../fakes/FakeAdminUserRepository.js";
import { FakeRefreshTokenRepository } from "../fakes/FakeRefreshTokenRepository.js";
import { expectAppError } from "../helpers/expectAppError.js";

function makeUseCase({ adminUsers = [] } = {}) {
  const adminUserRepository = new FakeAdminUserRepository({ adminUsers });
  const refreshTokenRepository = new FakeRefreshTokenRepository();
  const useCase = new ChangeAdminUserPhone({
    adminUserRepository,
    refreshTokenRepository
  });

  return { useCase, adminUserRepository, refreshTokenRepository };
}

describe("ChangeAdminUserPhone", () => {
  it("changes a normal admin phone and revokes all admin refresh tokens", async () => {
    const { useCase, adminUserRepository, refreshTokenRepository } = makeUseCase({
      adminUsers: [
        {
          id: "admin-1",
          phone: "+989121111111",
          role: ADMIN_ROLES.ADMIN,
          status: ADMIN_STATUS.ACTIVE,
          createdBy: "manager-1"
        }
      ]
    });

    const result = await useCase.execute({
      adminId: "admin-1",
      requestedBy: "manager-1",
      newPhone: "09122222222"
    });

    expect(result.admin).toMatchObject({
      id: "admin-1",
      phone: "+989122222222",
      role: ADMIN_ROLES.ADMIN,
      status: ADMIN_STATUS.ACTIVE,
      createdBy: "manager-1"
    });
    expect(adminUserRepository.updatedPhones).toEqual([
      {
        id: "admin-1",
        newPhone: "+989122222222"
      }
    ]);
    expect(refreshTokenRepository.revokedOwners).toEqual([
      {
        ownerId: "admin-1",
        ownerType: TOKEN_OWNER_TYPES.ADMIN
      }
    ]);
  });

  it("does not allow manager to change its own phone from admin user management endpoint", async () => {
    const { useCase } = makeUseCase();

    await expectAppError(
      useCase.execute({ adminId: "manager-1", requestedBy: "manager-1", newPhone: "09122222222" }),
      {
        statusCode: 400,
        code: "CANNOT_CHANGE_SELF_PHONE"
      }
    );
  });

  it("does not allow changing another manager phone from this endpoint", async () => {
    const { useCase } = makeUseCase({
      adminUsers: [
        {
          id: "manager-2",
          phone: "+989121111111",
          role: ADMIN_ROLES.MANAGER,
          status: ADMIN_STATUS.ACTIVE
        }
      ]
    });

    await expectAppError(
      useCase.execute({ adminId: "manager-2", requestedBy: "manager-1", newPhone: "09122222222" }),
      {
        statusCode: 400,
        code: "CANNOT_CHANGE_MANAGER_PHONE"
      }
    );
  });

  it("rejects duplicate admin phone numbers", async () => {
    const { useCase } = makeUseCase({
      adminUsers: [
        {
          id: "admin-1",
          phone: "+989121111111",
          role: ADMIN_ROLES.ADMIN,
          status: ADMIN_STATUS.ACTIVE
        },
        {
          id: "admin-2",
          phone: "+989122222222",
          role: ADMIN_ROLES.ADMIN,
          status: ADMIN_STATUS.ACTIVE
        }
      ]
    });

    await expectAppError(
      useCase.execute({ adminId: "admin-1", requestedBy: "manager-1", newPhone: "09122222222" }),
      {
        statusCode: 409,
        code: "PHONE_ALREADY_IN_USE"
      }
    );
  });

  it("returns not found when target admin does not exist", async () => {
    const { useCase } = makeUseCase();

    await expectAppError(
      useCase.execute({ adminId: "admin-missing", requestedBy: "manager-1", newPhone: "09122222222" }),
      {
        statusCode: 404,
        code: "NOT_FOUND"
      }
    );
  });
});

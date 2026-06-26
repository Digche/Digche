import { describe, expect, it } from "vitest";

import { SuspendChef } from "../../../src/application/use-cases/SuspendChef.js";
import { CHEF_STATUS } from "../../../src/domain/constants/statuses.js";
import { USER_ROLES } from "../../../src/domain/constants/roles.js";
import { TOKEN_OWNER_TYPES } from "../../../src/domain/constants/tokenOwnerTypes.js";

import { FakeChefAccountRepository } from "../fakes/FakeChefAccountRepository.js";
import { FakeRefreshTokenRepository } from "../fakes/FakeRefreshTokenRepository.js";
import { FakeUserRepository } from "../fakes/FakeUserRepository.js";
import { expectAppError } from "../helpers/expectAppError.js";

function makeUseCase({ chefAccounts = [], refreshTokens = [], users = [] } = {}) {
  const chefAccountRepository = new FakeChefAccountRepository({ chefAccounts });
  const refreshTokenRepository = new FakeRefreshTokenRepository({ refreshTokens });
  const userRepository = new FakeUserRepository({ users });
  const useCase = new SuspendChef({
    chefAccountRepository,
    refreshTokenRepository,
    userRepository
  });

  return { useCase, chefAccountRepository, refreshTokenRepository, userRepository };
}

describe("SuspendChef", () => {
  it("suspends a chef account and revokes chef refresh tokens", async () => {
    const { useCase, chefAccountRepository, refreshTokenRepository, userRepository } = makeUseCase({
      users: [
        {
          id: "user-1",
          phone: "+989121234567",
          firstName: "Ali",
          lastName: "Ahmadi",
          username: "ali_ahmadi",
          roles: [USER_ROLES.CHEF]
        }
      ],
      chefAccounts: [
        {
          id: "chef-1",
          userId: "user-1",
          status: CHEF_STATUS.ACTIVE
        }
      ],
      refreshTokens: [
        {
          id: "refresh-chef",
          ownerId: "user-1",
          ownerType: TOKEN_OWNER_TYPES.USER,
          selectedRole: USER_ROLES.CHEF
        },
        {
          id: "refresh-client",
          ownerId: "user-1",
          ownerType: TOKEN_OWNER_TYPES.USER,
          selectedRole: USER_ROLES.CLIENT
        }
      ]
    });

    const result = await useCase.execute({ userId: "user-1" });

    expect(result.chef).toMatchObject({
      id: "chef-1",
      userId: "user-1",
      status: CHEF_STATUS.SUSPENDED
    });
    expect(chefAccountRepository.updatedStatuses).toEqual([
      { userId: "user-1", status: CHEF_STATUS.SUSPENDED }
    ]);
    expect(refreshTokenRepository.revokedOwnerRoles).toEqual([
      {
        ownerId: "user-1",
        ownerType: TOKEN_OWNER_TYPES.USER,
        selectedRole: USER_ROLES.CHEF
      }
    ]);
    expect(refreshTokenRepository.revokedIds).toEqual(["refresh-chef"]);
    expect(userRepository.incrementedTokenVersions).toEqual([
      {
        userId: "user-1",
        tokenVersion: 1
      }
    ]);
  });

  it("returns not found when chef account does not exist", async () => {
    const { useCase } = makeUseCase();

    await expectAppError(useCase.execute({ userId: "missing-user" }), {
      statusCode: 404,
      code: "NOT_FOUND"
    });
  });
});

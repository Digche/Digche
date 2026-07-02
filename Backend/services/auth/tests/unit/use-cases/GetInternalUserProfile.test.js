import { describe, expect, it } from "vitest";

import { GetInternalUserProfile } from "../../../src/application/use-cases/GetInternalUserProfile.js";
import { USER_ROLES } from "../../../src/domain/constants/roles.js";
import { CHEF_STATUS } from "../../../src/domain/constants/statuses.js";

import { FakeUserRepository } from "../fakes/FakeUserRepository.js";
import { FakeChefAccountRepository } from "../fakes/FakeChefAccountRepository.js";
import { expectAppError } from "../helpers/expectAppError.js";

function makeUseCase({ users = [], chefAccounts = [] } = {}) {
  const userRepository = new FakeUserRepository({ users });
  const chefAccountRepository = new FakeChefAccountRepository({ chefAccounts });
  const useCase = new GetInternalUserProfile({
    userRepository,
    chefAccountRepository
  });

  return { useCase };
}

describe("GetInternalUserProfile", () => {
  it("returns full user profile with chef account details", async () => {
    const { useCase } = makeUseCase({
      users: [
        {
          id: "user-1",
          phone: "+989121234567",
          firstName: "Sara",
          lastName: "Chef",
          username: "sara_chef",
          photoUrl: "https://cdn.example.com/users/user-1/profile.jpg",
          address: "Tehran",
          roles: [USER_ROLES.CLIENT, USER_ROLES.CHEF],
          tokenVersion: 2,
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
          updatedAt: new Date("2026-01-02T00:00:00.000Z")
        }
      ],
      chefAccounts: [
        {
          id: "chef-1",
          userId: "user-1",
          status: CHEF_STATUS.ACTIVE,
          createdAt: new Date("2026-01-03T00:00:00.000Z"),
          updatedAt: new Date("2026-01-04T00:00:00.000Z")
        }
      ]
    });

    const result = await useCase.execute({ userId: "user-1" });

    expect(result.user).toMatchObject({
      id: "user-1",
      phone: "+989121234567",
      firstName: "Sara",
      lastName: "Chef",
      username: "sara_chef",
      displayName: "Sara Chef",
      photoUrl: "https://cdn.example.com/users/user-1/profile.jpg",
      address: "Tehran",
      roles: [USER_ROLES.CLIENT, USER_ROLES.CHEF],
      hasCompletedProfile: true,
      tokenVersion: 2,
      chef: {
        id: "chef-1",
        userId: "user-1",
        status: CHEF_STATUS.ACTIVE
      }
    });
  });

  it("throws not found when user does not exist", async () => {
    const { useCase } = makeUseCase();

    await expectAppError(useCase.execute({ userId: "missing-user" }), {
      statusCode: 404,
      code: "NOT_FOUND"
    });
  });
});

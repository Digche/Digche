import { describe, expect, it } from "vitest";

import { CompletePublicRegistration } from "../../../src/application/use-cases/CompletePublicRegistration.js";
import { USER_ROLES } from "../../../src/domain/constants/roles.js";
import { CHEF_STATUS } from "../../../src/domain/constants/statuses.js";
import { AUTH_SCOPES } from "../../../src/domain/constants/authScopes.js";
import { TOKEN_OWNER_TYPES } from "../../../src/domain/constants/tokenOwnerTypes.js";

import { FakeChefAccountRepository } from "../fakes/FakeChefAccountRepository.js";
import { FakeRefreshTokenRepository } from "../fakes/FakeRefreshTokenRepository.js";
import { FakeRegistrationTokenRepository } from "../fakes/FakeRegistrationTokenRepository.js";
import { FakeTokenService } from "../fakes/FakeTokenService.js";
import { FakeUserRepository } from "../fakes/FakeUserRepository.js";
import { expectAppError } from "../helpers/expectAppError.js";

function makeUseCase({ users = [], chefAccounts = [], registrationPayload = null } = {}) {
  const userRepository = new FakeUserRepository({ users });
  const chefAccountRepository = new FakeChefAccountRepository({ chefAccounts });
  const refreshTokenRepository = new FakeRefreshTokenRepository();
  const registrationTokenRepository = new FakeRegistrationTokenRepository({
    registrationTokens: registrationPayload?.jti
      ? [
          {
            tokenId: registrationPayload.jti,
            phone: registrationPayload.phone,
            role: registrationPayload.role,
            flow: registrationPayload.flow || "register",
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
          }
        ]
      : []
  });
  const tokenService = new FakeTokenService();

  if (registrationPayload) {
    tokenService.registerRegistrationToken("registration-token", {
      flow: "register",
      ...registrationPayload
    });
  }

  const useCase = new CompletePublicRegistration({
    userRepository,
    chefAccountRepository,
    refreshTokenRepository,
    registrationTokenRepository,
    tokenService,
    refreshTokenExpiresDays: 7
  });

  return {
    useCase,
    userRepository,
    chefAccountRepository,
    refreshTokenRepository,
    registrationTokenRepository,
    tokenService
  };
}

describe("CompletePublicRegistration", () => {
  it("creates a new client user, adds role, and issues session", async () => {
    const { useCase, userRepository, refreshTokenRepository, tokenService } = makeUseCase({
      registrationPayload: {
        phone: "+989121234567",
        role: USER_ROLES.CLIENT,
        scope: "public_registration",
        jti: "registration-1"
      }
    });

    const result = await useCase.execute({
      registrationToken: "registration-token",
      firstName: " Ali ",
      lastName: " Ahmadi ",
      username: "ali_ahmadi"
    });

    expect(result).toMatchObject({
      accessToken: "access-token-1",
      refreshToken: "refresh-token-1",
      user: {
        id: "user-1",
        phone: "+989121234567",
        firstName: "Ali",
        lastName: "Ahmadi",
        username: "ali_ahmadi",
        roles: [USER_ROLES.CLIENT],
        selectedRole: USER_ROLES.CLIENT
      }
    });
    expect(userRepository.createdUsers).toHaveLength(1);
    expect(userRepository.addedRoles).toEqual([
      { userId: "user-1", role: USER_ROLES.CLIENT }
    ]);
    expect(tokenService.signedPayloads[0]).toMatchObject({
      sub: "user-1",
      phone: "+989121234567",
      firstName: "Ali",
      lastName: "Ahmadi",
      username: "ali_ahmadi",
      roles: [USER_ROLES.CLIENT],
      selectedRole: USER_ROLES.CLIENT,
      scope: AUTH_SCOPES.PUBLIC
    });
    expect(refreshTokenRepository.createdRefreshTokens[0]).toMatchObject({
      ownerId: "user-1",
      ownerType: TOKEN_OWNER_TYPES.USER,
      scope: AUTH_SCOPES.PUBLIC,
      selectedRole: USER_ROLES.CLIENT,
      tokenHash: "hash:refresh-token-1"
    });
  });

  it("completes profile and adds a new role for an existing user", async () => {
    const { useCase, userRepository } = makeUseCase({
      users: [
        {
          id: "user-1",
          phone: "+989121234567",
          roles: [USER_ROLES.CLIENT]
        }
      ],
      registrationPayload: {
        phone: "+989121234567",
        role: USER_ROLES.CHEF,
        scope: "public_registration",
        jti: "registration-1"
      }
    });

    const result = await useCase.execute({
      registrationToken: "registration-token",
      firstName: "Sara",
      lastName: "Chef",
      username: "sara_chef"
    });

    expect(userRepository.completedProfiles).toEqual([
      {
        userId: "user-1",
        firstName: "Sara",
        lastName: "Chef",
        username: "sara_chef"
      }
    ]);
    expect(userRepository.addedRoles).toContainEqual({
      userId: "user-1",
      role: USER_ROLES.CHEF
    });
    expect(result.user.roles).toEqual([USER_ROLES.CLIENT, USER_ROLES.CHEF]);
  });

  it("creates active chef account for chef registration", async () => {
    const { useCase, chefAccountRepository } = makeUseCase({
      registrationPayload: {
        phone: "+989121234567",
        role: USER_ROLES.CHEF,
        scope: "public_registration",
        jti: "registration-1"
      }
    });

    const result = await useCase.execute({
      registrationToken: "registration-token",
      firstName: "Sara",
      lastName: "Chef",
      username: "sara_chef"
    });

    expect(chefAccountRepository.createdChefAccounts).toHaveLength(1);
    expect(chefAccountRepository.createdChefAccounts[0]).toMatchObject({
      userId: "user-1",
      status: CHEF_STATUS.ACTIVE
    });
    expect(result.user).toMatchObject({
      selectedRole: USER_ROLES.CHEF,
      chef: {
        status: CHEF_STATUS.ACTIVE
      }
    });
  });

  it("rejects invalid or expired registration token", async () => {
    const { useCase } = makeUseCase();

    await expectAppError(
      useCase.execute({
        registrationToken: "invalid-registration-token",
        firstName: "Ali",
        lastName: "Ahmadi",
        username: "ali_ahmadi"
      }),
      {
        statusCode: 401,
        code: "UNAUTHORIZED"
      }
    );
  });

  it("rejects duplicate username", async () => {
    const { useCase } = makeUseCase({
      users: [
        {
          id: "user-2",
          phone: "+989129999999",
          firstName: "Existing",
          lastName: "User",
          username: "taken_username",
          roles: [USER_ROLES.CLIENT]
        }
      ],
      registrationPayload: {
        phone: "+989121234567",
        role: USER_ROLES.CLIENT,
        scope: "public_registration",
        jti: "registration-1"
      }
    });

    await expectAppError(
      useCase.execute({
        registrationToken: "registration-token",
        firstName: "Ali",
        lastName: "Ahmadi",
        username: "taken_username"
      }),
      {
        statusCode: 409,
        code: "USERNAME_ALREADY_IN_USE"
      }
    );
  });

  it("validates required name fields and username format", async () => {
    const { useCase } = makeUseCase({
      registrationPayload: {
        phone: "+989121234567",
        role: USER_ROLES.CLIENT,
        scope: "public_registration",
        jti: "registration-1"
      }
    });

    await expectAppError(
      useCase.execute({ registrationToken: "registration-token", firstName: "", lastName: "Ahmadi", username: "ali_ahmadi" }),
      { statusCode: 400, code: "FIRST_NAME_REQUIRED" }
    );

    await expectAppError(
      useCase.execute({ registrationToken: "registration-token", firstName: "Ali", lastName: "Ahmadi", username: "ab" }),
      { statusCode: 400, code: "USERNAME_TOO_SHORT" }
    );

    await expectAppError(
      useCase.execute({ registrationToken: "registration-token", firstName: "Ali", lastName: "Ahmadi", username: "bad-user" }),
      { statusCode: 400, code: "INVALID_USERNAME" }
    );
  });
});

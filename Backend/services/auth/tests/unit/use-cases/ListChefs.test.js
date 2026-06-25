import { describe, expect, it } from "vitest";

import { ListChefs } from "../../../src/application/use-cases/ListChefs.js";
import { CHEF_STATUS } from "../../../src/domain/constants/statuses.js";
import { USER_ROLES } from "../../../src/domain/constants/roles.js";

import { FakeChefAccountRepository } from "../fakes/FakeChefAccountRepository.js";

function makeUseCase({ chefAccounts = [] } = {}) {
  const chefAccountRepository = new FakeChefAccountRepository({ chefAccounts });
  const useCase = new ListChefs({ chefAccountRepository });

  return { useCase };
}

describe("ListChefs", () => {
  it("returns all chef accounts with user details", async () => {
    const { useCase } = makeUseCase({
      chefAccounts: [
        {
          id: "chef-1",
          userId: "user-1",
          status: CHEF_STATUS.ACTIVE,
          user: {
            id: "user-1",
            phone: "+989121234567",
            firstName: "Sara",
            lastName: "Chef",
            username: "sara_chef",
            photoUrl: "https://cdn.example.com/users/user-1/profile.jpg",
            address: "Tehran",
            roles: [USER_ROLES.CHEF]
          }
        }
      ]
    });

    const result = await useCase.execute();

    expect(result.chefs).toHaveLength(1);
    expect(result.chefs[0]).toMatchObject({
      id: "chef-1",
      userId: "user-1",
      status: CHEF_STATUS.ACTIVE,
      user: {
        id: "user-1",
        phone: "+989121234567",
        firstName: "Sara",
        lastName: "Chef",
        username: "sara_chef",
        photoUrl: "https://cdn.example.com/users/user-1/profile.jpg",
        address: "Tehran",
        roles: [USER_ROLES.CHEF]
      }
    });
  });
});

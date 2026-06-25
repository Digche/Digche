import { describe, expect, it } from "vitest";

import { ActivateChef } from "../../../src/application/use-cases/ActivateChef.js";
import { CHEF_STATUS } from "../../../src/domain/constants/statuses.js";

import { FakeChefAccountRepository } from "../fakes/FakeChefAccountRepository.js";
import { expectAppError } from "../helpers/expectAppError.js";

function makeUseCase({ chefAccounts = [] } = {}) {
  const chefAccountRepository = new FakeChefAccountRepository({ chefAccounts });
  const useCase = new ActivateChef({ chefAccountRepository });

  return { useCase, chefAccountRepository };
}

describe("ActivateChef", () => {
  it("activates a suspended chef account", async () => {
    const { useCase, chefAccountRepository } = makeUseCase({
      chefAccounts: [
        {
          id: "chef-1",
          userId: "user-1",
          status: CHEF_STATUS.SUSPENDED
        }
      ]
    });

    const result = await useCase.execute({ userId: "user-1" });

    expect(result.chef).toMatchObject({
      id: "chef-1",
      userId: "user-1",
      status: CHEF_STATUS.ACTIVE
    });
    expect(chefAccountRepository.updatedStatuses).toEqual([
      { userId: "user-1", status: CHEF_STATUS.ACTIVE }
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

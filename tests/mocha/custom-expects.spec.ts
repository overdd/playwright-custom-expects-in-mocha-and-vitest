import assert from "node:assert/strict";
import { describe, it } from "mocha";
import { CustomeExpect } from "../helpers/custom-expect";
import { makeStatusRequest } from "../helpers/request";

const statuses = [400, 404, 200];
const retryConfig = { timeout: 10000, intervals: [10, 50, 100, 300] };


describe("customExpect.toPass in mocha", function () {
  this.timeout(retryConfig.timeout + 1000);

  it("retries until assertions pass", async () => {
    let counter = 0;

    await CustomeExpect.toPass(async () => {
      const { receivedStatus, expectedStatus } = await makeStatusRequest(
        counter,
        statuses
      );
      assert.equal(receivedStatus, expectedStatus);
      counter += 1;
      assert.equal(receivedStatus, 200);
    }, retryConfig);
  });
});

describe("customExpect.poll in mocha", function () {
  this.timeout(retryConfig.timeout + 1000);

  it("polls until the matcher passes", async () => {
    let counter = 0;

    await CustomeExpect
      .poll(async () => {
        const { receivedStatus, expectedStatus } = await makeStatusRequest(
          counter,
          statuses
        );
        assert.equal(receivedStatus, expectedStatus);
        counter += 1;
        return receivedStatus;
      }, retryConfig)
      .toBe(200);
  });
});

import { describe, it } from "vitest";
import { CustomeExpect } from "../helpers/custom-expect";
import { makeStatusRequest } from "../helpers/request";

const statuses = [400, 404, 200];
const retryConfig = { timeout: 10000, intervals: [10, 50, 100, 300] };


describe("customExpect.toPass in vitest", () => {
  it("retries until assertions pass", async () => {
    let counter = 0;

    await CustomeExpect.toPass(async () => {
      const { receivedStatus, expectedStatus } = await makeStatusRequest(
        counter,
        statuses
      );
      if (receivedStatus !== expectedStatus) {
        throw new Error(`Unexpected status ${receivedStatus}`);
      }
      counter += 1;
      if (receivedStatus !== 200) {
        throw new Error(`Unexpected status ${receivedStatus}`);
      }
    }, retryConfig);
  });
});

describe("customExpect.poll in vitest", () => {
  it("polls until the matcher passes", async () => {
    let counter = 0;

    await CustomeExpect
      .poll(async () => {
        const { receivedStatus, expectedStatus } = await makeStatusRequest(
          counter,
          statuses
        );
        if (receivedStatus !== expectedStatus) {
          throw new Error(`Unexpected status ${receivedStatus}`);
        }
        counter += 1;
        return receivedStatus;
      }, retryConfig)
      .toBe(200);
  });
});

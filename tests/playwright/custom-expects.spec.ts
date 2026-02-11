import { test, expect } from "@playwright/test";
import { makeStatusRequest } from "../helpers/request";

const statuses = [400, 404, 200];
const retryConfig = { timeout: 10000, intervals: [10, 50, 100, 300] };


test("expect().toPass retries until assertions pass", async ({ request }) => {
  let counter = 0;

  await expect(async () => {
    const { receivedStatus, expectedStatus } = await makeStatusRequest(
      counter,
      statuses
    );
    expect(receivedStatus).toBe(expectedStatus);
    counter += 1;
    expect(receivedStatus).toBe(200);
  }).toPass(retryConfig);
});

test("expect.poll waits for a changing value", async ({ request }) => {
  let counter = 0;

  await expect
    .poll(
      async () => {
        const { receivedStatus, expectedStatus } = await makeStatusRequest(
          counter,
          statuses
        );
        expect(receivedStatus).toBe(expectedStatus);
        counter += 1;
        return receivedStatus;
      },
      retryConfig
    )
    .toBe(200);
});

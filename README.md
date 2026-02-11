# playwright-custom-expects-in-mocha-and-vitest

Bringing Playwright's retry assertion patterns (`expect().toPass()` and `expect.poll()`) to Mocha and Vitest.

## What This Is

Playwright Test has powerful retry mechanisms for assertions that wait for conditions to pass. This repo demonstrates:

1. **How Playwright's built-in `expect().toPass()` and `expect.poll()` work** (baseline tests)
2. **A minimal custom implementation** that brings the same behavior to Mocha and Vitest

## The Problem

When testing asynchronous or eventually-consistent systems, assertions might initially fail but succeed after a retry. Playwright handles this natively, but Mocha and Vitest don't.

## The Solution: `CustomeExpect` Class

A single static class with two methods:

### `CustomeExpect.toPass(fn, options?)`

Retries a function containing assertions until they all pass or timeout is reached.

**Use case:** You have multiple assertions that need to pass together.

```typescript
await CustomeExpect.toPass(async () => {
  const status = await getStatus();
  assert.equal(status, 'ready');  // Might fail initially
  const count = await getCount();
  assert.equal(count, 5);  // Both must pass
}, { timeout: 10000, intervals: [100, 250, 500] });
```

### `CustomeExpect.poll(fn, options?)`

Polls a function that returns a value and retries matchers against that value.

**Use case:** You're waiting for a specific value to appear.

```typescript
await CustomeExpect
  .poll(async () => {
    const response = await fetch('/api/status');
    return response.status;
  }, { timeout: 10000, intervals: [100, 250, 500] })
  .toBe(200);  // Retries until status is 200
```

## What the Tests Do

All three test suites (Playwright, Mocha, Vitest) simulate the same scenario:

1. An API returns different HTTP status codes in sequence: `[400, 404, 200]`
2. Each call increments a counter to get the next status in the array
3. Tests retry assertions until they receive the expected `200` status

This proves the retry logic works identically across all frameworks.

## Project Structure

```
src/
  expect-helpers/
    custom-expect.ts     # CustomeExpect class implementation
tests/
  helpers/
    custom-expect.ts     # Re-export for tests
    request.ts           # Mock HTTP request helper
  playwright/            # Playwright native tests (baseline)
  mocha/                 # Mocha tests using CustomeExpect
  vitest/                # Vitest tests using CustomeExpect
```

## Setup

```bash
npm install
npx playwright install
```

## Run Tests

Run all three frameworks (continues even if one fails):

```bash
npm test
```

Or run individually:

```bash
npm run test:pw       # Playwright
npm run test:mocha    # Mocha
npm run test:vitest   # Vitest
```

## Implementation Details

- **Default timeout:** 5000ms (matches Playwright's `expect.poll()`)
- **Default retry intervals:** `[100, 250, 500, 1000]` milliseconds (exponential backoff, matches Playwright)
- **Matchers:** Currently only `toBe()` for `poll()` (MVP implementation)
- **TypeScript:** Full type safety with generic support for `poll<T>()`

## Why This Matters

This pattern is essential for testing:
- APIs with eventual consistency
- WebSocket or SSE connections
- Background job completion
- UI state changes in non-Playwright frameworks
- Any async operation that needs time to settle

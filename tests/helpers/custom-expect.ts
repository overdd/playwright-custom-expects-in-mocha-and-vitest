import assert from "node:assert/strict";

type Options = { timeout?: number; intervals?: number[] };

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class CustomeExpect {
    private static defaultOptions: Options = { timeout: 5000, intervals: [100, 250, 500, 1000] };

    static async toPass(fn: () => Promise<void> | void, options?: Options) {
        const timeout = options?.timeout ?? this.defaultOptions.timeout!;
        const intervals = options?.intervals ?? this.defaultOptions.intervals!;
        const start = Date.now();
        let attempt = 0;

        while (Date.now() - start < timeout) {
            try {
                await fn();
                return;
            } catch {
                await sleep(intervals[Math.min(attempt++, intervals.length - 1)]);
            }
        }

        throw new Error(`CustomeExpect.toPass() timed out after ${timeout}ms.`);
    }

    static poll<T>(fn: () => Promise<T> | T, options?: Options) {
        const timeout = options?.timeout ?? this.defaultOptions.timeout!;
        const intervals = options?.intervals ?? this.defaultOptions.intervals!;

        return {
            toBe: async (expected: T) => {
                const start = Date.now();
                let attempt = 0;

                while (Date.now() - start < timeout) {
                    try {
                        assert.equal(await fn(), expected);
                        return;
                    } catch {
                        await sleep(intervals[Math.min(attempt++, intervals.length - 1)]);
                    }
                }

                throw new Error(`CustomeExpect.poll() toBe timed out after ${timeout}ms.`);
            }
        };
    }
}

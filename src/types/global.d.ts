// Type declarations for Bun-specific modules
declare module "bun:sqlite" {
  export class Database {
    constructor(path: string, options?: { create?: boolean; readonly?: boolean });
    query<T, P extends unknown[]>(sql: string): Statement<T, P>;
    prepare(sql: string): Statement;
    run(sql: string): RunResult;
    close(): void;
  }

  interface Statement<T = unknown, P extends unknown[] = unknown[]> {
    all(...params: P): T[];
    get(...params: P): T | undefined;
    run(...params: P): RunResult;
  }

  interface RunResult {
    lastInsertRowid: number | bigint;
    changes: number;
  }
}

declare module "bun:test" {
  export function describe(name: string, fn: () => void): void;
  export function test(name: string, fn: () => void | Promise<void>): void;
  export function it(name: string, fn: () => void | Promise<void>): void;
  export function expect<T>(actual: T): Matchers<T>;
  export function beforeEach(fn: () => void | Promise<void>): void;
  export function afterEach(fn: () => void | Promise<void>): void;
  export function beforeAll(fn: () => void | Promise<void>): void;
  export function afterAll(fn: () => void | Promise<void>): void;

  interface Matchers<T> {
    toBe(expected: T): void;
    toEqual(expected: T): void;
    toBeGreaterThan(expected: number): void;
    toBeGreaterThanOrEqual(expected: number): void;
    toBeLessThan(expected: number): void;
    toBeLessThanOrEqual(expected: number): void;
    toBeTruthy(): void;
    toBeFalsy(): void;
    toBeNull(): void;
    toBeUndefined(): void;
    toBeDefined(): void;
    toContain(expected: any): void;
    toHaveLength(expected: number): void;
    toThrow(expected?: string | RegExp): void;
    toMatch(expected: string | RegExp): void;
    not: Matchers<T>;
  }
}

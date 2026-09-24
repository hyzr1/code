/**
 * Assertion harness injected into the sandbox worker.
 *
 * Deliberately small. Jest-shaped so the muscle memory transfers, but every
 * failure message shows both values formatted — a bad failure message costs a
 * debugging rep, which is the expensive kind.
 */

export class AssertionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssertionError";
  }
}

export function format(value: unknown, depth = 0): string {
  if (depth > 4) return "…";
  if (value === null) return "null";
  if (value === undefined) return "undefined";

  const t = typeof value;
  if (t === "string") return JSON.stringify(value);
  if (t === "number") return Object.is(value, -0) ? "-0" : String(value);
  if (t === "bigint") return `${value}n`;
  if (t === "boolean" || t === "symbol") return String(value);
  if (t === "function") {
    const name = (value as Function).name;
    return name ? `[Function: ${name}]` : "[Function (anonymous)]";
  }

  if (Array.isArray(value)) {
    const items = value.map((v) => format(v, depth + 1));
    const body = items.join(", ");
    return body.length > 72
      ? `[\n  ${items.join(",\n  ")}\n]`
      : `[${body}]`;
  }

  if (value instanceof Map) {
    const entries = [...value.entries()].map(
      ([k, v]) => `${format(k, depth + 1)} => ${format(v, depth + 1)}`,
    );
    return `Map(${value.size}) {${entries.length ? " " + entries.join(", ") + " " : ""}}`;
  }
  if (value instanceof Set) {
    const items = [...value].map((v) => format(v, depth + 1));
    return `Set(${value.size}) {${items.length ? " " + items.join(", ") + " " : ""}}`;
  }
  if (value instanceof Date) return `Date(${value.toISOString()})`;
  if (value instanceof RegExp) return String(value);
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  if (value instanceof Promise) return "Promise { … }";

  const obj = value as Record<string, unknown>;
  const ctor = obj.constructor?.name;
  const prefix = ctor && ctor !== "Object" ? `${ctor} ` : "";
  const keys = Object.keys(obj);
  if (keys.length === 0) return `${prefix}{}`;
  const parts = keys.map((k) => `${k}: ${format(obj[k], depth + 1)}`);
  const body = parts.join(", ");
  return body.length > 72
    ? `${prefix}{\n  ${parts.join(",\n  ")}\n}`
    : `${prefix}{ ${body} }`;
}

export function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;

  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return false;
  if (typeof a !== "object") return false;

  if (Array.isArray(a) !== Array.isArray(b)) return false;

  if (a instanceof Date && b instanceof Date)
    return a.getTime() === b.getTime();
  if (a instanceof RegExp && b instanceof RegExp) return String(a) === String(b);

  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false;
    for (const [k, v] of a) {
      if (!b.has(k) || !deepEqual(v, b.get(k))) return false;
    }
    return true;
  }
  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size) return false;
    // O(n²), but test data is small and this handles object members correctly.
    const rest = [...b];
    outer: for (const v of a) {
      for (let i = 0; i < rest.length; i++) {
        if (deepEqual(v, rest[i])) {
          rest.splice(i, 1);
          continue outer;
        }
      }
      return false;
    }
    return true;
  }

  const ao = a as Record<string, unknown>;
  const bo = b as Record<string, unknown>;
  const ak = Object.keys(ao);
  const bk = Object.keys(bo);
  if (ak.length !== bk.length) return false;
  for (const k of ak) {
    if (!Object.prototype.hasOwnProperty.call(bo, k)) return false;
    if (!deepEqual(ao[k], bo[k])) return false;
  }
  return true;
}

interface Matchers {
  toBe(expected: unknown): void;
  toEqual(expected: unknown): void;
  toBeTruthy(): void;
  toBeFalsy(): void;
  toBeNull(): void;
  toBeUndefined(): void;
  toBeDefined(): void;
  toBeNaN(): void;
  toHaveLength(n: number): void;
  toContain(item: unknown): void;
  toBeInstanceOf(ctor: Function): void;
  toBeCloseTo(n: number, digits?: number): void;
  toThrow(expected?: string | RegExp | Function): void;
  toBeGreaterThan(n: number): void;
  toBeLessThan(n: number): void;
}

export interface Expectation extends Matchers {
  not: Matchers;
}

export function expect(actual: unknown): Expectation {
  const build = (negated: boolean): Matchers => {
    const check = (pass: boolean, msg: string, negMsg: string) => {
      if (negated ? pass : !pass) {
        throw new AssertionError(negated ? negMsg : msg);
      }
    };

    return {
      toBe(expected) {
        check(
          Object.is(actual, expected),
          `expected ${format(expected)}\n     got ${format(actual)}`,
          `expected value not to be ${format(expected)}`,
        );
      },
      toEqual(expected) {
        check(
          deepEqual(actual, expected),
          `expected ${format(expected)}\n     got ${format(actual)}`,
          `expected value not to equal ${format(expected)}`,
        );
      },
      toBeTruthy() {
        check(
          !!actual,
          `expected a truthy value, got ${format(actual)}`,
          `expected a falsy value, got ${format(actual)}`,
        );
      },
      toBeFalsy() {
        check(
          !actual,
          `expected a falsy value, got ${format(actual)}`,
          `expected a truthy value, got ${format(actual)}`,
        );
      },
      toBeNull() {
        check(
          actual === null,
          `expected null, got ${format(actual)}`,
          `expected not null`,
        );
      },
      toBeUndefined() {
        check(
          actual === undefined,
          `expected undefined, got ${format(actual)}`,
          `expected not undefined`,
        );
      },
      toBeDefined() {
        check(
          actual !== undefined,
          `expected a defined value, got undefined`,
          `expected undefined, got ${format(actual)}`,
        );
      },
      toBeNaN() {
        check(
          Number.isNaN(actual),
          `expected NaN, got ${format(actual)}`,
          `expected not NaN`,
        );
      },
      toHaveLength(n) {
        const len = (actual as { length?: number })?.length;
        check(
          len === n,
          `expected length ${n}, got ${format(len)}  —  ${format(actual)}`,
          `expected length not to be ${n}`,
        );
      },
      toContain(item) {
        let has = false;
        if (typeof actual === "string") has = actual.includes(String(item));
        else if (Array.isArray(actual)) has = actual.some((v) => deepEqual(v, item));
        else if (actual instanceof Set) has = [...actual].some((v) => deepEqual(v, item));
        check(
          has,
          `expected ${format(actual)}\n  to contain ${format(item)}`,
          `expected ${format(actual)}\n  not to contain ${format(item)}`,
        );
      },
      toBeInstanceOf(ctor) {
        check(
          actual instanceof (ctor as new (...a: unknown[]) => unknown),
          `expected an instance of ${ctor.name}, got ${format(actual)}`,
          `expected not an instance of ${ctor.name}`,
        );
      },
      toBeCloseTo(n, digits = 2) {
        const pass =
          typeof actual === "number" &&
          Math.abs(actual - n) < Math.pow(10, -digits) / 2;
        check(
          pass,
          `expected ${format(actual)} to be close to ${n}`,
          `expected ${format(actual)} not to be close to ${n}`,
        );
      },
      toBeGreaterThan(n) {
        check(
          (actual as number) > n,
          `expected ${format(actual)} > ${n}`,
          `expected ${format(actual)} not > ${n}`,
        );
      },
      toBeLessThan(n) {
        check(
          (actual as number) < n,
          `expected ${format(actual)} < ${n}`,
          `expected ${format(actual)} not < ${n}`,
        );
      },
      toThrow(expected) {
        if (typeof actual !== "function") {
          throw new AssertionError(
            `toThrow needs a function to call, got ${format(actual)}`,
          );
        }
        let threw: unknown = null;
        let didThrow = false;
        try {
          (actual as () => unknown)();
        } catch (err) {
          didThrow = true;
          threw = err;
        }

        if (!didThrow) {
          check(false, `expected the function to throw, it did not`, ``);
          return;
        }
        if (negated) {
          throw new AssertionError(
            `expected no throw, but it threw ${format(threw)}`,
          );
        }
        if (expected === undefined) return;

        const msg = threw instanceof Error ? threw.message : String(threw);
        if (typeof expected === "string" && !msg.includes(expected)) {
          throw new AssertionError(
            `expected the message to include ${JSON.stringify(expected)}\n     got ${JSON.stringify(msg)}`,
          );
        }
        if (expected instanceof RegExp && !expected.test(msg)) {
          throw new AssertionError(
            `expected the message to match ${expected}\n     got ${JSON.stringify(msg)}`,
          );
        }
        if (typeof expected === "function" && !(threw instanceof (expected as new () => unknown))) {
          throw new AssertionError(
            `expected a ${expected.name}, got ${format(threw)}`,
          );
        }
      },
    };
  };

  return Object.assign(build(false), { not: build(true) });
}

export function assert(condition: unknown, message = "assertion failed"): void {
  if (!condition) throw new AssertionError(message);
}

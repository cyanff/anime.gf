export type Result<T, E> = { kind: "ok"; value: T } | { kind: "err"; error: E };

export type Option<T> = { kind: "some"; value: T } | { kind: "none" };

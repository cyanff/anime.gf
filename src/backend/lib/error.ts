/**
 * Check if the given value is of type Error, if not rethrow it.
 * https://stackoverflow.com/a/70993058
 * @param error A value that should be of type Error
 */
export function isError(error: any): asserts error is Error {
  if (!(error instanceof Error)) {
    throw error;
  }
}

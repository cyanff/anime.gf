/**
 * Freeze an object along with all of it's properties and subproperties making it completely immutable.
 * This is useful because Object.freeze() only freezes the top level properties.
 * @param object The object to freeze
 * @returns The frozen object
 */
export function deepFreeze(object: any) {
  let props = Object.getOwnPropertyNames(object);

  // Iterate through all top level properties
  props.forEach((prop) => {
    let subProp = object[prop];

    // Recursively traverse sub-properties
    if (subProp && typeof subProp === "object") {
      deepFreeze(subProp);
    }
  });

  // Freeze self
  return Object.freeze(object);
}

/**
 * Remove all top level properties matching the blacklist from an object
 * @param obj The object to clone and remove properties from
 * @param blacklist A string array of properties to remove
 * @returns A new object with the properties removed
 */
export function omit(obj: any, blacklist: string[]): any {
  const deepClone = JSON.parse(JSON.stringify(obj));

  // Delete all the top level properties that are in the blacklist
  Object.getOwnPropertyNames(deepClone).forEach((prop) => {
    if (blacklist.includes(prop)) {
      delete deepClone[prop];
    }
  });

  return deepClone;
}

// oyasumi
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Return the value clamped between the minimum and maximum values (inclusive).
 * @param val The value to clamp
 * @param min The minimum value
 * @param max The maximum value
 * @returns The clamped value
 */
export function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max);
}

/**
 * Converts a SQLite time string to ISO 8601 format.
 *
 * @param time - The SQLite time string to convert.
 * @returns The converted time string in ISO 8601 format.
 */
function sqliteToISO(time: string) {
  return time.replace(" ", "T") + "Z";
}

/**
 * Converts an ISO string to a user-relative time string.
 * @param iso - The ISO string representing the date and time.
 * @param timezone - The timezone to use for formatting the date and time.
 * @returns The user-relative time string.
 *
 * @example
 * ```ts
 * const iso = "2021-08-01T12:00:00Z";
 * const timezone = "America/New_York";
 * const userRelativeTime = isoToUserRelativeTime(iso, timezone);
 *
 * userRelativeTime // "Yesterday at 08:00"
 * ```
 */
function isoToUserRelativeTime(iso: string, timezone: string) {
  const now = new Date();
  const date = new Date(iso);
  let yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const timeFormatter = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
  const dateFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour12: false
  });

  if (date.getDate() === now.getDate()) {
    return `Today at ${timeFormatter.format(date)}`;
  } else if (date.getDate() === yesterday.getDate()) {
    return `Yesterday at ${timeFormatter.format(date)}`;
  } else {
    return `${dateFormatter.format(date)} at ${timeFormatter.format(date)}`;
  }
}

/**
 * Converts an ISO string to a relative time string for the LLM to use.
 * @param iso - An ISO time string.
 * @returns A string representing the relative time in the format "{value} {unit} ago".
 *
 * @example
 * ```ts
 * const iso = "2021-08-01T12:00:00Z";
 * const relativeTime = isoToLLMRelativeTime(iso);
 *
 * relativeTime // "2 weeks ago"
 * ```
 */
function isoToLLMRelativeTime(iso: string) {
  const now = new Date();
  const date = new Date(iso);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let unit;
  let value;

  if (diffInSeconds < 60) {
    unit = "second";
    value = diffInSeconds;
  } else if (diffInSeconds < 3600) {
    unit = "minute";
    value = Math.floor(diffInSeconds / 60);
  } else if (diffInSeconds < 86400) {
    unit = "hour";
    value = Math.floor(diffInSeconds / 3600);
  } else if (diffInSeconds < 604800) {
    unit = "day";
    value = Math.floor(diffInSeconds / 86400);
  } else if (diffInSeconds < 2628000) {
    unit = "week";
    value = Math.floor(diffInSeconds / 604800);
  } else if (diffInSeconds < 31536000) {
    unit = "month";
    value = Math.floor(diffInSeconds / 2628000);
  } else {
    unit = "year";
    value = Math.floor(diffInSeconds / 31536000);
  }
  if (value > 1) {
    unit += "s";
  }

  return `${value} ${unit} ago`;
}

function isoToFriendly(iso: string) {
  const date = new Date(iso);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const time = {
  isoToUserRelativeTime,
  isoToLLMRelativeTime,
  sqliteToISO,
  isoToFriendly
};

import type { StringValue } from "ms";
import ms from "ms";

export function durationToMilliseconds(duration: StringValue): number {
  return ms(duration);
}

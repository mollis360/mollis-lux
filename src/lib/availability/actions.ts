"use server";

import { getAvailability } from "./queries";

export async function checkRoomCategoryAvailability(input: unknown) {
  return getAvailability(input);
}

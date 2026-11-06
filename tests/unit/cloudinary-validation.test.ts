import { describe, expect, it } from "vitest";

import {
  CLOUDINARY_ALLOWED_FORMATS,
  CLOUDINARY_MAX_IMAGE_BYTES,
  getRoomCategoryImageFolder,
  isRoomCategoryImagePublicId,
} from "../../src/lib/cloudinary/server";

const roomCategoryId = "11111111-1111-4111-8111-111111111111";

describe("Cloudinary room-category image boundaries", () => {
  it("builds the single-hotel room-category folder", () => {
    expect(getRoomCategoryImageFolder(roomCategoryId)).toBe(
      `mollis-lux/room-categories/${roomCategoryId}`,
    );
  });

  it("accepts only direct public IDs in the category folder", () => {
    expect(
      isRoomCategoryImagePublicId(
        `${getRoomCategoryImageFolder(roomCategoryId)}/abc_123`,
        roomCategoryId,
      ),
    ).toBe(true);

    expect(
      isRoomCategoryImagePublicId(
        `mollis-lux/room-categories/22222222-2222-4222-8222-222222222222/abc_123`,
        roomCategoryId,
      ),
    ).toBe(false);

    expect(
      isRoomCategoryImagePublicId(
        `${getRoomCategoryImageFolder(roomCategoryId)}/nested/abc_123`,
        roomCategoryId,
      ),
    ).toBe(false);
  });

  it("keeps the upload policy limited to images and a bounded payload", () => {
    expect(CLOUDINARY_ALLOWED_FORMATS).toEqual(["jpg", "jpeg", "png", "webp", "avif"]);
    expect(CLOUDINARY_MAX_IMAGE_BYTES).toBe(10 * 1024 * 1024);
  });
});

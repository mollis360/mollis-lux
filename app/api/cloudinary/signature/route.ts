import { NextResponse } from "next/server";

import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/src/db";
import { roomCategories } from "@/src/db/schema/room-categories";
import { rooms } from "@/src/db/schema/rooms";
import { getCurrentSession } from "@/src/lib/auth/server";
import {
  getCloudinaryPublicConfig,
  getRoomCategoryImageFolder,
  getRoomImageFolder,
  requireCloudinaryConfig,
  signCloudinaryUpload,
} from "@/src/lib/cloudinary/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  paramsToSign: z.record(
    z.string(),
    z.union([z.string(), z.number()]),
  ),
});

const allowedParameters = new Set(["folder", "type"]);

const roomCategoryFolderPrefix = "mollis-lux/room-categories/";
const roomFolderPrefix = "mollis-lux/rooms/";

export async function POST(request: Request) {
  const session = await getCurrentSession({
    disableCookieCache: true,
  });

  if (!session) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  if (session.user.role !== "admin") {
    return NextResponse.json(
      { error: "Administrator access required." },
      { status: 403 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid signing parameters." },
      { status: 400 },
    );
  }

  const paramsToSign = parsed.data.paramsToSign;

  if (
    Object.keys(paramsToSign).some(
      (key) => !allowedParameters.has(key),
    )
  ) {
    return NextResponse.json(
      { error: "Unsupported signing parameters." },
      { status: 400 },
    );
  }

  const folder = paramsToSign.folder;

  if (typeof folder !== "string" || !folder.trim()) {
    return NextResponse.json(
      { error: "A valid upload folder is required." },
      { status: 400 },
    );
  }

  if (
    paramsToSign.type !== undefined &&
    paramsToSign.type !== "upload"
  ) {
    return NextResponse.json(
      { error: "Only standard image uploads are allowed." },
      { status: 400 },
    );
  }

  let authorizedFolder = false;

  // Room category image upload.
  // Expected folder: mollis-lux/room-categories/{roomCategoryId}
  if (folder.startsWith(roomCategoryFolderPrefix)) {
    const roomCategoryId = folder.slice(
      roomCategoryFolderPrefix.length,
    );

    if (
      !z.uuid().safeParse(roomCategoryId).success ||
      folder !== getRoomCategoryImageFolder(roomCategoryId)
    ) {
      return NextResponse.json(
        {
          error:
            "A valid room category upload folder is required.",
        },
        { status: 400 },
      );
    }

    const [category] = await db
      .select({ id: roomCategories.id })
      .from(roomCategories)
      .where(eq(roomCategories.id, roomCategoryId))
      .limit(1);

    if (!category) {
      return NextResponse.json(
        { error: "Room category not found." },
        { status: 404 },
      );
    }

    authorizedFolder = true;
  }

  // Physical room image upload.
  // Expected folder: mollis-lux/rooms/{roomId}
  if (folder.startsWith(roomFolderPrefix)) {
    const roomId = folder.slice(roomFolderPrefix.length);

    if (
      !z.uuid().safeParse(roomId).success ||
      folder !== getRoomImageFolder(roomId)
    ) {
      return NextResponse.json(
        {
          error: "A valid room upload folder is required.",
        },
        { status: 400 },
      );
    }

    const [room] = await db
      .select({ id: rooms.id })
      .from(rooms)
      .where(eq(rooms.id, roomId))
      .limit(1);

    if (!room) {
      return NextResponse.json(
        { error: "Room not found." },
        { status: 404 },
      );
    }

    authorizedFolder = true;
  }

  if (!authorizedFolder) {
    return NextResponse.json(
      { error: "The upload folder is not authorized." },
      { status: 400 },
    );
  }

  try {
    requireCloudinaryConfig();

    const publicConfig = getCloudinaryPublicConfig();

    if (!publicConfig) {
      return NextResponse.json(
        {
          error:
            "Cloudinary image storage is not configured.",
        },
        { status: 503 },
      );
    }

    // Generate the authoritative timestamp on the server.
    const timestamp = Math.floor(Date.now() / 1000);

    // Sign the exact upload parameters, including this timestamp.
    const signature = signCloudinaryUpload({
      folder,
      type: "upload",
      timestamp,
    });

    return NextResponse.json({
      signature,
      cloudName: publicConfig.cloudName,
      apiKey: publicConfig.apiKey,
      timestamp,
    });
  } catch (error) {
    console.error("[Cloudinary signature] failed", error);

    return NextResponse.json(
      {
        error:
          "Cloudinary image storage is not configured.",
      },
      { status: 503 },
    );
  }
}

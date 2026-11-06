import { v2 as cloudinary } from "cloudinary";

export const CLOUDINARY_MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export const CLOUDINARY_ALLOWED_FORMATS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "avif",
] as const;

export type CloudinaryPublicConfig = {
  cloudName: string;
  apiKey: string;
};

type CloudinaryConfig = CloudinaryPublicConfig & {
  apiSecret: string;
};

export class CloudinaryConfigurationError extends Error {
  constructor() {
    super("Cloudinary image storage is not configured.");
    this.name = "CloudinaryConfigurationError";
  }
}

export function getCloudinaryConfig(): CloudinaryConfig | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  return {
    cloudName,
    apiKey,
    apiSecret,
  };
}

/**
 * Returns only the values that are safe to send to a browser.
 * The API secret is intentionally not part of this return value.
 */
export function getCloudinaryPublicConfig(): CloudinaryPublicConfig | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();

  if (!cloudName || !apiKey) {
    return null;
  }

  return {
    cloudName,
    apiKey,
  };
}

export function requireCloudinaryConfig() {
  const config = getCloudinaryConfig();

  if (!config) {
    throw new CloudinaryConfigurationError();
  }

  return config;
}

export function getCloudinaryClient() {
  const config = requireCloudinaryConfig();

  cloudinary.config({
    cloud_name: config.cloudName,
    api_key: config.apiKey,
    api_secret: config.apiSecret,
    secure: true,
  });

  return cloudinary;
}

export function getRoomCategoryImageFolder(roomCategoryId: string) {
  return `mollis-lux/room-categories/${roomCategoryId}`;
}

export function isRoomCategoryImagePublicId(
  publicId: string,
  roomCategoryId: string,
) {
  const folder = getRoomCategoryImageFolder(roomCategoryId);

  return new RegExp(
    `^${escapeRegExp(folder)}/[A-Za-z0-9_-]+$`,
  ).test(publicId);
}

export function getRoomImageFolder(roomId: string) {
  return `mollis-lux/rooms/${roomId}`;
}

export function isRoomImagePublicId(
  publicId: string,
  roomId: string,
) {
  const folder = getRoomImageFolder(roomId);

  return new RegExp(
    `^${escapeRegExp(folder)}/[A-Za-z0-9_-]+$`,
  ).test(publicId);
}

export function getCloudinaryImageUrl(publicId: string) {
  const client = getCloudinaryClient();

  return client.url(publicId, {
    resource_type: "image",
    type: "upload",
    secure: true,
  });
}

export async function getCloudinaryImageResource(publicId: string) {
  const client = getCloudinaryClient();

  return client.api.resource(publicId, {
    resource_type: "image",
    type: "upload",
  });
}

export function signCloudinaryUpload(
  paramsToSign: Record<string, string | number>,
) {
  const config = requireCloudinaryConfig();
  const client = getCloudinaryClient();

  return client.utils.api_sign_request(paramsToSign, config.apiSecret);
}

export async function destroyCloudinaryImage(publicId: string) {
  const client = getCloudinaryClient();

  const result = await client.uploader.destroy(publicId, {
    resource_type: "image",
    type: "upload",
    invalidate: true,
  });

  if (result.result !== "ok" && result.result !== "not found") {
    throw new Error(`Cloudinary destroy returned ${result.result}.`);
  }

  return result.result;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

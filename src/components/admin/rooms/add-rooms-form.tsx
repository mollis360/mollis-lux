"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import AdminModal from "@/src/components/admin/ui/admin-modal";
import { createRoom, deleteRoom } from "@/src/lib/rooms/actions";
import {
  addCloudinaryRoomImage,
  deleteRoomImage,
  setRoomImageCover,
} from "@/src/lib/rooms/room-image-actions";

const MAX_IMAGES = 5;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

type CategoryOption = {
  id: string;
  name: string;
};

type RoomStatus = "available" | "maintenance" | "inactive";

type SelectedImage = {
  id: string;
  file: File;
  previewUrl: string;
  altText: string;
};

type PersistedImage = {
  id: string;
};

type CloudinarySignatureResponse = {
  signature: string;
  cloudName: string;
  apiKey: string;
  timestamp: number;
};

type CloudinaryUploadResponse = {
  public_id: string;
  resource_type: string;
  type: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
};

export default function AddRoomForm({
  categories,
  defaultCategoryId,
}: {
  categories: CategoryOption[];
  defaultCategoryId?: string;
}) {
  const router = useRouter();

  const initialCategory = useMemo(() => {
    if (
      defaultCategoryId &&
      categories.some((category) => category.id === defaultCategoryId)
    ) {
      return defaultCategoryId;
    }

    return categories[0]?.id ?? "";
  }, [categories, defaultCategoryId]);

  const [roomCategoryId, setRoomCategoryId] = useState(initialCategory);
  const [roomNumber, setRoomNumber] = useState("");
  const [name, setName] = useState("");
  const [floor, setFloor] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<RoomStatus>("available");
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [coverImageId, setCoverImageId] = useState<string | null>(null);

  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successCategoryId, setSuccessCategoryId] = useState<string | null>(
    null,
  );

  const previewUrlsRef = useRef(new Set<string>());

  useEffect(() => {
    const previewUrls = previewUrlsRef.current;

    return () => {
      for (const previewUrl of previewUrls) {
        URL.revokeObjectURL(previewUrl);
      }

      previewUrls.clear();
    };
  }, []);

  function validateImage(file: File): string | null {
    if (
      !ALLOWED_IMAGE_TYPES.includes(
        file.type as (typeof ALLOWED_IMAGE_TYPES)[number],
      )
    ) {
      return `${file.name}: only JPG, PNG, WEBP, and AVIF images are allowed.`;
    }

    if (file.size <= 0) {
      return `${file.name}: the selected file is empty.`;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return `${file.name}: the maximum image size is 10 MB.`;
    }

    return null;
  }

  function addSelectedFiles(files: File[]) {
    if (busy || files.length === 0) return;

    setError(null);

    const availableSlots = MAX_IMAGES - images.length;

    if (availableSlots <= 0) {
      setError("A room can have a maximum of 5 images.");
      return;
    }

    const filesToAdd = files.slice(0, availableSlots);

    for (const file of filesToAdd) {
      const validationError = validateImage(file);

      if (validationError) {
        setError(validationError);
        return;
      }
    }

    const nextImages: SelectedImage[] = filesToAdd.map((file) => {
      const previewUrl = URL.createObjectURL(file);
      previewUrlsRef.current.add(previewUrl);

      return {
        id: crypto.randomUUID(),
        file,
        previewUrl,
        altText: "",
      };
    });

    if (!coverImageId && nextImages[0]) {
      setCoverImageId(nextImages[0].id);
    }

    setImages((current) => [...current, ...nextImages]);

    if (files.length > availableSlots) {
      setError(
        `Only ${MAX_IMAGES} images can be selected for one room. The first ${availableSlots} eligible selection(s) were added.`,
      );
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    addSelectedFiles(files);

    // Allow the same file to be selected again after removal.
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();

    if (busy) return;

    addSelectedFiles(Array.from(event.dataTransfer.files));
  }

  function removeSelectedImage(imageId: string) {
    if (busy) return;

    const image = images.find((item) => item.id === imageId);

    if (image) {
      URL.revokeObjectURL(image.previewUrl);
      previewUrlsRef.current.delete(image.previewUrl);
    }

    const nextImages = images.filter((item) => item.id !== imageId);

    setImages(nextImages);

    if (coverImageId === imageId) {
      setCoverImageId(nextImages[0]?.id ?? null);
    }
  }

  function moveImage(imageId: string, direction: "left" | "right") {
    if (busy) return;

    setImages((current) => {
      const index = current.findIndex((image) => image.id === imageId);

      if (index === -1) return current;

      const targetIndex = direction === "left" ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= current.length) {
        return current;
      }

      const next = [...current];
      const [moved] = next.splice(index, 1);

      next.splice(targetIndex, 0, moved);

      return next;
    });
  }

  function updateAltText(imageId: string, altText: string) {
    if (busy) return;

    setImages((current) =>
      current.map((image) =>
        image.id === imageId ? { ...image, altText } : image,
      ),
    );
  }

  async function requestCloudinarySignature(
    folder: string,
  ): Promise<CloudinarySignatureResponse> {
    const response = await fetch("/api/cloudinary/signature", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // The server should generate and return the authoritative timestamp.
      body: JSON.stringify({
        paramsToSign: {
          folder,
          type: "upload",
        },
      }),
    });

    let body: unknown = null;

    try {
      body = await response.json();
    } catch {
      body = null;
    }

    if (!response.ok) {
      const message =
        isRecord(body) && typeof body.error === "string"
          ? body.error
          : "The Cloudinary upload signature could not be created.";

      throw new Error(message);
    }

    if (
      !isRecord(body) ||
      typeof body.signature !== "string" ||
      typeof body.cloudName !== "string" ||
      typeof body.apiKey !== "string" ||
      typeof body.timestamp !== "number" ||
      !Number.isInteger(body.timestamp)
    ) {
      throw new Error("The Cloudinary signing response is invalid.");
    }

    return {
      signature: body.signature,
      cloudName: body.cloudName,
      apiKey: body.apiKey,
      timestamp: body.timestamp,
    };
  }

  async function uploadImage(image: SelectedImage, roomId: string) {
    const folder = `mollis-lux/rooms/${roomId}`;
    const signed = await requestCloudinarySignature(folder);

    const formData = new FormData();

    formData.append("file", image.file);
    formData.append("api_key", signed.apiKey);
    formData.append("timestamp", signed.timestamp.toString());
    formData.append("folder", folder);
    formData.append("type", "upload");
    formData.append("signature", signed.signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(
        signed.cloudName,
      )}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    let body: unknown = null;

    try {
      body = await response.json();
    } catch {
      body = null;
    }

    if (!response.ok) {
      const message =
        isRecord(body) &&
        typeof body.error === "object" &&
        body.error !== null &&
        "message" in body.error &&
        typeof body.error.message === "string"
          ? body.error.message
          : "The image could not be uploaded to Cloudinary.";

      throw new Error(message);
    }

    if (!isCloudinaryUploadResponse(body)) {
      throw new Error("Cloudinary returned an invalid upload response.");
    }

    if (
      body.resource_type !== "image" ||
      body.type !== "upload" ||
      !body.public_id.startsWith(`${folder}/`)
    ) {
      throw new Error(
        "The uploaded image returned an invalid Cloudinary identifier.",
      );
    }

    return addCloudinaryRoomImage({
      roomId,
      publicId: body.public_id,
      width: body.width,
      height: body.height,
      bytes: body.bytes,
      format: body.format.toLowerCase(),
      altText: image.altText.trim(),
    });
  }

  async function cleanupCreatedRoom(
    roomId: string,
    persistedImages: PersistedImage[],
  ) {
    const cleanupErrors: string[] = [];

    for (const image of persistedImages) {
      try {
        await deleteRoomImage(image.id);
      } catch (cleanupError) {
        cleanupErrors.push(
          cleanupError instanceof Error
            ? cleanupError.message
            : "An image could not be cleaned up.",
        );
      }
    }

    try {
      await deleteRoom(roomId);
    } catch (cleanupError) {
      cleanupErrors.push(
        cleanupError instanceof Error
          ? cleanupError.message
          : "The newly created room could not be cleaned up.",
      );
    }

    return cleanupErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (busy) return;

    setError(null);
    setSuccess(false);
    setSuccessCategoryId(null);

    if (!roomCategoryId) {
      setError("Select a room category.");
      return;
    }

    if (!roomNumber.trim()) {
      setError("Enter a room number.");
      return;
    }

    if (images.length > MAX_IMAGES) {
      setError("A room can have a maximum of 5 images.");
      return;
    }

    for (const image of images) {
      const validationError = validateImage(image.file);

      if (validationError) {
        setError(validationError);
        return;
      }

      const altTextLength = image.altText.trim().length;

      if (altTextLength < 5) {
        setError(
          "Each room image needs meaningful alt text of at least 5 characters.",
        );
        return;
      }

      if (altTextLength > 255) {
        setError("Image alt text must not exceed 255 characters.");
        return;
      }
    }

    if (
      images.length > 0 &&
      !images.some((image) => image.id === coverImageId)
    ) {
      setError("Select a cover image before creating the room.");
      return;
    }

    setBusy(true);
    setUploading(false);
    setUploadProgress(0);

    let createdRoomId: string | null = null;
    const persistedImages: PersistedImage[] = [];

    try {
      const room = await createRoom({
        roomCategoryId,
        roomNumber: roomNumber.trim(),
        name: name.trim(),
        floor: floor.trim(),
        description: description.trim(),
        status,
      });

      createdRoomId = room.id;

      if (images.length > 0) {
        setUploading(true);

        for (let index = 0; index < images.length; index++) {
          const savedImage = await uploadImage(images[index], room.id);

          persistedImages.push({ id: savedImage.id });

          setUploadProgress(
            Math.round(((index + 1) / images.length) * 100),
          );
        }

        if (coverImageId) {
          const coverIndex = images.findIndex(
            (image) => image.id === coverImageId,
          );

          const coverImage = persistedImages[coverIndex];

          if (!coverImage) {
            throw new Error(
              "The selected cover image could not be found after uploading.",
            );
          }

          await setRoomImageCover(coverImage.id);
        }
      }

      setSuccessCategoryId(room.roomCategoryId);
      setSuccess(true);
    } catch (submitError) {
      if (createdRoomId) {
        const cleanupErrors = await cleanupCreatedRoom(
          createdRoomId,
          persistedImages,
        );

        if (cleanupErrors.length > 0) {
          setError(
            `The room could not be completed. Some cleanup operations also failed: ${cleanupErrors.join(" ")}`,
          );
        } else {
          setError(
            submitError instanceof Error
              ? submitError.message
              : "The room could not be created.",
          );
        }
      } else {
        setError(
          submitError instanceof Error
            ? submitError.message
            : "The room could not be created.",
        );
      }
    } finally {
      setBusy(false);
      setUploading(false);
    }
  }

  function handleSuccessClose() {
    const categoryId = successCategoryId;

    setSuccess(false);
    setSuccessCategoryId(null);

    if (categoryId) {
      router.push(`/admin/room-categories/${categoryId}`);
      router.refresh();
    }
  }

  if (categories.length === 0) {
    return (
      <div className="rounded-[1.75rem] border border-dashed border-neutral-300 bg-white/70 p-8 text-center shadow-sm backdrop-blur">
        <h2 className="font-serif text-xl text-neutral-900">
          No room categories available
        </h2>

        <p className="mt-2 text-sm text-neutral-500">
          Create the room categories before adding physical rooms.
        </p>
      </div>
    );
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-[1.75rem] border border-neutral-200/80 bg-white/80 p-5 shadow-sm backdrop-blur sm:p-7"
      >
        <div className="grid gap-6">
          <div>
            <h2 className="font-serif text-2xl tracking-tight text-neutral-900">
              Room details
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              Add the physical room and its images in one workflow.
            </p>
          </div>

          <div className="grid gap-5">
            <Field label="Room category" required>
              <select
                value={roomCategoryId}
                onChange={(event) => setRoomCategoryId(event.target.value)}
                className="field"
                required
                disabled={busy}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Room number" required>
                <input
                  value={roomNumber}
                  onChange={(event) => setRoomNumber(event.target.value)}
                  className="field"
                  maxLength={50}
                  required
                  disabled={busy}
                />
              </Field>

              <Field label="Floor">
                <input
                  value={floor}
                  onChange={(event) => setFloor(event.target.value)}
                  className="field"
                  maxLength={20}
                  disabled={busy}
                />
              </Field>
            </div>

            <Field label="Room name">
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="field"
                maxLength={255}
                placeholder="Optional"
                disabled={busy}
              />
            </Field>

            <Field label="Description">
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="field min-h-32 resize-y"
                rows={5}
                disabled={busy}
              />
            </Field>

            <Field label="Status" required>
              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as RoomStatus)
                }
                className="field"
                disabled={busy}
              >
                <option value="available">Available</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
              </select>
            </Field>
          </div>

          <section className="border-t border-neutral-200 pt-6">
            <div className="mb-4">
              <h3 className="font-serif text-xl text-neutral-900">
                Room images
              </h3>

              <p className="mt-1 text-sm text-neutral-500">
                Add up to 5 images. The selected cover image will be used as
                the room&apos;s primary image.
              </p>
            </div>

            <div
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
              className="rounded-[1.5rem] border border-dashed border-neutral-300 bg-neutral-50/70 p-5 text-center transition-colors hover:border-amber-600/50 sm:p-7"
            >
              <div className="mx-auto max-w-xl">
                <div className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-neutral-700">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 16V4m0 0L7 9m5-5 5 5M5 15v4a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-4"
                    />
                  </svg>
                </div>

                <p className="mt-3 text-sm font-medium text-neutral-800">
                  Drag and drop room images here
                </p>

                <p className="mt-1 text-xs text-neutral-500">
                  JPG, PNG, WEBP, or AVIF · maximum 10 MB per image · maximum 5
                  images
                </p>

                <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="size-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 5v14m-7-7h14"
                    />
                  </svg>

                  <span>Select images</span>

                  <input
                    type="file"
                    accept={ALLOWED_IMAGE_TYPES.join(",")}
                    multiple
                    onChange={handleFileChange}
                    disabled={busy || images.length >= MAX_IMAGES}
                    className="sr-only"
                  />
                </label>

                <p className="mt-3 text-xs text-neutral-400">
                  {images.length} / {MAX_IMAGES} selected
                </p>
              </div>
            </div>

            {images.length > 0 ? (
              <div className="mt-5 grid gap-4">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className="overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white shadow-sm"
                  >
                    <div className="grid gap-4 p-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:p-5">
                      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-100">
                        <Image
                          src={image.previewUrl}
                          alt={
                            image.altText || "Selected room image preview"
                          }
                          fill
                          unoptimized
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 180px"
                        />

                        {coverImageId === image.id ? (
                          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-neutral-900/90 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                            Cover
                          </span>
                        ) : null}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-neutral-900">
                              {image.file.name}
                            </p>

                            <p className="mt-1 text-xs text-neutral-500">
                              {formatBytes(image.file.size)}
                            </p>
                          </div>

                          <span className="text-xs text-neutral-400">
                            Image {index + 1}
                          </span>
                        </div>

                        <div className="mt-4">
                          <label className="block">
                            <span className="mb-2 block text-sm font-medium text-neutral-700">
                              Alt text
                              <span className="ml-1 text-neutral-400">*</span>
                            </span>

                            <input
                              value={image.altText}
                              onChange={(event) =>
                                updateAltText(image.id, event.target.value)
                              }
                              className="field"
                              maxLength={255}
                              minLength={5}
                              placeholder="Describe this room image"
                              disabled={busy}
                              required
                            />
                          </label>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setCoverImageId(image.id)}
                            disabled={busy || coverImageId === image.id}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {coverImageId === image.id
                              ? "Cover selected"
                              : "Make cover"}
                          </button>

                          <button
                            type="button"
                            onClick={() => moveImage(image.id, "left")}
                            disabled={busy || index === 0}
                            className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            ← Move left
                          </button>

                          <button
                            type="button"
                            onClick={() => moveImage(image.id, "right")}
                            disabled={busy || index === images.length - 1}
                            className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Move right →
                          </button>

                          <button
                            type="button"
                            onClick={() => removeSelectedImage(image.id)}
                            disabled={busy}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-neutral-200/80 bg-white/60 px-4 py-3 text-sm text-neutral-500">
                No images selected. You can add images now or leave this
                section empty.
              </div>
            )}
          </section>

          {uploading ? (
            <div
              className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4"
              role="status"
              aria-live="polite"
            >
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="inline-flex items-center gap-2 font-medium text-neutral-800">
                  <span className="size-2 animate-pulse rounded-full bg-amber-600" />
                  Uploading room images...
                </span>

                <span className="tabular-nums text-neutral-500">
                  {uploadProgress}%
                </span>
              </div>

              <div
                className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-200"
                role="progressbar"
                aria-label="Room image upload progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={uploadProgress}
              >
                <div
                  className="h-full rounded-full bg-neutral-900 transition-[width] duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 border-t border-neutral-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={busy}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={busy}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy
                ? uploading
                  ? `Uploading ${uploadProgress}%...`
                  : "Creating room..."
                : "Create Room"}
            </button>
          </div>
        </div>
      </form>

      <AdminModal
        open={Boolean(error)}
        variant="error"
        title="Unable to create room"
        description={error ?? ""}
        closeLabel="Got it"
        onClose={() => setError(null)}
      />

      <AdminModal
        open={success}
        variant="success"
        title="Room created successfully"
        description="Your room and its images have been saved. Continue to the room category to review the result."
        closeLabel="View Category"
        onClose={handleSuccessClose}
      />
    </>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-neutral-700">
        {label}
        {required ? <span className="ml-1 text-neutral-400">*</span> : null}
      </span>

      {children}
    </label>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isCloudinaryUploadResponse(
  value: unknown,
): value is CloudinaryUploadResponse {
  if (!isRecord(value)) return false;

  return (
    typeof value.public_id === "string" &&
    typeof value.resource_type === "string" &&
    typeof value.type === "string" &&
    typeof value.width === "number" &&
    Number.isInteger(value.width) &&
    typeof value.height === "number" &&
    Number.isInteger(value.height) &&
    typeof value.bytes === "number" &&
    Number.isInteger(value.bytes) &&
    typeof value.format === "string"
  );
}
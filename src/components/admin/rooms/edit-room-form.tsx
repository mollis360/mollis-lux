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
import {
  ArrowLeft,
  ArrowRight,
  ImagePlus,
  LoaderCircle,
  RotateCcw,
  Save,
  ShieldCheck,
  Star,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

import AdminModal from "@/src/components/admin/ui/admin-modal";
import {
  deleteRoom,
  updateRoom,
} from "@/src/lib/rooms/actions";
import {
  addCloudinaryRoomImage,
  deleteRoomImage,
  discardCloudinaryRoomImage,
  reorderRoomImages,
  setRoomImageCover,
  updateRoomImage,
} from "@/src/lib/rooms/room-image-actions";
import type { RoomImage, RoomWithImages } from "@/src/lib/rooms/types";

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

type ExistingImage = RoomImage;

type NewImage = {
  id: string;
  file: File;
  previewUrl: string;
  altText: string;
};

type DisplayImage =
  | {
      kind: "existing";
      id: string;
      image: ExistingImage;
    }
  | {
      kind: "new";
      id: string;
      image: NewImage;
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

type PersistedNewImage = {
  tempId: string;
  id: string;
  publicId: string;
};

export default function EditRoomForm({
  room,
  categories,
}: {
  room: RoomWithImages;
  categories: CategoryOption[];
}) {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] =
    useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successCategoryId, setSuccessCategoryId] = useState<string | null>(
    null,
  );

  const [form, setForm] = useState({
    roomCategoryId: room.roomCategoryId,
    roomNumber: room.roomNumber,
    name: room.name ?? "",
    floor: room.floor ?? "",
    description: room.description ?? "",
    status: room.status as RoomStatus,
  });

  const [existingImages, setExistingImages] = useState<ExistingImage[]>(() =>
    [...room.images].sort((a, b) => a.sortOrder - b.sortOrder),
  );

  const [newImages, setNewImages] = useState<NewImage[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);

  const [displayOrder, setDisplayOrder] = useState<string[]>(() =>
    [...room.images]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((image) => image.id),
  );

  const [coverImageId, setCoverImageId] = useState<string | null>(
    room.images.find((image) => image.isCover)?.id ??
      room.images[0]?.id ??
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

  const activeExistingImages = useMemo(
    () =>
      existingImages.filter(
        (image) => !deletedImageIds.includes(image.id),
      ),
    [existingImages, deletedImageIds],
  );

  const existingImageMap = useMemo(
    () =>
      new Map(activeExistingImages.map((image) => [image.id, image])),
    [activeExistingImages],
  );

  const newImageMap = useMemo(
    () => new Map(newImages.map((image) => [image.id, image])),
    [newImages],
  );

  const displayImages = useMemo<DisplayImage[]>(() => {
    const result: DisplayImage[] = [];

    for (const id of displayOrder) {
      const existing = existingImageMap.get(id);

      if (existing) {
        result.push({
          kind: "existing",
          id: existing.id,
          image: existing,
        });

        continue;
      }

      const newImage = newImageMap.get(id);

      if (newImage) {
        result.push({
          kind: "new",
          id: newImage.id,
          image: newImage,
        });
      }
    }

    return result;
  }, [displayOrder, existingImageMap, newImageMap]);

  const totalImageCount = displayImages.length;

  function updateForm<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function validateImage(file: File): string | null {
    if (
      !ALLOWED_IMAGE_TYPES.includes(
        file.type as (typeof ALLOWED_IMAGE_TYPES)[number],
      )
    ) {
      return `${file.name}: only JPG, PNG, WEBP, and AVIF images are allowed.`;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return `${file.name}: the maximum image size is 10 MB.`;
    }

    if (file.size <= 0) {
      return `${file.name}: the selected file is empty.`;
    }

    return null;
  }

  function addSelectedFiles(files: File[]) {
    if (isSubmitting || isDeleting) return;

    setError(null);

    const availableSlots = MAX_IMAGES - totalImageCount;

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

    const nextImages: NewImage[] = filesToAdd.map((file) => {
      const previewUrl = URL.createObjectURL(file);

      previewUrlsRef.current.add(previewUrl);

      return {
        id: crypto.randomUUID(),
        file,
        previewUrl,
        altText: "",
      };
    });

    setNewImages((current) => [...current, ...nextImages]);

    setDisplayOrder((current) => [
      ...current,
      ...nextImages.map((image) => image.id),
    ]);

    if (!coverImageId && nextImages[0]) {
      setCoverImageId(nextImages[0].id);
    }

    if (files.length > availableSlots) {
      setError(`Only ${MAX_IMAGES} images can be kept for one room.`);
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    addSelectedFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();

    if (isSubmitting || isDeleting) return;

    addSelectedFiles(Array.from(event.dataTransfer.files));
  }

  function removeNewImage(imageId: string) {
    if (isSubmitting || isDeleting) return;

    const image = newImages.find((item) => item.id === imageId);

    if (image) {
      URL.revokeObjectURL(image.previewUrl);
      previewUrlsRef.current.delete(image.previewUrl);
    }

    setNewImages((current) =>
      current.filter((item) => item.id !== imageId),
    );

    setDisplayOrder((current) =>
      current.filter((id) => id !== imageId),
    );

    if (coverImageId === imageId) {
      const replacement =
        displayImages.find((item) => item.id !== imageId)?.id ?? null;

      setCoverImageId(replacement);
    }
  }

  function markExistingImageForDeletion(imageId: string) {
    if (isSubmitting || isDeleting) return;

    setDeletedImageIds((current) =>
      current.includes(imageId) ? current : [...current, imageId],
    );

    if (coverImageId === imageId) {
      const replacement =
        displayImages.find((item) => item.id !== imageId)?.id ?? null;

      setCoverImageId(replacement);
    }
  }

  function restoreExistingImage(imageId: string) {
    if (isSubmitting || isDeleting) return;

    setDeletedImageIds((current) =>
      current.filter((id) => id !== imageId),
    );

    if (!coverImageId) {
      setCoverImageId(imageId);
    }
  }

  function updateExistingAltText(imageId: string, altText: string) {
    if (isSubmitting || isDeleting) return;

    setExistingImages((current) =>
      current.map((image) =>
        image.id === imageId ? { ...image, altText } : image,
      ),
    );
  }

  function updateNewAltText(imageId: string, altText: string) {
    if (isSubmitting || isDeleting) return;

    setNewImages((current) =>
      current.map((image) =>
        image.id === imageId ? { ...image, altText } : image,
      ),
    );
  }

  function moveDisplayImage(imageId: string, direction: "left" | "right") {
    if (isSubmitting || isDeleting) return;

    const currentIndex = displayOrder.findIndex((id) => id === imageId);

    if (currentIndex === -1) return;

    const targetIndex =
      direction === "left" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= displayOrder.length) {
      return;
    }

    setDisplayOrder((current) => {
      const next = [...current];
      const [moved] = next.splice(currentIndex, 1);

      if (!moved) return current;

      next.splice(targetIndex, 0, moved);

      return next;
    });
  }

  async function requestCloudinarySignature(
    folder: string,
  ): Promise<CloudinarySignatureResponse> {
    const response = await fetch("/api/cloudinary/signature", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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

  async function uploadNewImage(
    image: NewImage,
  ): Promise<PersistedNewImage> {
    const folder = `mollis-lux/rooms/${room.id}`;
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

    const savedImage = await addCloudinaryRoomImage({
      roomId: room.id,
      publicId: body.public_id,
      width: body.width,
      height: body.height,
      bytes: body.bytes,
      format: body.format.toLowerCase(),
      altText: image.altText.trim(),
    });

    return {
      tempId: image.id,
      id: savedImage.id,
      publicId: body.public_id,
    };
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting || isDeleting) return;

    setError(null);

    if (!form.roomCategoryId) {
      setError("Select a room category.");
      return;
    }

    if (!form.roomNumber.trim()) {
      setError("Enter a room number.");
      return;
    }

    if (totalImageCount > MAX_IMAGES) {
      setError("A room can have a maximum of 5 images.");
      return;
    }

    for (const item of displayImages) {
      const trimmedAltText = (item.image.altText ?? "").trim();

      if (trimmedAltText.length < 5) {
        setError(
          "Each room image needs meaningful alt text of at least 5 characters.",
        );
        return;
      }

      if (trimmedAltText.length > 255) {
        setError("Image alt text must not exceed 255 characters.");
        return;
      }

      if (item.kind === "new") {
        const validationError = validateImage(item.image.file);

        if (validationError) {
          setError(validationError);
          return;
        }
      }
    }

    if (totalImageCount > 0 && !coverImageId) {
      setError("Select a cover image before saving.");
      return;
    }

    if (
      coverImageId &&
      !displayImages.some((item) => item.id === coverImageId)
    ) {
      setError(
        "Your selected cover image is no longer available. Select another cover image.",
      );
      return;
    }

    setIsSubmitting(true);
    setUploading(false);
    setUploadProgress(0);

    const persistedNewImages: PersistedNewImage[] = [];

    try {
      const updatedRoom = await updateRoom(room.id, {
        roomCategoryId: form.roomCategoryId,
        roomNumber: form.roomNumber.trim(),
        name: form.name.trim() || undefined,
        floor: form.floor.trim() || undefined,
        description: form.description.trim() || undefined,
        status: form.status,
      });

      const orderedNewImages = displayImages
        .filter(
          (item): item is Extract<DisplayImage, { kind: "new" }> =>
            item.kind === "new",
        )
        .map((item) => item.image);

      const idMap = new Map<string, string>();

      if (orderedNewImages.length > 0) {
        setUploading(true);

        for (let index = 0; index < orderedNewImages.length; index++) {
          const saved = await uploadNewImage(orderedNewImages[index]);

          persistedNewImages.push(saved);
          idMap.set(saved.tempId, saved.id);

          setUploadProgress(
            Math.round(((index + 1) / orderedNewImages.length) * 100),
          );
        }
      }

      const finalOrder = displayImages.map((item) => {
        if (item.kind === "existing") {
          return item.id;
        }

        const persistedId = idMap.get(item.id);

        if (!persistedId) {
          throw new Error("A newly uploaded image could not be linked.");
        }

        return persistedId;
      });

      const deletedIds = new Set(deletedImageIds);

      for (const image of existingImages) {
        if (deletedIds.has(image.id)) {
          await deleteRoomImage(image.id);
          continue;
        }

        const originalImage = room.images.find(
          (original) => original.id === image.id,
        );

        const currentAltText = (image.altText ?? "").trim();
        const originalAltText = (originalImage?.altText ?? "").trim();

        if (originalImage && originalAltText !== currentAltText) {
          await updateRoomImage({
            id: image.id,
            altText: currentAltText,
          });
        }
      }

      if (finalOrder.length > 0) {
        await reorderRoomImages(room.id, finalOrder);

        let finalCoverId = coverImageId;

        if (finalCoverId && idMap.has(finalCoverId)) {
          finalCoverId = idMap.get(finalCoverId) ?? null;
        }

        if (finalCoverId && finalOrder.includes(finalCoverId)) {
          await setRoomImageCover(finalCoverId);
        } else {
          await setRoomImageCover(finalOrder[0]);
        }
      }

      setSuccessCategoryId(updatedRoom.roomCategoryId);
      setSuccess(true);
    } catch (submitError) {
      for (const image of persistedNewImages) {
        try {
          await deleteRoomImage(image.id);
        } catch {
          // Preserve the original save error.
        }

        try {
          await discardCloudinaryRoomImage({
            roomId: room.id,
            publicId: image.publicId,
          });
        } catch {
          // Preserve the original save error.
        }
      }

      setError(
        submitError instanceof Error
          ? submitError.message
          : "The room could not be updated.",
      );
    } finally {
      setIsSubmitting(false);
      setUploading(false);
    }
  }

  async function handleDeleteRoom() {
    if (isDeleting || isSubmitting) return;

    setError(null);
    setIsDeleting(true);

    try {
      await deleteRoom(room.id);

      setDeleteConfirmationOpen(false);

      router.push(`/admin/room-categories/${room.roomCategoryId}`);
      router.refresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "The room could not be deleted.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  function handleSuccessClose() {
    setSuccess(false);

    const categoryId = successCategoryId ?? room.roomCategoryId;

    router.push(`/admin/room-categories/${categoryId}`);
    router.refresh();
  }

  if (categories.length === 0) {
    return (
      <div className="rounded-[1.75rem] border border-dashed border-neutral-300 bg-white/70 p-8 text-center shadow-sm backdrop-blur">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-500">
          <ShieldCheck size={23} />
        </div>

        <h2 className="mt-4 font-serif text-xl text-neutral-900">
          No room categories available
        </h2>

        <p className="mt-2 text-sm text-neutral-500">
          Create a room category before editing this room.
        </p>
      </div>
    );
  }

  return (
    <>
      <AdminModal
        open={Boolean(error)}
        variant="error"
        title="Unable to update room"
        description={error ?? ""}
        closeLabel="Got it"
        onClose={() => setError(null)}
      />

      <AdminModal
        open={deleteConfirmationOpen}
        variant="confirm"
        title="Delete this room?"
        description={`Room ${room.roomNumber} will be permanently deleted if it has no reservation history. This action cannot be undone.`}
        confirmLabel={isDeleting ? "Deleting room..." : "Delete room"}
        cancelLabel="Keep room"
        busy={isDeleting}
        onConfirm={handleDeleteRoom}
        onClose={() => {
          if (!isDeleting) {
            setDeleteConfirmationOpen(false);
          }
        }}
      />

      <AdminModal
        open={success}
        variant="success"
        title="Room updated successfully"
        description="Your room details and image changes have been saved."
        closeLabel="Back to room category"
        onClose={handleSuccessClose}
      />

      <form
        onSubmit={onSubmit}
        noValidate
        aria-busy={isSubmitting || isDeleting}
        className="space-y-7 rounded-[1.75rem] border border-neutral-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-xl sm:p-8"
      >
        <section>
          <div className="mb-6 flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 text-neutral-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <ShieldCheck size={23} />
            </div>

            <div>
              <h2 className="font-serif text-2xl tracking-tight text-neutral-900">
                Room details
              </h2>

              <p className="mt-1 text-sm leading-6 text-neutral-500">
                Update the physical room information and operational status.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <Field label="Category">
              <select
                value={form.roomCategoryId}
                onChange={(event) =>
                  updateForm("roomCategoryId", event.target.value)
                }
                className="field"
                required
                disabled={isSubmitting || isDeleting}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Room Number">
                <input
                  value={form.roomNumber}
                  onChange={(event) =>
                    updateForm("roomNumber", event.target.value)
                  }
                  required
                  maxLength={50}
                  className="field"
                  disabled={isSubmitting || isDeleting}
                />
              </Field>

              <Field label="Floor">
                <input
                  value={form.floor}
                  onChange={(event) => updateForm("floor", event.target.value)}
                  maxLength={20}
                  className="field"
                  disabled={isSubmitting || isDeleting}
                />
              </Field>
            </div>

            <Field label="Display Name">
              <input
                value={form.name}
                onChange={(event) => updateForm("name", event.target.value)}
                maxLength={255}
                className="field"
                disabled={isSubmitting || isDeleting}
              />
            </Field>

            <Field label="Description">
              <textarea
                value={form.description}
                onChange={(event) =>
                  updateForm("description", event.target.value)
                }
                rows={5}
                className="field min-h-32 resize-y"
                disabled={isSubmitting || isDeleting}
              />
            </Field>

            <Field label="Operational Status">
              <select
                value={form.status}
                onChange={(event) =>
                  updateForm("status", event.target.value as RoomStatus)
                }
                className="field"
                disabled={isSubmitting || isDeleting}
              >
                <option value="available">Available</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
              </select>
            </Field>
          </div>
        </section>

        <section className="border-t border-neutral-200 pt-7">
          <div className="mb-5 flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 text-neutral-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <ImagePlus size={23} />
            </div>

            <div>
              <h2 className="font-serif text-2xl tracking-tight text-neutral-900">
                Room images
              </h2>

              <p className="mt-1 text-sm leading-6 text-neutral-500">
                Manage up to 5 room images. Choose a cover image and arrange
                the order guests will see.
              </p>
            </div>
          </div>

          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
            className="group rounded-[1.5rem] border border-dashed border-neutral-300 bg-gradient-to-br from-neutral-50 to-white p-5 text-center transition-colors duration-200 hover:border-neutral-500 hover:bg-neutral-50 sm:p-7"
          >
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-white text-neutral-700 shadow-sm ring-1 ring-neutral-200 transition duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md">
              <UploadCloud size={26} />
            </div>

            <p className="mt-4 text-sm font-semibold text-neutral-900">
              Add more room images
            </p>

            <p className="mt-1 text-xs leading-5 text-neutral-500">
              Drag and drop images here, or select files below.
              <br />
              JPG, PNG, WEBP or AVIF · maximum 10 MB each
            </p>

            <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-neutral-700 hover:shadow-md has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50">
              <ImagePlus size={17} />
              Select images

              <input
                type="file"
                accept={ALLOWED_IMAGE_TYPES.join(",")}
                multiple
                onChange={handleFileChange}
                disabled={
                  isSubmitting || isDeleting || totalImageCount >= MAX_IMAGES
                }
                className="sr-only"
              />
            </label>

            <div className="mx-auto mt-5 max-w-xs">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-neutral-500">Image capacity</span>

                <span className="font-semibold tabular-nums text-neutral-800">
                  {totalImageCount} / {MAX_IMAGES}
                </span>
              </div>

              <div
                className="h-1.5 overflow-hidden rounded-full bg-neutral-200"
                role="progressbar"
                aria-label="Room image capacity"
                aria-valuemin={0}
                aria-valuemax={MAX_IMAGES}
                aria-valuenow={totalImageCount}
              >
                <div
                  className="h-full rounded-full bg-neutral-800 transition-[width] duration-300"
                  style={{
                    width: `${(totalImageCount / MAX_IMAGES) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {displayImages.length > 0 ? (
            <div className="mt-6 grid gap-4">
              {displayImages.map((item, index) => {
                if (item.kind === "existing") {
                  return (
                    <ExistingImageCard
                      key={item.id}
                      image={item.image}
                      index={index}
                      total={displayImages.length}
                      isCover={coverImageId === item.id}
                      disabled={isSubmitting || isDeleting}
                      onSetCover={() => setCoverImageId(item.id)}
                      onMoveLeft={() => moveDisplayImage(item.id, "left")}
                      onMoveRight={() => moveDisplayImage(item.id, "right")}
                      onRemove={() => markExistingImageForDeletion(item.id)}
                      onAltTextChange={(value) =>
                        updateExistingAltText(item.id, value)
                      }
                    />
                  );
                }

                return (
                  <NewImageCard
                    key={item.id}
                    image={item.image}
                    index={index}
                    total={displayImages.length}
                    isCover={coverImageId === item.id}
                    disabled={isSubmitting || isDeleting}
                    onSetCover={() => setCoverImageId(item.id)}
                    onMoveLeft={() => moveDisplayImage(item.id, "left")}
                    onMoveRight={() => moveDisplayImage(item.id, "right")}
                    onRemove={() => removeNewImage(item.id)}
                    onAltTextChange={(value) =>
                      updateNewAltText(item.id, value)
                    }
                  />
                );
              })}
            </div>
          ) : (
            <div className="mt-6 rounded-[1.5rem] border border-dashed border-neutral-300 bg-neutral-50/60 px-5 py-9 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-white text-neutral-400 shadow-sm ring-1 ring-neutral-200">
                <ImagePlus size={22} />
              </div>

              <p className="mt-3 text-sm font-medium text-neutral-700">
                No room images yet
              </p>

              <p className="mt-1 text-xs text-neutral-500">
                Add an image to give guests a better view of this room.
              </p>
            </div>
          )}

          {deletedImageIds.length > 0 ? (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                  <Trash2 size={17} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-amber-950">
                    {deletedImageIds.length} image
                    {deletedImageIds.length === 1 ? "" : "s"} marked for
                    deletion
                  </p>

                  <p className="mt-1 text-xs leading-5 text-amber-800">
                    These images will be removed when you save. You can still
                    undo this change.
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {deletedImageIds.map((imageId) => (
                      <button
                        key={imageId}
                        type="button"
                        onClick={() => restoreExistingImage(imageId)}
                        disabled={isSubmitting || isDeleting}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs font-semibold text-amber-900 transition duration-200 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <RotateCcw size={13} />
                        Undo
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {uploading ? (
            <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4">
              <div className="flex items-center gap-3">
                <LoaderCircle
                  size={19}
                  className="shrink-0 animate-spin text-neutral-700"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-neutral-800">
                      Uploading new images
                    </span>

                    <span className="font-semibold tabular-nums text-neutral-600">
                      {uploadProgress}%
                    </span>
                  </div>

                  <div
                    className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-200"
                    role="progressbar"
                    aria-label="Image upload progress"
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
              </div>
            </div>
          ) : null}
        </section>

        <div className="flex flex-col-reverse gap-3 border-t border-neutral-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="hidden text-xs leading-5 text-neutral-400 sm:block">
            Changes are applied when you save.
          </p>

          <div className="flex w-full flex-col-reverse gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={() => setDeleteConfirmationOpen(true)}
              disabled={isSubmitting || isDeleting}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition duration-200 hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-100 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDeleting ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <Trash2
                  size={17}
                  className="transition-transform duration-200 hover:scale-110"
                />
              )}
              Delete Room
            </button>

            <button
              type="button"
              onClick={() =>
                router.push(`/admin/room-categories/${room.roomCategoryId}`)
              }
              disabled={isSubmitting || isDeleting}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-medium text-neutral-600 transition duration-200 hover:border-neutral-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={16} />
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || isDeleting}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-neutral-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle size={17} className="animate-spin" />
                  {uploading
                    ? `Uploading ${uploadProgress}%...`
                    : "Saving changes..."}
                </>
              ) : (
                <>
                  <Save size={17} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}

function ExistingImageCard({
  image,
  index,
  total,
  isCover,
  disabled,
  onSetCover,
  onMoveLeft,
  onMoveRight,
  onRemove,
  onAltTextChange,
}: {
  image: ExistingImage;
  index: number;
  total: number;
  isCover: boolean;
  disabled: boolean;
  onSetCover: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onRemove: () => void;
  onAltTextChange: (value: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md">
      <div className="grid gap-4 p-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:p-5">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-100">
          <Image
            src={image.imageUrl}
            alt={image.altText || "Room image"}
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
            sizes="(max-width: 640px) 100vw, 180px"
          />

          {isCover ? (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-neutral-900/90 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
              <Star size={12} className="fill-current" />
              Cover image
            </span>
          ) : null}

          <span className="absolute bottom-3 right-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-neutral-700 backdrop-blur">
            {index + 1} of {total}
          </span>
        </div>

        <div className="min-w-0">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-neutral-900">
              Image {index + 1}
            </p>

            <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-500">
              Existing
            </span>
          </div>

          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-medium text-neutral-700">
              Alt text
            </span>

            <input
              value={image.altText ?? ""}
              onChange={(event) => onAltTextChange(event.target.value)}
              maxLength={255}
              minLength={5}
              className="field"
              disabled={disabled}
              required
            />

            <span className="mt-1.5 block text-xs text-neutral-400">
              {(image.altText ?? "").length} / 255 characters
            </span>
          </label>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onSetCover}
              disabled={disabled || isCover}
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 transition duration-200 hover:-translate-y-0.5 hover:bg-neutral-50 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Star
                size={13}
                className={`transition-transform duration-200 ${
                  isCover ? "fill-current" : ""
                }`}
              />
              {isCover ? "Cover selected" : "Make cover"}
            </button>

            <button
              type="button"
              onClick={onMoveLeft}
              disabled={disabled || index === 0}
              aria-label="Move image left"
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 transition duration-200 hover:-translate-y-0.5 hover:bg-neutral-50 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft size={13} />
              Move left
            </button>

            <button
              type="button"
              onClick={onMoveRight}
              disabled={disabled || index === total - 1}
              aria-label="Move image right"
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 transition duration-200 hover:-translate-y-0.5 hover:bg-neutral-50 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              Move right
              <ArrowRight size={13} />
            </button>

            <button
              type="button"
              onClick={onRemove}
              disabled={disabled}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition duration-200 hover:-translate-y-0.5 hover:bg-red-100 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 size={13} />
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewImageCard({
  image,
  index,
  total,
  isCover,
  disabled,
  onSetCover,
  onMoveLeft,
  onMoveRight,
  onRemove,
  onAltTextChange,
}: {
  image: NewImage;
  index: number;
  total: number;
  isCover: boolean;
  disabled: boolean;
  onSetCover: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onRemove: () => void;
  onAltTextChange: (value: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-dashed border-neutral-300 bg-neutral-50/40 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-neutral-400 hover:bg-white hover:shadow-md">
      <div className="grid gap-4 p-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:p-5">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-100">
          <Image
            src={image.previewUrl}
            alt={image.altText || "New room image preview"}
            fill
            unoptimized
            className="object-cover transition-transform duration-500 hover:scale-105"
            sizes="(max-width: 640px) 100vw, 180px"
          />

          {isCover ? (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-neutral-900/90 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
              <Star size={12} className="fill-current" />
              Cover image
            </span>
          ) : null}

          <span className="absolute bottom-3 right-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-neutral-700 backdrop-blur">
            {index + 1} of {total}
          </span>
        </div>

        <div className="min-w-0">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-neutral-900">
                {image.file.name}
              </p>

              <p className="mt-1 text-xs text-neutral-500">
                {formatBytes(image.file.size)}
              </p>
            </div>

            <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
              New image
            </span>
          </div>

          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-medium text-neutral-700">
              Alt text
            </span>

            <input
              value={image.altText}
              onChange={(event) => onAltTextChange(event.target.value)}
              maxLength={255}
              minLength={5}
              placeholder="Describe this room image"
              className="field"
              disabled={disabled}
              required
            />

            <span className="mt-1.5 block text-xs text-neutral-400">
              {image.altText.length} / 255 characters
            </span>
          </label>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onSetCover}
              disabled={disabled || isCover}
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 transition duration-200 hover:-translate-y-0.5 hover:bg-neutral-50 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Star
                size={13}
                className={`transition-transform duration-200 ${
                  isCover ? "fill-current" : ""
                }`}
              />
              {isCover ? "Cover selected" : "Make cover"}
            </button>

            <button
              type="button"
              onClick={onMoveLeft}
              disabled={disabled || index === 0}
              aria-label="Move image left"
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 transition duration-200 hover:-translate-y-0.5 hover:bg-neutral-50 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft size={13} />
              Move left
            </button>

            <button
              type="button"
              onClick={onMoveRight}
              disabled={disabled || index === total - 1}
              aria-label="Move image right"
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 transition duration-200 hover:-translate-y-0.5 hover:bg-neutral-50 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              Move right
              <ArrowRight size={13} />
            </button>

            <button
              type="button"
              onClick={onRemove}
              disabled={disabled}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition duration-200 hover:-translate-y-0.5 hover:bg-red-100 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 size={13} />
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
        {label}
      </span>

      {children}
    </label>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

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


"use client";

import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from "react";

export type AdminModalVariant =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "confirm";

type AdminModalProps = {
  open: boolean;
  variant?: AdminModalVariant;
  title: string;
  description?: string;
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  closeLabel?: string;
  busy?: boolean;
  onConfirm?: () => void | Promise<void>;
  onClose: () => void;
};

const variantStyles: Record<
  AdminModalVariant,
  {
    icon: string;
    iconClass: string;
    confirmClass: string;
  }
> = {
  success: {
    icon: "✓",
    iconClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
    confirmClass: "bg-neutral-900 text-white hover:bg-neutral-800",
  },
  error: {
    icon: "!",
    iconClass: "border-red-200 bg-red-50 text-red-700",
    confirmClass: "bg-neutral-900 text-white hover:bg-neutral-800",
  },
  warning: {
    icon: "!",
    iconClass: "border-amber-200 bg-amber-50 text-amber-800",
    confirmClass: "bg-amber-700 text-white hover:bg-amber-800",
  },
  info: {
    icon: "i",
    iconClass: "border-neutral-200 bg-neutral-100 text-neutral-700",
    confirmClass: "bg-neutral-900 text-white hover:bg-neutral-800",
  },
  confirm: {
    icon: "?",
    iconClass: "border-amber-200 bg-amber-50 text-amber-800",
    confirmClass: "bg-neutral-900 text-white hover:bg-neutral-800",
  },
};

export default function AdminModal({
  open,
  variant = "info",
  title,
  description,
  children,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  closeLabel = "Close",
  busy = false,
  onConfirm,
  onClose,
}: AdminModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const primaryButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  const isConfirmation = Boolean(onConfirm);
  const styles = variantStyles[variant];

  useEffect(() => {
    if (!open) return;

    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    primaryButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (!busy) {
          event.preventDefault();
          onClose();
        }
        return;
      }

      if (event.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusableElements = dialog.querySelectorAll<HTMLElement>(
        [
          "a[href]",
          "button:not(:disabled)",
          "input:not(:disabled)",
          "select:not(:disabled)",
          "textarea:not(:disabled)",
          '[tabindex]:not([tabindex="-1"])',
        ].join(","),
      );

      const focusable = Array.from(focusableElements).filter(
        (element) =>
          !element.hasAttribute("hidden") &&
          element.getAttribute("aria-hidden") !== "true",
      );

      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocusedRef.current?.focus();
    };
  }, [open, busy, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto bg-neutral-950/50 p-4 backdrop-blur-sm sm:items-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) {
          onClose();
        }
      }}
    >
      <section
        ref={dialogRef}
        tabIndex={-1}
        role={isConfirmation ? "alertdialog" : "dialog"}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={
          description || children ? descriptionId : undefined
        }
        className="my-auto w-full max-w-md overflow-hidden rounded-[1.75rem] border border-neutral-200/80 bg-[#fffdf9] shadow-[0_24px_80px_rgba(28,25,23,0.18)] outline-none"
      >
        <div className="p-6 sm:p-7">
          <div
            className={`flex size-12 items-center justify-center rounded-2xl border text-xl font-semibold ${styles.iconClass}`}
            aria-hidden="true"
          >
            {styles.icon}
          </div>

          <h2
            id={titleId}
            className="mt-5 font-serif text-2xl tracking-tight text-neutral-900"
          >
            {title}
          </h2>

          {description ? (
            <p
              id={descriptionId}
              className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-600"
            >
              {description}
            </p>
          ) : null}

          {children ? (
            <div
              id={description ? undefined : descriptionId}
              className="mt-4 text-sm leading-6 text-neutral-700"
            >
              {children}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-neutral-200/80 bg-neutral-50/80 px-6 py-4 sm:flex-row sm:justify-end sm:px-7">
          {isConfirmation ? (
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cancelLabel}
            </button>
          ) : null}

          <button
            ref={primaryButtonRef}
            type="button"
            onClick={() => {
              if (busy) return;

              if (onConfirm) {
                void onConfirm();
                return;
              }

              onClose();
            }}
            disabled={busy}
            className={`inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 disabled:cursor-not-allowed disabled:opacity-50 ${styles.confirmClass}`}
          >
            {busy
              ? "Please wait..."
              : isConfirmation
                ? confirmLabel
                : closeLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

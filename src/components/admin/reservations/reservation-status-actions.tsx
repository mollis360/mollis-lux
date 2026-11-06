
"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReservationStatus } from "@/src/db/schema/reservations";
import AdminModal from "@/src/components/admin/ui/admin-modal";
import { transitionReservationStatus } from "@/src/lib/reservations/actions";
import { getReservationTransitions } from "@/src/lib/reservations/state";

function formatStatus(status: ReservationStatus) {
  return status.replaceAll("_", " ");
}

function getResultTitle(status: ReservationStatus) {
  switch (status) {
    case "confirmed":
      return "Reservation confirmed";
    case "cancelled":
      return "Reservation cancelled";
    case "checked_in":
      return "Guest checked in";
    case "checked_out":
      return "Guest checked out";
    case "no_show":
      return "Reservation marked as no-show";
    case "expired":
      return "Reservation expired";
    default:
      return "Reservation status updated";
  }
}

function getResultDescription(status: ReservationStatus) {
  switch (status) {
    case "confirmed":
      return "The reservation has been successfully confirmed.";
    case "cancelled":
      return "The reservation has been successfully cancelled.";
    case "checked_in":
      return "The guest has been successfully checked in.";
    case "checked_out":
      return "The guest has been successfully checked out.";
    case "no_show":
      return "The reservation has been successfully marked as a no-show.";
    case "expired":
      return "The reservation has expired.";
    default:
      return `The reservation status has been updated to ${formatStatus(status)}.`;
  }
}

export default function ReservationStatusActions({
  reservationId,
  status,
}: {
  reservationId: string;
  status: ReservationStatus;
}) {
  const router = useRouter();

  const [busyStatus, setBusyStatus] = useState<ReservationStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [pendingStatus, setPendingStatus] =
    useState<ReservationStatus | null>(null);

  const [completedStatus, setCompletedStatus] =
    useState<ReservationStatus | null>(null);

  const transitions = getReservationTransitions(status);
  const isBusy = busyStatus !== null;

  const closeModal = useCallback(() => {
    if (isBusy) return;

    setPendingStatus(null);
    setCompletedStatus(null);
  }, [isBusy]);

  async function changeStatus() {
    if (!pendingStatus || isBusy) return;

    const nextStatus = pendingStatus;

    setBusyStatus(nextStatus);
    setError(null);

    try {
      const result = await transitionReservationStatus({
        reservationId,
        toStatus: nextStatus,
      });

      setPendingStatus(null);
      setCompletedStatus(result.status);

      router.refresh();
    } catch (err) {
      setPendingStatus(null);

      setError(
        err instanceof Error
          ? err.message
          : "The reservation status could not be updated.",
      );
    } finally {
      setBusyStatus(null);
    }
  }

  return (
    <div className="space-y-4">
      {transitions.length === 0 ? (
        <p className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-500">
          This reservation has no further status transitions.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {transitions.map((nextStatus) => (
            <button
              key={nextStatus}
              type="button"
              disabled={isBusy}
              onClick={() => {
                setError(null);
                setPendingStatus(nextStatus);
              }}
              className="rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium capitalize text-neutral-700 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {formatStatus(nextStatus)}
            </button>
          ))}
        </div>
      )}

      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <AdminModal
        open={pendingStatus !== null}
        variant="confirm"
        title="Confirm reservation update"
        description={
          pendingStatus
            ? `Are you sure you want to change this reservation status to "${formatStatus(pendingStatus)}"?`
            : undefined
        }
        confirmLabel="Yes, continue"
        cancelLabel="Cancel"
        busy={isBusy}
        onConfirm={changeStatus}
        onClose={closeModal}
      />

      <AdminModal
        open={completedStatus !== null}
        variant="success"
        title={
          completedStatus
            ? getResultTitle(completedStatus)
            : "Reservation updated"
        }
        description={
          completedStatus
            ? getResultDescription(completedStatus)
            : undefined
        }
        closeLabel="Done"
        onClose={closeModal}
      />
    </div>
  );
}

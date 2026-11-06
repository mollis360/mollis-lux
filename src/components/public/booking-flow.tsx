
"use client";

import Link from "next/link";
import { useMemo, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { checkRoomCategoryAvailability } from "@/src/lib/availability/actions";
import type { AvailabilityResult } from "@/src/lib/availability/queries";
import { createReservation } from "@/src/lib/reservations/actions";
import {
  BookingFeedback,
  BookingField,
  BookingProgress,
  BookingReviewRow,
  BookingRoomSummary,
  calculateBookingNights,
  formatBookingDate,
  formatBookingMoney,
  type BookingCategorySummary,
  type BookingPhysicalRoomSummary,
  type BookingStep,
} from "@/src/components/public/booking/booking-ui";

type Props = {
  category: BookingCategorySummary;
  initialCheckIn: string;
  initialCheckOut: string;
  initialAdults: string;
  initialChildren: string;
  roomId?: string;
  roomNumber?: string;
  physicalRoom?: BookingPhysicalRoomSummary;
};

type StaySelection = {
  roomCategoryId: string;
  roomId?: string;
  checkIn: string;
  checkOut: string;
  adults: string;
  children: string;
};

function createIdempotencyKey() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(16).slice(2)}`
  );
}

function getHotelTodayDate() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function getSelectionKey(selection: StaySelection) {
  return JSON.stringify(selection);
}

export default function BookingFlow({
  category,
  initialCheckIn,
  initialCheckOut,
  initialAdults,
  initialChildren,
  roomId,
  roomNumber,
  physicalRoom,
}: Props) {
  const router = useRouter();

  const minDate = useMemo(() => getHotelTodayDate(), []);
  const isSpecificRoomBooking = Boolean(roomId);

  const [step, setStep] = useState<BookingStep>("dates");

  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [adults, setAdults] = useState(initialAdults || "1");
  const [children, setChildren] = useState(initialChildren || "0");

  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  const [availability, setAvailability] =
    useState<AvailabilityResult | null>(null);

  const [checkedSelectionKey, setCheckedSelectionKey] = useState<
    string | null
  >(null);

  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const [idempotencyKey, setIdempotencyKey] = useState(createIdempotencyKey);

  const [isPending, startTransition] = useTransition();

  const selectionKey = getSelectionKey({
    roomCategoryId: category.id,
    roomId,
    checkIn,
    checkOut,
    adults,
    children,
  });

  const hasCurrentAvailability =
    availability?.available === true &&
    checkedSelectionKey === selectionKey;

  const stayNights =
    availability && checkedSelectionKey === selectionKey
      ? availability.nights
      : calculateBookingNights(checkIn, checkOut);

  const price =
    hasCurrentAvailability &&
    availability.totalAmount != null &&
    availability.currency
      ? formatBookingMoney(
          availability.totalAmount,
          availability.currency,
        )
      : null;

  const nightlyPrice =
    hasCurrentAvailability &&
    availability.pricePerNight != null &&
    availability.currency
      ? formatBookingMoney(
          availability.pricePerNight,
          availability.currency,
        )
      : null;

  function invalidateAvailability() {
    setAvailability(null);
    setCheckedSelectionKey(null);
    setError(null);
    setFieldError(null);
    setIdempotencyKey(createIdempotencyKey());
  }

  function updateCheckIn(value: string) {
    invalidateAvailability();
    setCheckIn(value);
  }

  function updateCheckOut(value: string) {
    invalidateAvailability();
    setCheckOut(value);
  }

  function updateAdults(value: string) {
    invalidateAvailability();
    setAdults(value);
  }

  function updateChildren(value: string) {
    invalidateAvailability();
    setChildren(value);
  }

  function checkAvailability(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setFieldError(null);

    const adultCount = Number(adults);
    const childCount = Number(children);

    if (!checkIn || !checkOut || checkIn >= checkOut) {
      setFieldError("Choose a check-out date after check-in.");
      return;
    }

    if (checkIn < minDate) {
      setFieldError("Check-in cannot be in the past.");
      return;
    }

    if (
      !Number.isInteger(adultCount) ||
      adultCount < 1 ||
      adultCount > category.maxAdults
    ) {
      setFieldError(
        `Choose between 1 and ${category.maxAdults} adult${
          category.maxAdults === 1 ? "" : "s"
        }.`,
      );
      return;
    }

    if (
      !Number.isInteger(childCount) ||
      childCount < 0 ||
      childCount > category.maxChildren
    ) {
      setFieldError(
        `This room category accommodates up to ${category.maxChildren} ${
          category.maxChildren === 1 ? "child" : "children"
        }.`,
      );
      return;
    }

    const requestSelectionKey = getSelectionKey({
      roomCategoryId: category.id,
      roomId,
      checkIn,
      checkOut,
      adults,
      children,
    });

    setAvailability(null);
    setCheckedSelectionKey(null);

    startTransition(async () => {
      try {
        const result = await checkRoomCategoryAvailability({
          roomCategoryId: category.id,
          ...(roomId ? { roomId } : {}),
          checkIn,
          checkOut,
          adults: adultCount,
          children: childCount,
        });

        setAvailability(result);
        setCheckedSelectionKey(requestSelectionKey);

        if (result.available) {
          setStep("guest");
        } else {
          setError(
            result.reason ??
              "This room is not available for the selected dates.",
          );
        }
      } catch (actionError) {
        setError(
          actionError instanceof Error
            ? actionError.message
            : "Availability could not be checked. Please try again.",
        );
      }
    });
  }

  function reviewGuestDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setFieldError(null);

    if (!hasCurrentAvailability) {
      setStep("dates");
      setError("Please check availability again before continuing.");
      return;
    }

    if (guestName.trim().length < 2) {
      setFieldError("Enter the guest name for this reservation.");
      return;
    }

    setStep("review");
  }

  function submitReservation() {
    setError(null);
    setFieldError(null);

    if (!hasCurrentAvailability) {
      setStep("dates");
      setError("Check availability again before submitting the reservation.");
      return;
    }

    if (checkIn < minDate) {
      setStep("dates");
      setError(
        "Your check-in date is now in the past. Please choose new dates.",
      );
      invalidateAvailability();
      return;
    }

    if (guestName.trim().length < 2) {
      setStep("guest");
      setFieldError("Enter the guest name for this reservation.");
      return;
    }

    const submittedIdempotencyKey = idempotencyKey;

    startTransition(async () => {
      try {
        const reservation = await createReservation({
          roomCategoryId: category.id,
          ...(roomId ? { roomId } : {}),
          checkIn,
          checkOut,
          adults: Number(adults),
          children: Number(children),
          guestName: guestName.trim(),
          guestPhone: guestPhone.trim() || undefined,
          idempotencyKey: submittedIdempotencyKey,
        });

        router.replace(`/booking/confirmation/${reservation.id}`);
      } catch (actionError) {
        setError(
          actionError instanceof Error
            ? actionError.message
            : "The reservation could not be created. Please try again.",
        );
      }
    });
  }

  function editDates() {
    setStep("dates");
    invalidateAvailability();
  }

  function editGuestDetails() {
    setStep("guest");
    setError(null);
    setFieldError(null);
  }

  return (
    <div className="text-stone-800">
      <header className="mb-8 flex flex-col gap-5 border-b border-[#e9e1d5] pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#a18455]">
            MOLLIS LUX · Reservations
          </p>

          <h1 className="mt-3 font-serif text-3xl tracking-tight text-[#30291f] sm:text-4xl">
            A stay to look forward to.
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-stone-500">
            Thoughtfully considered details. A more personal kind of luxury.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 self-start rounded-full border border-[#e7ddcc] bg-[#fffdf9] px-4 py-2 sm:self-auto">
          <span className="size-2 rounded-full bg-[#b99a68]" />

          <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-stone-600">
            Secure reservation
          </span>
        </div>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] xl:gap-8">
        <section
          className="min-w-0 overflow-hidden rounded-[28px] border border-[#e9e1d5] bg-white shadow-[0_22px_70px_-48px_rgba(58,43,28,0.28)]"
          aria-label="Reservation registration"
        >
          <div className="border-b border-[#f0ebe3] bg-[#fffdf9] px-5 py-6 sm:px-8 sm:py-7">
            <div className="mb-7 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a18455]">
                  Your reservation
                </p>

                <h2 className="mt-2 font-serif text-2xl text-[#30291f] sm:text-3xl">
                  Booking registration
                </h2>
              </div>

              <span className="hidden rounded-full border border-[#e8decd] bg-[#faf7f1] px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#92764e] sm:inline-flex">
                Step {step === "dates" ? "01" : step === "guest" ? "02" : "03"} / 03
              </span>
            </div>

            <BookingProgress step={step} />
          </div>

          <div className="border-b border-[#f0ebe3] px-5 py-6 sm:px-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a18455]">
              {step === "dates"
                ? "01 / Plan your visit"
                : step === "guest"
                  ? "02 / Guest information"
                  : "03 / Final review"}
            </p>

            <h2 className="mt-2 font-serif text-2xl text-[#30291f] sm:text-3xl">
              {step === "dates"
                ? "When would you like to stay?"
                : step === "guest"
                  ? "Let us know who to welcome."
                  : "Everything in order?"}
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-stone-500">
              {step === "dates"
                ? "Select your dates and party size. We’ll check availability for your selected accommodation."
                : step === "guest"
                  ? "Enter the lead guest’s details. Your signed-in account email will be used for this reservation."
                  : "Take a moment to confirm your stay and guest information before submitting."}
            </p>
          </div>

          <div className="p-5 sm:p-8">
            {step === "dates" ? (
              <form
                onSubmit={checkAvailability}
                className="space-y-7"
                noValidate
              >
                {isSpecificRoomBooking ? (
                  <div className="flex items-start gap-3 rounded-2xl border border-[#e8decd] bg-[#faf7f1] p-4">
                    <span className="mt-0.5 text-[#a18455]">
                      <BedIcon />
                    </span>

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a18455]">
                        Your selected room
                      </p>

                      <p className="mt-1 font-serif text-xl text-[#30291f]">
                        {roomNumber
                          ? `Room ${roomNumber}`
                          : "Specific room selected"}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-stone-500">
                        We’ll check this exact room for your dates. If it is
                        unavailable, you can return and choose another room.
                      </p>
                    </div>
                  </div>
                ) : null}

                <div className="grid gap-4 sm:grid-cols-2">
                  <BookingField
                    id="booking-check-in"
                    label="Check-in"
                    type="date"
                    min={minDate}
                    value={checkIn}
                    onChange={updateCheckIn}
                    required
                  />

                  <BookingField
                    id="booking-check-out"
                    label="Check-out"
                    type="date"
                    min={checkIn || minDate}
                    value={checkOut}
                    onChange={updateCheckOut}
                    required
                  />
                </div>

                <div className="rounded-2xl border border-[#eee7dc] bg-[#faf8f4] p-4 sm:p-5">
                  <div className="mb-4">
                    <p className="text-sm font-medium text-stone-800">
                      Who’s coming?
                    </p>

                    <p className="mt-1 text-xs leading-5 text-stone-500">
                      Choose the number of guests for your stay.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <BookingField
                      id="booking-adults"
                      label={`Adults · Max ${category.maxAdults}`}
                      type="number"
                      min={1}
                      max={category.maxAdults}
                      value={adults}
                      onChange={updateAdults}
                      required
                    />

                    <BookingField
                      id="booking-children"
                      label={`Children · Max ${category.maxChildren}`}
                      type="number"
                      min={0}
                      max={category.maxChildren}
                      value={children}
                      onChange={updateChildren}
                      required
                    />
                  </div>
                </div>

                {fieldError ? (
                  <BookingFeedback>{fieldError}</BookingFeedback>
                ) : null}

                {error ? <BookingFeedback>{error}</BookingFeedback> : null}

                <button
                  type="submit"
                  disabled={isPending}
                  className="luxury-primary-button group"
                >
                  {isPending
                    ? "Checking availability…"
                    : "Check availability"}

                  {!isPending ? (
                    <span
                      aria-hidden="true"
                      className="transition-transform group-hover:translate-x-1"
                    >
                      →
                    </span>
                  ) : null}
                </button>

                <p className="text-center text-[11px] leading-5 text-stone-400">
                  Checking dates does not create a reservation. Availability
                  is verified by the hotel booking system.
                </p>
              </form>
            ) : null}

            {step === "guest" ? (
              <form
                onSubmit={reviewGuestDetails}
                className="space-y-7"
                noValidate
              >
                <div className="rounded-2xl border border-[#eee7dc] bg-[#faf8f4] p-4 sm:p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a18455]">
                    Your selected stay
                  </p>

                  {isSpecificRoomBooking ? (
                    <p className="mt-2 text-sm font-medium text-stone-800">
                      {roomNumber
                        ? `Room ${roomNumber}`
                        : "Selected physical room"}
                    </p>
                  ) : null}

                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-stone-700">
                    <span>{formatBookingDate(checkIn)}</span>
                    <span className="text-[#a18455]">→</span>
                    <span>{formatBookingDate(checkOut)}</span>
                  </div>

                  <p className="mt-2 text-xs text-stone-500">
                    {stayNights > 0
                      ? `${stayNights} ${
                          stayNights === 1 ? "night" : "nights"
                        }`
                      : "Selected dates"}{" "}
                    · {adults} {Number(adults) === 1 ? "adult" : "adults"}
                    {Number(children) > 0
                      ? ` · ${children} ${
                          Number(children) === 1 ? "child" : "children"
                        }`
                      : ""}
                  </p>
                </div>

                <div className="space-y-5">
                  <BookingField
                    id="guest-name"
                    label="Full name of lead guest"
                    type="text"
                    autoComplete="name"
                    placeholder="Enter full name"
                    value={guestName}
                    onChange={setGuestName}
                    required
                  />

                  <BookingField
                    id="guest-phone"
                    label="Phone number · Optional"
                    type="tel"
                    autoComplete="tel"
                    placeholder="Enter a contact number"
                    value={guestPhone}
                    onChange={setGuestPhone}
                  />
                </div>

                {fieldError ? (
                  <BookingFeedback>{fieldError}</BookingFeedback>
                ) : null}

                {error ? <BookingFeedback>{error}</BookingFeedback> : null}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={editDates}
                    className="luxury-secondary-button"
                  >
                    <span aria-hidden="true">←</span> Change stay
                  </button>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="luxury-primary-button flex-1"
                  >
                    Review reservation <span aria-hidden="true">→</span>
                  </button>
                </div>
              </form>
            ) : null}

            {step === "review" &&
            hasCurrentAvailability &&
            availability ? (
              <div className="space-y-7" aria-labelledby="review-heading">
                <dl className="divide-y divide-[#eee7dc] rounded-2xl border border-[#eee7dc]">
                  <BookingReviewRow
                    label="Room category"
                    value={category.name}
                  />

                  {isSpecificRoomBooking ? (
                    <BookingReviewRow
                      label="Selected room"
                      value={
                        roomNumber
                          ? `Room ${roomNumber}`
                          : "Specific room selected"
                      }
                    />
                  ) : (
                    <BookingReviewRow
                      label="Room assignment"
                      value="An available room will be assigned when your reservation is created."
                    />
                  )}

                  <BookingReviewRow
                    label="Check-in"
                    value={formatBookingDate(checkIn)}
                  />

                  <BookingReviewRow
                    label="Check-out"
                    value={formatBookingDate(checkOut)}
                  />

                  <BookingReviewRow
                    label="Length of stay"
                    value={`${availability.nights} ${
                      availability.nights === 1 ? "night" : "nights"
                    }`}
                  />

                  <BookingReviewRow
                    label="Guests"
                    value={`${adults} ${
                      Number(adults) === 1 ? "adult" : "adults"
                    }${
                      Number(children) > 0
                        ? `, ${children} ${
                            Number(children) === 1 ? "child" : "children"
                          }`
                        : ""
                    }`}
                  />

                  <BookingReviewRow
                    label="Lead guest"
                    value={guestName.trim()}
                  />

                  <BookingReviewRow
                    label="Account email"
                    value="Your signed-in account email"
                  />

                  <BookingReviewRow
                    label="Phone"
                    value={guestPhone.trim() || "Not provided"}
                  />
                </dl>

                <div className="rounded-2xl border border-[#e8decd] bg-[#faf7f1] p-5 sm:p-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a18455]">
                    Stay estimate
                  </p>

                  <div className="mt-4 flex items-center justify-between gap-4">
                    <span className="text-sm text-stone-600">
                      Nightly rate
                    </span>

                    <span className="text-sm font-medium text-stone-800">
                      {nightlyPrice ?? "—"}
                    </span>
                  </div>

                  <div className="mt-4 flex items-end justify-between gap-4 border-t border-[#e8decd] pt-4">
                    <div>
                      <p className="text-sm font-medium text-stone-900">
                        Reservation total
                      </p>

                      <p className="mt-1 text-xs leading-5 text-stone-500">
                        Based on the current availability quote.
                      </p>
                    </div>

                    <p className="font-serif text-2xl text-[#8b7048] sm:text-3xl">
                      {price ?? "—"}
                    </p>
                  </div>
                </div>

                <BookingFeedback variant="info">
                  Creating this reservation establishes a 15-minute inventory
                  hold. Payment processing is not configured in this flow.
                </BookingFeedback>

                {error ? <BookingFeedback>{error}</BookingFeedback> : null}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={editGuestDetails}
                    disabled={isPending}
                    className="luxury-secondary-button"
                  >
                    Edit guest details
                  </button>

                  <button
                    type="button"
                    onClick={submitReservation}
                    disabled={isPending}
                    className="luxury-primary-button flex-1"
                  >
                    {isPending
                      ? "Creating reservation…"
                      : "Create reservation hold"}
                  </button>
                </div>
              </div>
            ) : null}

            {step === "review" && !hasCurrentAvailability ? (
              <div className="space-y-5">
                <h2 className="font-serif text-3xl text-[#30291f]">
                  Check your stay again
                </h2>

                <BookingFeedback>
                  Your previous availability result is no longer valid for
                  these details. Check availability again before continuing.
                </BookingFeedback>

                <button
                  type="button"
                  onClick={editDates}
                  className="luxury-primary-button"
                >
                  Return to stay dates
                </button>
              </div>
            ) : null}
          </div>
        </section>

        <div className="min-w-0 xl:sticky xl:top-6">
          <BookingRoomSummary
            category={category}
            physicalRoom={physicalRoom}
            checkIn={checkIn}
            checkOut={checkOut}
            adults={adults}
            childCount={children}
            nights={stayNights}
            totalPrice={price}
            showPrice={step === "review" && hasCurrentAvailability}
          />
        </div>
      </div>

      <footer className="mt-8 flex flex-col gap-2 border-t border-[#e9e1d5] pt-5 text-[11px] leading-5 text-stone-400 sm:flex-row sm:items-center sm:justify-between">
        <p>MOLLIS LUX · Thoughtful stays, considered details.</p>

        <Link
          href={`/rooms/${category.slug}`}
          className="transition hover:text-[#8b7048]"
        >
          Return to room details
        </Link>
      </footer>

      <style jsx>{`
        .luxury-primary-button {
          display: flex;
          min-height: 52px;
          width: 100%;
          align-items: center;
          justify-content: center;
          gap: 12px;
          border: 1px solid #d8c39f;
          border-radius: 16px;
          background: linear-gradient(135deg, #f4ead8, #e9d8ba);
          padding: 14px 20px;
          color: #59472f;
          font-size: 13px;
          font-weight: 600;
          transition:
            background 180ms ease,
            border-color 180ms ease,
            transform 180ms ease;
        }

        .luxury-primary-button:hover:not(:disabled) {
          border-color: #b99a68;
          background: linear-gradient(135deg, #efe0c6, #dfc69f);
          transform: translateY(-1px);
        }

        .luxury-primary-button:focus-visible,
        .luxury-secondary-button:focus-visible {
          outline: 2px solid #a18455;
          outline-offset: 3px;
        }

        .luxury-primary-button:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .luxury-secondary-button {
          display: inline-flex;
          min-height: 52px;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 1px solid #e6dfd4;
          border-radius: 16px;
          background: #fff;
          padding: 14px 20px;
          color: #6b6257;
          font-size: 13px;
          transition:
            border-color 180ms ease,
            background 180ms ease;
        }

        .luxury-secondary-button:hover {
          border-color: #cbb58f;
          background: #fffdf9;
        }
      `}</style>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden="true">
      <rect
        x="3.5"
        y="5"
        width="17"
        height="15.5"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M7.5 3.5v3M16.5 3.5v3M3.5 9.5h17"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden="true">
      <circle
        cx="12"
        cy="8"
        r="3.2"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M5 20c.7-3.2 3.1-5 7-5s6.3 1.8 7 5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden="true">
      <path
        d="m5 12.5 4.2 4.2L19 7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BedIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden="true">
      <path
        d="M3 18V7m18 11V11a2 2 0 0 0-2-2H9v9M3 14h18M6 10h1"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

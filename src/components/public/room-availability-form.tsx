"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { CalendarCheck, CircleCheck, CircleX } from "lucide-react";

import { checkRoomCategoryAvailability } from "@/src/lib/availability/actions";
import type { AvailabilityResult } from "@/src/lib/availability/queries";

type Props = { roomCategoryId: string; roomCategorySlug: string; maxAdults: number; maxChildren: number };

export default function RoomAvailabilityForm({ roomCategoryId, roomCategorySlug, maxAdults, maxChildren }: Props) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState("1");
  const [children, setChildren] = useState("0");
  const [result, setResult] = useState<AvailabilityResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);
    const adultCount = Number(adults);
    const childCount = Number(children);
    if (!checkIn || !checkOut || checkIn >= checkOut) return setError("Choose a check-out date after check-in.");
    if (!Number.isInteger(adultCount) || adultCount < 1 || adultCount > maxAdults) return setError(`This room category accommodates up to ${maxAdults} adult${maxAdults === 1 ? "" : "s"}.`);
    if (!Number.isInteger(childCount) || childCount < 0 || childCount > maxChildren) return setError(`This room category accommodates up to ${maxChildren} child${maxChildren === 1 ? "" : "ren"}.`);

    startTransition(async () => {
      try {
        setResult(await checkRoomCategoryAvailability({ roomCategoryId, checkIn, checkOut, adults: adultCount, children: childCount }));
      } catch (actionError) {
        setError(actionError instanceof Error ? actionError.message : "Availability could not be checked.");
      }
    });
  }

  const bookingHref = `/booking?room=${encodeURIComponent(roomCategorySlug)}&checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}&adults=${encodeURIComponent(adults)}&children=${encodeURIComponent(children)}`;

  return (
    <section className="mt-10 rounded-3xl border border-stone-200 bg-white p-5 shadow-[0_18px_50px_rgba(83,66,45,0.08)] sm:p-6" aria-labelledby="availability-heading">
      <p className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#9b7b4b]"><CalendarCheck className="h-4 w-4" aria-hidden="true" />Plan your stay</p>
      <h2 id="availability-heading" className="mt-3 font-serif text-2xl text-stone-950">Check availability</h2>
      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2" noValidate>
        <Field id="check-in" label="Check-in" value={checkIn} onChange={setCheckIn} type="date" required />
        <Field id="check-out" label="Check-out" value={checkOut} onChange={setCheckOut} type="date" required />
        <Field id="adults" label="Adults" value={adults} onChange={setAdults} type="number" min={1} max={maxAdults} required />
        <Field id="children" label="Children" value={children} onChange={setChildren} type="number" min={0} max={maxChildren} required />
        <button type="submit" disabled={isPending} className="sm:col-span-2 rounded-2xl bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-[#a78655] disabled:cursor-not-allowed disabled:opacity-60">{isPending ? "Checking..." : "Check availability"}</button>
      </form>

      {error && <p role="alert" className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800">{error}</p>}
      {result && <div className="mt-5 rounded-2xl border border-stone-200 bg-stone-50 p-4" role="status" aria-live="polite">
        {result.available ? <>
          <p className="flex items-center gap-2 text-sm text-emerald-800"><CircleCheck className="h-4 w-4" aria-hidden="true" />This category is available for {result.nights} {result.nights === 1 ? "night" : "nights"}.</p>
          {result.pricePerNight && result.totalAmount && <p className="mt-2 text-sm text-stone-700">{result.currency} {result.totalAmount} total · {result.currency} {result.pricePerNight} per night</p>}
          <p className="mt-2 text-xs leading-6 text-stone-500">Continue to provide guest details and review the reservation. Payment is not configured yet.</p>
          <Link href={bookingHref} className="mt-4 inline-flex rounded-xl bg-stone-900 px-4 py-2 text-xs uppercase tracking-[0.15em] text-white hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-[#a78655]">Continue booking</Link>
        </> : <p className="flex items-center gap-2 text-sm text-stone-600"><CircleX className="h-4 w-4 text-stone-500" aria-hidden="true" />{result.reason ?? "This room is not available for the selected dates."}</p>}
      </div>}
    </section>
  );
}

function Field({ id, label, value, onChange, type, min, max, required }: { id: string; label: string; value: string; onChange: (value: string) => void; type: string; min?: number; max?: number; required?: boolean }) {
  return <label htmlFor={id} className="block"><span className="text-[10px] uppercase tracking-[0.18em] text-stone-500">{label}</span><input id={id} name={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} min={min} max={max} required={required} className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-[#a78655] focus:ring-2 focus:ring-[#a78655]/20" /></label>;
}

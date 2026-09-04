import type { Attendee } from "./AttendeeList";
import type { ClassStatus, FitnessClass } from "./classTypes";

const classNames = ["Boxing", "Yoga", "Gym"];
const peopleNames = ["Mg Kyaw", "Mg Mya", "Su Su", "Mya Mya", "Phyu Phyu"];
const paymentTypes: Attendee["paymentType"][] = ["Membership", "Package", "One-time"];
const bookingStatuses: Attendee["bookingStatus"][] = ["Checked-in", "Booked", "No-show", "Cancelled"];

const timeFormatter = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" });

function attendeesFor(index: number): Attendee[] {
  const count = index % 5 === 1 ? 0 : (index % 3) + 1;
  return Array.from({ length: count }, (_, attendeeIndex) => ({
    id: `class-${index}-attendee-${attendeeIndex}`,
    name: peopleNames[(index + attendeeIndex) % peopleNames.length],
    paymentType: paymentTypes[(index + attendeeIndex) % paymentTypes.length],
    bookingStatus: bookingStatuses[(index + attendeeIndex) % bookingStatuses.length],
  }));
}

function createClassRows(count: number): FitnessClass[] {
  const base = new Date("2026-09-03T06:30:00.000Z");
  return Array.from({ length: count }, (_, index) => {
    const slot = index % 12;
    const day = Math.floor(index / 12);
    const start = new Date(base.getTime() + day * 86_400_000 + slot * 55 * 60_000);
    const capacity = index % 29 === 0 ? 0 : 12 + (index % 4) * 6;
    const bookedCount = capacity === 0 ? 0 : index % 7 === 0 ? capacity : Math.min(capacity, 4 + ((index * 3) % 20));
    const status: ClassStatus =
      index % 17 === 0 ? "Cancelled" : bookedCount >= capacity && capacity > 0 ? "Full" : "Scheduled";

    return {
      id: `class-${index}`,
      className: classNames[index % classNames.length],
      instructor: peopleNames[index % peopleNames.length],
      startTime: timeFormatter.format(start),
      capacity,
      bookedCount,
      status,
      attendees: attendeesFor(index),
    };
  });
}

export const classRows: FitnessClass[] = createClassRows(1200);

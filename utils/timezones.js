import { countries } from "./sources/countries";

function getFormatter(timezone) {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });
}

export function getCountryTimezone(country) {
    return countries[country]?.timezone || "UTC";
}

export function getDatePartsInTimezone(date, timezone) {
    const parts = getFormatter(timezone).formatToParts(date);
    const get = (type) => parts.find((part) => part.type === type)?.value;

    return {
        year: Number(get("year")),
        month: Number(get("month")),
        day: Number(get("day")),
        hour: Number(get("hour")),
        minute: Number(get("minute")),
        second: Number(get("second")),
    };
}

export function getDateKeyInTimezone(date, timezone) {
    const { year, month, day } = getDatePartsInTimezone(date, timezone);
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function getMinutesInTimezone(date, timezone) {
    const { hour, minute } = getDatePartsInTimezone(date, timezone);
    return hour * 60 + minute;
}

export function createDateInTimezone(dateKey, minutes, timezone) {
    const [year, month, day] = dateKey.split("-").map(Number);
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0));

    const parts = getDatePartsInTimezone(utcDate, timezone);
    const targetTime = Date.UTC(year, month - 1, day, hour, minute, 0, 0);
    const tzTime = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second, 0);
    const offset = targetTime - tzTime;

    return new Date(utcDate.getTime() + offset);
}

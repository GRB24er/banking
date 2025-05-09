/* eslint-disable no-prototype-builtins */
import { type ClassValue, clsx } from "clsx";
import qs from "query-string";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

/********************
 * CLASSNAMES (TW)  *
 ********************/
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/********************
 * DATE & TIME      *
 ********************/
export const formatDateTime = (value: string | number | Date) => {
  const date = value instanceof Date ? value : new Date(value);

  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };

  const dateDayOptions: Intl.DateTimeFormatOptions = {
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    month: "short",
    year: "numeric",
    day: "numeric",
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };

  return {
    dateTime: date.toLocaleString("en-US", dateTimeOptions),
    dateDay: date.toLocaleString("en-US", dateDayOptions),
    dateOnly: date.toLocaleString("en-US", dateOptions),
    timeOnly: date.toLocaleString("en-US", timeOptions),
  };
};

/********************
 * MONEY            *
 ********************/
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

/********************
 * SAFE JSON        *
 ********************/
export const parseStringify = (value: unknown) =>
  JSON.parse(JSON.stringify(value));

/********************
 * STRING HELPERS   *
 ********************/
export const removeSpecialCharacters = (value?: string | null): string =>
  typeof value === "string" ? value.replace(/[^\w\s]/gi, "") : "";

/********************
 * URL HELPERS      *
 ********************/
interface UrlQueryParams {
  params: string;
  key: string;
  value: string | number | undefined | null;
}

export function formUrlQuery({ params, key, value }: UrlQueryParams) {
  const currentUrl = qs.parse(params);
  currentUrl[key] = value as any;

  // On the server we don't have window
  if (typeof window === "undefined") {
    return qs.stringify(currentUrl, { skipNull: true });
  }

  return qs.stringifyUrl(
    { url: window.location.pathname, query: currentUrl },
    { skipNull: true }
  );
}

/********************
 * ACCOUNT COLORS   *
 ********************/
export function getAccountTypeColors(type: AccountTypes) {
  switch (type) {
    case "depository":
      return {
        bg: "bg-blue-25",
        lightBg: "bg-blue-100",
        title: "text-blue-900",
        subText: "text-blue-700",
      };
    case "credit":
      return {
        bg: "bg-success-25",
        lightBg: "bg-success-100",
        title: "text-success-900",
        subText: "text-success-700",
      };
    default:
      return {
        bg: "bg-green-25",
        lightBg: "bg-green-100",
        title: "text-green-900",
        subText: "text-green-700",
      };
  }
}

/********************
 * TRANSACTION AGG. *
 ********************/
export function countTransactionCategories(
  transactions: Transaction[] = []
): CategoryCount[] {
  const categoryCounts: Record<string, number> = {};
  let totalCount = 0;

  transactions.forEach(({ category }) => {
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    totalCount += 1;
  });

  return Object.entries(categoryCounts)
    .map(([name, count]) => ({ name, count, totalCount }))
    .sort((a, b) => b.count - a.count);
}

/********************
 * MISC             *
 ********************/
export const extractCustomerIdFromUrl = (url: string) =>
  url.split("/").pop() || "";

export const encryptId = (id: string) => btoa(id);
export const decryptId = (id: string) => atob(id);

export const getTransactionStatus = (dateValue: string | number | Date) => {
  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  const today = new Date();
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(today.getDate() - 2);

  return date > twoDaysAgo ? "Processing" : "Success";
};

/********************
 * AUTH SCHEMA      *
 ********************/
export const authFormSchema = (type: "sign-in" | "sign-up") =>
  z.object({
    /* sign‑up fields */
    firstName: type === "sign-in" ? z.string().optional() : z.string().min(3),
    lastName: type === "sign-in" ? z.string().optional() : z.string().min(3),
    address1: type === "sign-in" ? z.string().optional() : z.string().max(50),
    city: type === "sign-in" ? z.string().optional() : z.string().max(50),
    state:
      type === "sign-in"
        ? z.string().optional()
        : z.string().length(2, "Must be 2‑letter code"),
    postalCode:
      type === "sign-in"
        ? z.string().optional()
        : z.string().min(3).max(6),
    dateOfBirth:
      type === "sign-in" ? z.string().optional() : z.string().min(3),
    ssn: type === "sign-in" ? z.string().optional() : z.string().min(3),

    /* common fields */
    email: z.string().email(),
    password: z.string().min(8),
  });

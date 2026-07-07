import { format, formatDistanceToNow } from "date-fns";
export const formatDate = (date: string) =>
  format(new Date(date), "dd MMM yyyy, HH:mm");
export const formatRelative = (date: string) =>
  formatDistanceToNow(new Date(date), { addSuffix: true });

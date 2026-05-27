import { Notification } from "../models/Clinical.js";
import { emitToUser } from "./socket.service.js";

export async function notifyUser(
  userId: string,
  input: {
    title: string;
    body: string;
    type?: string;
    urgent?: boolean;
  }
) {
  const doc = await Notification.create({
    userId,
    title: input.title,
    body: input.body,
    type: input.type ?? "info",
    urgent: input.urgent ?? false,
    read: false,
  });

  emitToUser(userId, "notification", {
    title: input.title,
    body: input.body,
    type: input.type ?? "info",
    id: doc._id.toString(),
  });

  return doc;
}

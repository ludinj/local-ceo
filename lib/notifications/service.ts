import type { Notification, Prisma } from "@/lib/generated/prisma/client";

async function getPrismaClient() {
  const { prisma } = await import("@/lib/prisma");
  return prisma;
}

export type NotificationActorType = "SYSTEM" | "USER" | "AI";

export type CreateNotificationInput = {
  recipientId: string;
  companyId?: string | null;
  actorType?: NotificationActorType;
  actorId?: string | null;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  metadata?: Prisma.InputJsonValue | null;
};

export type NotificationQueryOptions = {
  companyId?: string;
  limit?: number;
  skip?: number;
};

function notificationWhere(
  userId: string,
  companyId?: string
): Prisma.NotificationWhereInput {
  return { recipientId: userId, ...(companyId ? { companyId } : {}) };
}

function boundedLimit(limit = 5): number {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error("Notification limit must be a positive integer.");
  }
  return Math.min(limit, 100);
}

export async function createNotification(
  input: CreateNotificationInput
): Promise<Notification> {
  const prisma = await getPrismaClient();
  const type = input.type.trim();
  const title = input.title.trim();
  const message = input.message.trim();

  if (!type || !title || !message) {
    throw new Error("Notification type, title, and message are required.");
  }

  return prisma.notification.create({
    data: {
      recipientId: input.recipientId,
      companyId: input.companyId ?? null,
      actorType: input.actorType ?? "SYSTEM",
      actorId: input.actorId ?? null,
      type,
      title,
      message,
      link: input.link ?? null,
      metadata:
        input.metadata === null || input.metadata === undefined
          ? undefined
          : input.metadata,
    },
  });
}

export async function countUnreadNotificationsForUser(
  userId: string,
  companyId?: string
): Promise<number> {
  const prisma = await getPrismaClient();
  return prisma.notification.count({
    where: { ...notificationWhere(userId, companyId), readAt: null },
  });
}

export async function getNotificationsForUser(
  userId: string,
  options: NotificationQueryOptions = {}
): Promise<Notification[]> {
  const prisma = await getPrismaClient();
  const skip = options.skip ?? 0;
  if (!Number.isInteger(skip) || skip < 0) {
    throw new Error("Notification offset must be a non-negative integer.");
  }

  return prisma.notification.findMany({
    where: notificationWhere(userId, options.companyId),
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: boundedLimit(options.limit),
    skip,
  });
}

export async function markNotificationRead(
  notificationId: string,
  userId: string
): Promise<Notification | null> {
  const prisma = await getPrismaClient();
  await prisma.notification.updateMany({
    where: { id: notificationId, recipientId: userId, readAt: null },
    data: { readAt: new Date() },
  });

  // Reading an already-read notification returns its unchanged original readAt.
  return prisma.notification.findFirst({
    where: { id: notificationId, recipientId: userId },
  });
}

export async function markAllNotificationsRead(
  userId: string
): Promise<number> {
  const prisma = await getPrismaClient();
  const result = await prisma.notification.updateMany({
    where: { recipientId: userId, readAt: null },
    data: { readAt: new Date() },
  });
  return result.count;
}

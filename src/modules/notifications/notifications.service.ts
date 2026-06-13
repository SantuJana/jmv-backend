import { Expo } from "expo-server-sdk";
import { notificationsRepository } from "./notifications.repository";

// Create a new Expo SDK client
// optionally providing an access token if you have enabled push security
const expo = new Expo();

export const notificationsService = {
  async registerToken(userId: string, token: string) {
    if (!Expo.isExpoPushToken(token)) {
      throw new Error(`Push token ${token} is not a valid Expo push token`);
    }
    return notificationsRepository.saveToken(userId, token);
  },

  async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, any>,
    imageUrl?: string
  ) {
    const pushTokens = await notificationsRepository.getUserTokens(userId);

    if (pushTokens.length === 0) {
      return;
    }

    const messages = [];
    for (const pushToken of pushTokens) {
      if (!Expo.isExpoPushToken(pushToken)) {
        continue;
      }

      const message: any = {
        to: pushToken,
        sound: "default" as const,
        title,
        body,
        data: data || {},
        categoryId: "ORDER_STATUS_ACTIONS",
        channelId: "order-status",
      };

      if (imageUrl) {
        message.mutableContent = true;
        message.attachments = [{ url: imageUrl }];
      }

      messages.push(message);
    }

    // The Expo push service accepts batches of notifications so
    // that you don't need to send 1000 requests to send 1000 notifications.
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    // Send the chunks to the Expo push service
    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error("Error sending push notification chunk", error);
      }
    }

    return tickets;
  }
};

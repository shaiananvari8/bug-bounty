const notifications = [];

export async function listNotifications() {
  return notifications;
}

export async function createNotification(payload) {
  const { userId, title, body } = payload;
  const notification = {
    id: `ntf_${Date.now()}`,
    read: false,
    userId,
    title,
    body
  };
  notifications.push(notification);
  return notification;
}

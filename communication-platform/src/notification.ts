import { getData, notification } from './dataStore';

import { getAuthUserId } from './helper';

import HTTPError from 'http-errors';

export function notificationsGetV1(token: string): { notifications: notification[]; } {
  const data = getData();

  // get authUserId of the token and check if it is valid
  const authUserId = getAuthUserId(token, data);
  if (authUserId === -1) {
    throw HTTPError(403, 'invalid token');
  }

  for (const key in data.users) {
    if (data.users[key].uId === authUserId) {
      let maxNotifications = 20;
      if (data.users[key].notifications.length < 20) {
        maxNotifications = data.users[key].notifications.length;
      }
      const notifications = [] as notification[];
      for (let i = 0; i < maxNotifications; i++) {
        notifications.push(data.users[key].notifications[i]);
      }
      return {
        notifications: notifications
      };
    }
  }
}

import express, { Request, Response } from 'express';
import webpush from 'web-push';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3001);

// Middleware
app.use(cors(
  {
    origin: "https://random-pomodoro.org",
  }
));
app.use(express.json());

// VAPID keys configuration
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY || '',
  privateKey: process.env.VAPID_PRIVATE_KEY || '',
};

if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
  console.error('VAPID keys not found. Please set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in .env file');
  process.exit(1);
}

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:example@yourdomain.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// In-memory storage for subscriptions (replace with database in production)
const subscriptions: Map<string, webpush.PushSubscription> = new Map();

// Scheduled notifications storage
interface ScheduledNotification {
  id: string;
  endpoint: string;
  scheduledTime: number; // Unix timestamp in milliseconds
  title: string;
  body?: string;
  icon?: string;
  data?: any;
}

const scheduledNotifications: Map<string, ScheduledNotification> = new Map();

// Routes

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get VAPID public key
app.get('/vapid-public-key', (req: Request, res: Response) => {
  res.json({ publicKey: vapidKeys.publicKey });
});

// Subscribe to push notifications
app.post('/subscribe', (req: Request, res: Response) => {
  try {
    const subscription: webpush.PushSubscription = req.body;

    if (!subscription || !subscription.endpoint) {
      res.status(400).json({ error: 'Invalid subscription object' });
      return;
    }

    // Use endpoint as unique identifier
    const subscriptionId = subscription.endpoint;
    subscriptions.set(subscriptionId, subscription);

    console.log(`New subscription added: ${subscriptionId}`);
    res.status(201).json({
      message: 'Subscription added successfully',
      subscriptionId
    });
  } catch (error) {
    console.error('Error adding subscription:', error);
    res.status(500).json({ error: 'Failed to add subscription' });
  }
});

// Unsubscribe from push notifications
app.post('/unsubscribe', (req: Request, res: Response) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      res.status(400).json({ error: 'Endpoint is required' });
      return;
    }

    const deleted = subscriptions.delete(endpoint);

    if (deleted) {
      console.log(`Subscription removed: ${endpoint}`);
      res.json({ message: 'Subscription removed successfully' });
    } else {
      res.status(404).json({ error: 'Subscription not found' });
    }
  } catch (error) {
    console.error('Error removing subscription:', error);
    res.status(500).json({ error: 'Failed to remove subscription' });
  }
});

// Send notification to specific subscription
app.post('/send-notification', async (req: Request, res: Response) => {
  try {
    const { endpoint, payload } = req.body;

    if (!endpoint) {
      res.status(400).json({ error: 'Endpoint is required' });
      return;
    }

    const subscription = subscriptions.get(endpoint);

    if (!subscription) {
      res.status(404).json({ error: 'Subscription not found' });
      return;
    }

    const notificationPayload = JSON.stringify(payload || {
      title: 'Random Pomodoro',
      body: 'Notification from Random Pomodoro',
      icon: '/icon.png',
    });

    await webpush.sendNotification(subscription, notificationPayload);

    console.log(`Notification sent to: ${endpoint}`);
    res.json({ message: 'Notification sent successfully' });
  } catch (error: any) {
    console.error('Error sending notification:', error);

    // Remove subscription if it's no longer valid
    if (error.statusCode === 410) {
      const { endpoint } = req.body;
      subscriptions.delete(endpoint);
      console.log(`Removed invalid subscription: ${endpoint}`);
    }

    res.status(500).json({
      error: 'Failed to send notification',
      details: error.message
    });
  }
});

// Schedule a notification to be sent at a specific time
app.post('/schedule', (req: Request, res: Response) => {
  try {
    const { endpoint, scheduledTime, title, body, icon, data } = req.body;

    if (!endpoint) {
      res.status(400).json({ error: 'Endpoint is required' });
      return;
    }

    if (!scheduledTime) {
      res.status(400).json({ error: 'scheduledTime is required' });
      return;
    }

    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    const subscription = subscriptions.get(endpoint);
    if (!subscription) {
      res.status(404).json({ error: 'Subscription not found' });
      return;
    }

    const scheduledTimeMs = typeof scheduledTime === 'number' ? scheduledTime : Date.parse(scheduledTime);

    if (isNaN(scheduledTimeMs)) {
      res.status(400).json({ error: 'Invalid scheduledTime format' });
      return;
    }

    if (scheduledTimeMs <= Date.now()) {
      res.status(400).json({ error: 'scheduledTime must be in the future' });
      return;
    }

    const id = `${endpoint}-${scheduledTimeMs}`;

    const notification: ScheduledNotification = {
      id,
      endpoint,
      scheduledTime: scheduledTimeMs,
      title,
      body,
      icon,
      data,
    };

    scheduledNotifications.set(id, notification);

    const scheduledDate = new Date(scheduledTimeMs);
    console.log(`Notification scheduled: "${title}" for ${scheduledDate.toISOString()}`);

    res.status(201).json({
      message: 'Notification scheduled successfully',
      id,
      scheduledTime: scheduledTimeMs,
      scheduledDate: scheduledDate.toISOString(),
    });
  } catch (error) {
    console.error('Error scheduling notification:', error);
    res.status(500).json({ error: 'Failed to schedule notification' });
  }
});

// Cancel a scheduled notification
app.delete('/schedule/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = scheduledNotifications.delete(id);

    if (deleted) {
      console.log(`Scheduled notification cancelled: ${id}`);
      res.json({ message: 'Scheduled notification cancelled successfully' });
    } else {
      res.status(404).json({ error: 'Scheduled notification not found' });
    }
  } catch (error) {
    console.error('Error cancelling scheduled notification:', error);
    res.status(500).json({ error: 'Failed to cancel scheduled notification' });
  }
});

// Get all scheduled notifications for an endpoint
app.get('/schedule', (req: Request, res: Response) => {
  try {
    const { endpoint } = req.query;

    if (!endpoint) {
      // Return all scheduled notifications
      const all = Array.from(scheduledNotifications.values()).map(n => ({
        id: n.id,
        scheduledTime: n.scheduledTime,
        scheduledDate: new Date(n.scheduledTime).toISOString(),
        title: n.title,
      }));
      res.json({ count: all.length, notifications: all });
      return;
    }

    // Return scheduled notifications for specific endpoint
    const filtered = Array.from(scheduledNotifications.values())
      .filter(n => n.endpoint === endpoint)
      .map(n => ({
        id: n.id,
        scheduledTime: n.scheduledTime,
        scheduledDate: new Date(n.scheduledTime).toISOString(),
        title: n.title,
      }));

    res.json({ count: filtered.length, notifications: filtered });
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    res.status(500).json({ error: 'Failed to get scheduled notifications' });
  }
});

// Receive notification trigger from browser and send to own subscription
app.post('/notify', async (req: Request, res: Response) => {
  try {
    const { endpoint, title, body, icon, data } = req.body;

    if (!endpoint) {
      res.status(400).json({ error: 'Endpoint is required' });
      return;
    }

    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    const subscription = subscriptions.get(endpoint);

    if (!subscription) {
      res.status(404).json({ error: 'Subscription not found' });
      return;
    }

    const notificationPayload = JSON.stringify({
      title,
      body: body || '',
      icon: icon || '/icon.png',
      data: data || {},
    });

    console.log(`Sending notification: "${title}" to ${endpoint.substring(0, 50)}...`);

    try {
      await webpush.sendNotification(subscription, notificationPayload);
      console.log(`Notification sent successfully`);

      res.json({
        message: 'Notification sent successfully'
      });
    } catch (error: any) {
      console.error('Error sending notification:', error.message);

      // Remove invalid subscription
      if (error.statusCode === 410) {
        subscriptions.delete(endpoint);
        console.log(`Removed invalid subscription: ${endpoint}`);
      }

      res.status(500).json({
        error: 'Failed to send notification',
        details: error.message
      });
    }
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Broadcast notification to all subscriptions (legacy endpoint)
app.post('/broadcast', async (req: Request, res: Response) => {
  try {
    const { payload } = req.body;

    const notificationPayload = JSON.stringify(payload || {
      title: 'Random Pomodoro',
      body: 'Broadcast notification',
      icon: '/icon.png',
    });

    const results = {
      successful: 0,
      failed: 0,
      total: subscriptions.size,
    };

    const promises = Array.from(subscriptions.entries()).map(async ([endpoint, subscription]) => {
      try {
        await webpush.sendNotification(subscription, notificationPayload);
        results.successful++;
        console.log(`Broadcast sent to: ${endpoint}`);
      } catch (error: any) {
        results.failed++;
        console.error(`Failed to send to ${endpoint}:`, error.message);

        // Remove invalid subscriptions
        if (error.statusCode === 410) {
          subscriptions.delete(endpoint);
          console.log(`Removed invalid subscription: ${endpoint}`);
        }
      }
    });

    await Promise.all(promises);

    res.json({
      message: 'Broadcast completed',
      results
    });
  } catch (error) {
    console.error('Error broadcasting notification:', error);
    res.status(500).json({ error: 'Failed to broadcast notification' });
  }
});

// Get subscription count
app.get('/subscriptions/count', (req: Request, res: Response) => {
  res.json({ count: subscriptions.size });
});

// List all subscriptions (endpoints only for privacy)
app.get('/subscriptions', (req: Request, res: Response) => {
  const endpoints = Array.from(subscriptions.keys());
  res.json({
    count: endpoints.length,
    endpoints: endpoints.map(ep => ep.substring(0, 50) + '...') // Truncate for privacy
  });
});

// Check and send scheduled notifications
async function checkScheduledNotifications() {
  const now = Date.now();
  const toSend: ScheduledNotification[] = [];

  // Find notifications that should be sent
  for (const [id, notification] of scheduledNotifications.entries()) {
    if (notification.scheduledTime <= now) {
      toSend.push(notification);
      scheduledNotifications.delete(id);
    }
  }

  // Send notifications
  for (const notification of toSend) {
    const subscription = subscriptions.get(notification.endpoint);

    if (!subscription) {
      console.log(`Scheduled notification skipped: subscription not found for ${notification.endpoint}`);
      continue;
    }

    const notificationPayload = JSON.stringify({
      title: notification.title,
      body: notification.body || '',
      icon: notification.icon || '/icon.png',
      data: notification.data || {},
    });

    try {
      await webpush.sendNotification(subscription, notificationPayload);
      console.log(`Scheduled notification sent: "${notification.title}" to ${notification.endpoint.substring(0, 50)}...`);
    } catch (error: any) {
      console.error(`Failed to send scheduled notification:`, error.message);

      // Remove invalid subscription
      if (error.statusCode === 410) {
        subscriptions.delete(notification.endpoint);
        console.log(`Removed invalid subscription: ${notification.endpoint}`);
      }
    }
  }
}

// Check for scheduled notifications every 10 seconds
const CHECK_INTERVAL = 10000;
setInterval(checkScheduledNotifications, CHECK_INTERVAL);

// Start server
app.listen(3001, "127.0.0.1", () => {
  console.log(`Web Push server running on port ${PORT}`);
  console.log(`VAPID public key: ${vapidKeys.publicKey}`);
  console.log(`Checking scheduled notifications every ${CHECK_INTERVAL / 1000} seconds`);
});
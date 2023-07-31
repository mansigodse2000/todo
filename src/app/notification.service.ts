import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  showNotification(message: string): void {
    // Check if the browser supports notifications
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Todo List', { body: message });
    }
  }

  requestPermission(): void {
    // Request permission for notifications
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          console.log('Notification permission granted!');
        }
      });
    }
  }
}

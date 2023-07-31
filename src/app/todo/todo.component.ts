import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '../notification.service';
import { ITask } from '../model/task';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css'],
})
export class TodoComponent implements OnInit {
  todoForm!: FormGroup;
  tasks: ITask[] = [];
  done: ITask[] = [];

  notificationInterval: number = 1;
  notificationIntervalId: any;
  newNotificationInterval: number | null = null;

  constructor(private fb: FormBuilder, private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.todoForm = this.fb.group({
      item: ['', Validators.required],
    });

    // Retrieve tasks from localStorage if available
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      this.tasks = JSON.parse(storedTasks);
    }

    const storedDone = localStorage.getItem('done');
    if (storedDone) {
      this.done = JSON.parse(storedDone);
    }

    // Request permission for notifications
    this.notificationService.requestPermission();

    // Call checkAndNotify initially to show notifications on page load if needed
    this.checkAndNotify();

    // Use setInterval to call checkAndNotify at the specified interval
    this.notificationIntervalId = setInterval(() => {
      this.checkAndNotify();
    }, this.notificationInterval * 60000); // Convert the interval to milliseconds
  }

  addTask() {
    const newTask: ITask = {
      description: this.todoForm.value.item,
      done: false,
      editing: false,
    };

    this.tasks.push(newTask);
    this.updateLocalStorage();
    this.todoForm.reset();

    const hasPendingTasks = this.tasks.some((task) => !task.done);

    // Call the notification function if there are pending tasks
    if (hasPendingTasks) {
      const notificationMessage = 'New Task added: ' + newTask.description;
      this.notificationService.showNotification(notificationMessage);
    }
  }

  editTask(task: ITask) {
    task.description =
      prompt('Enter the updated task description:', task.description) ||
      task.description;
    this.updateLocalStorage();
  }

  deleteTask(task: ITask, list: string) {
    let targetList: ITask[] = [];

    switch (list) {
      case 'tasks':
        targetList = this.tasks;
        break;
      case 'done':
        targetList = this.done;
        break;
      default:
        break;
    }

    const index = targetList.indexOf(task);
    if (index > -1) {
      targetList.splice(index, 1);
      this.updateLocalStorage();
    }
  }

  drop(event: CdkDragDrop<ITask[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }

    this.updateLocalStorage();

    const hasPendingTasks = this.tasks.some((task) => !task.done);

    // Call the notification function if there are no more pending tasks (all tasks are completed)
    if (!hasPendingTasks) {
      const notificationMessage = 'All tasks completed!';
      this.notificationService.showNotification(notificationMessage);
    }
  }

  updateNotificationInterval(): void {
    // Ensure the entered value is a positive number and at least 1
    const newInterval = Math.max(1, Math.abs(Math.floor(this.newNotificationInterval || 0)));
  
    // Update the notification interval and restart the setInterval function
    this.notificationInterval = newInterval;
    this.restartNotificationInterval();
  
    // Reset the input field after setting the interval
    this.newNotificationInterval = null;
  }

  restartNotificationInterval(): void {
    // Clear the existing setInterval (if any) to avoid multiple intervals running simultaneously
    if (this.notificationIntervalId) {
      clearInterval(this.notificationIntervalId);
    }

    // Use setInterval to call checkAndNotify at the specified interval
    this.notificationIntervalId = setInterval(() => {
      this.checkAndNotify();
    }, this.notificationInterval * 60000); // Convert the interval to milliseconds
  }

  private checkAndNotify(): void {
    const hasPendingTasks = this.tasks.some((task) => !task.done);

    // Call the notification function if there are pending tasks
    if (hasPendingTasks) {
      const notificationMessage = 'You have pending tasks in the Todo list!';
      this.notificationService.showNotification(notificationMessage);
    }
  }

  private updateLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
    localStorage.setItem('done', JSON.stringify(this.done));
  }
}

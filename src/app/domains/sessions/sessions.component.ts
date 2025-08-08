// angular import
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhotographerSessionsComponent } from './photographer-sessions/photographer-sessions.component';
import { AdminSessionsComponent } from './admin-sessions/admin-sessions.component';

@Component({
  selector: 'sessions-main',
  imports: [CommonModule, PhotographerSessionsComponent, AdminSessionsComponent],
  templateUrl: './sessions.component.html',
  styleUrls: ['./sessions.component.scss']
})
export class SessionsComponent {
  constructor() {}

  user: any = null;
  role: number = 0;

  ngOnInit(): void {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
      this.role = this.user.role;
    }
  }
}

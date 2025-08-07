// angular import
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconDirective, IconService } from '@ant-design/icons-angular';
import { CheckCircleOutline, ClearOutline, CloseCircleOutline, EyeOutline, ScheduleOutline } from '@ant-design/icons-angular/icons';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NewSessionModalComponent } from './new-session-modal/new-session-modal.component';
import { FormsModule } from '@angular/forms';

interface Session {
  id: number;
  photographer: string;
  veteran: string;
  date: string; // ISO or formatted string
  status: 'Requested' | 'Scheduled' | 'Rescheduled' | 'Completed' | 'Canceled';
}

@Component({
  selector: 'sessions-main',
  imports: [CommonModule, IconDirective, FormsModule, NgbModule],
  templateUrl: './sessions.component.html',
  styleUrls: ['./sessions.component.scss']
})
export class SessionsComponent {
  private iconService = inject(IconService);

  constructor(private modalService: NgbModal) {
    this.iconService.addIcon(...[EyeOutline, CheckCircleOutline, CloseCircleOutline, ScheduleOutline, ClearOutline]);
  }

  user: any = null;
  role: number = 0;

  activeSessions: Session[] = [];
  completedSessions: Session[] = [];

  ngOnInit(): void {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
      this.role = this.user.role;
    }

    const allSessions: Session[] = [
      { id: 1, photographer: 'Benjamin Wright', veteran: 'James Cook', date: '2025/05/06 13:20:00', status: 'Requested' },
      { id: 2, photographer: 'Benjamin Wright', veteran: 'James Cook', date: '2025/06/08 11:00:00', status: 'Scheduled' },
      { id: 3, photographer: 'Benjamin Wright', veteran: 'James Cook', date: '2025/07/10 09:00:00', status: 'Completed' },
      { id: 4, photographer: 'Benjamin Wright', veteran: 'John Smith', date: '2025/07/12 14:00:00', status: 'Canceled' },
      { id: 5, photographer: 'Benjamin Wright', veteran: 'Emily Carter', date: '2025/07/15 16:30:00', status: 'Rescheduled' }
    ];

    const isActive = (s: Session) => !['Completed', 'Canceled'].includes(s.status);

    if (this.role === 1) {
      // Photographer view
      this.activeSessions = allSessions.filter((s) => s.photographer === this.user.name && isActive(s));
      this.completedSessions = allSessions.filter((s) => s.photographer === this.user.name && !isActive(s));
    } else if (this.role === 2) {
      // Veteran view
      this.activeSessions = allSessions.filter((s) => s.veteran === this.user.name && isActive(s));
      this.completedSessions = allSessions.filter((s) => s.veteran === this.user.name && !isActive(s));
    }
  }

  openNewSessionModal() {
    const modalRef = this.modalService.open(NewSessionModalComponent, { size: 'lg' });
    modalRef.result
      .then((selectedPhotographer) => {
        if (selectedPhotographer) {
          console.log('Requested session with:', selectedPhotographer);
          // You could push to activeSessions[] here
        }
      })
      .catch(() => {});
  }

  view(session: Session) {
    alert('Viewing session');
  }

  approve(session: Session) {
    alert('Approving session');
  }

  cancel(session: Session) {
    alert('Cancelling session');
  }

  reschedule(session: Session) {
    alert('Rescheduling session');
  }

  complete(session: Session) {
    alert('Completing session');
  }
}

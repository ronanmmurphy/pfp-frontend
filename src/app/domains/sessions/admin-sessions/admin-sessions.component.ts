// angular import
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconDirective, IconService } from '@ant-design/icons-angular';
import { DeleteOutline, EditOutline, EyeOutline } from '@ant-design/icons-angular/icons';

@Component({
  selector: 'admin-sessions',
  imports: [CommonModule, IconDirective],
  templateUrl: './admin-sessions.component.html',
  styleUrls: ['./admin-sessions.component.scss']
})
export class AdminSessionsComponent {
  private iconService = inject(IconService);

  constructor() {
    this.iconService.addIcon(...[EyeOutline, EditOutline, DeleteOutline]);
  }

  sessions = [
    {
      id: '84564564',
      photographer: 'Emma Johnson',
      status: 'Canceled',
      status_type: 'bg-danger',
      veteran: 'John Walker',
      date: '2025/05/06 13:20:00'
    },
    {
      id: '84564786',
      photographer: 'Liam Harris',
      status: 'Requested',
      status_type: 'bg-warning',
      veteran: 'Emily Carter',
      date: '2025/05/07 10:00:00'
    },
    {
      id: '84564522',
      photographer: 'Olivia Martinez',
      status: 'Completed',
      status_type: 'bg-info',
      veteran: 'Michael Thompson',
      date: '2025/05/03 09:30:00'
    },
    {
      id: '84564564',
      photographer: 'Noah Robinson',
      status: 'Rescheduled',
      status_type: 'bg-success',
      veteran: 'Olivia Brooks',
      date: '2025/05/08 11:45:00'
    },
    {
      id: '84564786',
      photographer: 'Ava Lewis',
      status: 'Scheduled',
      status_type: 'bg-success',
      veteran: 'Daniel Mitchell',
      date: '2025/05/09 14:10:00'
    },
    {
      id: '84564522',
      photographer: 'William Clark',
      status: 'Completed',
      status_type: 'bg-info',
      veteran: 'Sophia Reed',
      date: '2025/05/04 08:20:00'
    },
    {
      id: '84564564',
      photographer: 'Isabella Young',
      status: 'Canceled',
      status_type: 'bg-danger',
      veteran: 'Ethan Morgan',
      date: '2025/05/01 17:30:00'
    },
    {
      id: '84564786',
      photographer: 'James Hall',
      status: 'Scheduled',
      status_type: 'bg-success',
      veteran: 'Grace Henderson',
      date: '2025/05/10 12:00:00'
    },
    {
      id: '84564522',
      photographer: 'Mia King',
      status: 'Requested',
      status_type: 'bg-warning',
      veteran: 'Liam Scott',
      date: '2025/05/11 15:25:00'
    },
    {
      id: '84564786',
      photographer: 'Benjamin Wright',
      status: 'Rescheduled',
      status_type: 'bg-success',
      veteran: 'Ava Murphy',
      date: '2025/05/12 09:00:00'
    }
  ];

  view(session): void {
    alert(`Viewing session`);
  }

  edit(session): void {
    alert(`Editing session`);
  }

  delete(session): void {
    if (confirm(`Are you sure you want to delete?`)) {
    }
  }
}

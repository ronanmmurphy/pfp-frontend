// angular import
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconDirective, IconService } from '@ant-design/icons-angular';
import { FallOutline, GiftOutline, MessageOutline, RiseOutline, SettingOutline } from '@ant-design/icons-angular/icons';
import { CardComponent } from 'src/app/shared/components/card/card.component';

@Component({
  selector: 'admin-dashboard',
  imports: [CommonModule, IconDirective, CardComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent {
  private iconService = inject(IconService);

  constructor() {
    this.iconService.addIcon(...[RiseOutline, FallOutline, SettingOutline, GiftOutline, MessageOutline]);
  }

  AnalyticEcommerce = [
    {
      title: 'Total Photographers',
      amount: '4,42,236',
      background: 'bg-light-primary ',
      border: 'border-primary',
      icon: 'rise',
      percentage: '59.3%',
      color: 'text-primary',
      number: '35,000'
    },
    {
      title: 'Total Veterans',
      amount: '78,250',
      background: 'bg-light-primary ',
      border: 'border-primary',
      icon: 'rise',
      percentage: '70.5%',
      color: 'text-primary',
      number: '8,900'
    },
    {
      title: 'Total Sessions',
      amount: '18,800',
      background: 'bg-light-warning ',
      border: 'border-warning',
      icon: 'fall',
      percentage: '27.4%',
      color: 'text-warning',
      number: '1,943'
    },
    {
      title: 'Unmatched Sessions',
      amount: '5,078',
      background: 'bg-light-warning ',
      border: 'border-warning',
      icon: 'fall',
      percentage: '27.4%',
      color: 'text-warning',
      number: '$20,395'
    }
  ];

  recentSessions = [
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
}

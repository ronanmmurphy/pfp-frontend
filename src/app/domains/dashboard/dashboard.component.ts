// angular import
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconDirective, IconService } from '@ant-design/icons-angular';
import { FallOutline, GiftOutline, MessageOutline, RiseOutline, SettingOutline } from '@ant-design/icons-angular/icons';
import { CardComponent } from 'src/app/shared/components/card/card.component';

@Component({
  selector: 'dashboard-main',
  imports: [CommonModule, IconDirective, CardComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
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
      veteran: 'John Walker'
    },
    {
      id: '84564786',
      photographer: 'Liam Harris',
      status: 'In Progress',
      status_type: 'bg-warning',
      veteran: 'Emily Carter'
    },
    {
      id: '84564522',
      photographer: 'Olivia Martinez',
      status: 'Completed',
      status_type: 'bg-success',
      veteran: 'Michael Thompson'
    },
    {
      id: '84564564',
      photographer: 'Noah Robinson',
      status: 'Canceled',
      status_type: 'bg-danger',
      veteran: 'Olivia Brooks'
    },
    {
      id: '84564786',
      photographer: 'Ava Lewis',
      status: 'In Progress',
      status_type: 'bg-warning',
      veteran: 'Daniel Mitchell'
    },
    {
      id: '84564522',
      photographer: 'William Clark',
      status: 'Completed',
      status_type: 'bg-success',
      veteran: 'Sophia Reed'
    },
    {
      id: '84564564',
      photographer: 'Isabella Young',
      status: 'Canceled',
      status_type: 'bg-danger',
      veteran: 'Ethan Morgan'
    },
    {
      id: '84564786',
      photographer: 'James Hall',
      status: 'In Progress',
      status_type: 'bg-warning',
      veteran: 'Grace Henderson'
    },
    {
      id: '84564522',
      photographer: 'Mia King',
      status: 'Completed',
      status_type: 'bg-success',
      veteran: 'Liam Scott'
    },
    {
      id: '84564786',
      photographer: 'Benjamin Wright',
      status: 'In Progress',
      status_type: 'bg-warning',
      veteran: 'Ava Murphy'
    }
  ];
}

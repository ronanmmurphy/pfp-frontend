// angular import
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconDirective, IconService } from '@ant-design/icons-angular';
import { DeleteOutline, EditOutline, EyeOutline } from '@ant-design/icons-angular/icons';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ViewUserModalComponent } from './components/view-user-modal/view-user-modal.component';

@Component({
  selector: 'users-main',
  imports: [CommonModule, IconDirective, FormsModule],
  templateUrl: 'users.component.html',
  styleUrls: ['users.component.scss']
})
export class UsersComponent {
  private iconService = inject(IconService);

  constructor(private modalService: NgbModal) {
    this.iconService.addIcon(...[EyeOutline, EditOutline, DeleteOutline]);
  }

  users = [
    {
      id: 1,
      firstName: 'Ronan',
      lastName: 'Murphy',
      email: 'ronan@example.com',
      role: 'admin',
      location: 'Austin, TX'
    },
    {
      id: 2,
      firstName: 'Benjamin',
      lastName: 'Wright',
      email: 'benjamin@example.com',
      role: 'photographer',
      location: 'Dallas, TX',
      phoneNumber: '123-456-7890',
      streetAddress: '123 Photo St',
      streetAddress2: 'Suite 100',
      city: 'Dallas',
      state: 'TX',
      postalCode: '75201',
      website: 'https://benjaminphotos.com',
      referral: 'Instagram'
    },
    {
      id: 3,
      firstName: 'James',
      lastName: 'Cook',
      email: 'james@example.com',
      role: 'veteran',
      location: 'Dallas, TX',
      phoneNumber: '987-654-3210',
      streetAddress: '456 Veteran Ave',
      streetAddress2: 'Apt 5B',
      city: 'Dallas',
      state: 'TX',
      postalCode: '75202',
      seekingEmployment: 'yes',
      linkedIn: 'https://linkedin.com/in/jamescook',
      eligibility: 'Military Spouse',
      branch: 'US Navy',
      ets: '2025-12-01',
      referral: 'Friend'
    },
    {
      id: 4,
      firstName: 'Emma',
      lastName: 'Johnson',
      email: 'emma@example.com',
      role: 'photographer',
      location: 'Houston, TX',
      phoneNumber: '555-123-4567',
      streetAddress: '789 Lens Blvd',
      streetAddress2: '',
      city: 'Houston',
      state: 'TX',
      postalCode: '77002',
      website: 'https://emmajohnsonart.com',
      referral: 'Local event'
    },
    {
      id: 5,
      firstName: 'Liam',
      lastName: 'Harris',
      email: 'liam@example.com',
      role: 'veteran',
      location: 'San Antonio, TX',
      phoneNumber: '321-654-9870',
      streetAddress: '321 Hero St',
      streetAddress2: 'Unit C',
      city: 'San Antonio',
      state: 'TX',
      postalCode: '78205',
      seekingEmployment: 'no',
      linkedIn: '',
      eligibility: 'Transitioning Service Member',
      branch: 'US Army',
      ets: '2024-10-15',
      referral: ''
    },
    {
      id: 6,
      firstName: 'Sophia',
      lastName: 'Hill',
      email: 'sophia@example.com',
      role: 'photographer',
      location: 'Plano, TX',
      phoneNumber: '222-333-4444',
      streetAddress: '135 Studio Rd',
      streetAddress2: '',
      city: 'Plano',
      state: 'TX',
      postalCode: '75024',
      website: 'https://sophiashoots.com',
      referral: 'Colleague'
    }
  ];

  view(user): void {
    const modalRef = this.modalService.open(ViewUserModalComponent, { size: 'lg', centered: true });
    modalRef.componentInstance.user = user;
    modalRef.componentInstance.isEditMode = false;
    modalRef.result.then(
      (updatedUser) => {
        if (updatedUser) {
          const index = this.users.findIndex((u) => u.id === updatedUser.id);
          if (index > -1) this.users[index] = updatedUser;
        }
      },
      () => {} // Dismissed
    );
  }

  edit(user): void {
    const modalRef = this.modalService.open(ViewUserModalComponent, { size: 'lg', centered: true });
    modalRef.componentInstance.user = user;
    modalRef.componentInstance.isEditMode = true;
    modalRef.result.then(
      (updatedUser) => {
        if (updatedUser) {
          const index = this.users.findIndex((u) => u.id === updatedUser.id);
          if (index > -1) this.users[index] = updatedUser;
        }
      },
      () => {} // Dismissed
    );
  }

  delete(user): void {
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      this.users = this.users.filter((u) => u.id !== user.id);
    }
  }
}

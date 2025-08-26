import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import * as L from 'leaflet';
import { AuthService } from 'src/app/services/auth.service';
import { UserRow, UserService } from 'src/app/services/user.service';
import { SessionService } from 'src/app/services/session.service';
import { UserRole } from 'src/app/enums/user.enum';
import { getFullName, getLocationText } from 'src/app/utils/helper';

@Component({
  selector: 'request-session-modal',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './request-session-modal.component.html',
  styleUrls: ['./request-session-modal.component.scss'],
  standalone: true
})
export class RequestSessionModalComponent implements OnInit, AfterViewInit, OnDestroy {
  getLocationText = getLocationText;
  getFullName = getFullName;

  user: any;
  map: any;
  sessionForm: FormGroup;

  selectedRadius = 'Nearest to me';
  locationOptions = ['Nearest to me', '10 miles', '50 miles', '100 miles', 'Custom Radius...'];
  customRadius: number | null = null;

  filteredPhotographers: any[] = [];
  selectedPhotographer = {
    user_id: null
  };

  loading = false;

  redIcon = L.icon({
    iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });

  blueIcon = L.icon({
    iconUrl: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });

  constructor(
    public modal: NgbActiveModal,
    private auth: AuthService,
    private userService: UserService,
    private sessionService: SessionService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    this.sessionForm = this.fb.group({
      sessionName: ['', Validators.required],
      sessionNote: [''],
      sessionDate: ['', Validators.required],
      sessionExpirationDate: ['']
    });
  }

  ngOnInit(): void {
    this.auth.currentUser$.subscribe({
      next: (user) => {
        if (user && user.role === UserRole.VETERAN) {
          this.user = user;
          this.onRadiusChange();
        } else {
          this.toastr.error('Only veterans can create sessions.');
          this.modal.dismiss();
        }
      },
      error: () => {
        this.toastr.error('Failed to load user data.');
        this.modal.dismiss();
      }
    });
  }

  ngAfterViewInit(): void {
    this.map = L.map('leafletMap').setView([32.7767, -96.797], 8); // Default to Dallas

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  ngOnDestroy(): void {
    if (this.map) this.map.remove();
  }

  onRadiusChange(): void {
    if (!this.user?.id) {
      this.toastr.error('User data not loaded.');
      return;
    }

    this.filteredPhotographers = [];
    const radius = this.getRadiusFromText();

    if (!radius) return;

    this.loading = true;
    this.userService.getPhotographersNear(this.user.id, radius).subscribe({
      next: (photographers: any[]) => {
        this.filteredPhotographers = photographers;
        this.loading = false;
        this.updateMap();
      },
      error: (err: any) => {
        this.toastr.error(err?.error?.message || 'Failed to load photographers.');
        this.loading = false;
      }
    });
  }

  updateMap(): void {
    if (!this.map) return;

    this.map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) {
        this.map.removeLayer(layer);
      }
    });

    // Add veteran's marker (use default if location not set)
    const veteranLat = this.user?.latitude || 32.7767;
    const veteranLon = this.user?.longitude || -96.797;
    L.marker([veteranLat, veteranLon], { icon: this.redIcon }).addTo(this.map).bindPopup('Your Location');

    // Add photographers' markers
    this.filteredPhotographers.forEach((p) => {
      L.marker([p.user_latitude, p.user_longitude], { icon: this.blueIcon })
        .addTo(this.map)
        .bindPopup(getFullName(p.user_first_name, p.user_last_name));
    });

    // Fit bounds to show all markers
    const bounds = L.latLngBounds([[veteranLat, veteranLon]]);
    this.filteredPhotographers.forEach((p) => {
      bounds.extend([p.user_latitude, p.user_longitude]);
    });
    this.map.fitBounds(bounds, { padding: [50, 50] });
  }

  selectPhotographer(photographer: any) {
    this.selectedPhotographer = photographer;
  }

  requestSession() {
    if (this.sessionForm.invalid || !this.selectedPhotographer) {
      this.sessionForm.markAllAsTouched();
      this.toastr.error('Please fill in all required fields and select a photographer.');
      return;
    }

    const payload = {
      name: this.sessionForm.get('sessionName')?.value,
      note: this.sessionForm.get('sessionNote')?.value || undefined,
      date: this.sessionForm.get('sessionDate')?.value,
      expirationDate: this.sessionForm.get('sessionExpirationDate')?.value || undefined,
      photographerId: this.selectedPhotographer.user_id,
      veteranId: this.user.id
    };

    this.loading = true;
    this.sessionService.createSession(payload).subscribe({
      next: () => {
        this.toastr.success('Session requested successfully.');
        this.loading = false;
        this.modal.close();
      },
      error: () => {
        this.toastr.error('Failed to request session.');
        this.loading = false;
      }
    });
  }

  close() {
    this.modal.dismiss();
  }

  getRadiusFromText() {
    let radius = 3;
    switch (this.selectedRadius) {
      case 'Nearest to me':
        radius = 3;
        break;
      case '10 miles':
        radius = 10;
        break;
      case '50 miles':
        radius = 50;
        break;
      case '100 miles':
        radius = 100;
        break;
      case 'Custom Radius...':
        radius = Number(this.customRadius);
        break;
    }

    return radius;
  }
}

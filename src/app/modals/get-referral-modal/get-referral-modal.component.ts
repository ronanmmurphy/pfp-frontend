import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import * as L from 'leaflet';
import { UserService } from 'src/app/services/user.service';
import { getFullName, getLocationText } from 'src/app/utils/user.helper';
import { INearbyPhotographer, IUser } from 'src/app/types/user.type';
import { NgSelectModule } from '@ng-select/ng-select';
import { Subject, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-get-referral-modal',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './get-referral-modal.component.html',
  styleUrls: ['./get-referral-modal.component.scss'],
  standalone: true
})
export class GetReferralModalComponent implements OnInit, AfterViewInit, OnDestroy {
  getLocationText = getLocationText;
  getFullName = getFullName;

  user: IUser;
  map: any;

  latitude!: number;
  longitude!: number;

  useCustomLocation = false;
  suggestions: any[] = [];
  selectedAddress: any = null;
  addressInput$ = new Subject<string>();

  selectedRadius = 'Nearest to me';
  locationOptions = ['Nearest to me', '10 miles', '50 miles', '100 miles', 'Custom Radius...'];
  customRadius: number | null = null;

  photographers: INearbyPhotographer[] = [];

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
    private userService: UserService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.latitude = this.user.latitude;
    this.longitude = this.user.longitude;
    this.onRadiusChange();
    this.addressInput$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => {
          if (!term || term.length < 3) {
            // Clear previous suggestions so ng-select updates properly
            this.suggestions = [];
            return of([]);
          }
          return this.userService.getAddressSuggestions({ streetAddress1: term });
        })
      )
      .subscribe((res) => {
        // Always assign a new array reference
        this.suggestions = [...res];
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

  toggleLocationMode(): void {
    this.useCustomLocation = !this.useCustomLocation;

    if (!this.useCustomLocation) {
      // reset to base location
      this.latitude = this.user.latitude;
      this.longitude = this.user.longitude;
      this.selectedAddress = null;
      this.onRadiusChange();
    }
  }

  onSelectAddress(address: any): void {
    this.selectedAddress = address;
    this.latitude = address.latitude;
    this.longitude = address.longitude;
    this.onRadiusChange();
  }

  onRadiusChange(): void {
    if (!this.user?.id) {
      this.toastr.error('User data not loaded.');
      return;
    }

    this.photographers = [];
    const radius = this.getRadiusFromText();

    if (!radius) return;

    this.loading = true;
    this.userService
      .getPhotographersNear({
        latitude: this.latitude,
        longitude: this.longitude,
        radius
      })
      .subscribe({
        next: (photographers: INearbyPhotographer[]) => {
          this.photographers = photographers;
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
    this.photographers.forEach((p) => {
      L.marker([p.latitude, p.longitude], { icon: this.blueIcon })
        .addTo(this.map)
        .bindPopup(
          `<strong>${getFullName(p.firstName, p.lastName)}</strong><br/>
          ${p.email || 'No Email'}<br/>
          ${p.phoneNumber || 'No Phone'}<br/>
          ${getLocationText(p.streetAddress1, p?.streetAddress2, p?.city, p?.state, p?.postalCode)}<br/>
          Distance: ${p.distance.toFixed(2)} miles`
        );
    });

    // Fit bounds to show all markers
    const bounds = L.latLngBounds([[veteranLat, veteranLon]]);
    this.photographers.forEach((p) => {
      bounds.extend([p.latitude, p.longitude]);
    });
    this.map.fitBounds(bounds, { padding: [50, 50] });
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

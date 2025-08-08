import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as L from 'leaflet';

interface Photographer {
  id: number;
  name: string;
  location: string;
  email: string;
}

@Component({
  selector: 'app-new-session-modal',
  templateUrl: './new-session-modal.component.html',
  styleUrls: ['./new-session-modal.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class NewSessionModalComponent implements OnInit {
  user: any;
  map: any;

  selectedRadius = 'Nearest to me';
  customLocation = '';
  locationOptions = ['Nearest to me', 'Within 10 miles', 'Within 50 miles', 'Within 100 miles', 'Custom Radius...'];

  photographers: Photographer[] = [
    {
      id: 1,
      name: 'Benjamin Wright',
      location: 'Main Street, Dallas, TX, 75201', // ~2 miles
      email: 'benjamin@example.com'
    },
    {
      id: 2,
      name: 'Emma Johnson',
      location: 'Elm Street, Dallas, TX, 75202', // ~3 miles
      email: 'emma@example.com'
    },
    {
      id: 3,
      name: 'Liam Harris',
      location: 'Mockingbird Lane, Dallas, TX, 75235', // ~7 miles
      email: 'liam@example.com'
    }
  ];

  photographersWithin10Miles: Photographer[] = [
    {
      id: 4,
      name: 'Chloe Ramirez',
      location: 'Beckley Ave, Dallas, TX, 75224', // ~5 miles
      email: 'chloe@example.com'
    },
    {
      id: 5,
      name: 'Mason Patel',
      location: 'Ross Ave, Dallas, TX, 75204', // ~4 miles
      email: 'mason@example.com'
    },
    {
      id: 6,
      name: 'Isabella Nguyen',
      location: 'Lemmon Ave, Dallas, TX, 75219', // ~8 miles
      email: 'isabella@example.com'
    }
  ];

  photographersWithin50Miles: Photographer[] = [
    {
      id: 7,
      name: 'Elijah Brown',
      location: 'Spring Creek Pkwy, Plano, TX, 75023', // ~28 miles
      email: 'elijah@example.com'
    },
    {
      id: 8,
      name: 'Grace Lee',
      location: 'Downtown, Denton, TX, 76201', // ~38 miles
      email: 'grace@example.com'
    },
    {
      id: 9,
      name: 'Lucas White',
      location: 'Hebron Pkwy, Carrollton, TX, 75010', // ~25 miles
      email: 'lucas@example.com'
    }
  ];

  photographersWithin100Miles: Photographer[] = [
    {
      id: 10,
      name: 'Avery Davis',
      location: 'Downtown, Waco, TX, 76701', // ~95 miles
      email: 'avery@example.com'
    },
    {
      id: 11,
      name: 'Harper Wilson',
      location: 'Broadway Ave, Tyler, TX, 75701', // ~98 miles
      email: 'harper@example.com'
    },
    {
      id: 12,
      name: 'Ethan Clark',
      location: 'Texoma Pkwy, Sherman, TX, 75090', // ~85 miles
      email: 'ethan@example.com'
    }
  ];

  filteredPhotographers: Photographer[] = [];
  selectedPhotographer: Photographer | null = null;

  markers: L.Marker[] = [];

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

  constructor(public modal: NgbActiveModal) {}

  ngOnInit(): void {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
    }

    this.filteredPhotographers = [...this.photographers]; // For now, just show all
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  initMap(): void {
    this.map = L.map('leafletMap').setView([32.7767, -96.797], 8); // Dallas default

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    const veteranLocation = `${this.user.address1}, ${this.user.city}, ${this.user.state}, ${this.user.country}`;
    this.geocodeAndMark(veteranLocation, this.redIcon, 'Your Location');

    this.photographers.forEach((p) => {
      this.geocodeAndMark(p.location, this.blueIcon, p.name);
    });
  }

  clearMarkers(): void {
    this.markers.forEach((marker) => this.map.removeLayer(marker));
    this.markers = [];
  }

  geocodeAndMark(address: string, icon: any, popupText: string): void {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          const marker = L.marker([lat, lon], { icon }).addTo(this.map).bindPopup(popupText);
          this.markers.push(marker);
        }
      })
      .catch((err) => console.error('Geocoding failed:', err));
  }

  onRadiusChange() {
    if (this.selectedRadius !== 'Custom Radius...') {
      this.customLocation = '';
    }

    switch (this.selectedRadius) {
      case 'Nearest to me':
        this.filteredPhotographers = [...this.photographers];
        break;
      case 'Within 10 miles':
        this.filteredPhotographers = [...this.photographersWithin10Miles];
        break;
      case 'Within 50 miles':
        this.filteredPhotographers = [...this.photographersWithin50Miles];
        break;
      case 'Within 100 miles':
        this.filteredPhotographers = [...this.photographersWithin100Miles];
        break;
      case 'Custom Radius...':
        this.filteredPhotographers = [];
        break;
      default:
        this.filteredPhotographers = [];
        break;
    }

    this.clearMarkers();
    const veteranLocation = `${this.user.address1}, ${this.user.city}, ${this.user.state}, ${this.user.country}`;
    this.geocodeAndMark(veteranLocation, this.redIcon, 'Your Location');
    this.filteredPhotographers.forEach((p) => {
      this.geocodeAndMark(p.location, this.blueIcon, p.name);
    });
  }

  selectPhotographer(photographer: Photographer) {
    this.selectedPhotographer = photographer;
  }

  requestSession() {
    console.log('Session requested with:', this.selectedPhotographer);
    this.modal.close(this.selectedPhotographer);
  }

  close() {
    this.modal.dismiss();
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import * as L from 'leaflet';
import 'leaflet.markercluster';
import * as Geohash from 'ngeohash';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface Card {
  name: string;
  category: string;
}

const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

@Injectable({
  providedIn: 'root'
})
export class MapService {

  constructor(private http: HttpClient) { }

  getData() {
    return this.http.get('/assets/data/location.json').pipe(
      catchError(err => {
        console.log(err);
        return of(err);
      })
    );
  }
}

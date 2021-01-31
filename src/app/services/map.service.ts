import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import * as L from 'leaflet';
import 'leaflet.markercluster';
import * as Geohash from 'ngeohash';

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

  private getGeohashes(coords: L.LatLngBounds): string[] {
    const { lat: minLat, lng: minLog } = coords.getSouthWest();
    const { lat: maxLat, lng: maxLog } = coords.getNorthEast();

    return Geohash.bboxes(minLat, minLog, maxLat, maxLog, 2);
  }

  getData() {
    return this.http.get('/assets/data/location.json').pipe(
      catchError(err => {
        console.log(err);
        return of(err);
      })
    );
  }

  setCluster(map: L.Map, markers: L.Marker[]) {
    /** create cluster group */
    const clusterGroup = L.markerClusterGroup();
    clusterGroup.addLayers(markers);
    map.addLayer(clusterGroup);

    return clusterGroup;
  }

  filterByGeohashes(bounds: L.LatLngBounds, data = {}) {
    /** get Geohashes for the given bounds */
    const geohashes = this.getGeohashes(bounds);
    const filtered = [];
    geohashes.forEach(hash => {
      if (data[hash]) {
        data[hash].forEach(item => {
          filtered.push(item);
        });
      }
    });
    return filtered;
  }
}

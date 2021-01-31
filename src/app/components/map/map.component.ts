import { AfterViewInit, Component, OnInit } from '@angular/core';

import { LoadingController } from '@ionic/angular';

import * as L from 'leaflet';

import { MapService, Card } from 'src/app/services/map.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, AfterViewInit {

  map: L.Map;
  isCardShown;
  cardContent: Card;
  filtered;
  markers;
  dataset$: Observable<any>;
  clusterGroup: L.MarkerClusterGroup;

  constructor(
    private mapService: MapService,
    private loadingCtrl: LoadingController
  ) {
    this.filtered = [];
    this.markers = [];
    this.clusterGroup = L.markerClusterGroup();
  }

  ngOnInit() {}

  async ngAfterViewInit() {
    const loader = await this.loadingCtrl.create({
      message: 'Loading...'
    });
    await loader.present();

    this.mapService.getData().subscribe(data => {
      // this.dataset = data;

      this.map = L.map('map');

      const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      });
      tiles.addTo(this.map);

      this.map.on('load', async () => {
        await this.onMapReady(this.map);
        loader.dismiss();
      });

      /** Should go AFTER the 'load' listener due to a known bug. */
      this.map.setView([ 39.8282, -98.5795 ], 8);

      this.map.on('click', this.handleMapClick.bind(this));

      this.map.on('zoomend', () => {
        this.clusterGroup.removeLayers(this.markers);
        this.setCluster(this.map.getBounds());
      });

      /** get the bounds of the visible map area */
      const bounds = this.map.getBounds();
      this.setCluster(bounds);
    });
  }

  private setCluster(bounds: L.LatLngBounds) {
    /** get Geohashes for the given bounds */
    const geohashes = this.getGeohashes(bounds);
    // console.log(geohashes);

    /** filter DATASET using geohashes */
    this.filtered = this.filterByGeohashes(geohashes, this.dataset);

    /** set markers for the filteres data */
    if (this.filtered.length) {
      this.markers = this.setMarkers(this.filtered);
    }

    /** create cluster group */
    this.clusterGroup.addLayers(this.markers);
    this.map.addLayer(this.clusterGroup);
  }

  private getGeohashes(coords: L.LatLngBounds): string[] {
    const { lat: minLat, lng: minLog } = coords.getSouthWest();
    const { lat: maxLat, lng: maxLog } = coords.getNorthEast();

    return Geohash.bboxes(minLat, minLog, maxLat, maxLog, 2);
  }

  private filterByGeohashes(geohashes: string[], data = {}) {
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

  private setMarkers(data) {
    const markers: L.Marker[] = [];
    data.forEach(item => {
      const card: Card = {
        name: item.NAME,
        category: item.CATEGORY
      };
      markers.push(L.marker([item.COORDS.LATITUDE, item.COORDS.LONGITUDE])
      .on('click', this.handleMarkerClick.bind(this, card)));
    });
    return markers;
  }

  private handleMarkerClick(data: Card) {
    this.isCardShown = true;
    this.cardContent = data;
  }

  private handleMapClick(e: L.LeafletMouseEvent) {
    const target = e.originalEvent.target as HTMLElement;
    if (target === target.closest('#card')) {
      return;
    }
    this.isCardShown = false;
  }

  private onMapReady(map: L.Map) {
    setTimeout(() => {
      map.invalidateSize();
    }, 0);
  }
}

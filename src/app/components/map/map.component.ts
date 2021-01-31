import { AfterViewInit, Component, OnInit, OnDestroy } from '@angular/core';

import { LoadingController } from '@ionic/angular';

import { Subscription } from 'rxjs';

import * as L from 'leaflet';

import { MapService, Card } from 'src/app/services/map.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {

  map: L.Map;
  isCardShown;
  cardContent: Card;
  markers;
  clusterGroup: L.MarkerClusterGroup;
  dataSub: Subscription;

  constructor(
    private mapService: MapService,
    private loadingCtrl: LoadingController
  ) {
    this.markers = [];
  }

  ngOnInit() {}

  async ngAfterViewInit() {
    const loader = await this.loadingCtrl.create({
      message: 'Loading...'
    });
    await loader.present();

    this.dataSub = this.mapService.getData().subscribe(data => {

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

      /** Map click handler */
      this.map.on('click', this.handleMapClick.bind(this));

      /** Map zoom handler */
      this.map.on('zoomend', () => {
        if (!this.clusterGroup) {
          return;
        }
        this.clusterGroup.removeLayers(this.markers);
        this.clusterGroup = this.mapService.setCluster(this.map, this.markers);
      });

      /** get the bounds of the visible map area */
      const bounds = this.map.getBounds();

      /** filter DATASET using geohashes */
      const filtered = this.mapService.filterByGeohashes(bounds, data);

      /** set markers for the filteres data */
      if (filtered.length) {
        this.markers = this.setMarkers(filtered);
        this.clusterGroup = this.mapService.setCluster(this.map, this.markers);
      }
    });
  }

  ngOnDestroy() {
    if (this.dataSub) {
      this.dataSub.unsubscribe();
    }
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

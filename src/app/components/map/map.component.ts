import { AfterViewInit, Component, OnInit, OnDestroy } from '@angular/core';

import { LoadingController } from '@ionic/angular';

import { Observable, BehaviorSubject, Subject, fromEvent } from 'rxjs';
import { filter, mergeMap, takeUntil, tap, map, take } from 'rxjs/operators';

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
  filtered;
  filteredByCategory;
  clusterGroup: L.MarkerClusterGroup;
  categoryFilter: BehaviorSubject<string[]>;
  selectedFilter: BehaviorSubject<string[]>;
  selected$: Observable<string[]>;
  filter$: Observable<string[]>;
  onDestroy$: Subject<null>;

  constructor(
    private mapService: MapService,
    private loadingCtrl: LoadingController
  ) {
    this.markers = [];
    this.filtered = [];
    this.categoryFilter = new BehaviorSubject<string[]>([]);
    this.selectedFilter = new BehaviorSubject<string[]>([]);
    this.filter$ = this.categoryFilter.asObservable();
    this.selected$ = this.selectedFilter.asObservable();
    this.onDestroy$ = new Subject();
  }

  ngOnInit() {}

  async ngAfterViewInit() {
    const loader = await this.loadingCtrl.create({
      message: 'Loading...'
    });
    await loader.present();

    /** get DATASET */
    this.mapService.getData().pipe(takeUntil(this.onDestroy$)).subscribe(data => {

      /** init map */
      this.map = L.map('map');

      const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      });
      tiles.addTo(this.map);

      this.map.setView([ 39.8282, -98.5795 ], 8);

      loader.dismiss();

      /** set event listeners for the map */
      this.map.on('load', async () => {
        await this.onMapReady(this.map);
      });

      /** map click handler */
      this.map.on('click', this.handleMapClick.bind(this));

      /** map zoom handler */
      fromEvent(this.map, 'zoomend').pipe(
        tap(() => {
          this.filtered = this.getFilteredData(data);
        }),
        filter(() => this.filtered.length),
        mergeMap(() => {
          return this.selectedFilter.pipe(
            map(selected => {
              if (selected.length) {
                return this.mapService.filterByCategories(selected, this.filtered);
              } else {
                const cats = this.mapService.getCategoriesByGeohashes(this.filtered);
                return this.mapService.filterByCategories(cats, this.filtered);
              }
            })
          );
        }),
        tap(filtered => {
          this.markers = this.setMarkers(filtered);
          this.map.removeLayer(this.clusterGroup);
          this.clusterGroup = this.mapService.setCluster(this.map, this.markers);
        }),
        takeUntil(this.onDestroy$)
      ).subscribe();

      this.filtered = this.getFilteredData(data);

      /** set markers for the filteres data */
      if (this.filtered.length) {
        this.markers = this.setMarkers(this.filtered);
        this.clusterGroup = this.mapService.setCluster(this.map, this.markers);

        /** get available categories for category filter */
        const cats = this.mapService.getCategoriesByGeohashes(this.filtered);
        this.categoryFilter.next(cats);
      }
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next(null);
  }

  /** make sure the window size is calculated and the map is properly displayed */
  private onMapReady(map: L.Map) {
    setTimeout(() => {
      map.invalidateSize();
    }, 0);
  }

  /** set markers for the map */
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

  /** show card on marker click */
  private handleMarkerClick(data: Card) {
    this.isCardShown = true;
    this.cardContent = data;
  }

  /** hide card on map click */
  private handleMapClick(e: L.LeafletMouseEvent) {
    const target = e.originalEvent.target as HTMLElement;
    if (target === target.closest('#card')) {
      return;
    }
    this.isCardShown = false;
  }

  /** filter DATASET for the visible map area using geohashes */
  getFilteredData(data) {
    const bounds = this.map.getBounds();
    return this.mapService.filterByGeohashes(bounds, data);
  }

  /** remove chip from the filtered categories and filter again */
  removeChip(chipValue: string) {
    this.selected$.pipe(take(1)).subscribe(chips => {
      chips.splice(chips.indexOf(chipValue), 1);
      this.selectedFilter.next(chips);
      this.selectByCategory(chips);
    });
  }

  /** select data by categories, if none selected by user - all available categories for the map view are used */
  selectByCategory(val: CustomEvent | string[]) {
    const selectedValue = val instanceof CustomEvent ? (val as CustomEvent).detail.value : val;
    if (selectedValue[0] === 'all') {
      this.selectedFilter.next(this.mapService.getCategoriesByGeohashes(this.filtered));
    } else if (selectedValue[0] === 'none') {
      this.selectedFilter.next([]);
    } else {
      this.selectedFilter.next(selectedValue);
    }
    let filtered = [];
    let filteredByCategory = [];
    if (selectedValue.length) {
      filteredByCategory = this.mapService.filterByCategories(selectedValue, this.filtered);
    }
    filtered = filteredByCategory.length ? filteredByCategory : this.filtered;

    this.markers = this.setMarkers(filtered);
    this.map.removeLayer(this.clusterGroup);
    this.clusterGroup = this.mapService.setCluster(this.map, this.markers);
  }
}

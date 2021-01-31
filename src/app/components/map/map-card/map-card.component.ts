import { Component, Input, OnInit } from '@angular/core';

import { Card } from 'src/app/services/map.service';

@Component({
  selector: 'app-map-card',
  templateUrl: './map-card.component.html',
  styleUrls: ['./map-card.component.scss'],
})
export class MapCardComponent implements OnInit {

  @Input() showCard: boolean;
  @Input() cardContent: Card;

  constructor() { }

  ngOnInit() {}

}

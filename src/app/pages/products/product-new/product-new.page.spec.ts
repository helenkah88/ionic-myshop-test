import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ProductNewPage } from './product-new.page';

describe('ProductNewPage', () => {
  let component: ProductNewPage;
  let fixture: ComponentFixture<ProductNewPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductNewPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductNewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

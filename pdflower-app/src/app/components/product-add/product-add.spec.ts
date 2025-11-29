import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductAdd } from './product-add';

describe('ProductAdd', () => {
  let component: ProductAdd;
  let fixture: ComponentFixture<ProductAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductAdd);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoPictureManager } from './info-picture-manager';

describe('InfoPictureManager', () => {
  let component: InfoPictureManager;
  let fixture: ComponentFixture<InfoPictureManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoPictureManager]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoPictureManager);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

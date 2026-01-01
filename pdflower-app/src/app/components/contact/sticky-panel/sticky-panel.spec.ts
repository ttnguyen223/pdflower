import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StickyPanel } from './sticky-panel';

describe('StickyPanel', () => {
  let component: StickyPanel;
  let fixture: ComponentFixture<StickyPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StickyPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StickyPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

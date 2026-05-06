import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PastEvent } from './past-event';

describe('PastEvent', () => {
  let component: PastEvent;
  let fixture: ComponentFixture<PastEvent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PastEvent],
    }).compileComponents();

    fixture = TestBed.createComponent(PastEvent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavedPlacesComponent } from './saved-places.component';

describe('SavedPlacesComponent', () => {
  let component: SavedPlacesComponent;
  let fixture: ComponentFixture<SavedPlacesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavedPlacesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SavedPlacesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

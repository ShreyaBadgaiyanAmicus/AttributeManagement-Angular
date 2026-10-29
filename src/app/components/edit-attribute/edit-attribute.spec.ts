import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditAttributeComponent } from './edit-attribute';

describe('EditAttributeComponent', () => {
  let component: EditAttributeComponent;
  let fixture: ComponentFixture<EditAttributeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditAttributeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditAttributeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

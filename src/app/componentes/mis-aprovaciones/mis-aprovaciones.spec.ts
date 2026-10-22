import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MisAprovaciones } from './mis-aprovaciones';

describe('MisAprovaciones', () => {
  let component: MisAprovaciones;
  let fixture: ComponentFixture<MisAprovaciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisAprovaciones],
    }).compileComponents();

    fixture = TestBed.createComponent(MisAprovaciones);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

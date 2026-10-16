import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LocalDetalle } from './local-detalle';

describe('LocalDetalle', () => {
  let component: LocalDetalle;
  let fixture: ComponentFixture<LocalDetalle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocalDetalle],
    }).compileComponents();

    fixture = TestBed.createComponent(LocalDetalle);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

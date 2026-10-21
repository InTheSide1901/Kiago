import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SolicitudLocal } from './solicitud-local';

describe('SolicitudLocal', () => {
  let component: SolicitudLocal;
  let fixture: ComponentFixture<SolicitudLocal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitudLocal],
    }).compileComponents();

    fixture = TestBed.createComponent(SolicitudLocal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

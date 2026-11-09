import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServiceSolicitudes } from './service-solicitudes';

describe('ServiceSolicitudes', () => {
  let component: ServiceSolicitudes;
  let fixture: ComponentFixture<ServiceSolicitudes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceSolicitudes],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceSolicitudes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

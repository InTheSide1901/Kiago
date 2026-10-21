import { TestBed } from '@angular/core/testing';
import { ServiceSolicitudLocal } from './service-solicitud-local';

describe('ServiceSolicitudLocal', () => {
  let service: ServiceSolicitudLocal;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServiceSolicitudLocal);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

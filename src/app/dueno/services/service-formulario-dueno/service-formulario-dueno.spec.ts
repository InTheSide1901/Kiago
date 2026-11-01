import { TestBed } from '@angular/core/testing';
import { ServiceFormularioDueno } from './service-formulario-dueno';

describe('ServiceFormularioDueno', () => {
  let service: ServiceFormularioDueno;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServiceFormularioDueno);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

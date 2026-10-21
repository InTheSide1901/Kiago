import { TestBed } from '@angular/core/testing';
import { ServicePerfil } from './service-perfil';

describe('ServicePerfil', () => {
  let service: ServicePerfil;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServicePerfil);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

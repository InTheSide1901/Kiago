import { TestBed } from '@angular/core/testing';
import { ServiceComentario } from './service-comentario';

describe('ServiceComentario', () => {
  let service: ServiceComentario;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServiceComentario);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

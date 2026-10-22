import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';
import { duenoGuard } from './dueno-guard';

describe('duenoGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => duenoGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});

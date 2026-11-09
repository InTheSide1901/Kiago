import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LugaresDueno } from './lugares-dueno';

describe('LugaresDueno', () => {
  let component: LugaresDueno;
  let fixture: ComponentFixture<LugaresDueno>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LugaresDueno],
    }).compileComponents();

    fixture = TestBed.createComponent(LugaresDueno);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

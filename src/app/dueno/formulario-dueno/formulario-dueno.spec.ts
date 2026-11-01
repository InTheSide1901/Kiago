import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormularioDueno } from './formulario-dueno';

describe('FormularioDueno', () => {
  let component: FormularioDueno;
  let fixture: ComponentFixture<FormularioDueno>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioDueno],
    }).compileComponents();

    fixture = TestBed.createComponent(FormularioDueno);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

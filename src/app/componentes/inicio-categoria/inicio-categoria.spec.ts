import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InicioCategoria } from './inicio-categoria';

describe('InicioCategoria', () => {
  let component: InicioCategoria;
  let fixture: ComponentFixture<InicioCategoria>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InicioCategoria],
    }).compileComponents();

    fixture = TestBed.createComponent(InicioCategoria);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

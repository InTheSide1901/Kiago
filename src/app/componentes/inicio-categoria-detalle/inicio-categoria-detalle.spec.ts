import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InicioCategoriaDetalle } from './inicio-categoria-detalle';

describe('InicioCategoriaDetalle', () => {
  let component: InicioCategoriaDetalle;
  let fixture: ComponentFixture<InicioCategoriaDetalle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InicioCategoriaDetalle],
    }).compileComponents();

    fixture = TestBed.createComponent(InicioCategoriaDetalle);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

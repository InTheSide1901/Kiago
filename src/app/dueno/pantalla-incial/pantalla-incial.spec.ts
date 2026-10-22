import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PantallaIncial } from './pantalla-incial';

describe('PantallaIncial', () => {
  let component: PantallaIncial;
  let fixture: ComponentFixture<PantallaIncial>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PantallaIncial],
    }).compileComponents();

    fixture = TestBed.createComponent(PantallaIncial);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

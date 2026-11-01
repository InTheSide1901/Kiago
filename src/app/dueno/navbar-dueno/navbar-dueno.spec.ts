import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarDueno } from './navbar-dueno';

describe('NavbarDueno', () => {
  let component: NavbarDueno;
  let fixture: ComponentFixture<NavbarDueno>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarDueno],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarDueno);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

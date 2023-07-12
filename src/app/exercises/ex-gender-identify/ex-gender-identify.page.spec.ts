import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExGenderIdentifyPage } from './ex-gender-identify.page';

describe('ExGenderIdentifyPage', () => {
  let component: ExGenderIdentifyPage;
  let fixture: ComponentFixture<ExGenderIdentifyPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ExGenderIdentifyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExCategoryIdentifyPage } from './ex-category-identify.page';

describe('ExCategoryIdentifyPage', () => {
  let component: ExCategoryIdentifyPage;
  let fixture: ComponentFixture<ExCategoryIdentifyPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ExCategoryIdentifyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RandomExercisesPage } from './random-exercises.page';

describe('RandomExercisesPage', () => {
  let component: RandomExercisesPage;
  let fixture: ComponentFixture<RandomExercisesPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(RandomExercisesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

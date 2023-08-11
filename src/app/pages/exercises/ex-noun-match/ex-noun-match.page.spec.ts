import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExNounMatchPage } from './ex-noun-match.page';

describe('ExNounMatchPage', () => {
  let component: ExNounMatchPage;
  let fixture: ComponentFixture<ExNounMatchPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ExNounMatchPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

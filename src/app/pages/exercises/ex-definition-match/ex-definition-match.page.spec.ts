import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExDefinitionMatchPage } from './ex-definition-match.page';

describe('ExDefinitionMatchPage', () => {
  let component: ExDefinitionMatchPage;
  let fixture: ComponentFixture<ExDefinitionMatchPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ExDefinitionMatchPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

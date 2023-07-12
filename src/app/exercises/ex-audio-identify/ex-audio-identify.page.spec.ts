import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExAudioIdentifyPage } from './ex-audio-identify.page';

describe('ExAudioIdentifyPage', () => {
  let component: ExAudioIdentifyPage;
  let fixture: ComponentFixture<ExAudioIdentifyPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ExAudioIdentifyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

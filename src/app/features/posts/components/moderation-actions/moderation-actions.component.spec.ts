import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { provideTranslateTesting } from '../../../../core/i18n/testing/provide-translate-testing';

import { ModerationActionsComponent } from './moderation-actions.component';

describe('ModerationActionsComponent', () => {
  let component: ModerationActionsComponent;
  let fixture: ComponentFixture<ModerationActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModerationActionsComponent],
      providers: [provideNoopAnimations(), provideTranslateTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ModerationActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

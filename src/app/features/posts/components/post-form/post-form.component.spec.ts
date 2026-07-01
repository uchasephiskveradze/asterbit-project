import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { PostFormComponent } from './post-form.component';
import { POST_FORM_VALIDATION } from './post-form.validation';

const translateTesting = provideTranslateService({
  fallbackLang: 'en',
  lang: 'en',
  loader: { provide: TranslateLoader, useValue: { getTranslation: () => of({}) } },
});

describe('PostFormComponent', () => {
  let component: PostFormComponent;
  let fixture: ComponentFixture<PostFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostFormComponent],
      providers: [translateTesting],
    }).compileComponents();

    fixture = TestBed.createComponent(PostFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should not show field errors before a field is touched', () => {
    expect(component.getError('title')).toBeNull();
    expect(component.getError('author')).toBeNull();
    expect(component.getError('description')).toBeNull();
    expect(component.getError('content')).toBeNull();
  });

  it('should mark fields touched when submit is attempted while invalid', () => {
    const event = { preventDefault: vi.fn() } as unknown as MouseEvent;

    component.onSubmitAttempt(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(component.isInvalid('title')).toBe(true);
    expect(component.isInvalid('author')).toBe(true);
    expect(component.isInvalid('description')).toBe(true);
    expect(component.isInvalid('content')).toBe(true);
  });

  it('should block submit and show errors when required fields are empty', () => {
    const emitSpy = vi.spyOn(component.formSubmit, 'emit');

    component.onSubmit();

    expect(emitSpy).not.toHaveBeenCalled();
    expect(component.form.invalid).toBe(true);
    expect(component.isInvalid('title')).toBe(true);
  });

  it('should enforce minimum lengths', () => {
    component.form.setValue({
      title: 'a'.repeat(POST_FORM_VALIDATION.title.minLength - 1),
      author: 'Jane Doe',
      description: 'a'.repeat(POST_FORM_VALIDATION.description.minLength - 1),
      content: 'a'.repeat(POST_FORM_VALIDATION.content.minLength - 1),
    });
    component.form.controls.title.markAsTouched();

    expect(component.form.invalid).toBe(true);
    expect(component.getError('title')).toEqual({
      key: 'form.errors.minLength',
      params: { count: POST_FORM_VALIDATION.title.minLength },
    });
  });

  it('should emit valid form values when all rules pass', () => {
    const emitSpy = vi.spyOn(component.formSubmit, 'emit');
    const validValue = {
      title: 'Valid Post Title',
      author: 'Jane Doe',
      description: 'a'.repeat(POST_FORM_VALIDATION.description.minLength),
      content: 'a'.repeat(POST_FORM_VALIDATION.content.minLength),
    };

    component.form.setValue(validValue);
    component.onSubmit();

    expect(emitSpy).toHaveBeenCalledWith(validValue);
  });
});

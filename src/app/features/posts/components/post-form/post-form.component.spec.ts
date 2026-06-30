import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostFormComponent } from './post-form.component';
import { POST_FORM_VALIDATION } from './post-form.validation';

describe('PostFormComponent', () => {
  let component: PostFormComponent;
  let fixture: ComponentFixture<PostFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PostFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should block submit and show errors when required fields are empty', () => {
    const emitSpy = vi.spyOn(component.formSubmit, 'emit');

    component.onSubmit();

    expect(emitSpy).not.toHaveBeenCalled();
    expect(component.form.invalid).toBe(true);
    expect(component.isInvalid('title')).toBe(true);
    expect(component.isInvalid('author')).toBe(true);
    expect(component.isInvalid('description')).toBe(true);
    expect(component.isInvalid('content')).toBe(true);
  });

  it('should enforce assignment minimum lengths', () => {
    component.form.setValue({
      title: 'a'.repeat(POST_FORM_VALIDATION.title.minLength - 1),
      author: 'Jane Doe',
      description: 'a'.repeat(POST_FORM_VALIDATION.description.minLength - 1),
      content: 'a'.repeat(POST_FORM_VALIDATION.content.minLength - 1),
    });
    component.form.markAllAsTouched();

    expect(component.form.invalid).toBe(true);
    expect(component.getError('title')).toContain(
      String(POST_FORM_VALIDATION.title.minLength),
    );
    expect(component.getError('description')).toContain(
      String(POST_FORM_VALIDATION.description.minLength),
    );
    expect(component.getError('content')).toContain(
      String(POST_FORM_VALIDATION.content.minLength),
    );
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

  it('should show character counter only while a field is focused', () => {
    expect(component.showCounter('title')).toBe(false);

    component.onFieldFocus('title');
    expect(component.showCounter('title')).toBe(true);
    expect(component.showCounter('author')).toBe(false);

    component.onFieldBlur('title');
    expect(component.showCounter('title')).toBe(false);
  });
});

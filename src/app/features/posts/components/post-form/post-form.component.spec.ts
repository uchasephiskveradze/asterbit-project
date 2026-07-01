import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideTranslateTesting } from '../../../../core/i18n/testing/provide-translate-testing';

import { Post } from '../../models/post.model';
import { PostFormComponent } from './post-form.component';
import { POST_FORM_VALIDATION } from './post-form.validation';

describe('PostFormComponent', () => {
  let component: PostFormComponent;
  let fixture: ComponentFixture<PostFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostFormComponent],
      providers: [provideTranslateTesting()],
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
    expect(component.getError('title')).toEqual({
      key: 'form.errors.minLength',
      params: { count: POST_FORM_VALIDATION.title.minLength },
    });
    expect(component.getError('description')).toEqual({
      key: 'form.errors.minLength',
      params: { count: POST_FORM_VALIDATION.description.minLength },
    });
    expect(component.getError('content')).toEqual({
      key: 'form.errors.minLength',
      params: { count: POST_FORM_VALIDATION.content.minLength },
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

  it('should show character counter only while a field is focused', () => {
    expect(component.showCounter('title')).toBe(false);

    component.onFieldFocus('title');
    expect(component.showCounter('title')).toBe(true);
    expect(component.showCounter('author')).toBe(false);

    component.onFieldBlur('title');
    expect(component.showCounter('title')).toBe(false);
  });

  it('should patch edit values only when the post id changes', () => {
    const patchSpy = vi.spyOn(component.form, 'patchValue');
    const post: Post = {
      id: '1',
      title: 'Original title',
      author: 'Jane Doe',
      description: 'a'.repeat(POST_FORM_VALIDATION.description.minLength),
      content: 'a'.repeat(POST_FORM_VALIDATION.content.minLength),
      createdAt: '2026-01-01T00:00:00.000Z',
      status: 'approved',
    };

    fixture.componentRef.setInput('post', post);
    fixture.detectChanges();
    expect(patchSpy).toHaveBeenCalledTimes(1);

    fixture.componentRef.setInput('post', {
      ...post,
      title: 'Updated title',
    });
    fixture.detectChanges();
    expect(patchSpy).toHaveBeenCalledTimes(1);

    fixture.componentRef.setInput('post', {
      ...post,
      id: '2',
      title: 'Different post',
    });
    fixture.detectChanges();
    expect(patchSpy).toHaveBeenCalledTimes(2);
  });
});

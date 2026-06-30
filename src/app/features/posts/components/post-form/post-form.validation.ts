export const POST_FORM_VALIDATION = {
  title: {
    minLength: 5,
    maxLength: 200,
  },
  author: {
    maxLength: 100,
  },
  description: {
    minLength: 20,
    maxLength: 500,
  },
  content: {
    minLength: 100,
    maxLength: 10_000,
  },
} as const;

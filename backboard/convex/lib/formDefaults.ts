type FormKind = 'survey' | 'application' | 'feedback' | 'contact';

type FieldType = 'text' | 'textarea' | 'select' | 'checkbox';

export type DefaultFormField = {
  id: string;
  label: string;
  type: FieldType;
  order: number;
  selectOptions?: string[];
  required?: boolean;
};

function field(partial: Omit<DefaultFormField, 'order'> & { order: number }): DefaultFormField {
  return {
    required: partial.required ?? true,
    ...partial,
  };
}

export function defaultFieldsForKind(kind: FormKind): DefaultFormField[] {
  switch (kind) {
    case 'survey':
      return [
        field({
          id: 'q1',
          label: 'Overall satisfaction',
          type: 'select',
          order: 0,
          selectOptions: ['Great', 'Good', 'Neutral', 'Poor'],
        }),
        field({
          id: 'q2',
          label: 'What should we improve?',
          type: 'textarea',
          order: 1,
          required: false,
        }),
        field({
          id: 'q3',
          label: 'Would you recommend us?',
          type: 'select',
          order: 2,
          selectOptions: ['Yes', 'Maybe', 'No'],
        }),
        field({
          id: 'q4',
          label: 'Contact email (optional)',
          type: 'text',
          order: 3,
          required: false,
        }),
      ];
    case 'application':
      return [
        field({ id: 'a1', label: 'Full name', type: 'text', order: 0 }),
        field({ id: 'a2', label: 'Email', type: 'text', order: 1 }),
        field({
          id: 'a3',
          label: 'Why are you applying?',
          type: 'textarea',
          order: 2,
        }),
        field({
          id: 'a4',
          label: 'Years of experience',
          type: 'select',
          order: 3,
          selectOptions: ['0-1', '1-3', '3-5', '5+'],
        }),
      ];
    case 'feedback':
      return [
        field({ id: 'f1', label: 'Topic', type: 'text', order: 0 }),
        field({
          id: 'f2',
          label: 'Detailed feedback',
          type: 'textarea',
          order: 1,
        }),
        field({
          id: 'f3',
          label: 'Severity',
          type: 'select',
          order: 2,
          selectOptions: ['Low', 'Medium', 'High'],
        }),
        field({
          id: 'f4',
          label: 'Follow up via email?',
          type: 'checkbox',
          order: 3,
          required: false,
        }),
      ];
    case 'contact':
      return [
        field({ id: 'c1', label: 'Name', type: 'text', order: 0 }),
        field({ id: 'c2', label: 'Email', type: 'text', order: 1 }),
        field({
          id: 'c3',
          label: 'Message',
          type: 'textarea',
          order: 2,
        }),
        field({
          id: 'c4',
          label: 'How did you hear about us?',
          type: 'select',
          order: 3,
          selectOptions: ['Social', 'Friend', 'Search', 'Other'],
          required: false,
        }),
      ];
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

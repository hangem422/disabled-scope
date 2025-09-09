export const Obj = {
  foo: 'foo',
  bar: 'bar',
} as const;

export type Obj = (typeof Obj)[keyof typeof Obj];

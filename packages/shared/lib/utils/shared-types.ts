export type ValueOf<T> = T[keyof T];

export type Success<T, E> =
  | {
      success: true;
      value: T;
    }
  | {
      success: false;
      error?: string;
      reason: E;
    };

export type OR_Filters = AND_Filter[];

export interface AND_Filter {
  /** The Column label */
  label: string;
  /** The values to be matched in this column */
  values: string[];
}

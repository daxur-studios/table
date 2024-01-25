import { WritableSignal, signal } from '@angular/core';
import { ITableData } from './table-data.model';
import { FormGroup } from '@angular/forms';

// export class TableController<T extends Object> {
//   constructor(public readonly options: ITableOptions<T>) {}
// }

export interface ITableOptions<T extends Object> {
  columns: ITableColumn<T>[];
  data: WritableSignal<T[]>;

  filterPredicate?: (data: T, filter: string) => boolean;
  trackBy?: (row: T) => string | number;

  rowHeight?: number;
  getRowHeight?: (row: T) => number;
}

export interface ITableColumn<T extends Object> {
  propertyPath: keyof T;
  columnLabel: string;

  cell: (
    row: T
  ) =>
    | string
    | number
    | boolean
    | Date
    | string[]
    | number[]
    | null
    | undefined;

  filter?: (row: T) => boolean;
}

import { WritableSignal, signal } from '@angular/core';
import { ITableData } from './table-data.model';
import { FormGroup } from '@angular/forms';

export class TableController<T extends Object, G extends FormGroup> {
  constructor(public readonly options: ITableOptions<T, G>) {}
}

export interface ITableOptions<T extends Object, G extends FormGroup> {
  columns: ITableColumn<T>[];
  data: WritableSignal<T[]>;

  filterFormGroup: G;

  filterPredicate?: (data: T, filter: string) => boolean;
  trackBy?: (row: T) => string | number;

  rowHeight?: number;
  getRowHeight?: (row: T) => number;
}

export interface ITableColumn<T extends Object> {
  propertyPath: keyof T;
  columnLabel: string;

  cell: (row: T) => string | number | boolean | Date | string[] | number[];
}

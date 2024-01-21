import { WritableSignal, signal } from '@angular/core';
import { ITableData } from './table-data.model';
import { FormGroup } from '@angular/forms';

export class TableController<T, G extends FormGroup> {
  readonly filteredData = signal<T[]>([]);

  constructor(public readonly options: ITableOptions<T, G>) {}
}

interface ITableOptions<T, G extends FormGroup> {
  columns: WritableSignal<ITableColumn<T>[]>;
  data: WritableSignal<T[]>;

  filterFormGroup: G;
}

interface ITableColumn<T> {
  propertyPath: keyof T;
  columnLabel?: string;
}

import { ElementRef, Injectable, WritableSignal, signal } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ITableColumn } from './models';
import { FormControl } from '@angular/forms';

/** New Instance Per Table Component */
@Injectable()
export class TableService<T extends Object> {
  readonly dataSource = new MatTableDataSource<T>([]);
  readonly sortedData: WritableSignal<T[]> = signal([]);
  readonly visibleRows: WritableSignal<T[]> = signal([]);

  readonly filterControl = new FormControl<string | null>(null);

  public itemSize = 50;
  /** Set at ngOnInit of the TableComponent */
  matTableRef?: ElementRef<HTMLDivElement>;
  filterInputRef?: ElementRef<HTMLInputElement>;

  constructor() {}

  public applyFilter(filterValue: string | null) {
    if (!filterValue) {
      this.dataSource.filter = '';
      return;
    }

    this.dataSource.filter = filterValue.trim().toLowerCase();

    this.recalculateVisibleRows();

    console.warn('Table2Component.applyFilter()', this.dataSource);
  }

  public recalculateVisibleRows() {
    if (!this.matTableRef) {
      return;
    }

    // Calculate the visible rows based on the scroll position and the item size
    const firstVisibleRowIndex = Math.floor(
      this.matTableRef.nativeElement.scrollTop / this.itemSize
    );
    const lastVisibleRowIndex = Math.ceil(
      (this.matTableRef.nativeElement.scrollTop +
        this.matTableRef.nativeElement.clientHeight) /
        this.itemSize
    );

    // Set all rows to invisible
    // for (let i = 0; i < this.dataSource.data.length; i++) {
    //   this.dataSource.data[i].visible = false;
    // }
    const visibleRows: T[] = [];

    // Set the visible rows to visible
    for (let i = firstVisibleRowIndex; i < lastVisibleRowIndex; i++) {
      const x = this.sortedData()[i];
      if (x) {
        visibleRows.push(x);
        // x.visible = true;
      }
    }

    // Set the last row to be visible in order to make the table scrollable
    if (this.sortedData().length > 0) {
      // this.sortedData.at(-1)!.visible = true;
      visibleRows.push(this.sortedData().at(-1)!);
    }

    this.visibleRows.set(visibleRows);

    console.warn('VISIBLE ROWS', this.visibleRows);
    // this.updateVisibleRows();
  }

  addFilter(column: ITableColumn<T>, event?: Event) {
    this.filterControl.setValue(`${column.columnLabel}: `);
    if (event) {
      event.stopPropagation();
    }
    if (this.filterInputRef) {
      this.filterInputRef.nativeElement.focus();
    }
  }
}

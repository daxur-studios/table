import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  Injector,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
  WritableSignal,
  effect,
  signal,
} from '@angular/core';
import {
  MatTable,
  MatTableDataSource,
  MatTableModule,
} from '@angular/material/table';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import {
  ITableColumn,
  ITableOptions,
  TableController,
  VariableRowHeightController,
} from '../models';
import { FormGroup } from '@angular/forms';

// export interface PeriodicElement {
//   id: string;
//   name: string;
//   position: number;
//   weight: number;
//   symbol: string;
//   rowHeight: number;
//   visible?: boolean;
// }

// const ELEMENT_DATA: PeriodicElement[] = [];

// const abc = 'abcdefghijklmnopqrstuvwxyz';
// // 440000
// for (let i = 0; i < 100000; i++) {
//   ELEMENT_DATA.push({
//     id: 'id' + i.toString(),
//     position: i,
//     name: `Element ${i}` + abc[i % abc.length] + abc[(i + i) % abc.length],
//     weight: i * 100,
//     symbol: 'X' + i,
//     rowHeight: 50,
//     // rowHeight: 50 + (i % 3) ? 50 : 0,
//     visible: false,
//   });
// }

// ELEMENT_DATA.at(0)!.visible = true;

// ELEMENT_DATA.at(500)!.visible = true;
// ELEMENT_DATA.at(-1)!.visible = true;

@Component({
  selector: 'lib-table2',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatSortModule],
  templateUrl: './table2.component.html',
  styleUrl: './table2.component.scss',
})
export class Table2Component<T extends Object, G extends FormGroup = any>
  implements OnInit, AfterViewInit
{
  @Input({ required: true }) controller?: WritableSignal<TableController<T, G>>;

  /** Cell Templates by `propertyPath` */
  @Input() templates?: {
    [v in keyof T]?: TemplateRef<unknown>;
  };

  //#region Host Binding CSS Variables
  @HostBinding('style.--itemSize') itemSize = 50;
  @HostBinding('style.--itemSizePx') get itemSizePx() {
    return `${this.itemSize}px`;
  }

  @HostBinding('style.--tableHeight') get tableHeight() {
    return this.dataSource.filteredData.length * this.itemSize;
  }
  @HostBinding('style.--tableHeightPx') get tableHeightPx() {
    return `${this.tableHeight}px`;
  }
  //#endregion

  @ViewChild(MatTable, { static: true, read: ElementRef })
  matTable!: ElementRef<HTMLDivElement>;

  @ViewChild(MatSort, { static: true }) sort?: MatSort;

  get columns(): ITableColumn<T>[] {
    return this.controller?.().options.columns || [];
  }
  // columns = [
  //   {
  //     columnDef: 'position',
  //     header: 'No.',
  //     cell: (element: PeriodicElement) => `${element.position}`,
  //   },
  //   {
  //     columnDef: 'name',
  //     header: 'Name',
  //     cell: (element: PeriodicElement) => `${element.name}`,
  //   },
  //   {
  //     columnDef: 'weight',
  //     header: 'Weight',
  //     cell: (element: PeriodicElement) => `${element.weight}`,
  //   },
  //   {
  //     columnDef: 'symbol',
  //     header: 'Symbol',
  //     cell: (element: PeriodicElement) => `${element.symbol}`,
  //   },
  // ];
  get displayedColumns() {
    return this.columns.map((c) => c.propertyPath);
  }

  dataSource: MatTableDataSource<T> = new MatTableDataSource<T>([]);

  sortedData: T[] = [];
  readonly visibleRows: WritableSignal<T[]> = signal([]);

  public sortedDataIndexOf(row: T) {
    return this.sortedData.indexOf(row);
  }

  public matColumnDefOf(column: ITableColumn<T>) {
    return String(column.propertyPath);
  }

  constructor(private readonly injector: Injector) {}

  readonly variableRowHeightController = new VariableRowHeightController(this);

  ngOnInit(): void {
    effect(
      () => {
        this.dataSource.data = this.controller!().options.data();
        console.warn('SET DATA NOW');
        this.recalculateVisibleRows();
      },
      { injector: this.injector, allowSignalWrites: true }
    );

    this.dataSource.connect().subscribe((renderedData) => {
      this.sortedData = renderedData;

      // this.updateVisibleRows();
      this.recalculateVisibleRows();

      this.variableRowHeightController.calculateRowHeights();
    });

    console.warn('Table2Component.ngOnInit()', this.matTable);
    this.recalculateVisibleRows();
  }

  ngAfterViewInit() {
    this.dataSource.filterPredicate =
      this.options?.filterPredicate ?? (() => true);

    this.dataSource.sort = this.sort!;

    this.sort!.sortChange.subscribe((event) => {
      this.onSortChange(event);
    });
  }

  get options() {
    return this.controller?.().options;
  }

  trackBy(index: number, row: T) {
    return this.options?.trackBy?.(row) ?? index;
  }

  onScroll(event: Event) {
    this.recalculateVisibleRows();
  }

  private recalculateVisibleRows() {
    // Calculate the visible rows based on the scroll position and the item size
    const firstVisibleRowIndex = Math.floor(
      this.matTable.nativeElement.scrollTop / this.itemSize
    );
    const lastVisibleRowIndex = Math.ceil(
      (this.matTable.nativeElement.scrollTop +
        this.matTable.nativeElement.clientHeight) /
        this.itemSize
    );

    // Set all rows to invisible
    // for (let i = 0; i < this.dataSource.data.length; i++) {
    //   this.dataSource.data[i].visible = false;
    // }
    const visibleRows: T[] = [];

    // Set the visible rows to visible
    for (let i = firstVisibleRowIndex; i < lastVisibleRowIndex; i++) {
      const x = this.sortedData[i];
      if (x) {
        visibleRows.push(x);
        // x.visible = true;
      }
    }

    // Set the last row to be visible in order to make the table scrollable
    if (this.sortedData.length > 0) {
      // this.sortedData.at(-1)!.visible = true;
      visibleRows.push(this.sortedData.at(-1)!);
    }

    this.visibleRows.set(visibleRows);

    console.warn('VISIBLE ROWS', this.visibleRows);
    // this.updateVisibleRows();
  }
  // updateVisibleRows() {
  //   this.visibleRows = this.sortedData.filter((row) => row.visible);
  // }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    this.recalculateVisibleRows();

    console.warn('Table2Component.applyFilter()', this.dataSource);
  }

  onSortChange(event: Sort) {
    this.recalculateVisibleRows();
  }
}

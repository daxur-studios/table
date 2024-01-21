import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostBinding,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  MatTable,
  MatTableDataSource,
  MatTableModule,
} from '@angular/material/table';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';

export interface PeriodicElement {
  id: string;
  name: string;
  position: number;
  weight: number;
  symbol: string;
  visible?: boolean;
}

const ELEMENT_DATA: PeriodicElement[] = [];

const abc = 'abcdefghijklmnopqrstuvwxyz';
// 440000
for (let i = 0; i < 100000; i++) {
  ELEMENT_DATA.push({
    id: 'id' + i.toString(),
    position: i,
    name: `Element ${i}` + abc[i % abc.length] + abc[(i + i) % abc.length],
    weight: i * 100,
    symbol: 'X' + i,
    visible: false,
  });
}

ELEMENT_DATA.at(0)!.visible = true;

ELEMENT_DATA.at(500)!.visible = true;
ELEMENT_DATA.at(-1)!.visible = true;

@Component({
  selector: 'lib-table2',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatSortModule],
  templateUrl: './table2.component.html',
  styleUrl: './table2.component.scss',
})
export class Table2Component implements OnInit, AfterViewInit {
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

  @ViewChild(MatTable, { static: true, read: ElementRef })
  matTable!: ElementRef<HTMLDivElement>;

  @ViewChild(MatSort, { static: true }) sort?: MatSort;

  readonly variableRowHeight = new Map<number, number>();

  columns = [
    {
      columnDef: 'position',
      header: 'No.',
      cell: (element: PeriodicElement) => `${element.position}`,
    },
    {
      columnDef: 'name',
      header: 'Name',
      cell: (element: PeriodicElement) => `${element.name}`,
    },
    {
      columnDef: 'weight',
      header: 'Weight',
      cell: (element: PeriodicElement) => `${element.weight}`,
    },
    {
      columnDef: 'symbol',
      header: 'Symbol',
      cell: (element: PeriodicElement) => `${element.symbol}`,
    },
  ];
  dataSource: MatTableDataSource<PeriodicElement> = new MatTableDataSource(
    ELEMENT_DATA
  );

  get visibleRows() {
    // return this.dataSource
    //   .sortData(this.dataSource.filteredData, this.dataSource.sort)
    //   .filter((row) => row.visible);
    return this.renderedData.filter((row) => row.visible);

    return this.dataSource.filteredData.filter((row) => row.visible);
  }
  displayedColumns = this.columns.map((c) => c.columnDef);

  public indexOf(row: PeriodicElement) {
    return this.renderedData.indexOf(row);
  }

  constructor() {}

  renderedData: PeriodicElement[] = [];

  ngOnInit(): void {
    this.dataSource
      .connect()
      .subscribe(
        (d) => (this.renderedData = d) && console.debug(this.renderedData)
      );

    console.warn('Table2Component.ngOnInit()', this.matTable);
    this.recalculateVisibleRows();
  }
  ngAfterViewInit() {
    this.dataSource.filterPredicate = (data, filter) => {
      if (!filter) {
        return true;
      }

      return [
        data?.name?.toLowerCase().includes(filter),
        data?.symbol?.toLowerCase().includes(filter),
      ].some((x) => x);
    };

    this.dataSource.sort = this.sort!;
  }

  trackBy(index: number, row: PeriodicElement) {
    return row.id;
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
    for (let i = 0; i < this.dataSource.data.length; i++) {
      this.dataSource.data[i].visible = false;
    }

    // Set the visible rows to visible
    for (let i = firstVisibleRowIndex; i < lastVisibleRowIndex; i++) {
      const x = this.renderedData[i];
      if (x) {
        x.visible = true;
      }
    }

    // Set the last row to be visible in order to make the table scrollable
    if (this.renderedData.length > 0) {
      this.renderedData.at(-1)!.visible = true;
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    this.recalculateVisibleRows();

    console.warn('Table2Component.applyFilter()', this.dataSource);
  }

  private currentSort: Sort | null = null;
  onSortChange(event: Sort) {
    console.debug('Table2Component.onSortChange()', event);
    this.currentSort = event;
    setTimeout(() => {
      this.recalculateVisibleRows();
    }, 0);
    // this.dataSource.sortData = (
    //   filteredData: PeriodicElement[],
    //   sort: MatSort
    // ) => {
    //   return filteredData.sort((a: PeriodicElement, b: PeriodicElement) => {
    //     const isAsc = sort.direction === 'asc';

    //     switch (sort.active as keyof PeriodicElement) {
    //       case 'name':
    //         return a.name.localeCompare(b.name) * (isAsc ? 1 : -1);
    //       case 'position':
    //         return isAsc ? a.position - b.position : b.position - a.position;
    //       case 'weight':
    //         return isAsc ? a.weight - b.weight : b.weight - a.weight;
    //       case 'symbol':
    //         return isAsc
    //           ? a.symbol.localeCompare(b.symbol)
    //           : b.symbol.localeCompare(a.symbol);
    //       default:
    //         return 0;
    //     }
    //   });
    // };
  }
}

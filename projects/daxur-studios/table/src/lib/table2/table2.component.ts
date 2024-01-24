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
import { FilterComponent } from '../filter/filter.component';
import { TableService } from '../table.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'lib-table2',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    FilterComponent,
    MatIconModule,
    MatButtonModule,
  ],
  providers: [TableService],
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
  @HostBinding('style.--itemSize') get itemSize() {
    return this.tableService.itemSize;
  }
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
  matTableRef!: ElementRef<HTMLDivElement>;

  @ViewChild(MatSort, { static: true }) sort?: MatSort;

  get columns(): ITableColumn<T>[] {
    return this.controller?.().options.columns || [];
  }

  get displayedColumns() {
    return this.columns.map((c) => c.propertyPath);
  }

  dataSource: MatTableDataSource<T> = this.tableService.dataSource;

  sortedData: WritableSignal<T[]> = this.tableService.sortedData;
  readonly visibleRows: WritableSignal<T[]> = this.tableService.visibleRows;

  public sortedDataIndexOf(row: T) {
    return this.sortedData().indexOf(row);
  }

  public matColumnDefOf(column: ITableColumn<T>) {
    return String(column.propertyPath);
  }

  constructor(
    private readonly injector: Injector,
    readonly tableService: TableService<T>
  ) {}

  readonly variableRowHeightController = new VariableRowHeightController(this);

  private recalculateVisibleRows() {
    this.tableService.recalculateVisibleRows();
  }

  ngOnInit(): void {
    this.tableService.matTableRef = this.matTableRef;
    effect(
      () => {
        this.dataSource.data = this.controller!().options.data();
        console.warn('SET DATA NOW');
        this.recalculateVisibleRows();
      },
      { injector: this.injector, allowSignalWrites: true }
    );

    this.dataSource.connect().subscribe((renderedData) => {
      this.sortedData.set(renderedData);

      // this.updateVisibleRows();
      this.recalculateVisibleRows();

      this.variableRowHeightController.calculateRowHeights();
    });

    console.warn('Table2Component.ngOnInit()', this.matTableRef);
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

  // updateVisibleRows() {
  //   this.visibleRows = this.sortedData.filter((row) => row.visible);
  // }

  onSortChange(event: Sort) {
    this.recalculateVisibleRows();
  }

  addFilter(column: ITableColumn<T>, event?: MouseEvent) {
    this.tableService.addFilter(column, event);
  }
}

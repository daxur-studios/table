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
  VariableRowHeightController,
} from '../models';
import { FormGroup } from '@angular/forms';
import { FilterComponent } from '../filter/filter.component';
import { TableService } from '../services/table.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FiltersService } from '../services';

@Component({
  selector: 'lib-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    FilterComponent,
    MatIconModule,
    MatButtonModule,
  ],
  providers: [TableService, FiltersService],
  templateUrl: './table2.component.html',
  styleUrl: './table2.component.scss',
})
export class TableComponent<T extends Object> implements OnInit, AfterViewInit {
  @Input({ required: true }) options!: WritableSignal<ITableOptions<T>>;

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
    return this.options().columns || [];
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
    readonly tableService: TableService<T>,
    readonly filtersService: FiltersService<T>
  ) {
    this.tableService.tableComponent = this;
  }

  readonly variableRowHeightController = new VariableRowHeightController(this);

  private recalculateVisibleRows() {
    this.tableService.recalculateVisibleRows();
  }

  ngOnInit(): void {
    this.tableService.matTableRef = this.matTableRef;
    this.filtersService.options = this.options;

    effect(
      () => {
        this.dataSource.data = this.options().data();
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
    const options = this.options();
    if (options.filterPredicate) {
      this.dataSource.filterPredicate = options.filterPredicate;
    } else {
      this.dataSource.filterPredicate =
        this.filtersService.filterPredicateAdvanced;
    }

    this.dataSource.sort = this.sort!;

    this.sort!.sortChange.subscribe((event) => {
      this.onSortChange(event);
    });
  }

  trackBy(index: number, row: T) {
    return this.options?.()?.trackBy?.(row) ?? index;
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
    this.filtersService.addFilter(column, event);
  }
}

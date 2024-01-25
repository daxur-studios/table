import {
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { TableService } from '../services/table.service';
import { Subject, take, takeUntil } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { AND_Filter, OR_Filters } from '../models';
import { FiltersService } from '../services';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-filter',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatIconModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatTooltipModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatAutocompleteModule,
  ],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.scss',
})
export class FilterComponent<T extends Object> implements OnInit, OnDestroy {
  @ViewChild('filterInputRef', { static: true })
  filterInputRef?: ElementRef<HTMLInputElement>;
  @ViewChild('autosize') autosize?: CdkTextareaAutosize;

  get options() {
    return this.filtersService.options?.();
  }
  readonly formControl = this.filtersService.formControl;
  readonly parsedFilters = this.filtersService.parsedFilters;

  constructor(
    private _ngZone: NgZone,
    readonly tableService: TableService<T>,
    readonly filtersService: FiltersService<T>
  ) {}

  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable
      .pipe(take(1))
      .subscribe(() => this.autosize?.resizeToFitContent(true));
  }

  readonly onDestroy = new Subject<void>();

  ngOnInit(): void {
    this.filtersService.filterInputRef = this.filterInputRef;
    this.formControl.valueChanges
      .pipe(takeUntil(this.onDestroy))
      .subscribe((value) => {
        this.filtersService.parseFilterValue(value);
        this.tableService.applyFilterToDataSource(value);
      });
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  //#region x
  OR_FilterCtrl = new FormControl('');
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    const parsedFilters = this.parsedFilters();

    // Add our fruit
    if (value) {
      parsedFilters.push([]);
    }

    this.parsedFilters.set(parsedFilters);

    // Clear the input value
    event.chipInput!.clear();

    this.OR_FilterCtrl.setValue(null);
  }

  remove(fruit: OR_Filters): void {
    const parsedFilters = this.parsedFilters();

    const index = parsedFilters.indexOf(fruit);

    if (index >= 0) {
      parsedFilters.splice(index, 1);

      this.parsedFilters.set(parsedFilters);
    }
  }
  selected(event: any): void {}

  addORFilter() {
    this.parsedFilters.update((x) => {
      x.push([]);
      return x;
    });
  }
  addANDFilter(OR_Filter: OR_Filters) {
    OR_Filter.push({ label: '', values: [] });
  }
  addORValue(AND_Filter: AND_Filter) {
    AND_Filter.values.push('');
  }
  //#endregion
}

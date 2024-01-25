import { ElementRef, Injectable, WritableSignal, signal } from '@angular/core';
import { AND_Filter, ITableColumn, ITableOptions, OR_Filters } from '../models';
import { FormControl } from '@angular/forms';

/** New Instance Per Table Component */
@Injectable()
export class FiltersService<T extends Object> {
  filterInputRef?: ElementRef<HTMLInputElement>;
  options?: WritableSignal<ITableOptions<T>>;

  readonly formControl = new FormControl<string | null>(null);
  readonly parsedFilters: WritableSignal<OR_Filters[]> = signal([]);

  constructor() {
    this.formControl.valueChanges.subscribe((value) => {
      this.parsedFilters.set(this.parseFilterValue(value));
      console.debug('PARSED FILTERS', this.parsedFilters());
    });
  }

  /**
   * The filter value can be just a string or a string with the following format:
   * ### Examples:
* "No: 0 and Active: true" --> ```[[{label: "No", values: ["0"]}, {label: "Active", values: ["true"]}]];```
*
* "Name: 0, 2 and Active: true, false"  --> ```[[{label: "Name", values: ["0", "2"]}, {label: "Active", values: ["true", "false"]}]];```
*
"Name: Bruno Kertesz, James Jones and Active: true \nName: Jack White-hill and Active: false"
 --> ```[[{label: "Name", values: ["Bruno Kertesz", "James Jones"]}, {label: "Active", values: ["true"]}], [{label: "Name", values: ["Jack White-hill"]}, {label: "Active", values: ["false"]}]];```
* 
*
* "Bruno Kertesz" --> ```[[{label: "", values: ["Bruno Kertesz"]}]];```
 */
  public parseFilterValue(value: string | null): OR_Filters[] {
    if (!value) {
      return [];
    }
    value = value.trim();
    //const options =

    const OR_Filters: OR_Filters[] = [];

    const OR_FilterStrings = value.split('\n'); //.filter((x) => !!x.trim());

    OR_FilterStrings.forEach((orFilterString) => {
      OR_Filters.push(parse_AND_FilterString(orFilterString));
    });

    function parse_AND_FilterString(orFilterString: string) {
      const AND_Filters: AND_Filter[] = [];

      const AND_FilterStrings = orFilterString.split('and');

      AND_FilterStrings.forEach((andFilterString) => {
        AND_Filters.push(parseColumnFilterString(andFilterString));
      });

      function parseColumnFilterString(columnFilerString: string): AND_Filter {
        const AND_Filter: AND_Filter = {
          label: '',
          values: [],
        };

        const columnLabelAndValues = columnFilerString.split(':');
        AND_Filter.label = (columnLabelAndValues[0] || '').trim();

        const values = columnLabelAndValues[1]?.split(',') || [];
        values.forEach((value) => {
          if (value.trim()) AND_Filter.values.push(value.trim());
        });

        return AND_Filter;
      }

      return AND_Filters;
    }

    return OR_Filters;
  }

  public parsedFiltersToFilterString(parsedFilters: OR_Filters[]): string {
    const filterString = parsedFilters
      .map((orFilter) => {
        return orFilter
          .map((andFilter) => {
            return `${andFilter.label}: ${andFilter.values.join(', ')}`;
          })
          .join(' and ');
      })
      .join('\n');

    return filterString;
  }

  /** This is run eg 1000 times on a table with 1000 rows */
  public filterPredicateSimple = (row: T, filter: string): boolean => {
    const options = this.options?.();

    if (!options) {
      return true;
    }

    filter = filter || '';
    filter = String(filter).trim().toLowerCase();

    const results: boolean[] = [];

    const columns = options.columns;
    columns.forEach((column) => {
      results.push(FiltersService.filterColumn(filter, column, row));
    });

    return results.some((x) => x);
  };

  /** This is run eg 1000 times on a table with 1000 rows */
  public filterPredicateAdvanced = (row: T, filter: string): boolean => {
    const options = this.options?.();

    if (!options) {
      return true;
    }

    filter = filter || '';
    filter = String(filter).trim(); //.toLowerCase();

    const OR_results: boolean[] = [];

    const OR_Filters = this.parseFilterValue(filter);
    OR_Filters.forEach((orFilter) => {
      const AND_Results: boolean[] = [];

      orFilter.forEach((andFilter) => {
        // Each AND filter represents a column

        const column = options.columns.find(
          (x) => x.columnLabel == andFilter.label
        );

        if (!column) {
          return;
        }

        const columnOrResults: boolean[] = [];

        andFilter.values.forEach((value) => {
          columnOrResults.push(FiltersService.filterColumn(value, column, row));
        });

        AND_Results.push(columnOrResults.some((x) => x));
      });

      OR_results.push(AND_Results.every((x) => x));
    });

    return OR_results.some((x) => x);
  };
  static filterColumn<T extends Object>(
    filter: string,
    column: ITableColumn<T>,
    row: T
  ): boolean {
    //#region Custom Filter
    if (column.filter) {
      return column.filter(row);
    }
    //#endregion

    console.debug('filterColumn', { filter, column, row });

    //#region Default Filter
    const cellValue = String(column.cell(row)).trim().toLowerCase();
    return cellValue.includes(String(filter).trim().toLowerCase());
    //#endregion
  }

  addFilter(column: ITableColumn<T>, event?: Event) {
    const parsedFilters = this.parseFilterValue(this.formControl.value);

    if (parsedFilters.length === 0) {
      parsedFilters.push([]);
    }
    const lastORFilter = parsedFilters.at(-1)!;

    const lastANDFilter = lastORFilter.at(-1);
    if (lastANDFilter?.values.length === 0) {
      // If the last AND filter is empty, replace it
      lastANDFilter.label = column.columnLabel;
      lastANDFilter.values = [];
    } else {
      // Otherwise add a new empty AND filter
      lastORFilter.push({
        label: column.columnLabel,
        values: [],
      });
    }

    //currentParsedFilters[currentParsedFilters.length - 1] = currentORFilter;

    const newFilterValue = this.parsedFiltersToFilterString(parsedFilters);

    this.formControl.setValue(newFilterValue);
    if (event) {
      event.stopPropagation();
    }
    if (this.filterInputRef) {
      this.filterInputRef.nativeElement.focus();
    }
  }
}

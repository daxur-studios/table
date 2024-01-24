import type { Table2Component } from '../table2/table2.component';

export class VariableRowHeightController<T extends Object> {
  public lastRowOffset = 0;
  public meta: Map<T, { height: number }> = new Map();

  constructor(readonly table: Table2Component<T>) {}

  public calculateRowHeights() {
    this.lastRowOffset = this.table.sortedData().reduce((acc, row) => {
      return acc + (this.table.options?.getRowHeight?.(row) ?? 0);
      // row.rowHeight = acc;
      // return acc + row.rowHeight;
    }, 0);
  }
}

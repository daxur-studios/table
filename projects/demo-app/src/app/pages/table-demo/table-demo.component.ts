import { Component, WritableSignal, signal } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TableComponent, ITableOptions } from '@daxur-studios/table';

@Component({
  selector: 'app-table-demo',
  standalone: true,
  imports: [TableComponent],
  templateUrl: './table-demo.component.html',
  styleUrl: './table-demo.component.scss',
})
export class TableDemoComponent {
  readonly data: WritableSignal<IDemoTableData[]> = signal([]);

  show: 'basic' | 'advanced' = 'basic';

  //#region Table Controllers
  readonly options = signal<ITableOptions<IDemoTableData>>({
    data: this.data,
    trackBy: (row) => row.id,
    // filterPredicate: (row, filter) => {
    //   this.options().columns;
    //   const x = (row: IDemoTableData, filter: string) => {
    //     return row.name.includes(filter);
    //   };
    //   return x(row, filter);
    // },
    columns: [
      {
        propertyPath: 'name',
        columnLabel: 'Name',
        cell: (row) => row.name,
      },
      {
        propertyPath: 'description',
        columnLabel: 'Description',
        cell: (row) => row.description,
      },
      {
        propertyPath: 'isActive',
        columnLabel: 'Active',
        cell: (row) => row.isActive,
      },
      {
        propertyPath: 'date',
        columnLabel: 'Date',
        cell: (row) => row.date.toISOString(),
      },
      {
        propertyPath: 'stringArray',
        columnLabel: 'String Array',
        cell: (row) => row.stringArray.join(', '),
      },
      {
        propertyPath: 'numberArray',
        columnLabel: 'Number Array',
        cell: (row) => row.numberArray.join(', '),
      },
      {
        propertyPath: 'objectArray',
        columnLabel: 'Object Array',
        cell: (row) => row.objectArray.map((o) => o.name).join(', '),
      },
    ],
  });

  readonly advancedOptions = signal<ITableOptions<IDemoTableData>>({
    columns: [
      {
        propertyPath: 'name',
        columnLabel: 'Name',
        cell: (row) => row.name,
      },
      {
        propertyPath: 'numberArray',
        columnLabel: 'Number Array',
        cell: (row) => row.numberArray.join('\n'),
      },
    ],
    data: this.data,

    trackBy: (row) => row.id,
    filterPredicate: (row, filter) => {
      return row.id.toString().includes(filter);
    },
    getRowHeight: (row) => {
      return row.numberArray.length * 50 || 50;
    },
  });
  //#endregion

  constructor() {
    // Add 1 Million rows of data
    this.initBasicDemo();
  }

  initBasicDemo() {
    this.show = 'basic';
    const data: IDemoTableData[] = [];
    for (let i = 0; i < 1000; i++) {
      data.push({
        id: i,
        name: `Name ${i}`,
        description: `Description ${i}`,
        isActive: randomBoolean(i),
        date: randomDate(i),
        stringArray: [randomString(i), randomString(i), randomString(i)],
        numberArray: Array.from({ length: randomNumber(i) }, () =>
          randomNumber(i)
        ),
        objectArray: [
          { id: i, name: randomString(i) },
          { id: randomNumber(i), name: randomString(i) },
          { id: randomNumber(i), name: randomString(i) },
        ],
        object: { id: randomNumber(i), name: randomString(i - 1) },
        nestedObject: {
          id: randomNumber(i + 2),
          name: randomString(i + 1),
          useThis: { id: randomNumber(i + 4), name: randomString(i + 3) },
        },
      });
    }

    this.data.set(data);
  }
  initAdvancedDemo() {
    this.show = 'advanced';
    const data: IDemoTableData[] = [];
    for (let i = 0; i < 10000; i++) {
      data.push({
        id: i,
        name: `Name ${i}`,
        description: `Description ${i}`,
        isActive: randomBoolean(i),
        date: randomDate(i),
        stringArray: [randomString(i), randomString(i), randomString(i)],
        numberArray: Array.from({ length: randomNumber(i) }, () =>
          randomNumber(i)
        ),
        objectArray: [
          { id: i, name: randomString(i) },
          { id: randomNumber(i), name: randomString(i) },
          { id: randomNumber(i), name: randomString(i) },
        ],
        object: { id: randomNumber(i), name: randomString(i - 1) },
        nestedObject: {
          id: randomNumber(i + 2),
          name: randomString(i + 1),
          useThis: { id: randomNumber(i + 4), name: randomString(i + 3) },
        },
      });
    }

    this.data.set(data);
  }
}

interface IDemoTableData {
  //#region Simple Types
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  //#endregion

  date: Date;

  //#region Arrays
  stringArray: string[];
  numberArray: number[];
  objectArray: { id: number; name: string }[];
  //#endregion

  //#region Objects
  object: { id: number; name: string };
  nestedObject: {
    id: number;
    name: string;
    useThis: { id: number; name: string };
  };
  //#endregion
}

// interface IDemoTableFilterControls {
//   name: FormControl<string | null>;
// }
// type IDemoTableFilterFormGroup = FormGroup<IDemoTableFilterControls>;

//#region Helper Functions
function randomNumber(i: number) {
  return Math.floor(Math.random() * 10);
}

function randomDate(i: number) {
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + randomNumber(i));
  return futureDate;
}

function randomString(i: number) {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < 10; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
function randomBoolean(i: number) {
  return i % 2 === 0;
}
//#endregion

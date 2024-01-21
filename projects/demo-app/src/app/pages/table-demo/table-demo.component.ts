import { Component, WritableSignal, signal } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {
  Table2Component,
  TableComponent,
  TableController,
} from '@daxur-studios/table';

@Component({
  selector: 'app-table-demo',
  standalone: true,
  imports: [TableComponent, Table2Component],
  templateUrl: './table-demo.component.html',
  styleUrl: './table-demo.component.scss',
})
export class TableDemoComponent {
  readonly data: WritableSignal<IDemoTableData[]> = signal([]);
  readonly filterFormGroup = new FormGroup<IDemoTableFilterControls>({
    name: new FormControl(null),
  });

  readonly controller = signal(
    new TableController<IDemoTableData, IDemoTableFilterFormGroup>({
      data: this.data,
      filterFormGroup: this.filterFormGroup,
      columns: signal([
        {
          propertyPath: 'name',
          columnLabel: 'Name',
        },
        {
          propertyPath: 'description',
          columnLabel: 'Description',
        },
        {
          propertyPath: 'isActive',
          columnLabel: 'Active',
        },
        {
          propertyPath: 'date',
          columnLabel: 'Date',
        },
        {
          propertyPath: 'stringArray',
          columnLabel: 'String Array',
        },
        {
          propertyPath: 'numberArray',
          columnLabel: 'Number Array',
        },
        {
          propertyPath: 'objectArray',
          columnLabel: 'Object Array',
        },
      ]),
    })
  );

  constructor() {
    // Add 1 Million rows of data

    //#region Helper Functions
    function randomNumber(i: number) {
      return Math.floor(Math.random() * (10 + i));
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
        result += characters.charAt(
          Math.floor(Math.random() * charactersLength)
        );
      }
      return result;
    }
    function randomBoolean(i: number) {
      return i % 2 === 0;
    }
    //#endregion

    const data: IDemoTableData[] = [];
    for (let i = 0; i < 1; i++) {
      data.push({
        id: i,
        name: `Name ${i}`,
        description: `Description ${i}`,
        isActive: randomBoolean(i),
        date: randomDate(i),
        stringArray: [randomString(i), randomString(i), randomString(i)],
        numberArray: [randomNumber(i), randomNumber(i), randomNumber(i)],
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

interface IDemoTableFilterControls {
  name: FormControl<string | null>;
}
type IDemoTableFilterFormGroup = FormGroup<IDemoTableFilterControls>;

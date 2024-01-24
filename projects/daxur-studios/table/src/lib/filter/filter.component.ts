import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { TableService } from '../table.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'lib-filter',
  standalone: true,
  imports: [
    MatInputModule,
    MatIconModule,
    MatFormFieldModule,
    ReactiveFormsModule,
  ],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.scss',
})
export class FilterComponent<T extends Object> implements OnInit, OnDestroy {
  @ViewChild('filterInputRef', { static: true })
  filterInputRef?: ElementRef<HTMLInputElement>;

  readonly filterControl: FormControl<string | null> =
    this.tableService.filterControl;

  constructor(readonly tableService: TableService<T>) {}
  readonly onDestroy = new Subject<void>();

  ngOnInit(): void {
    this.tableService.filterInputRef = this.filterInputRef;
    this.filterControl.valueChanges
      .pipe(takeUntil(this.onDestroy))
      .subscribe((value) => {
        this.tableService.applyFilter(value);
      });
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }
}

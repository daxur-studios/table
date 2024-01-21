import {
  Component,
  ElementRef,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import {
  CdkVirtualScrollViewport,
  FixedSizeVirtualScrollStrategy,
  ScrollingModule,
  VIRTUAL_SCROLL_STRATEGY,
} from '@angular/cdk/scrolling';
import { TableController } from '../models';
import { FormGroup } from '@angular/forms';

export class CustomVirtualScrollStrategy extends FixedSizeVirtualScrollStrategy {
  constructor() {
    super(50, 250, 500);
  }
}

@Component({
  selector: 'lib-table',
  standalone: true,
  providers: [
    { provide: VIRTUAL_SCROLL_STRATEGY, useClass: CustomVirtualScrollStrategy },
  ],
  imports: [ScrollingModule],
  templateUrl: './table.html',
  styleUrl: './table.scss',
})
export class TableComponent<T, G extends FormGroup>
  implements OnInit, OnDestroy
{
  @HostBinding('style.--itemSize') itemSize = 50;
  @HostBinding('style.--itemSizePx') get itemSizePx() {
    return `${this.itemSize}px`;
  }
  @HostBinding('style.--baseCellWidth') get baseCellWidth() {
    return `${100 / this.controller().options.columns().length}%`;
  }

  @ViewChild('resizeWrapper', { static: true })
  resizeWrapper?: ElementRef<HTMLDivElement>;
  @ViewChild(CdkVirtualScrollViewport, { static: true })
  viewport?: CdkVirtualScrollViewport;

  @Input({ required: true }) controller!: WritableSignal<TableController<T, G>>;

  readonly resizeObserver = new ResizeObserver((entries) => {
    this.viewport?.checkViewportSize();
  });

  ngOnDestroy(): void {
    this.resizeObserver.disconnect();
  }
  ngOnInit(): void {
    const div = this.resizeWrapper?.nativeElement!;
    this.resizeObserver.observe(div);
  }
}

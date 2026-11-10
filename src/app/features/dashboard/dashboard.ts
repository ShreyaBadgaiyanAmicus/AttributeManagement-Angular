
import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  DestroyRef
} from '@angular/core';

import { AsyncPipe, DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, scan, startWith, tap } from 'rxjs';

import { StoreService } from '../../core/services/store';
import { AttributeService } from '../attributes/services/attribute';

import {
  ActivityLogService,
  ActivityLog
} from '../../core/services/activity-log';

import {
  CollapsibleSection
} from '../../shared/components/collapsible-section/collapsible-section';

interface BusinessUnitChartItem {
  name: string;
  count: number;
  x: number;
  y: number;
  width: number;
  height: number;
  labelX: number;
}

interface ChartTick {
  value: number;
  y: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    CollapsibleSection
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {

  private store = inject(StoreService);
  private attributeService = inject(AttributeService);
  private activityLog = inject(ActivityLogService);
  private destroyRef = inject(DestroyRef);

  // Summary Cards
  summary$ = this.store.attributes$.pipe(
    map(attributes => {

      const now = new Date();

      const active = attributes.filter(
        attribute => attribute.isActive
      ).length;

      const inactive = attributes.filter(
        attribute => !attribute.isActive
      ).length;

      const createdThisMonth = attributes.filter(attribute => {

        const createdDate = new Date(attribute.createdOn);

        return (
          createdDate.getMonth() === now.getMonth() &&
          createdDate.getFullYear() === now.getFullYear()
        );

      }).length;

      return {
        total: attributes.length,
        active,
        inactive,
        createdThisMonth
      };
    })
  );

  // Business Unit Bar Chart
  chart$ = this.store.attributes$.pipe(
    map(attributes => {

      const businessUnitCounts = new Map<string, number>();

      attributes.forEach(attribute => {

        const name = attribute.businessUnitName || 'Unassigned';

        businessUnitCounts.set(
          name,
          (businessUnitCounts.get(name) ?? 0) + 1
        );

      });

      const entries = Array.from(
        businessUnitCounts.entries()
      );

      const maxCount = Math.max(
        ...entries.map(([, count]) => count),
        0
      );

      const maxValue = Math.max(
        4,
        Math.ceil(maxCount / 4) * 4
      );

      const chartHeight = 200;
      const chartBottom = 240;
      const chartLeft = 65;
      const chartWidth = 600;

      const slotWidth = chartWidth / Math.max(entries.length, 1);

      const items: BusinessUnitChartItem[] = entries.map(
        ([name, count], index) => {

          const width = Math.min(52, slotWidth * 0.55);
          const height = (count / maxValue) * chartHeight;

          const x = chartLeft +
            index * slotWidth +
            (slotWidth - width) / 2;

          const y = chartBottom - height;

          return {
            name,
            count,
            x,
            y,
            width,
            height,
            labelX: x + width / 2
          };

        }
      );

      const ticks: ChartTick[] = Array.from(
        { length: 5 },
        (_, index) => {

          const value = (maxValue / 4) * index;

          return {
            value,
            y: chartBottom -
              (value / maxValue) * chartHeight
          };

        }
      );

      return {
        items,
        ticks
      };

    })
  );

  // Recent Activity - Latest 10 actions
  activities$ = this.activityLog.activity$.pipe(

    tap(activity => {
      console.log('DASHBOARD RECEIVED:', activity);
    }),

    scan(
      (activities: ActivityLog[], activity) => [
        activity,
        ...activities
      ].slice(0, 10),
      [] as ActivityLog[]
    ),

    startWith([] as ActivityLog[])
  );

  // Fetch attributes when Dashboard opens
  ngOnInit(): void {

    this.attributeService.getAttributes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();

  }
}

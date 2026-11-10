
import {
  Component,
  inject,
  ChangeDetectionStrategy
} from '@angular/core';

import { AsyncPipe } from '@angular/common';
import { StoreService } from '../../../core/services/store';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [AsyncPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './loader.html',
  styleUrl: './loader.css'
})
export class LoaderComponent {
  private store = inject(StoreService);

  isLoading$ = this.store.isLoading$;
}

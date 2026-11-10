
import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject
} from '@angular/core';

import { RouterOutlet } from '@angular/router';

import { ToastComponent } from './shared/components/toast/toast';
import { LoaderComponent } from './shared/components/loader/loader';
import { IdleService } from './core/services/idle';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    ToastComponent,
    LoaderComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {

  protected readonly title = signal('AttributeManagementApp');

  private idleService = inject(IdleService);

  constructor() {
    this.idleService.startWatching();
  }
}

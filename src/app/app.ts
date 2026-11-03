
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ToastComponent } from './shared/components/toast/toast';
import { LoaderComponent } from './shared/components/loader/loader';

@Component({
  imports: [
    RouterOutlet,
    ToastComponent,
    LoaderComponent
  ],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('AttributeManagementApp');
}

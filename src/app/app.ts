import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AttributeListComponent } from './components/attribute-list/attribute-list';
import { AddAttributeComponent } from './components/add-attribute/add-attribute';

@Component({
  imports: [RouterOutlet,AttributeListComponent,AddAttributeComponent],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('AttributeManagementApp');
}

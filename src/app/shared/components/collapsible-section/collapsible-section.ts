
import {
  Component,
  ChangeDetectionStrategy
} from '@angular/core';

@Component({
  selector: 'app-collapsible-section',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './collapsible-section.html',
  styleUrl: './collapsible-section.css'
})
export class CollapsibleSection {

  isCollapsed = false;

  toggle(): void {
    this.isCollapsed = !this.isCollapsed;
  }

}

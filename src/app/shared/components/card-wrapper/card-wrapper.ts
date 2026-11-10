
import {
  Component,
  ChangeDetectionStrategy
} from '@angular/core';

@Component({
  selector: 'app-card-wrapper',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './card-wrapper.html',
  styleUrl: './card-wrapper.css'
})
export class CardWrapper {}

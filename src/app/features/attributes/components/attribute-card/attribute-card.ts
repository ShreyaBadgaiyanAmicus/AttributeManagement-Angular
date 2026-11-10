
import {
  Component,
  Input,
  OnInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ChangeDetectionStrategy
} from '@angular/core';

import { IAttribute } from '../../models/attribute.model';
import { RelativeTimePipe } from '../../../../shared/pipes/relative-time-pipe';

@Component({
  selector: 'app-attribute-card',
  standalone: true,
  imports: [RelativeTimePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './attribute-card.html',
  styleUrl: './attribute-card.css'
})
export class AttributeCardComponent implements OnInit, OnChanges, OnDestroy {

  @Input({ required: true }) attribute!: IAttribute;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['attribute']) {
      console.log(
        'ngOnChanges fired for:',
        this.attribute.attributeName
      );
    }
  }

  ngOnInit(): void {
    console.log(
      'ngOnInit fired for:',
      this.attribute.attributeName
    );
  }

  ngOnDestroy(): void {
    console.log(
      'ngOnDestroy fired for:',
      this.attribute.attributeName
    );
  }
}

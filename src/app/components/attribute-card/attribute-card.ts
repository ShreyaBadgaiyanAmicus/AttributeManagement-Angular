import {
  Component,
  Input,
  OnInit,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';

import { DatePipe } from '@angular/common';
import { IAttribute } from '../../models/attribute.model';
import { RelativeTimePipe } from '../../pipes/relative-time-pipe';

@Component({
  selector: 'app-attribute-card',
  imports: [DatePipe,RelativeTimePipe],
  templateUrl: './attribute-card.html',
  styleUrl: './attribute-card.css'
})
export class AttributeCardComponent implements OnInit, OnChanges, OnDestroy {
  @Input({ required: true }) attribute!: IAttribute;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['attribute']) {
      console.log(
        'ngOnChanges fired for:',
        this.attribute.AttributeName
      );
    }
  }

  ngOnInit(): void {
    console.log(
      'ngOnInit fired for:',
      this.attribute.AttributeName
    );
  }

  ngOnDestroy(): void {
    console.log(
      'ngOnDestroy fired for:',
      this.attribute.AttributeName
    );
  }
}

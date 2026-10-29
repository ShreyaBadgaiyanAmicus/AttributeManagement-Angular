import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  OnChanges
} from '@angular/core';

import { IAttribute } from '../models/attribute.model';

@Directive({
  selector: '[appFilterBy]',
  standalone: true
})
export class FilterBy implements OnChanges {
  @Input({ required: true }) appFilterBy!: IAttribute;
  @Input() appFilterByTerm = '';

  constructor(
    private templateRef: TemplateRef<unknown>,
    private viewContainer: ViewContainerRef
  ) {}

  ngOnChanges(): void {
    this.viewContainer.clear();

    const term = this.appFilterByTerm.trim().toLowerCase();

    const matches =
      this.appFilterBy.AttributeName.toLowerCase().includes(term) ||
      this.appFilterBy.BusinessUnitName.toLowerCase().includes(term);

    if (matches) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}

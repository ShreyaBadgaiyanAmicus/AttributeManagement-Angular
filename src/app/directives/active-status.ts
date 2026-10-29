import { Directive, ElementRef, Input, OnChanges, Renderer2 } from '@angular/core';
import { IAttribute } from '../models/attribute.model';

@Directive({
  selector: '[appActiveStatus]',
  standalone: true
})
export class ActiveStatus implements OnChanges {
  @Input({ required: true }) appActiveStatus!: IAttribute;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnChanges(): void {
    const attribute = this.appActiveStatus;
    const element = this.elementRef.nativeElement;


    this.renderer.removeClass(element, 'active-badge');
    this.renderer.removeClass(element, 'inactive-badge');

    if (attribute.IsActive) {
      this.renderer.addClass(element, 'active-badge');

      const createdDate = new Date(attribute.CreatedOn);
      this.renderer.setAttribute(
        element,
        'title',
        `Active since ${createdDate.toLocaleDateString()}`
      );
    } else {
      this.renderer.addClass(element, 'inactive-badge');

      const updatedDate = attribute.UpdatedOn
        ? new Date(attribute.UpdatedOn)
        : null;

      const dateText = updatedDate
        ? updatedDate.toLocaleDateString()
        : 'unknown date';

      this.renderer.setAttribute(
        element,
        'title',
        `Inactive since ${dateText}`
      );
    }
  }
}

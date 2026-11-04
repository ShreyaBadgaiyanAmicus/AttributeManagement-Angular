
import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  Renderer2
} from '@angular/core';

import { UserRole } from '../../core/services/store';

@Directive({
  selector: '[appRoleBadge]',
  standalone: true
})
export class RoleBadge implements OnChanges {

  @Input({ required: true }) appRoleBadge!: UserRole;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnChanges(): void {
    const element = this.elementRef.nativeElement;

    this.renderer.removeClass(element, 'admin-badge');
    this.renderer.removeClass(element, 'viewer-badge');

    if (this.appRoleBadge === 'Admin') {
      this.renderer.addClass(element, 'admin-badge');
    } else if (this.appRoleBadge === 'Viewer') {
      this.renderer.addClass(element, 'viewer-badge');
    }
  }
}

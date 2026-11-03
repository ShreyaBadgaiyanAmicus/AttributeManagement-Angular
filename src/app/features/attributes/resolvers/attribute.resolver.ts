import { Injectable, inject } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot,
  Router,
  RedirectCommand
} from '@angular/router';

import { Observable, of, catchError, map } from 'rxjs';

import { IAttribute } from '../models/attribute.model';
import { AttributeService } from '../services/attribute';
import { ToastService } from '../../../core/services/toast.service';

@Injectable({
  providedIn: 'root'
})
export class AttributeResolver
  implements Resolve<IAttribute | RedirectCommand> {

  private attributeService = inject(AttributeService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  resolve(
    route: ActivatedRouteSnapshot
  ): Observable<IAttribute | RedirectCommand> {

    const id = Number(route.paramMap.get('id'));

    return this.attributeService.getAttributeById(id).pipe(

      map(attribute => attribute),

      catchError(() => {
        this.toastService.showError(
          `Attribute with ID ${id} was not found.`
        );

        return of(
          new RedirectCommand(
            this.router.createUrlTree(['/attributes'])
          )
        );
      })

    );
  }
}
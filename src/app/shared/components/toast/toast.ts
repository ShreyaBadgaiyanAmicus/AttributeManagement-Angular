
import {
  Component,
  inject,
  ChangeDetectionStrategy
} from '@angular/core';

import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './toast.html',
  styleUrl: './toast.css'
})
export class ToastComponent {

  toastService = inject(ToastService);

}

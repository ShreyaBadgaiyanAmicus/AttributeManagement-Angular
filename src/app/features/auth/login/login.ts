
import {
  Component,
  ChangeDetectionStrategy,
  inject
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth';
import { UserRole } from '../../../core/services/store';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {

  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  username = '';
  password = '';
  role: UserRole = 'Admin';

  login(): void {
    if (this.username.trim() && this.password.trim()) {

      this.authService.login(
        this.role,
        this.username.trim()
      );

      const returnUrl =
        this.route.snapshot.queryParams['returnUrl'] || '/attributes';

      this.router.navigateByUrl(returnUrl);
    }
  }
}

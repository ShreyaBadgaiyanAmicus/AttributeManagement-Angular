import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {

  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  username = '';
  password = '';

  login(): void {
    if (this.username.trim() && this.password.trim()) {

      this.authService.login();

      const returnUrl =
        this.route.snapshot.queryParams['returnUrl'] || '/attributes';

      this.router.navigateByUrl(returnUrl);
    }
  }
}
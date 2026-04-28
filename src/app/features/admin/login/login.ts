import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth';
import { NavbarComponent } from '../../../shared/components/navbar/navbar';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  isLoading = false;

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastr.success('Login bem-sucedido!', 'Bem-vindo');
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.error(err.error?.message || 'E-mail ou senha inválidos.', 'Erro no Login');
      },
    });
  }
}

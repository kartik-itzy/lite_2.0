import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';

import { ButtonComponent } from '../components/ui/button/button.component';
import { InputComponent } from '../components/ui/input/input.component';
import { AlertComponent } from '../components/ui/alert/alert.component';
import UtilsForGlobalData from '../Utility/UtilsForGlobalData';
import * as crypto from 'crypto-js';
import { DataService } from '../data.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    AlertComponent
  ],
  template: `
    <div class="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 relative flex items-center justify-center p-6 overflow-hidden">
      <!-- Background Pattern -->
      <div class="absolute inset-0 opacity-20">
        <div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, #3b82f6 1px, transparent 0); background-size: 40px 40px;"></div>
      </div>
      
      <!-- Animated Floating Elements -->
      <div class="absolute top-20 left-20 w-32 h-32 bg-blue-500/30 rounded-full blur-xl animate-float-slow"></div>
      <div class="absolute bottom-20 right-20 w-40 h-40 bg-indigo-500/30 rounded-full blur-xl animate-float-medium"></div>
      <div class="absolute top-1/2 left-10 w-24 h-24 bg-slate-400/30 rounded-full blur-lg animate-float-fast"></div>
      <div class="absolute top-1/3 right-10 w-20 h-20 bg-blue-400/20 rounded-full blur-lg animate-float-slow"></div>
      
      <!-- Additional Animated Elements -->
      <div class="absolute top-1/4 left-1/3 w-16 h-16 bg-purple-400/20 rounded-full blur-md animate-float-medium"></div>
      <div class="absolute bottom-1/3 right-1/4 w-28 h-28 bg-green-400/20 rounded-full blur-lg animate-float-slow"></div>
      <div class="absolute top-3/4 left-1/2 w-12 h-12 bg-pink-400/30 rounded-full blur-sm animate-float-fast"></div>
      <div class="absolute top-1/6 right-1/3 w-20 h-20 bg-yellow-400/20 rounded-full blur-md animate-float-medium"></div>
      
      <!-- Moving Lines -->
      <div class="absolute top-0 left-0 w-full h-full">
        <div class="absolute top-1/4 left-0 w-1 h-32 bg-gradient-to-b from-blue-400/40 to-transparent animate-slide-down"></div>
        <div class="absolute top-3/4 right-0 w-1 h-24 bg-gradient-to-b from-indigo-400/40 to-transparent animate-slide-up"></div>
        <div class="absolute top-1/2 left-1/4 w-1 h-20 bg-gradient-to-b from-purple-400/40 to-transparent animate-slide-down-delayed"></div>
      </div>
      
      <div class="w-full max-w-lg flex flex-col items-center">
        <!-- Logo/Brand Section -->
        <div class="text-center mb-10">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl mb-6 shadow-lg">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p class="text-gray-600 text-md">Sign in to your account to continue</p>
        </div>

        <!-- Login Form Card -->
        <div class="bg-white/80 w-96 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8 pt-12 relative z-10">
          <!-- Error Alert -->
          <div *ngIf="loginError" class="mb-8">
            <app-alert
              variant="danger"
              title="Login Failed"
              [message]="loginError"
              [dismissible]="true"
              (dismissed)="clearError()"
            ></app-alert>
          </div>

          <!-- Login Form -->
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6 pt-4">
            <!-- Customer Key Field -->
            <div class="space-y-2">
              <app-input
                formControlName="email"
                type="text"
                label="Email ID"
                placeholder="Enter your email"
                icon="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                [errorText]="getFieldError('email')"
              ></app-input>
            </div>

            <!-- Username Field -->
            <!-- <div class="space-y-2">
              <app-input
                formControlName="username"
                type="text"
                label="Username"
                placeholder="Enter your username"
                icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                [errorText]="getFieldError('username')"
              ></app-input>
            </div> -->

            <!-- Password Field -->
            <div class="space-y-2">
              <app-input
                formControlName="password"
                type="password"
                label="Password"
                placeholder="Enter your password"
                icon="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                [errorText]="getFieldError('password')"
              ></app-input>
            </div>

            <!-- Remember Me & Forgot Password -->
            <div class="flex items-center justify-between pt-2">
              <label class="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  formControlName="rememberMe"
                  class="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-colors"
                >
                <span class="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Remember me</span>
              </label>
              <a href="#" class="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 hover:underline">
                Forgot password?
              </a>
            </div>

            <!-- Submit Button -->
            <div class="pt-4 flex justify-center">
              <app-button
                type="submit"
                variant="primary"
                size="lg"
                [loading]="isSubmitting"
                [disabled]="loginForm.invalid || isSubmitting"
                class="px-8 h-12  text-base font-semibold"
              >
                {{ isSubmitting ? 'Signing In...' : 'Sign In' }}
              </app-button>
            </div>
          </form>

          <!-- <div class="relative my-8">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-200"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-4 bg-white text-gray-500">Or continue with</span>
            </div>
          </div> -->

          <!-- <div class="grid grid-cols-2 gap-4">
            <button class="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span class="text-sm font-medium text-gray-700">Google</span>
            </button>
            <button class="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
              </svg>
              <span class="text-sm font-medium text-gray-700">Twitter</span>
            </button>
          </div> -->

          <div class="text-center mt-8">
            <p class="text-sm text-gray-600">
              Don't have an account? 
              <a href="#" class="font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200 hover:underline">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Floating Animation Keyframes */
    @keyframes float-slow {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      25% { transform: translateY(-20px) rotate(1deg); }
      50% { transform: translateY(-10px) rotate(0deg); }
      75% { transform: translateY(-15px) rotate(-1deg); }
    }
    
    @keyframes float-medium {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      33% { transform: translateY(-15px) rotate(2deg); }
      66% { transform: translateY(-5px) rotate(-1deg); }
    }
    
    @keyframes float-fast {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-25px) rotate(3deg); }
    }
    
    @keyframes slide-down {
      0% { transform: translateY(-100px); opacity: 0; }
      50% { opacity: 1; }
      100% { transform: translateY(100vh); opacity: 0; }
    }
    
    @keyframes slide-up {
      0% { transform: translateY(100vh); opacity: 0; }
      50% { opacity: 1; }
      100% { transform: translateY(-100px); opacity: 0; }
    }
    
    @keyframes slide-down-delayed {
      0% { transform: translateY(-100px); opacity: 0; }
      25% { opacity: 0; }
      50% { opacity: 1; }
      75% { opacity: 1; }
      100% { transform: translateY(100vh); opacity: 0; }
    }
    
    /* Animation Classes */
    .animate-float-slow {
      animation: float-slow 6s ease-in-out infinite;
    }
    
    .animate-float-medium {
      animation: float-medium 4s ease-in-out infinite;
    }
    
    .animate-float-fast {
      animation: float-fast 3s ease-in-out infinite;
    }
    
    .animate-slide-down {
      animation: slide-down 8s linear infinite;
    }
    
    .animate-slide-up {
      animation: slide-up 10s linear infinite;
    }
    
    .animate-slide-down-delayed {
      animation: slide-down-delayed 12s linear infinite;
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isSubmitting = false;
  loginError = '';
  passwordHashValue: any = '';
  jwtTokenID: any;
  JwtDecode: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    public dataServices: DataService,
  ) {
    this.loginForm = this.fb.group({

      email: ['dearhb@gmail.com', [Validators.required]],
      password: ['12345678', [Validators.required, Validators.minLength(6)]],

      // customerKey: ['kdnnew', [Validators.required]],
      // username: ['dear', [Validators.required]],
      // password: ['rh18$$BW', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // this.checkExistingAuth();
  }

  checkExistingAuth(): void {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    const username = localStorage.getItem('user_email') || sessionStorage.getItem('user_email');
    const customerKey = localStorage.getItem('customer_key') || sessionStorage.getItem('customer_key');

    if (token && username && customerKey) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;
    this.loginError = '';

    const { email, password, rememberMe } = this.loginForm.value;

    // Store Email
    UtilsForGlobalData.setLocalStorageKey('EmailID', email);

    // Hash Password
    const passwordHashValue = crypto.SHA1(password).toString();

    const payload = {
      email: email,
      password: passwordHashValue,
      user_type: 'client'
    };

    this.dataServices.getData(JSON.stringify(payload))
      .subscribe({
        next: (data: any) => {
          this.isSubmitting = false;

          if (!data?.jwt) {
            this.loginError = 'Invalid server response.';
            return;
          }

          const jwtTokenID = data.jwt;

          // Store token (respect Remember Me)
          if (rememberMe) {
            localStorage.setItem('JwtToken', jwtTokenID);
          } else {
            localStorage.setItem('JwtToken', jwtTokenID); // same key and storage
          }


          // Decode token (NEW SYNTAX)
          const decodedToken: any = jwtDecode(jwtTokenID);

          // Store tenant id
          if (decodedToken?.tenant_id) {
            UtilsForGlobalData.setLocalStorageKey(
              'Client_tenant_id',
              decodedToken.tenant_id
            );
          }

          UtilsForGlobalData.setLocalStorageKey('17', 'Client_Login');

          // Navigate
          this.router.navigate(['/dashboard']);
        },

        error: (error: any) => {
          this.isSubmitting = false;
          this.loginError =
            error?.error?.message || 'Email ID or Password is incorrect.';
        }
      });
  }

  clearError(): void {
    this.loginError = '';
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field && field.invalid && field.touched) {
      if (fieldName === 'customerKey') {
        if (field.errors?.['required']) return 'Customer key is required';
      }
      if (fieldName === 'username') {
        if (field.errors?.['required']) return 'Username is required';
      }
      if (fieldName === 'password') {
        if (field.errors?.['required']) return 'Password is required';
        if (field.errors?.['minlength']) return 'Password must be at least 6 characters';
      }
    }
    return '';
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }
} 
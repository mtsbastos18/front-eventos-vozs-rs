import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { User } from '../../shared/models/user';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/auth';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    const user = localStorage.getItem('user');
    if (user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res) => {
        // Verifica diferentes formatos comuns de retorno de API
        const token = res?.token || res?.access_token || res?.data?.token;
        const user = res?.user || res?.data?.user;

        if (token) {
          localStorage.setItem('token', token);
          if (user) {
            localStorage.setItem('user', JSON.stringify(user));
            this.currentUserSubject.next(user);
          }
        } else {
          console.warn('Login bem-sucedido, mas o token não foi encontrado na resposta da API:', res);
        }
      }),
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

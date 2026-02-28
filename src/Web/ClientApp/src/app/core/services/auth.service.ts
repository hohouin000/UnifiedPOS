import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface UserInfo {
    userName: string;
    email: string;
    isAuthenticated: boolean;
}

interface LoginResponse {
    userName: string;
    email: string;
    success: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
    private userSubject = new BehaviorSubject<UserInfo | null>(null);

    isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
    user$ = this.userSubject.asObservable();

    constructor(private http: HttpClient) {
        this.checkAuth();
    }

    checkAuth(): void {
        this.http.get<LoginResponse>('/api/Auth/me').pipe(
            catchError(() => of(null))
        ).subscribe(response => {
            if (response && response.success) {
                this.isAuthenticatedSubject.next(true);
                this.userSubject.next({
                    userName: response.userName,
                    email: response.email || '',
                    isAuthenticated: true
                });
            } else {
                this.isAuthenticatedSubject.next(false);
                this.userSubject.next(null);
            }
        });
    }

    login(request: LoginRequest): Observable<boolean> {
        return this.http.post<LoginResponse>('/api/Auth/login', request).pipe(
            map(response => {
                if (response.success) {
                    this.isAuthenticatedSubject.next(true);
                    this.userSubject.next({
                        userName: response.userName,
                        email: response.email,
                        isAuthenticated: true
                    });
                    return true;
                }
                return false;
            }),
            catchError(() => of(false))
        );
    }

    logout(): Observable<void> {
        return this.http.post<void>('/api/Auth/logout', {}).pipe(
            tap(() => {
                this.isAuthenticatedSubject.next(false);
                this.userSubject.next(null);
            }),
            catchError(() => {
                this.isAuthenticatedSubject.next(false);
                this.userSubject.next(null);
                return of(undefined);
            })
        );
    }

    get isAuthenticated(): boolean {
        return this.isAuthenticatedSubject.value;
    }
}

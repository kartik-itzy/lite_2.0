import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

export interface User {
  email: string;
  name?: string;
  role?: string;
  userId?: string;
  company?: string;
  departmentId?: string;
  accessToken?: string;
  permissions?: any;
}

export interface LoginResponse {
  data?: Array<any>;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private readonly API_URL = 'https://api.dev-valuecrm.com/';

  constructor(private http: HttpClient, private router: Router) {
    this.restoreAuthState();
  }

  // Restore logged-in state after refresh
  private restoreAuthState(): void {
    const accessToken = this.getToken();
    const email = localStorage.getItem('user_email') || sessionStorage.getItem('user_email');

    if (accessToken && email) {
      this.currentUserSubject.next({ email, accessToken });
    }
  }

  login(customerKey: string, username: string, password: string, rememberMe: boolean): Promise<boolean> {

    const headers = new HttpHeaders({
      'Content-Type': 'text/plain',
      'Accept': 'application/json'
    });

    const requestBody = {
      serviceName: "Auth3",
      methodName: "inCreds",
      parameters: [customerKey, username, password]
    };

    return new Promise(resolve => {
      this.http.post<LoginResponse>(this.API_URL, requestBody, { headers })
        .subscribe({
          next: (response) => {
            if (response.data && response.data.length > 0) {
              const userData = response.data[0];

              const user: User = {
                email: userData.email || username,
                name: userData.userName,
                role: userData.RoleId,
                userId: userData.userid,
                company: userData.company,
                departmentId: userData.departmentid,
                accessToken: userData.accesstoken,
                permissions: this.mapPermissions(userData)
              };

              const storage = rememberMe ? localStorage : sessionStorage;
              this.storeUserData(storage, user, customerKey, username);

              this.currentUserSubject.next(user);
              resolve(true);
            } else {
              resolve(false);
            }
          },
          error: () => resolve(false)
        });
    });
  }

  getUserPermissions(): any {
  const permissionsStr =
    localStorage.getItem('user_permissions') ||
    sessionStorage.getItem('user_permissions');

  return permissionsStr ? JSON.parse(permissionsStr) : null;
}


  private mapPermissions(data: any) {
    return {
      canCreateItem: data['CreateItem'] === 'Yes',
      canCreateCustomer: data['CreateCustomer'] === 'Yes',
      canCreateVendor: data['CreateVendor'] === 'Yes',
      canCreateSO: data['CreateSO'] === 'Yes',
      canEditSO: data['EditSO'] === 'Yes',
      canCreatePick: data['CreatePick'] === 'Yes',
      canEditPick: data['EditPick'] === 'Yes',
      canPostPick: data['PostPick'] === 'Yes',
      canCreatePO: data['CreatePO'] === 'Yes',
      canEditPO: data['EditPO'] === 'Yes',
      canCreateGR: data['CreateGR'] === 'Yes',
      canEditGR: data['EditGR'] === 'Yes',
      canPostGR: data['PostGR'] === 'Yes',
      canEditDeposit: data['EditDeposit'] === 'Yes',
      canEditSOafterFinal: data['EditSOafterFinal'] === 'Yes',
      canEditPOafterFinal: data['EditPOafterFinal'] === 'Yes',
      retailUser: data['RetailUser'] === 'Yes',
      warehouseUser: data['WarehouseUser'] === 'Yes',
      defaultWarehouse: data['DefaultWarehouse'],
      showSODashboard: data['ShowSODashboard'] === 'Yes',
      showPODashboard: data['ShowPODashboard'] === 'Yes',
      showWHDashboard: data['ShowWHDashboard'] === 'Yes',
      showACCDashboard: data['ShowACCDashboard'] === 'Yes'
    };
  }

  private storeUserData(storage: Storage, user: User, customerKey: string, username: string): void {
    storage.setItem('auth_token', user.accessToken || '');
    storage.setItem('user_email', username);
    storage.setItem('customer_key', customerKey);
    storage.setItem('user_name', user.name || '');
    storage.setItem('user_role', user.role || '');
    storage.setItem('user_company', user.company || '');
    storage.setItem('user_permissions', JSON.stringify(user.permissions));
  }

  logout(): void {
    localStorage.clear();
    sessionStorage.clear();
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}

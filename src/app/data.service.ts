import { Injectable, Inject } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import * as CryptoJS from 'crypto-js';
import { DOCUMENT } from '@angular/common';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  adminPage: any;
  dataURI: any;
  decryptedToken: any = null;
  headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
  secretKey: string = environment.secretKey;
  serverEndPoint: any;
  serviceEndpoint: any;
  userId: string = '';
  value: any;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private http: HttpClient
  ) {
    if (this.document.location.hostname == 'localhost') {
      this.serviceEndpoint = environment.localServiceEndpoint;
    } else {
      var split = this.document.location.hostname.split('.', 3);
      var httpsValue = 'https://api';
      this.serviceEndpoint = httpsValue + '.' + split[1] + '.' + split[2] + '/';
      console.log(this.serviceEndpoint);
    }
  }

  headersData = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  getDomain() {
    const hostname = this.document.location.hostname;

    if (hostname === 'localhost') {
      return 'dev-valuecrm.com';
    }

    const parts = hostname.split('.');

    if (parts.length > 2) {
      // Remove first subdomain
      return parts.slice(1).join('.');
    }

    return hostname; // fallback
  }

  
  getData(data: string): any {
    return this.http.post(this.serviceEndpoint + 'api/v1/login/company', data, {
      headers: this.headersData,
    });
  }

  adminCredis() {
    if (this.adminPage == null) {
      this.adminPage = this.retrieveKey('17');
      return this.adminPage;
      // console.log(this.adminPage);
    }
  }

  getMethodForHugedata(dataUrl: string, options: any) {
    let productionUrl = this.serviceEndpoint;

    var getMethodHeadersData = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'bearer ' + this.retrieveKey('JwtToken'),
      options,
    });

    var getUrl = productionUrl + dataUrl;
    return this.http.get(getUrl, { headers: getMethodHeadersData });
  }

  getMethod(dataUrl: string) {
    let productionUrl = this.serviceEndpoint;

    var getMethodHeadersData = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'bearer ' + this.retrieveKey('JwtToken'),
    });

    var getUrl = productionUrl + dataUrl;
    return this.http.get(getUrl, { headers: getMethodHeadersData });
  }

  putMethod(dataUrl: string, body: any): any {
    var putMethodHeadersData = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'bearer ' + this.retrieveKey('JwtToken'),
    });

    let productionUrl = this.serviceEndpoint;
    var putUrl = productionUrl + dataUrl;

    return this.http.put(putUrl, body, {
      headers: putMethodHeadersData,
    });
  }

  postMethod(dataUrl: string, body: any): any {
    var postMethodHeadersData = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'bearer ' + this.retrieveKey('JwtToken'),
    });

    let productionUrl = this.serviceEndpoint;
    var postUrl = productionUrl + dataUrl;

    return this.http.post(postUrl, body, { headers: postMethodHeadersData });
  }

  deleteMethod(dataUrl: string): any {
    var deleteMethodHeadersData = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'bearer ' + this.retrieveKey('JwtToken'),
    });

    let productionUrl = this.serviceEndpoint;
    var deleteUrl = productionUrl + dataUrl;

    return this.http.delete(deleteUrl, { headers: deleteMethodHeadersData });
  }

  deleteImageMethod(dataUrl: string, body: any): any {
    var deleteMethodHeadersData = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'bearer ' + this.retrieveKey('JwtToken'),
    });

    let productionUrl = this.serviceEndpoint;
    var deleteImageUrl = productionUrl + dataUrl;

    return this.http.delete(deleteImageUrl, {
      headers: deleteMethodHeadersData,
      body: body,
    });
  }

  postMethodForOTP(dataUrl: string): any {
    var postMethodHeadersData = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    let productionUrl = this.serviceEndpoint;
    var postUrl = productionUrl + dataUrl;

    return this.http.post(postUrl, { headers: postMethodHeadersData });
  }

  getMethodForOTP(dataUrl: string) {
    let productionUrl = this.serviceEndpoint;

    var getMethodHeadersData = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    var getUrl = productionUrl + dataUrl;
    return this.http.get(getUrl, { headers: getMethodHeadersData });
  }

  putMethodForOTP(dataUrl: string, body: any): any {
    var putMethodHeadersData = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    let productionUrl = this.serviceEndpoint;
    var putUrl = productionUrl + dataUrl;

    return this.http.put(putUrl, body, { headers: putMethodHeadersData });
  }

  getBase64(file: Blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  getServerData(
    serviceName: string,
    methodName: string,
    parameters: string[]
  ): any {
    if (this.decryptedToken == null) {
      this.decryptedToken = this.retrieveKey('JwtToken');
      parameters[0] = this.decryptedToken;
    } else {
      parameters[0] = this.decryptedToken;
    }

    return this.http.post(
      this.serverEndPoint,
      JSON.stringify({
        serviceName: serviceName,
        methodName: methodName,
        parameters: parameters,
      }),
      { headers: this.headers }
    );
  }

  getServerDataFromRust() {
    return this.http.get('http://64.227.182.124:8989/customers');
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(
        `Backend returned code ${error.status}, ` + `body was: ${error.error}`
      );
    }
  }

  setKey(key: any, value: any) {
    window.localStorage.setItem(key, value);
  }

  retrieveKey(key: string) {
    this.value = localStorage.getItem(key);
    this.value = CryptoJS.AES.decrypt(this.value, this.secretKey).toString(
      CryptoJS.enc.Utf8
    );
    return this.value;
  }

  resetDecryptedToken(): Boolean {
    this.decryptedToken = null;
    return true;
  }

  setLocal(key: string, value: string): void {
    window.localStorage.setItem(key, value);
  }

  getValues(key: string) {
    return localStorage.getItem(key);
  }

  removeTheLocalStorageValue() {
    localStorage.removeItem('accessToken');
    this.decryptedToken = null;
  }

  getTheServerIP() {
    return environment.staticServerIP;
  }
}

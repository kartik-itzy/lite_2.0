import * as CryptoJS from 'crypto-js';
import { environment } from '../../environments/environment';

var secretKey: string = environment.secretKey;
// import 
var decryptedToken: any = null;

export default class UtilsForGlobalData {
    /* return the Current Date in Formt YYYY-MM-DD*/
    static getCurrentDate(): string {
        return new Date().toISOString().slice(0, 10);
    }

    /* return the Current Time in Formt : HH:MM:SS*/
    static getCurrentTime(): string {
        var today = new Date();
        return (
            today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds()
        );
    }

    /* Return Current UserId*/
    static getUserId(): String {
        return this.retrieveLocalStorageKey('userID');
    }

    /* Set the UserId*/
    static setUserId(userid: string): void {
        this.setLocalStorageKey('userID', userid);
    }

    static getUserRoleId(): string {
        return this.retrieveLocalStorageKey('RoleID');
    }

    /* Get the Company*/
    static getCompanyName(): string {
        return this.retrieveLocalStorageKey('company');
    }

    static setsessionTimer(data: Object): void {
        window.localStorage.setItem('sessionTimer', JSON.stringify(data));
    }

    /* Get the Company*/
    static getsessionTimer(): string {
        return this.retrieveLocalStorageKey('sessionTimer');
    }

    /**
     * sets the (key,value) with the encypted value in localstorage
     */
    static setLocalStorageKey(key: any, value: any) {
        value = CryptoJS.AES.encrypt(value, secretKey);
        window.localStorage.setItem(key, value);
    }

    /**
     * retrives the (key,value) and decrypts value
     */
    static retrieveLocalStorageKey(key: any) {
        try {
            var value: any = localStorage.getItem(key);
            value = CryptoJS.AES.decrypt(value, secretKey).toString(
                CryptoJS.enc.Utf8
            );
            return value; //Observable.of(value)["value"];
        } catch (Error) {
            return null;
        }
    }

    /**
     * retrives the JwtToken and decrypts value
     */
    static fetchSecuredAccessKey() {
        if (decryptedToken == null) {
            return this.retrieveLocalStorageKey('JwtToken');
        } else {
            return decryptedToken;
        }
    }

    /**
     * Clear the Specific Value from Local Storage
     */
    static ClearValueFromLocalStorage(keys: any): any {
        for (var i = 0; i < keys.length; i++) {
            localStorage.removeItem(keys[i]);
        }
    }

    /**
     * Clear the All Value from Local Storage Except loginID, customerKey
     */
    static ClearAllFromLocalStorage(): any {
        for (var attr in localStorage) {
            if (attr != 'loginID' ? attr != 'customerKey' : false) {
                localStorage.removeItem(attr);
            }
        }
    }

    static sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

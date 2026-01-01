export default class UtilsFormatData {
    static numberWithCommas(x: any) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      }
    static objectIsEqual(obj1: any, obj2: any): boolean {
        if (obj1 === obj2) {
          return true;
        }
    
        if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
          return false;
        }
    
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
    
        if (keys1.length !== keys2.length) {
          return false;
        }
    
        for (const key of keys1) {
          if (!keys2.includes(key) || !this.objectIsEqual(obj1[key], obj2[key])) {
            return false;
          }
        }
    
        return true;
      }
    static  formatDate(date: Date) {
        var d = new Date(date),
          month = '' + (d.getMonth() + 1),
          day = '' + d.getDate(),
          year = d.getFullYear();
    
        if (month.length < 2)
          month = '0' + month;
        if (day.length < 2)
          day = '0' + day;
    
        return [year, month, day].join('-');
      }

    static inputFormatNumber(e: any) {
      const inputElement = e.event.target;
      const value = inputElement.value;
      const cleanedValue = value.replace(/[^0-9.]/g, '');
      const formattedValue = Number(cleanedValue).toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      });
      inputElement.value = formattedValue;
    }
}
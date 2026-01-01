import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface OrderItem {
  itemCode: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface Customer {
  code: string;
  name: string;
}

@Component({
  selector: 'app-sales-order-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales-order-detail.component.html',
  styleUrls: ['./sales-order-detail.component.css']
})
export class SalesOrderDetailComponent {
  orderNumber = 'S0000017';
  orderDate = '20.02.2025';
  dueDate = '22.03.2025';
  promisedDate = '20.02.2025';
  status = 'Open';
  totalAmount = 0.00;

  sellToCustomer: Customer = {
    code: 'C000001',
    name: 'กลุ่ม ชาวนาเพื่อน'
  };
  billToCustomer: Customer = {
    code: 'C000001',
    name: 'กลุ่ม ชาวนาเพื่อน'
  };

  locationCode = 'WH - Warehouse';
  salesPerson = '';
  notifications = ['Email X', 'SMS X'];
  amountIncludesTax = false;

  orderItems: OrderItem[] = [];

  subtotal = 0.00;
  discount = 0.00;
  tax = 0.00;
  total = 0.00;

  statusOptions = ['Open', 'Pending', 'Completed', 'Cancelled'];
  locationOptions = ['WH - Warehouse', 'ST - Store', 'OF - Office'];
  salesPersonOptions = ['John Doe', 'Jane Smith', 'Mike Johnson'];

  constructor() {
    this.calculateTotals();
  }

  addItem() {
    this.orderItems.push({
      itemCode: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0
    });
  }

  removeItem(index: number) {
    this.orderItems.splice(index, 1);
    this.calculateTotals();
  }

  updateItemAmount(index: number) {
    const item = this.orderItems[index];
    item.amount = item.quantity * item.unitPrice;
    this.calculateTotals();
  }

  calculateTotals() {
    this.subtotal = this.orderItems.reduce((sum, item) => sum + item.amount, 0);
    this.total = this.subtotal - this.discount + this.tax;
    this.totalAmount = this.total;
  }

  removeNotification(notification: string) {
    const index = this.notifications.indexOf(notification);
    if (index > -1) {
      this.notifications.splice(index, 1);
    }
  }

  saveOrder() {
    alert('Order saved successfully!');
  }

  cancel() {
    if (confirm('Are you sure you want to cancel? All changes will be lost.')) {
    }
  }
} 
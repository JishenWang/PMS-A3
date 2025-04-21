import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
// 定义库存商品接口
interface InventoryItem {
  item_id?: number;        
  item_name: string;       
  category: string;
  quantity: number;
  price: number;
  supplier_name: string;
  stock_status: string;
  featured_item?: number;
  special_note?: string;
}

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false
})
export class Tab2Page {  // 新商品对象
  newItem: InventoryItem = {
    item_name: '',
    category: 'Electronics',
    quantity: 0,
    price: 0,
    supplier_name: '',
    stock_status: 'In Stock',
    featured_item: 0
  };
  
  featuredItems: InventoryItem[] = [];
  categories = ['Electronics', 'Furniture', 'Clothing', 'Tools', 'Miscellaneous'];
  stockStatuses = ['In Stock', 'Low Stock', 'Out of Stock'];
  
  private apiUrl = 'https://prog2005.it.scu.edu.au/ArtGalley';
  mockApi = false;
// 注入服务
  constructor(
    private http: HttpClient, 
    private alertController: AlertController
  ) {
    this.loadFeaturedItems();
  }
 // 加载特色商品
  loadFeaturedItems() {
    if (this.mockApi) {
      this.featuredItems = [{
        item_id: 1,
        item_name: 'Sample Laptop',
        category: 'Electronics',
        quantity: 5,
        price: 999,
        supplier_name: 'Tech Supplier',
        stock_status: 'In Stock',
        featured_item: 1
      }];
      return;
    }

    this.http.get<InventoryItem[]>(this.apiUrl).subscribe({
      next: (items) => {
        this.featuredItems = items.filter(item => item.featured_item === 1);
      },
      error: (err) => {
        this.handleError('Failed to load featured items', err);
      }
    });
  }
 // 添加商品
  addItem() {
    if (!this.validateItem()) return;
// 准备要提交的数据
    const postData = {
      item_name: this.newItem.item_name.trim(),
      category: this.newItem.category,
      quantity: Math.round(Number(this.newItem.quantity)), // 确保整数
      price: Math.round(Number(this.newItem.price)),     // 确保整数
      supplier_name: this.newItem.supplier_name.trim(),
      stock_status: this.newItem.stock_status,
      featured_item: this.newItem.featured_item || 0,
      special_note: this.newItem.special_note?.trim()
    };

    console.log('Submitting to API:', postData);

    if (this.mockApi) {
      setTimeout(() => {
        this.showAlert('Success', 'Item added successfully (mock)');
        this.resetForm();
        this.loadFeaturedItems();
      }, 500);
      return;
    }

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    this.http.post(this.apiUrl, postData, httpOptions).subscribe({
      next: () => {
        this.showAlert('Success', 'Item added successfully');
        this.resetForm();
        this.loadFeaturedItems();
      },
      error: (err) => {
        this.handleError('Failed to add item', err);
      }
    });
  }

  validateItem(): boolean {
    const errors = [];
    
    if (!this.newItem.item_name.trim()) {
      errors.push('Item name is required');
    }
    if (this.newItem.quantity <= 0 || !Number.isInteger(this.newItem.quantity)) {
      errors.push('Quantity must be a positive integer');
    }
    if (this.newItem.price <= 0 || !Number.isInteger(this.newItem.price)) {
      errors.push('Price must be a positive integer');
    }
    if (!this.newItem.supplier_name.trim()) {
      errors.push('Supplier name is required');
    }

    if (errors.length > 0) {
      this.showAlert('Validation Error', errors.join('\n'));
      return false;
    }
    return true;
  }

  resetForm() {
    this.newItem = {
      item_name: '',
      category: 'Electronics',
      quantity: 0,
      price: 0,
      supplier_name: '',
      stock_status: 'In Stock',
      featured_item: 0
    };
  }

  private handleError(context: string, err: HttpErrorResponse) {
    console.error(context, err);
    
    let errorMsg = context;
    if (err.error) {
      if (typeof err.error === 'object') {
        errorMsg += `: ${JSON.stringify(err.error)}`;
      } else {
        errorMsg += `: ${err.error}`;
      }
    } else {
      errorMsg += `: ${err.status} - ${err.statusText}`;
    }
    
    this.showAlert('Error', errorMsg);
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  async presentHelp() {
    const alert = await this.alertController.create({
      header: 'Add/Featured Items Help',
      message: 'This page allows you to add new inventory items and view featured items. All fields marked with * are required. Item names must be unique.',
      buttons: ['OK']
    });
    await alert.present();
  }
}
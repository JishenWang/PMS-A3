import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertController, LoadingController } from '@ionic/angular';

// Strict type definitions
type InventoryCategory = 'Electronics' | 'Furniture' | 'Clothing' | 'Tools' | 'Miscellaneous';
type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

interface InventoryItem {
  Item_id: number;
  item_name: string;
  category: InventoryCategory;
  quantity: number;
  price: number;
  supplier_name: string;
  stock_status: StockStatus;
  featured_item: number;
  special_note?: string;
}

@Component({
  selector: 'app-tab1',
  templateUrl: './tab1.page.html',
  styleUrls: ['./tab1.page.scss'],
  standalone:false
})
export class Tab1Page implements OnInit {
  searchTerm = '';
  inventoryItems: InventoryItem[] = [];
  filteredItems: InventoryItem[] = [];
  readonly API_ENDPOINT = 'https://prog2005.it.scu.edu.au/ArtGalley';

  constructor(
    private http: HttpClient,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {}

  async ngOnInit() {
    await this.loadInventory();
  }

  // Load inventory data
  async loadInventory() {
    const loading = await this.loadingCtrl.create({
      message: 'Loading inventory data...',
      spinner: 'circular',
      duration: 5000 // Timeout protection
    });
    
    try {
      await loading.present();
      
      // API request
      const response = await this.http.get<InventoryItem[]>(this.API_ENDPOINT).toPromise();
      
      // Data validation and conversion
      this.inventoryItems = (response || []).map(item => ({
        ...item,
        quantity: Number(item.quantity) || 0,
        price: Number(item.price) || 0,
        category: this.validateCategory(item.category),
        stock_status: this.validateStatus(item.stock_status)
      }));
      
      this.filteredItems = [...this.inventoryItems];
    } catch (error) {
      console.error('API request failed:', error);
      await this.showAlert('Error', 'Unable to load inventory data');
    } finally {
      loading.dismiss();
    }
  }

  // Category validation
  private validateCategory(category: string): InventoryCategory {
    const validCategories: InventoryCategory[] = [
      'Electronics', 'Furniture', 'Clothing', 'Tools', 'Miscellaneous'
    ];
    return validCategories.includes(category as any) 
      ? category as InventoryCategory 
      : 'Miscellaneous';
  }

  // Status validation
  private validateStatus(status: string): StockStatus {
    if (/in stock/i.test(status)) return 'In Stock';
    if (/low stock/i.test(status)) return 'Low Stock';
    if (/out of stock/i.test(status)) return 'Out of Stock';
    return 'In Stock'; // Default value
  }

  // Item search
  filterItems() {
    if (!this.searchTerm.trim()) {
      this.filteredItems = [...this.inventoryItems];
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.filteredItems = this.inventoryItems.filter(item =>
      item.item_name.toLowerCase().includes(term) ||
      item.supplier_name.toLowerCase().includes(term)
    );
  }

  // Reset search
  clearSearch() {
    this.searchTerm = '';
    this.filteredItems = [...this.inventoryItems];
  }

  // Get status color
  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'in stock': return 'success';
      case 'low stock': return 'warning';
      case 'out of stock': return 'danger';
      default: return 'medium';
    }
  }

  // Get category icon
  getCategoryIcon(category: string): string {
    switch (category.toLowerCase()) {
      case 'electronics': return 'hardware-chip-outline';
      case 'furniture': return 'cube-outline';
      case 'clothing': return 'shirt-outline';
      case 'tools': return 'construct-outline';
      default: return 'pricetags-outline';
    }
  }

  // Show help information
  async showHelp() {
    const alert = await this.alertCtrl.create({
      header: 'Help',
      subHeader: 'Inventory Management System Guide',
      message: `
        <ion-icon name="search-outline"></ion-icon> Use the search bar to find items by name<br><br>
        <ion-icon name="pricetag-outline"></ion-icon> Icons represent item categories<br><br>
        <ion-badge color="success">In Stock</ion-badge> Indicates sufficient stock
      `,
      buttons: ['Got it']
    });
    await alert.present();
  }

  // Show error prompt
  private async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}    
import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface InventoryItem {
  item_id?: number;
  item_name: string;
  category: string;
  quantity: number;
  price: number;
  supplier_name: string;
  stock_status: string;
  featured_item: number;
  special_note?: string;
}

@Component({
  selector: 'app-tab3',
  templateUrl: './tab3.page.html',
  styleUrls: ['./tab3.page.scss'],
  standalone: false
})
export class Tab3Page implements OnInit {
  inventoryForm: FormGroup;
  inventoryItems: InventoryItem[] = [];
  filteredItems: InventoryItem[] = [];
  selectedItem: InventoryItem | null = null;
  isEditMode = false;
  searchTerm = '';
  apiUrl = 'https://prog2005.it.scu.edu.au/ArtGalley';

  categories = ['Electronics', 'Furniture', 'Clothing', 'Tools', 'Miscellaneous'];
  stockStatuses = ['In Stock', 'Low Stock', 'Out of Stock'];

  constructor(
    private fb: FormBuilder,
    private alertController: AlertController,
    private http: HttpClient,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController
  ) {
    this.inventoryForm = this.fb.group({
      item_name: ['', [
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z0-9\s]+$/)
      ]],
      category: ['', Validators.required],
      quantity: ['', [
        Validators.required,
        Validators.min(0),
        Validators.max(9999),
        Validators.pattern(/^[0-9]+$/)
      ]],
      price: ['', [
        Validators.required,
        Validators.min(0),
        Validators.max(999999),
        Validators.pattern(/^[0-9]+$/)
      ]],
      supplier_name: ['', [
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z\s]+$/)
      ]],
      stock_status: ['', Validators.required],
      featured_item: [0, Validators.required],
      special_note: ['', Validators.maxLength(200)]
    });
  }

  getStatusColor(status: string): string {
    switch(status) {
      case 'In Stock': return 'success';
      case 'Low Stock': return 'warning';
      case 'Out of Stock': return 'danger';
      default: return 'medium';
    }
  }

  async ngOnInit() {
    await this.loadItems();
  }

  async loadItems() {
    const loading = await this.loadingCtrl.create({
      message: 'Loading inventory...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const response = await this.http.get<InventoryItem[]>(this.apiUrl).toPromise();
      this.inventoryItems = response || [];
      this.filterItems();
    } catch (error) {
      console.error('Error loading items:', error);
      await this.presentAlert('Error', 'Failed to load inventory data. Please try again later.');
    } finally {
      await loading.dismiss();
    }
  }

  filterItems() {
    if (!this.searchTerm) {
      this.filteredItems = [...this.inventoryItems];
    } else {
      const searchText = this.searchTerm.toLowerCase();
      this.filteredItems = this.inventoryItems.filter(item => 
        item.item_name.toLowerCase().includes(searchText))
    }
  }

  onSearchChange(event: any) {
    this.searchTerm = event.detail.value || '';
    this.filterItems();
  }

  selectItem(item: InventoryItem) {
    this.selectedItem = item;
    this.isEditMode = true;
    this.inventoryForm.patchValue({
      item_name: item.item_name,
      category: item.category,
      quantity: item.quantity,
      price: item.price,
      supplier_name: item.supplier_name,
      stock_status: item.stock_status,
      featured_item: item.featured_item,
      special_note: item.special_note || ''
    });
    this.scrollToForm();
  }

  async updateItem() {
    if (this.inventoryForm.invalid || !this.selectedItem) {
      await this.presentAlert('Validation Error', 'Please fill all required fields correctly.');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Updating item...',
      spinner: 'lines'
    });
    await loading.present();

    try {
      const updatedItem = {
        ...this.selectedItem,
        ...this.inventoryForm.value
      };

      await this.http.put(
        `${this.apiUrl}/${this.selectedItem.item_name}`,
        updatedItem,
        { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
      ).toPromise();

      await this.loadItems();
      await this.presentAlert('Success', 'Item updated successfully!');
      this.resetForm();
    } catch (error) {
      console.error('Error updating item:', error);
      await this.presentAlert('Error', 'Failed to update item. Please try again.');
    } finally {
      await loading.dismiss();
    }
  }

  async deleteItem() {
    if (!this.selectedItem) return;
    
    if (this.selectedItem.item_name === 'Laptop') {
      await this.presentAlert('Notice', 'The Laptop item cannot be deleted.');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Deleting item...',
      spinner: 'dots'
    });
    await loading.present();

    try {
      await this.http.delete(
        `${this.apiUrl}/${this.selectedItem.item_name}`
      ).toPromise();

      await this.loadItems();
      await this.presentAlert('Success', 'Item deleted successfully!');
      this.resetForm();
    } catch (error) {
      console.error('Error deleting item:', error);
      await this.presentAlert('Error', 'Failed to delete item. Please try again.');
    } finally {
      await loading.dismiss();
    }
  }

  resetForm() {
    this.inventoryForm.reset({
      featured_item: 0
    });
    this.selectedItem = null;
    this.isEditMode = false;
    this.searchTerm = '';
    this.filterItems();
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
      cssClass: 'custom-alert'
    });
    await alert.present();
  }

  async showHelp() {
    const alert = await this.alertController.create({
      header: 'Inventory Management Help',
      message: `
      Help content:
Search: Enter "Filter items by name" in the search bar. When you type "Search", real-time results will be displayed.

Edit project: Click on any project to view and modify its detailed information. All fields except the project ID can be updated.

Save Changes: After the editing is completed, click the blue Save button to update the entries. Required fields are marked with *.

Delete Items: Select an item and click the red Delete button. Note: Demo items like "Laptop" cannot be deleted.

Validation: A red error prompt indicates that the input is invalid. Hover the mouse over the field to view the requirements.

Navigation: Use the tabs at the bottom to switch between inventory views.
      `,
      buttons: ['Understood'],
      cssClass: 'help-alert'
    });
    await alert.present();
  }

  async confirmDelete() {
    if (!this.selectedItem) return;

    const alert = await this.alertController.create({
      header: 'Confirm Deletion',
      message: `Are you sure you want to delete "${this.selectedItem.item_name}"?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: () => this.deleteItem()
        }
      ],
      cssClass: 'delete-confirm-alert'
    });
    await alert.present();
  }

  scrollToForm() {
    const formElement = document.querySelector('ion-card');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  navigateToTab(tabName: string) {
    this.navCtrl.navigateForward(`/tabs/${tabName}`);
  }
}
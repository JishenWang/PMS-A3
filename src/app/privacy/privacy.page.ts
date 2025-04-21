// src/app/privacy/privacy.page.ts
import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.page.html',
  styleUrls: ['./privacy.page.scss'],
  standalone: false
})
export class PrivacyPage {
  constructor(private alertController: AlertController) {}

  async presentHelp() {
    const alert = await this.alertController.create({
      header: 'Privacy Page Help',
      message: 'This page explains our privacy and security policies regarding inventory data management.',
      buttons: ['OK']
    });

    await alert.present();
  }
}
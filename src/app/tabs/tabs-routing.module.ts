import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
// 定义路由配置
const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [// 子路由配置
      {
        path: 'tab1',
        loadChildren: () => import('../tab1/tab1.module').then(m => m.Tab1PageModule)
      },
      {
        path: 'tab2',
        loadChildren: () => import('../tab2/tab2.module').then(m => m.Tab2PageModule)
      },
      {
        path: 'tab3',
        loadChildren: () => import('../tab3/tab3.module').then(m => m.Tab3PageModule)
      },
	  {
        path: 'privacy',
        loadChildren: () => import('../privacy/privacy.module').then(m => m.PrivacyPageModule)
      },
      {
        path: '',// 空路径时重定向到 '/tabs/tab1'
        redirectTo: '/tabs/tab1',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/tab1',
    pathMatch: 'full'
  }
];

@NgModule({ // 导入路由配置
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}// 导出 TabsPageRoutingModule

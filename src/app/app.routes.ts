import { Routes } from '@angular/router';
import { DemoComponent } from './components/demo/demo.component';
import { ComponentsDemoComponent } from './components/demo/components-demo.component';
import { ModalDemoComponent } from './components/demo/modal-demo.component';
import { FormsDemoComponent } from './components/demo/forms-demo.component';
import { TabDemoComponent } from './components/demo/tab-demo.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { StockComponent } from './stock/stock.component';
import { ProductsComponent } from './products/products.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './shared/guards/auth.guard';

// analytics and dahsboard
import { CouponDashboardComponent } from './modules/Analytics-and-dashboard/coupon-dashboard/coupon-dashboard.component';
import { StatsComponent } from './modules/Analytics-and-dashboard/stats/stats.component';
//brand
import { BrandComponent } from './modules/Brand/brand/brand.component';
import { LoyaltyPlanByBrandComponent } from './modules/Brand/loyalty-plan-by-brand/loyalty-plan-by-brand.component';
import { RedeemPlanByBrandComponent } from './modules/Brand/redeem-plan-by-brand/redeem-plan-by-brand.component';
import { MemberLevelByBrandComponent } from './modules/Brand/member-level-by-brand/member-level-by-brand.component';
import { TopupPromotionByBrandComponent } from './modules/Brand/topup-promotion-by-brand/topup-promotion-by-brand.component';
import { AppPromotionByBrandComponent } from './modules/Brand/app-promotion-by-brand/app-promotion-by-brand.component';
import { CouponPlanByBrandComponent } from './modules/Brand/coupon-plan-by-brand/coupon-plan-by-brand.component';
import { BrandPointsComponent } from './modules/Brand/brand-points/brand-points.component';
// Campaign-and-promotions
import { AppPromotionComponent } from './modules/Campaign-and-promotions/app-promotion/app-promotion.component';
import { CampaignComponent } from './modules/Campaign-and-promotions/campaign/campaign.component';
// Configuration
import { StoreComponent } from './modules/Configuration/store/store.component';
import { CompanyComponent } from './modules/Configuration/company/company.component';
import { ItemComponent } from './modules/Configuration/item/item.component';
import { ItemCategoryComponent } from './modules/Configuration/item-category/item-category.component';
import { UsersComponent } from './modules/Configuration/users/users.component';
import { TendersComponent } from './modules/Configuration/tenders/tenders.component';
import { TransactionsComponent } from './modules/Configuration/transactions/transactions.component';
import { PaymentLogComponent } from './modules/Configuration/payment-log/payment-log.component';
// crm
import { ManualMemberLevelComponent } from './modules/CRM/manual-member-level/manual-member-level.component';
import { MembersComponent } from './modules/CRM/members/members.component';
import { CustomersComponent } from './modules/CRM/customers/customers.component';
import { MemberLevelComponent } from './modules/CRM/member-level/member-level.component';
import { MemberDefaultComponent } from './modules/CRM/member-default/member-default.component';
import { MemberSegmentationSetupComponent } from './modules/CRM/member-segmentation-setup/member-segmentation-setup.component';
import { MemberSegmentationComponent } from './modules/CRM/member-segmentation/member-segmentation.component';
import { SubMemberComponent } from './modules/CRM/sub-member/sub-member.component';
import { TransactionsHistoryComponent } from './modules/CRM/transactions-history/transactions-history.component';
// Integration-and-external-setup
import { ThirdPartySetupComponent } from './modules/Integration-and-external-setup/third-party-setup/third-party-setup.component';
import { LineIntegrationComponent } from './modules/Integration-and-external-setup/line-integration/line-integration.component';

// loyalty and reward
import { LoyaltyPlanComponent } from './modules/Loyalty-and-reward/loyalty-plan/loyalty-plan.component';
import { TopupPromotionComponent } from './modules/Loyalty-and-reward/topup-promotion/topup-promotion.component';
import { BasicDealsComponent } from './modules/Loyalty-and-reward/basic-deals/basic-deals.component';
import { CouponPlanComponent } from './modules/Loyalty-and-reward/coupon-plan/coupon-plan.component';
import { RedeemPlanComponent } from './modules/Loyalty-and-reward/redeem-plan/redeem-plan.component';
import { ApplyCouponComponent } from './modules/Loyalty-and-reward/apply-coupon/apply-coupon.component';
import { CardComponent } from './modules/Others/card/card.component';
import { BrandDetailsComponent } from './modules/Brand/brand-details/brand-details.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'demo',
    component: DemoComponent,
    // canActivate: [AuthGuard]
  },
  {
    path: 'demo/components',
    component: ComponentsDemoComponent,
    // canActivate: [AuthGuard]
  },
  {
    path: 'demo/modal',
    component: ModalDemoComponent,
    // canActivate: [AuthGuard]
  },
  {
    path: 'demo/forms',
    component: FormsDemoComponent,
    // canActivate: [AuthGuard]
  },
  {
    path: 'demo/tabs',
    component: TabDemoComponent,
    // canActivate: [AuthGuard]
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    // canActivate: [AuthGuard]
  },
  {
    path: 'stock',
    component: StockComponent,
    // canActivate: [AuthGuard]
  },
  {
    path: 'products',
    component: ProductsComponent,
    // canActivate: [AuthGuard]
  },
  {
    path: 'sales-order-detail',
    loadComponent: () =>
      import('./sales-order-detail/sales-order-detail.component').then(
        (m) => m.SalesOrderDetailComponent
      ),
    // canActivate: [AuthGuard]
  },
  { path: 'crafted/retail/STORE-POS', component: StoreComponent },
  { path: 'crafted/retail/company', component: CompanyComponent },
  { path: 'crafted/retail/itemList', component: ItemComponent },
  { path: 'crafted/retail/users', component: UsersComponent },
  { path: 'crafted/retail/tenders', component: TendersComponent },
  { path: 'crafted/retail/transaction', component: TransactionsComponent },
  { path: 'crafted/retail/item_category', component: ItemCategoryComponent },
  { path: 'crafted/retail/paymentlog', component: PaymentLogComponent },

  {
    path: 'crafted/retail/memberslistmanual',
    component: ManualMemberLevelComponent,
  },
  { path: 'crafted/retail/memberslist', component: MembersComponent },
  { path: 'crafted/retail/customers', component: CustomersComponent },
  { path: 'crafted/retail/memberlevel', component: MemberLevelComponent },
  { path: 'crafted/retail/member_default', component: MemberDefaultComponent },
  {
    path: 'crafted/retail/membersegmentationsetup',
    component: MemberSegmentationSetupComponent,
  },
  {
    path: 'crafted/retail/membersegmentation',
    component: MemberSegmentationComponent,
  },
  { path: 'crafted/retail/submember', component: SubMemberComponent },

  { path: 'crafted/retail/loyalty', component: LoyaltyPlanComponent },
  {
    path: 'crafted/retail/topup_promotion',
    component: TopupPromotionComponent,
  },
  { path: 'crafted/retail/basicdeals', component: BasicDealsComponent },
  { path: 'crafted/retail/couponlist', component: CouponPlanComponent },
  { path: 'crafted/retail/redeemlist', component: RedeemPlanComponent },
  { path: 'crafted/retail/applycoupon', component: ApplyCouponComponent },

  { path: 'crafted/retail/AppPromotions', component: AppPromotionComponent },
  { path: 'crafted/retail/campaign', component: CampaignComponent },

  {
    path: 'crafted/retail/thirdparty_setup',
    component: ThirdPartySetupComponent,
  },

  {
    path: 'crafted/retail/coupon_dashboard',
    component: CouponDashboardComponent,
  },
  { path: 'crafted/retail/client_stats', component: StatsComponent },

  { path: 'crafted/retail/Brand', component: BrandComponent },
  { path:'crafted/retail/Brand-details/:id', component:BrandDetailsComponent},
  {
    path: 'crafted/retail/loyaltyplanByBrand',
    component: LoyaltyPlanByBrandComponent,
  },
  {
    path: 'crafted/retail/redeemplanByBrand',
    component: RedeemPlanByBrandComponent,
  },
  {
    path: 'crafted/retail/memberlevelByBrand',
    component: MemberLevelByBrandComponent,
  },
  {
    path: 'crafted/retail/TopupPromotionByBrand',
    component: TopupPromotionByBrandComponent,
  },
  {
    path: 'crafted/retail/AppPromotionByBrand',
    component: AppPromotionByBrandComponent,
  },
  {
    path: 'crafted/retail/couponplanbybrand',
    component: CouponPlanByBrandComponent,
  },

  {
    path: 'crafted/retail/Card',
    component: CardComponent

  },

  { path: 'crafted/retail/LineIntegration', component: LineIntegrationComponent },
  { path: 'crafted/retail/BrandPointsByMember', component: BrandPointsComponent },
  { path: 'crafted/retail/TransactionsHistory', component: TransactionsHistoryComponent },

];

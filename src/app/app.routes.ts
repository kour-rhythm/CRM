import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component'; // Corrected import path
import { RegisterComponent } from './components/register/register.component'; // Corrected import path
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CustomerComponent } from './components/customer/customer.component';
import { ProductComponent } from './components/product/product.component';
import { SalesOpportunitiesComponent } from './components/salesopportunities/salesopportunities.component'; // Corrected import path
import { TicketsComponent } from './components/tickets/tickets.component';
import { AgentComponent } from './components/agents/agents.component'; // Corrected import path
import { MarketingComponent } from './components/marketing/marketing.component';
import { CampaignsComponent } from './components/campaigns/campaigns.component'; // Corrected import path
import { EmailComponent } from './components/email/email.component'; // Corrected import path (was SmsComponent in your previous routes)
import { SmsComponent } from './components/sms/sms.component'; // Corrected import path (was EmailComponent in your previous routes)
import { ReportsComponent } from './components/reports/reports.component';
import { CustomerReportComponent } from './components/customer-report/customer-report.component';
import { MarketingReportComponent } from './components/marketing-report/marketing-report.component';
import { SalesReportComponent } from './components/sales-report/sales-report.component';
import { FaqComponent } from './components/faq/faq.component';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component'; // Import the UnauthorizedComponent

import { AuthGuard } from './guards/auth.guard'; // Import your AuthGuard

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login', // Default route redirects to login
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'Login'
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'Register'
  },
  {
    path: 'unauthorized', // Route for unauthorized access
    component: UnauthorizedComponent,
    title: 'Access Denied'
  },
  // PROTECTED ROUTES - Apply AuthGuard to these routes
  {
    path: 'dashboard',
    component: DashboardComponent,
    title: 'Dashboard Home',
    canActivate: [AuthGuard] // Apply the guard
  },
  {
    path: 'customer',
    component: CustomerComponent,
    title: 'Customer Management',
    canActivate: [AuthGuard]
  },
  {
    path: 'product',
    component: ProductComponent,
    title: 'Product Management',
    canActivate: [AuthGuard]
  },
  {
    path: 'salesopportunities',
    component: SalesOpportunitiesComponent,
    title: 'Sales Opportunities Management',
    canActivate: [AuthGuard]
  },
  {
    path: 'tickets',
    component: TicketsComponent,
    title: 'Ticket Management',
    canActivate: [AuthGuard]
  },
  {
    path: 'agents',
    component: AgentComponent,
    title: 'Agent Management',
    canActivate: [AuthGuard]
  },
  {
    path: 'marketing', // Main marketing landing page
    component: MarketingComponent,
    title: 'Marketing Portal',
    canActivate: [AuthGuard]
  },
  {
    path: 'campaigns', // Campaign Management sub-page
    component: CampaignsComponent,
    title: 'Campaign Management',
    canActivate: [AuthGuard]
  },
  {
    path: 'email', // Marketing via Email sub-page
    component: EmailComponent,
    title: 'Marketing via Email',
    canActivate: [AuthGuard]
  },
  {
    path: 'sms', // Marketing via SMS sub-page
    component: SmsComponent,
    title: 'Marketing via SMS',
    canActivate: [AuthGuard]
  },
  {
    path: 'reports', // Main reports landing page
    component: ReportsComponent,
    title: 'CRM Reports Dashboard',
    canActivate: [AuthGuard]
  },
  {
    path: 'customer-report', // Customer Report sub-page
    component: CustomerReportComponent,
    title: 'Customer Report',
    canActivate: [AuthGuard]
  },
  {
    path: 'marketing-report', // Marketing Report sub-page
    component: MarketingReportComponent,
    title: 'Marketing Report',
    canActivate: [AuthGuard]
  },
  {
    path: 'sales-report', // Sales Report sub-page
    component: SalesReportComponent,
    title: 'Sales Report',
    canActivate: [AuthGuard]
  },
  {
    path: 'faq', // FAQ page
    component: FaqComponent,
    title: 'FAQ',
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: 'unauthorized' } // Catch-all redirects to unauthorized
];

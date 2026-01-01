import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'rhbus-backoffice';
  showLayout = false; // Start with false to avoid flash

  constructor(private router: Router) {
    // Listen to route changes to determine if layout should be shown
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Hide layout for login page and root path
      const hideLayoutRoutes = ['/login', '/login/', '/', ''];
      this.showLayout = !hideLayoutRoutes.some(route => event.url === route);
    });
  }

  ngOnInit(): void {
    // Set initial layout state based on current URL
    const currentUrl = this.router.url;
    const hideLayoutRoutes = ['/login', '/login/', '/', ''];
    this.showLayout = !hideLayoutRoutes.some(route => currentUrl === route);
  }
}

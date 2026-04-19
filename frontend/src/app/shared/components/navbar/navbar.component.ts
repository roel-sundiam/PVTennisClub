import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <button type="button" class="nav-brand" (click)="goToDashboard()" title="Go to dashboard">
        <i class="fas fa-border-all brand-icon"></i>
        <span class="brand-name">Punta Verde Tennis Club</span>
      </button>

      @if (auth.isLoggedIn()) {
        <!-- Desktop Navigation -->
        <div class="nav-links desktop-nav">
          @if (auth.isAdmin()) {
            @if (auth.isSuperAdmin()) {
              <a routerLink="/admin/rates" routerLinkActive="active" class="nav-link-text">Rates</a>
            }
          }

          <!-- Profile Avatar with Image -->
          @if (auth.user()) {
            <button
              type="button"
              class="profile-section"
              (click)="goToProfile()"
              title="Edit profile"
            >
              <div class="profile-avatar">
                @if (auth.user()!.profileImage) {
                  <img [src]="auth.user()!.profileImage" alt="Profile" class="avatar-image" />
                } @else {
                  <span class="avatar-initials">{{ getInitials() }}</span>
                }
              </div>
              <span class="profile-username">{{ auth.user()!.name }}</span>
            </button>
          }

          <button class="btn-logout" (click)="auth.logout()" title="Logout">
            <i class="fas fa-sign-out-alt"></i>
            <span class="icon-label">Logout</span>
          </button>
        </div>

        <!-- Mobile Navigation -->
        <div class="mobile-nav">
          <!-- Profile Avatar (visible on mobile) -->
          @if (auth.user()) {
            <button
              type="button"
              class="profile-section-mobile"
              (click)="goToProfile()"
              title="Edit profile"
            >
              <div class="profile-avatar">
                @if (auth.user()!.profileImage) {
                  <img [src]="auth.user()!.profileImage" alt="Profile" class="avatar-image" />
                } @else {
                  <span class="avatar-initials">{{ getInitials() }}</span>
                }
              </div>
            </button>
          }

          <!-- Hamburger Menu (admin only) -->
          @if (auth.isAdmin()) {
            <button type="button" class="btn-hamburger" (click)="toggleMobileMenu()" title="Menu">
              <i
                class="fas"
                [class.fa-bars]="!mobileMenuOpen"
                [class.fa-times]="mobileMenuOpen"
              ></i>
            </button>
          }

          <!-- Logout Button (visible for all users on mobile) -->
          @if (!auth.isAdmin()) {
            <button class="btn-logout-mobile-icon" (click)="auth.logout()" title="Logout">
              <i class="fas fa-sign-out-alt"></i>
            </button>
          }

          <!-- Mobile Menu Dropdown -->
          @if (mobileMenuOpen && auth.isAdmin()) {
            <div class="mobile-menu-dropdown">
              @if (auth.isSuperAdmin()) {
                <a
                  routerLink="/admin/rates"
                  routerLinkActive="active"
                  class="mobile-menu-item"
                  (click)="closeMobileMenu()"
                >
                  <i class="fas fa-dollar-sign"></i> Rates
                </a>
              }
              <div class="mobile-menu-divider"></div>
              <button
                type="button"
                class="mobile-menu-item btn-logout-mobile"
                (click)="auth.logout()"
              >
                <i class="fas fa-sign-out-alt"></i> Logout
              </button>
            </div>
          }
        </div>
      }
    </nav>
  `,
  styles: [
    `
      .navbar {
        background: linear-gradient(135deg, #2d6a1f 0%, #4a8a2a 100%);
        color: white;
        padding: 0 1.5rem;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.35);
        position: sticky;
        top: 0;
        z-index: 100;
      }
      .nav-brand {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1.1rem;
        font-weight: 700;
        letter-spacing: 0.5px;
        color: #ffffff;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.4rem 0.5rem;
        border-radius: 4px;
        transition: all 0.2s;
        font-family: inherit;
      }
      .nav-brand:hover {
        background: rgba(255, 255, 255, 0.1);
      }
      .brand-icon {
        font-size: 1.4rem;
        color: #ffffff;
      }
      .nav-links {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .nav-link-text {
        color: #ffffff;
        text-decoration: none;
        padding: 0.4rem 0.75rem;
        border-radius: 4px;
        font-size: 0.9rem;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }
      .nav-link-text:hover,
      .nav-link-text.active {
        background: rgba(255, 255, 255, 0.15);
        color: #ffffff;
      }
      .nav-link-icon {
        color: #ffffff;
        text-decoration: none;
        padding: 0.4rem 0.75rem;
        border-radius: 4px;
        font-size: 1rem;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      .nav-link-icon:hover,
      .nav-link-icon.active {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.4);
      }
      .icon-label {
        display: none;
      }
      .nav-links a {
        color: #ffffff;
        text-decoration: none;
        padding: 0.4rem 0.75rem;
        border-radius: 4px;
        font-size: 0.9rem;
        transition: background 0.2s;
      }
      .nav-links a:hover,
      .nav-links a.active {
        background: rgba(255, 255, 255, 0.15);
        color: #ffffff;
      }
      .btn-logout {
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.2);
        padding: 0.4rem 0.75rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-left: 0;
      }
      .btn-logout:hover {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.4);
      }
      .profile-section {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        margin: 0 0.5rem;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.4rem 0.5rem;
        border-radius: 8px;
        transition: all 0.2s;
        color: inherit;
        font-family: inherit;
      }
      .profile-section:hover {
        background: rgba(255, 255, 255, 0.15);
      }
      .profile-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.15);
        border: 2px solid rgba(255, 255, 255, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        overflow: hidden;
      }
      .avatar-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
      }
      .avatar-initials {
        font-size: 0.85rem;
        font-weight: 700;
        color: #ffffff;
        text-transform: uppercase;
      }
      .profile-username {
        font-size: 0.9rem;
        color: #ffffff;
        font-weight: 500;
        max-width: 120px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      @media (min-width: 769px) {
        .icon-label {
          display: inline;
        }
        .desktop-nav {
          display: flex !important;
        }
        .mobile-nav {
          display: none !important;
        }
      }

      @media (max-width: 768px) {
        .desktop-nav {
          display: none !important;
        }
        .mobile-nav {
          display: flex !important;
          align-items: center;
          gap: 0.5rem;
        }
      }

      @media (max-width: 600px) {
        .brand-name {
          display: inline;
          font-size: 0.9rem;
        }
        .nav-link-text {
          padding: 0.35rem 0.5rem;
          font-size: 0.82rem;
        }
        .nav-link-icon {
          padding: 0.4rem 0.5rem;
        }
        .icon-label {
          display: none;
        }
        .btn-logout {
          padding: 0.4rem 0.5rem;
          font-size: 0.9rem;
          margin-left: 0;
        }
        .profile-username {
          display: none;
        }
        .profile-section {
          margin: 0 0.25rem;
        }
      }

      /* Mobile Menu Styles */
      .mobile-nav {
        position: relative;
      }
      .profile-section-mobile {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.4rem 0.5rem;
        border-radius: 8px;
        transition: all 0.2s;
        color: inherit;
        font-family: inherit;
      }
      .profile-section-mobile:hover {
        background: rgba(255, 255, 255, 0.15);
      }
      .btn-hamburger {
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.2);
        padding: 0.4rem 0.75rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1.2rem;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .btn-hamburger:hover {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.4);
      }
      .mobile-menu-dropdown {
        position: absolute;
        top: 60px;
        right: 0;
        background: #2d6a1f;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
        min-width: 220px;
        z-index: 1000;
        overflow: hidden;
      }
      .mobile-menu-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        width: 100%;
        padding: 0.75rem 1rem;
        color: #ffffff;
        background: none;
        border: none;
        text-decoration: none;
        cursor: pointer;
        font-size: 0.95rem;
        transition: all 0.2s;
        text-align: left;
        font-family: inherit;
      }
      .mobile-menu-item:hover,
      .mobile-menu-item.active {
        background: rgba(255, 255, 255, 0.15);
      }
      .mobile-menu-item i {
        width: 1.2rem;
        text-align: center;
      }
      .btn-logout-mobile {
        color: #ffffff;
      }
      .btn-logout-mobile:hover {
        background: rgba(255, 0, 0, 0.1);
      }
      .mobile-menu-divider {
        height: 1px;
        background: rgba(255, 255, 255, 0.1);
      }
      .btn-logout-mobile-icon {
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.2);
        padding: 0.4rem 0.75rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .btn-logout-mobile-icon:hover {
        background: rgba(255, 0, 0, 0.1);
        border-color: rgba(255, 0, 0, 0.3);
      }
    `,
  ],
})
export class NavbarComponent {
  mobileMenuOpen = false;

  constructor(
    public auth: AuthService,
    private router: Router,
  ) {}

  getInitials(): string {
    const user = this.auth.user();
    if (!user) return '';
    const parts = user.name.split(' ');
    const initials = parts
      .map((p) => p.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
    return initials;
  }

  goToDashboard() {
    this.router.navigate(['/player/dashboard']);
  }

  goToProfile() {
    this.router.navigate(['/player/profile/edit']);
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }
}

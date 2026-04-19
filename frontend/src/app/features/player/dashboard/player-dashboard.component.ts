import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SessionsService, Charge } from '../../../core/services/sessions.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-player-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <div class="court-bg">
        <div class="court-overlay"></div>
      </div>

      <!-- Page card -->
      <div class="page-card">
        <div class="card-header">
          <div>
            <h2>Welcome to Your Dashboard</h2>
            <span class="welcome">{{ auth.user()?.name }}</span>
          </div>
          <div class="balance-summary" [class.all-clear]="outstanding === 0">
            <span class="balance-icon">{{ outstanding > 0 ? '⚠️' : '✅' }}</span>
            <div>
              <div class="balance-amount">
                {{ outstanding > 0 ? (outstanding | currency) : 'All Paid' }}
              </div>
              <div class="balance-label">{{ outstanding > 0 ? 'Outstanding' : 'Balance' }}</div>
            </div>
          </div>
        </div>

        <div class="card-body">
          @if (loading) {
            <div class="loading">Loading your dashboard...</div>
          } @else {
            <!-- Quick Actions Grid -->
            <div class="grid-section">
              <h3 class="grid-title">Quick Actions</h3>
              <div class="action-grid">
                <!-- Reserve Court Card -->
                <div class="action-card reserve-court" (click)="navigateTo('/player/reserve')">
                  <div class="card-badge reserve-badge">Available</div>
                  <div class="card-icon-container">
                    <i class="fas fa-border-all card-icon"></i>
                  </div>
                  <h4>Reserve Court</h4>
                  <p>Book your next game</p>
                  <div class="card-footer">
                    <span class="card-meta">Open now →</span>
                  </div>
                </div>

                <!-- My Reservations Card -->
                <div class="action-card reservations" (click)="navigateTo('/player/reservations')">
                  <div class="card-badge reservations-badge">View</div>
                  <div class="card-icon-container">
                    <i class="fas fa-calendar-check card-icon"></i>
                  </div>
                  <h4>My Reservations</h4>
                  <p>View your bookings</p>
                  <div class="card-footer">
                    <span class="card-meta">Active 2 →</span>
                  </div>
                </div>

                <!-- Payments Card -->
                <div class="action-card payments" (click)="navigateTo('/payments')">
                  <div class="card-badge payments-badge">
                    {{ outstanding > 0 ? 'Due' : 'Paid' }}
                  </div>
                  <div class="card-icon-container">
                    <i class="fas fa-credit-card card-icon"></i>
                  </div>
                  <h4>Payments</h4>
                  <p>Manage payments</p>
                  <div class="card-footer">
                    <span class="card-meta">{{
                      outstanding > 0 ? 'Review →' : 'All clear →'
                    }}</span>
                  </div>
                </div>

                <!-- Member Directory Card -->
                <div class="action-card directory" (click)="navigateTo('/player/directory')">
                  <div class="card-badge directory-badge">Connect</div>
                  <div class="card-icon-container">
                    <i class="fas fa-users card-icon"></i>
                  </div>
                  <h4>Member Directory</h4>
                  <p>Connect with members</p>
                  <div class="card-footer">
                    <span class="card-meta">580 members →</span>
                  </div>
                </div>

                <!-- Rules & Regulations Card -->
                <div class="action-card rules" (click)="navigateTo('/rules')">
                  <div class="card-badge rules-badge">Guidelines</div>
                  <div class="card-icon-container">
                    <i class="fas fa-gavel card-icon"></i>
                  </div>
                  <h4>Rules & Regulations</h4>
                  <p>Club guidelines</p>
                  <div class="card-footer">
                    <span class="card-meta">Read →</span>
                  </div>
                </div>

                <!-- Tournaments Card (Coming Soon) -->
                <div class="action-card tournaments coming-soon">
                  <div class="card-icon-container">
                    <div style="font-size: 2.5rem;">🏆</div>
                  </div>
                  <h4>Tournaments</h4>
                  <p>Compete &amp; win</p>
                  <div class="card-footer">
                    <span class="card-meta">Stay tuned</span>
                  </div>
                </div>

                <!-- Admin Dashboard Card (only for admins) -->
                @if (auth.isAdmin()) {
                  <div class="action-card admin-dashboard" (click)="navigateTo('/admin/dashboard')">
                    <div class="card-badge admin-badge">Admin</div>
                    <div class="card-icon-container">
                      <i class="fas fa-cogs card-icon"></i>
                    </div>
                    <h4>Admin Dashboard</h4>
                    <p>Manage club</p>
                    <div class="card-footer">
                      <span class="card-meta">Manage →</span>
                    </div>
                  </div>
                }

                <!-- Site Analytics Card (only for superadmins) -->
                @if (auth.isSuperAdmin()) {
                  <div class="action-card analytics" (click)="navigateTo('/admin/analytics')">
                    <div class="card-badge analytics-badge">Analytics</div>
                    <div class="card-icon-container">
                      <div style="font-size: 2.5rem;">📊</div>
                    </div>
                    <h4>Site Analytics</h4>
                    <p>View site metrics</p>
                    <div class="card-footer">
                      <span class="card-meta">Analytics →</span>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Court Schedule Calendar -->
            <div class="grid-section">
              <h3 class="grid-title">Court Schedule</h3>
              <div class="calendar-container">
                <div class="calendar-header">
                  <button class="calendar-nav-btn" (click)="prevMonth()">‹</button>
                  <h4 class="calendar-title">{{ currentMonth | date: 'MMMM yyyy' }}</h4>
                  <button class="calendar-nav-btn" (click)="nextMonth()">›</button>
                </div>
                <div class="calendar-weekdays">
                  <div class="weekday" *ngFor="let day of weekdays">{{ day }}</div>
                </div>
                <div class="calendar-grid">
                  <div
                    *ngFor="let day of calendarDays"
                    class="calendar-day"
                    [class.other-month]="!day.currentMonth"
                    [class.today]="day.isToday"
                    [class.has-event]="day.hasEvent"
                  >
                    <span class="day-number">{{ day.date }}</span>
                    <div *ngIf="day.hasEvent" class="event-dot"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Session History -->
            <div class="grid-section">
              <h3 class="grid-title">Session History</h3>

              @if (charges.length === 0) {
                <div class="empty-state">
                  <span>🎾</span>
                  <p>No sessions recorded yet. Start playing!</p>
                </div>
              } @else {
                <div class="charge-list">
                  @for (charge of charges; track charge._id) {
                    <div class="charge-card" [class.paid]="charge.status === 'paid'">
                      <div class="charge-header">
                        <div>
                          <div class="session-date">
                            {{ charge.sessionId.date | date: 'EEE, MMM d, y' }}
                          </div>
                          <div class="session-meta">
                            {{ charge.sessionId.startTime }}
                            @if (charge.sessionId.ballBoyUsed) {
                              &nbsp;· 🙋 Ball Boy
                            }
                          </div>
                        </div>
                        <div class="charge-right">
                          <div class="charge-total">{{ charge.amount | currency }}</div>
                          <span class="status-badge status-{{ charge.status }}">{{
                            charge.status
                          }}</span>
                        </div>
                      </div>
                      <div class="charge-breakdown">
                        @if (charge.breakdown.withoutLightFee > 0) {
                          <div class="breakdown-item">
                            <span>🌙 Without Light</span>
                            <span>{{ charge.breakdown.withoutLightFee | currency }}</span>
                          </div>
                        }
                        @if (charge.breakdown.lightFee > 0) {
                          <div class="breakdown-item">
                            <span>💡 With Light</span>
                            <span>{{ charge.breakdown.lightFee | currency }}</span>
                          </div>
                        }
                        @if (charge.breakdown.ballBoyFee > 0) {
                          <div class="breakdown-item">
                            <span>🙋 Ball Boy</span>
                            <span>{{ charge.breakdown.ballBoyFee | currency }}</span>
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: auto;
      }
      .dashboard-container {
        position: relative;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
        margin: 0;
        min-height: calc(100vh - 60px);
        background: linear-gradient(135deg, rgba(0, 18, 0, 0.15), rgba(0, 18, 0, 0.05));
      }
      .court-bg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: url('/tennis-court-surface.png') center center / cover no-repeat;
        z-index: 0;
      }
      .court-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 18, 0, 0.35);
        z-index: 0;
      }
      .page-card {
        position: relative;
        z-index: 1;
        background: #fff;
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
      }
      .card-header {
        background: linear-gradient(135deg, #2d6a1f 0%, #4a8a2a 100%);
        padding: 1.5rem 2rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 1.5rem;
      }
      .card-header > div:first-child h2 {
        color: #fff;
        font-size: 1.6rem;
        font-weight: 800;
        margin: 0;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
      }
      .welcome {
        color: rgba(255, 255, 255, 0.88);
        font-size: 0.9rem;
        font-style: italic;
        display: block;
        margin-top: 0.3rem;
      }
      .balance-summary {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        background: rgba(255, 255, 255, 0.15);
        padding: 0.75rem 1rem;
        border-radius: 10px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      .balance-summary.all-clear {
        background: rgba(209, 250, 229, 0.15);
        border-color: rgba(209, 250, 229, 0.3);
      }
      .balance-icon {
        font-size: 1.5rem;
      }
      .balance-amount {
        font-size: 1rem;
        font-weight: 700;
        color: #fff;
        margin: 0;
      }
      .balance-label {
        color: rgba(255, 255, 255, 0.8);
        font-size: 0.75rem;
        margin: 0;
      }
      .card-body {
        padding: 2rem;
      }

      .loading {
        color: #666;
        padding: 2rem 0;
        text-align: center;
      }

      .grid-section {
        margin-bottom: 2.5rem;
      }
      .grid-title {
        color: #2d6a1f;
        font-size: 1.1rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.8px;
        margin: 0 0 1.5rem 0;
        display: flex;
        align-items: center;
      }
      .grid-title::before {
        content: '';
        width: 4px;
        height: 20px;
        background: linear-gradient(135deg, #2d6a1f 0%, #4a8a2a 100%);
        border-radius: 2px;
        margin-right: 0.8rem;
      }

      .action-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
        margin-bottom: 1rem;
      }
      .action-card {
        position: relative;
        background: rgba(255, 255, 255, 0.75);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.5);
        border-radius: 16px;
        padding: 1.5rem 1.25rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
        box-shadow:
          0 8px 32px rgba(0, 0, 0, 0.08),
          inset 0 1px 1px rgba(255, 255, 255, 0.6),
          inset 0 -1px 1px rgba(0, 0, 0, 0.05);
      }
      .action-card::before {
        content: '';
        position: absolute;
        top: -50%;
        right: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
        opacity: 0;
        transition: opacity 0.6s;
        pointer-events: none;
      }
      .action-card:hover::before {
        opacity: 1;
      }
      .action-card:hover {
        transform: translateY(-8px) scale(1.02);
        background: rgba(255, 255, 255, 0.95);
        border-color: rgba(255, 255, 255, 0.8);
        box-shadow:
          0 20px 48px rgba(0, 0, 0, 0.15),
          inset 0 1px 1px rgba(255, 255, 255, 0.8),
          inset 0 -1px 1px rgba(0, 0, 0, 0.08);
      }
      .action-card.reserve-court {
        border: 1px solid rgba(255, 193, 7, 0.3);
      }
      .action-card.reserve-court:hover {
        background: linear-gradient(135deg, rgba(255, 243, 199, 0.9), rgba(255, 235, 154, 0.9));
        border-color: rgba(255, 193, 7, 0.6);
        box-shadow:
          0 20px 48px rgba(255, 193, 7, 0.15),
          inset 0 1px 1px rgba(255, 255, 255, 0.8);
      }
      .action-card.reservations {
        border: 1px solid rgba(59, 130, 246, 0.3);
      }
      .action-card.reservations:hover {
        background: linear-gradient(135deg, rgba(219, 234, 254, 0.9), rgba(191, 219, 254, 0.9));
        border-color: rgba(59, 130, 246, 0.6);
        box-shadow:
          0 20px 48px rgba(59, 130, 246, 0.15),
          inset 0 1px 1px rgba(255, 255, 255, 0.8);
      }
      .action-card.payments {
        border: 1px solid rgba(34, 197, 94, 0.3);
      }
      .action-card.payments:hover {
        background: linear-gradient(135deg, rgba(209, 250, 229, 0.9), rgba(167, 243, 208, 0.9));
        border-color: rgba(34, 197, 94, 0.6);
        box-shadow:
          0 20px 48px rgba(34, 197, 94, 0.15),
          inset 0 1px 1px rgba(255, 255, 255, 0.8);
      }
      .action-card.directory {
        border: 1px solid rgba(168, 85, 247, 0.3);
      }
      .action-card.directory:hover {
        background: linear-gradient(135deg, rgba(233, 213, 255, 0.9), rgba(216, 180, 254, 0.9));
        border-color: rgba(168, 85, 247, 0.6);
        box-shadow:
          0 20px 48px rgba(168, 85, 247, 0.15),
          inset 0 1px 1px rgba(255, 255, 255, 0.8);
      }
      .action-card.rules {
        border: 1px solid rgba(249, 115, 22, 0.3);
      }
      .action-card.rules:hover {
        background: linear-gradient(135deg, rgba(254, 215, 170, 0.9), rgba(253, 186, 116, 0.9));
        border-color: rgba(249, 115, 22, 0.6);
        box-shadow:
          0 20px 48px rgba(249, 115, 22, 0.15),
          inset 0 1px 1px rgba(255, 255, 255, 0.8);
      }

      /* Admin Dashboard Card */
      .action-card.admin-dashboard {
        border: 1px solid rgba(139, 92, 246, 0.3);
      }
      .action-card.admin-dashboard:hover {
        background: linear-gradient(135deg, rgba(233, 213, 255, 0.9), rgba(216, 180, 254, 0.9));
        border-color: rgba(139, 92, 246, 0.6);
        box-shadow:
          0 20px 48px rgba(139, 92, 246, 0.15),
          inset 0 1px 1px rgba(255, 255, 255, 0.8);
      }

      /* Site Analytics Card */
      .action-card.analytics {
        border: 1px solid rgba(139, 92, 246, 0.3);
      }
      .action-card.analytics:hover {
        background: linear-gradient(135deg, rgba(217, 119, 255, 0.9), rgba(167, 139, 250, 0.9));
        border-color: rgba(139, 92, 246, 0.8);
        box-shadow:
          0 20px 48px rgba(139, 92, 246, 0.2),
          inset 0 1px 1px rgba(255, 255, 255, 0.8);
      }

      .card-badge {
        position: absolute;
        top: 0.75rem;
        right: 0.75rem;
        padding: 0.35rem 0.75rem;
        border-radius: 20px;
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        opacity: 0;
        transform: scale(0.8);
        transition: all 0.4s;
      }
      .action-card:hover .card-badge {
        opacity: 1;
        transform: scale(1);
      }
      .reserve-badge {
        background: rgba(255, 193, 7, 0.9);
        color: #8b6a00;
        box-shadow: 0 2px 8px rgba(255, 193, 7, 0.3);
      }
      .reservations-badge {
        background: rgba(59, 130, 246, 0.9);
        color: #fff;
        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
      }
      .payments-badge {
        background: rgba(34, 197, 94, 0.9);
        color: #fff;
        box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
      }
      .directory-badge {
        background: rgba(168, 85, 247, 0.9);
        color: #fff;
        box-shadow: 0 2px 8px rgba(168, 85, 247, 0.3);
      }
      .rules-badge {
        background: rgba(249, 115, 22, 0.9);
        color: #fff;
        box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
      }
      .admin-badge {
        background: rgba(139, 92, 246, 0.9);
        color: #fff;
        box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
      }
      .analytics-badge {
        background: rgba(168, 85, 247, 0.9);
        color: #fff;
        box-shadow: 0 2px 8px rgba(168, 85, 247, 0.3);
      }

      /* Tournaments Card (Coming Soon) */
      .action-card.tournaments {
        border: 1px solid rgba(20, 184, 166, 0.3);
        cursor: default;
        opacity: 0.75;
      }
      .action-card.tournaments:hover {
        transform: none;
        background: rgba(255, 255, 255, 0.75);
        border-color: rgba(20, 184, 166, 0.4);
        box-shadow:
          0 8px 32px rgba(0, 0, 0, 0.08),
          inset 0 1px 1px rgba(255, 255, 255, 0.6),
          inset 0 -1px 1px rgba(0, 0, 0, 0.05);
      }
      .action-card.tournaments:hover::before {
        opacity: 0;
      }

      .card-icon-container {
        width: 70px;
        height: 70px;
        background: linear-gradient(
          135deg,
          rgba(255, 255, 255, 0.9) 0%,
          rgba(240, 245, 250, 0.8) 100%
        );
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 0.75rem;
        box-shadow:
          0 8px 16px rgba(0, 0, 0, 0.08),
          0 -4px 8px rgba(255, 255, 255, 0.8) inset,
          0 4px 8px rgba(0, 0, 0, 0.06) inset;
        transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        position: relative;
        perspective: 1000px;
      }
      .card-icon-container::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.6), transparent);
        pointer-events: none;
      }
      .action-card:hover .card-icon-container {
        transform: scale(1.2) rotateX(10deg) rotateY(-10deg) rotateZ(5deg);
        box-shadow:
          0 16px 32px rgba(0, 0, 0, 0.15),
          0 -6px 12px rgba(255, 255, 255, 0.9) inset,
          0 6px 12px rgba(0, 0, 0, 0.08) inset,
          0 0 20px rgba(45, 106, 31, 0.2);
      }
      .card-icon {
        font-size: 2.5rem;
        display: flex !important;
        align-items: center;
        justify-content: center;
        transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        font-weight: 600;
        position: relative;
        z-index: 1;
        line-height: 1;
      }
      .action-card.reserve-court .card-icon {
        color: #f59e0b;
      }
      .action-card.reservations .card-icon {
        color: #3b82f6;
      }
      .action-card.payments .card-icon {
        color: #22c55e;
      }
      .action-card.directory .card-icon {
        color: #a855f7;
      }
      .action-card.rules .card-icon {
        color: #f97316;
      }
      .action-card.admin-dashboard .card-icon {
        color: #8b5cf6;
      }
      .action-card.reserve-court:hover .card-icon {
        transform: scale(1.3) rotateZ(-8deg);
        filter: drop-shadow(0 4px 8px rgba(245, 158, 11, 0.4));
      }
      .action-card.reservations:hover .card-icon {
        transform: scale(1.3) rotateZ(-8deg);
        filter: drop-shadow(0 4px 8px rgba(59, 130, 246, 0.4));
      }
      .action-card.payments:hover .card-icon {
        transform: scale(1.3) rotateZ(-8deg);
        filter: drop-shadow(0 4px 8px rgba(34, 197, 94, 0.4));
      }
      .action-card.directory:hover .card-icon {
        transform: scale(1.3) rotateZ(-8deg);
        filter: drop-shadow(0 4px 8px rgba(168, 85, 247, 0.4));
      }
      .action-card.rules:hover .card-icon {
        transform: scale(1.3) rotateZ(-8deg);
        filter: drop-shadow(0 4px 8px rgba(249, 115, 22, 0.4));
      }
      .action-card.admin-dashboard:hover .card-icon {
        transform: scale(1.3) rotateZ(-8deg);
        filter: drop-shadow(0 4px 8px rgba(139, 92, 246, 0.4));
      }
      .action-card h4 {
        font-size: 0.95rem;
        font-weight: 700;
        color: #1a1a1a;
        margin: 0.5rem 0 0.25rem 0;
        transition: color 0.3s;
      }
      .action-card:hover h4 {
        color: #2d6a1f;
      }
      .action-card p {
        font-size: 0.75rem;
        color: #666;
        margin: 0 0 0.75rem 0;
        font-weight: 500;
        transition: color 0.3s;
      }
      .action-card:hover p {
        color: #555;
      }
      .card-footer {
        width: 100%;
        border-top: 1px solid rgba(0, 0, 0, 0.06);
        padding-top: 0.75rem;
        margin-top: auto;
      }
      .card-meta {
        font-size: 0.78rem;
        color: #2d6a1f;
        font-weight: 600;
        opacity: 0;
        display: inline-block;
        transform: translateY(5px);
        transition: all 0.3s;
      }
      .action-card:hover .card-meta {
        opacity: 1;
        transform: translateY(0);
      }

      .empty-state {
        text-align: center;
        padding: 3rem 1rem;
        color: #666;
      }
      .empty-state span {
        font-size: 3rem;
        display: block;
        margin-bottom: 0.5rem;
      }

      .charge-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .charge-card {
        background: #fafafa;
        border-radius: 10px;
        padding: 1rem 1.25rem;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
        border-left: 4px solid #f59e0b;
      }
      .charge-card.paid {
        border-left-color: #3a7d2c;
      }
      .charge-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 0.75rem;
      }
      .session-date {
        font-weight: 600;
        color: #1a1a1a;
      }
      .session-meta {
        color: #666;
        font-size: 0.85rem;
        margin-top: 0.15rem;
      }
      .charge-right {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 0.35rem;
      }
      .charge-total {
        font-weight: 700;
        font-size: 1.1rem;
        color: #1a1a1a;
      }
      .status-badge {
        padding: 0.2rem 0.6rem;
        border-radius: 10px;
        font-size: 0.76rem;
        font-weight: 600;
        text-transform: capitalize;
      }
      .status-paid {
        background: #d1fae5;
        color: #065f46;
      }
      .status-unpaid {
        background: #fef3c7;
        color: #92400e;
      }

      .charge-breakdown {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      .breakdown-item {
        background: #f0faf0;
        border-radius: 6px;
        padding: 0.35rem 0.7rem;
        font-size: 0.82rem;
        display: flex;
        gap: 0.5rem;
        color: #555;
      }
      .breakdown-item span:last-child {
        font-weight: 600;
        color: #2d6a1f;
      }

      @media (max-width: 768px) {
        :host {
          display: block;
          width: 100%;
          min-height: 100%;
        }
        .dashboard-container {
          position: relative;
          width: 100%;
          min-height: auto;
          align-items: flex-start;
          padding: 1rem;
          padding-top: 1.5rem;
        }
        .page-card {
          max-width: 100%;
          margin-bottom: 2rem;
        }
        .card-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.25rem;
        }
        .card-header > div:first-child h2 {
          font-size: 1.3rem;
        }
        .balance-summary {
          width: 100%;
          justify-content: space-between;
        }
        .card-body {
          padding: 1.25rem;
        }
        .action-grid {
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 0.75rem;
        }
        .action-card {
          padding: 1.25rem 0.75rem;
          border-radius: 12px;
        }
        .card-icon-container {
          width: 60px;
          height: 60px;
        }
        .card-icon {
          font-size: 2.2rem;
        }
        .action-card h4 {
          font-size: 0.85rem;
        }
        .action-card p {
          font-size: 0.7rem;
        }
        .card-badge {
          top: 0.5rem;
          right: 0.5rem;
          padding: 0.25rem 0.5rem;
          font-size: 0.65rem;
        }
        .card-footer {
          padding-top: 0.5rem;
        }
        .card-meta {
          font-size: 0.7rem;
        }
      }

      @media (max-width: 480px) {
        .card-header > div:first-child h2 {
          font-size: 1.1rem;
        }
        .action-grid {
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
        }
        .action-card {
          padding: 0.85rem 0.5rem;
          border-radius: 10px;
        }
        .card-icon-container {
          width: 50px;
          height: 50px;
          margin-bottom: 0.4rem;
        }
        .card-icon {
          font-size: 1.8rem;
        }
        .action-card h4 {
          font-size: 0.75rem;
          margin: 0.3rem 0 0.1rem 0;
        }
        .action-card p {
          display: none;
        }
        .card-badge {
          display: none;
        }
        .card-footer {
          padding-top: 0.4rem;
          border-top: none;
        }
        .card-meta {
          font-size: 0.6rem;
          opacity: 1;
          transform: translateY(0);
        }
      }

      .calendar-container {
        background: rgba(255, 255, 255, 0.75);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.5);
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow:
          0 8px 32px rgba(0, 0, 0, 0.08),
          inset 0 1px 1px rgba(255, 255, 255, 0.6),
          inset 0 -1px 1px rgba(0, 0, 0, 0.05);
      }
      .calendar-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1.5rem;
        gap: 1rem;
      }
      .calendar-nav-btn {
        background: linear-gradient(135deg, #2d6a1f 0%, #4a8a2a 100%);
        color: white;
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 8px;
        font-size: 1.2rem;
        cursor: pointer;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(45, 106, 31, 0.2);
      }
      .calendar-nav-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(45, 106, 31, 0.3);
      }
      .calendar-title {
        font-size: 1.1rem;
        font-weight: 700;
        color: #2d6a1f;
        margin: 0;
        text-transform: capitalize;
        flex: 1;
        text-align: center;
      }
      .calendar-weekdays {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 0.5rem;
        margin-bottom: 0.75rem;
      }
      .weekday {
        text-align: center;
        font-weight: 700;
        color: #2d6a1f;
        font-size: 0.85rem;
        padding: 0.5rem 0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 0.5rem;
      }
      .calendar-day {
        aspect-ratio: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: #f9faf9;
        border-radius: 10px;
        cursor: pointer;
        border: 2px solid transparent;
        transition: all 0.3s;
        position: relative;
        font-weight: 600;
        color: #1a1a1a;
        font-size: 0.95rem;
      }
      .calendar-day.other-month {
        color: #ccc;
        background: #fafafa;
      }
      .calendar-day.today {
        background: linear-gradient(135deg, #2d6a1f 0%, #4a8a2a 100%);
        color: white;
        font-weight: 700;
        box-shadow: 0 4px 12px rgba(45, 106, 31, 0.3);
      }
      .calendar-day.has-event:not(.today) {
        background: linear-gradient(135deg, rgba(61, 184, 105, 0.1), rgba(45, 106, 31, 0.1));
        border-color: rgba(45, 106, 31, 0.3);
      }
      .calendar-day:hover:not(.other-month) {
        transform: scale(1.08);
        background: linear-gradient(135deg, rgba(61, 184, 105, 0.15), rgba(45, 106, 31, 0.15));
        border-color: rgba(45, 106, 31, 0.5);
        box-shadow: 0 4px 12px rgba(45, 106, 31, 0.15);
      }
      .event-dot {
        width: 5px;
        height: 5px;
        background: #3db869;
        border-radius: 50%;
        position: absolute;
        bottom: 4px;
      }
      .calendar-day.today .event-dot {
        background: rgba(255, 255, 255, 0.8);
      }

      @media (max-width: 768px) {
        .calendar-container {
          padding: 1rem;
        }
        .calendar-header {
          margin-bottom: 1rem;
        }
        .calendar-nav-btn {
          width: 36px;
          height: 36px;
          font-size: 1rem;
        }
        .calendar-title {
          font-size: 1rem;
        }
        .calendar-day {
          font-size: 0.85rem;
        }
      }

      @media (max-width: 480px) {
        .calendar-container {
          padding: 0.75rem;
        }
        .calendar-nav-btn {
          width: 30px;
          height: 30px;
          font-size: 0.9rem;
        }
        .calendar-title {
          font-size: 0.9rem;
        }
        .calendar-day {
          font-size: 0.7rem;
        }
      }
    `,
  ],
})
export class PlayerDashboardComponent implements OnInit {
  charges: Charge[] = [];
  loading = true;
  outstanding = 0;
  currentMonth = new Date();
  weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  calendarDays: any[] = [];

  constructor(
    public auth: AuthService,
    private sessionsService: SessionsService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

  ngOnInit() {
    this.generateCalendar();
    this.sessionsService.getMyCharges().subscribe({
      next: (charges) => {
        this.charges = charges;
        this.outstanding = charges
          .filter((c) => c.status === 'unpaid')
          .reduce((sum, c) => sum + c.amount, 0);
        this.generateCalendar();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  generateCalendar() {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const today = new Date();

    this.calendarDays = [];

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      this.calendarDays.push({
        date: prevMonthLastDay - i,
        currentMonth: false,
        isToday: false,
        hasEvent: false,
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const isToday =
        i === today.getDate() && month === today.getMonth() && year === today.getFullYear();
      const hasEvent = this.charges.some((c) => {
        const chargeDate = new Date(c.sessionId.date);
        return (
          chargeDate.getDate() === i &&
          chargeDate.getMonth() === month &&
          chargeDate.getFullYear() === year
        );
      });
      this.calendarDays.push({
        date: i,
        currentMonth: true,
        isToday,
        hasEvent,
      });
    }

    const remainingDays = 42 - this.calendarDays.length;
    for (let i = 1; i <= remainingDays; i++) {
      this.calendarDays.push({
        date: i,
        currentMonth: false,
        isToday: false,
        hasEvent: false,
      });
    }
  }

  prevMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1);
    this.generateCalendar();
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}

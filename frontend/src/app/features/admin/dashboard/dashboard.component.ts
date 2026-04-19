import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UsersService } from '../../../core/services/users.service';
import { SessionsService } from '../../../core/services/sessions.service';
import { forkJoin, timeout } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-header">
      <h2>Admin Dashboard</h2>
    </div>

    @if (loading) {
      <div class="loading">Loading...</div>
    } @else if (errorMsg) {
      <div class="alert alert-error">{{ errorMsg }}</div>
    } @else {
      <div class="stats-grid">
        <div class="stat-card stat-pending">
          <div class="stat-value">{{ pendingCount }}</div>
          <div class="stat-label">Pending Approvals</div>
          <a routerLink="/admin/users" class="stat-action">Review users</a>
        </div>

        <div class="stat-card stat-sessions">
          <div class="stat-value">{{ sessionCount }}</div>
          <div class="stat-label">Total Sessions</div>
          <a routerLink="/admin/sessions" class="stat-action">View sessions</a>
        </div>

        <div class="stat-card stat-unpaid">
          <div class="stat-value">{{ unpaidAmount | currency: 'USD' : 'symbol' : '1.2-2' }}</div>
          <div class="stat-label">Total Outstanding</div>
          <a routerLink="/admin/sessions" class="stat-action">View charges</a>
        </div>
      </div>

      <div class="quick-actions">
        <h3>Quick Actions</h3>
        <div class="action-grid">
          <a routerLink="/admin/sessions/new" class="action-card">
            <span class="action-icon">➕</span>
            <span>Record Session</span>
          </a>
          <a routerLink="/admin/users" class="action-card">
            <span class="action-icon">👥</span>
            <span>Manage Users</span>
          </a>
          <a routerLink="/admin/rates" class="action-card">
            <span class="action-icon">💰</span>
            <span>Update Rates</span>
          </a>
          <a routerLink="/admin/sessions" class="action-card">
            <span class="action-icon">📋</span>
            <span>Session History</span>
          </a>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .page-header {
        margin-bottom: 1.5rem;
      }
      .page-header h2 {
        color: var(--primary);
        font-size: 1.4rem;
      }
      .loading {
        color: #666;
        padding: 2rem 0;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
      }
      .stat-card {
        background: white;
        border-radius: 10px;
        padding: 1.5rem;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
        border-left: 4px solid transparent;
      }
      .stat-pending {
        border-left-color: #f59e0b;
      }
      .stat-sessions {
        border-left-color: var(--primary);
      }
      .stat-unpaid {
        border-left-color: #ef4444;
      }
      .stat-value {
        font-size: 2rem;
        font-weight: 700;
        color: #1a1a1a;
      }
      .stat-label {
        color: #666;
        font-size: 0.9rem;
        margin: 0.25rem 0 0.75rem;
      }
      .stat-action {
        color: var(--primary);
        font-size: 0.85rem;
        text-decoration: none;
        font-weight: 600;
      }
      .stat-action:hover {
        text-decoration: underline;
      }

      .quick-actions h3 {
        color: var(--primary);
        margin-bottom: 1rem;
        font-size: 1.1rem;
      }
      .action-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 0.75rem;
      }
      .action-card {
        background: white;
        border-radius: 10px;
        padding: 1.25rem;
        text-decoration: none;
        color: #333;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
        transition:
          transform 0.15s,
          box-shadow 0.15s;
        border: 2px solid transparent;
        font-size: 0.9rem;
        text-align: center;
      }
      .action-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(27, 94, 32, 0.15);
        border-color: var(--accent);
      }
      .action-icon {
        font-size: 1.75rem;
      }
    `,
  ],
})
export class AdminDashboardComponent implements OnInit {
  loading = true;
  errorMsg = '';
  pendingCount = 0;
  sessionCount = 0;
  unpaidAmount = 0;

  constructor(
    private usersService: UsersService,
    private sessionsService: SessionsService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    console.log('Dashboard ngOnInit — starting API calls');

    forkJoin({
      pending: this.usersService.getPendingUsers(),
      sessions: this.sessionsService.getSessions(),
    })
      .pipe(timeout(8000))
      .subscribe({
        next: ({ pending, sessions }) => {
          console.log('Dashboard API success', { pending, sessions });
          this.pendingCount = pending.length;
          this.sessionCount = sessions.length;
          this.unpaidAmount = sessions.reduce((total, s) => {
            const unpaid = s.players
              .filter((p) => p.status === 'unpaid')
              .reduce((sum, p) => sum + p.charges.total, 0);
            return total + unpaid;
          }, 0);
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Dashboard API error', err);
          this.loading = false;
          if (err.name === 'TimeoutError') {
            this.errorMsg =
              'Request timed out. Is the backend running? Start it with: cd c:\\Projects2\\PVTennisClub\\backend && npm start';
          } else if (err.status === 401) {
            this.errorMsg = 'Session expired — please log out and log in again.';
          } else {
            this.errorMsg = `Error ${err.status || err.message || 'unknown'}. Check browser console (F12) for details.`;
          }
          this.cdr.detectChanges();
        },
      });
  }
}

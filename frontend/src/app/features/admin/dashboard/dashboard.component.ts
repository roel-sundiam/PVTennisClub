import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UsersService } from '../../../core/services/users.service';
import { SessionsService } from '../../../core/services/sessions.service';
import { ChargesService, Charge } from '../../../core/services/charges.service';
import { forkJoin, timeout, of, catchError } from 'rxjs';

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
          <div class="stat-value">{{ unpaidAmount | currency: 'PHP' : 'symbol' : '1.2-2' }}</div>
          <div class="stat-label">Total Outstanding</div>
          <a routerLink="/admin/sessions" class="stat-action">View charges</a>
        </div>

        <div class="stat-card stat-approvals">
          <div class="stat-value">{{ pendingApprovalsCount }}</div>
          <div class="stat-label">Payment Approvals</div>
          <a routerLink="/admin/payment-approvals" class="stat-action">Review payments</a>
        </div>
      </div>

      <!-- Pending Payment Approvals Queue -->
      <div class="approvals-section">
        <div class="approvals-header">
          <h3>Payment Approvals Queue</h3>
          <a routerLink="/admin/payment-approvals" class="view-all-link">View all →</a>
        </div>
        @if (pendingApprovals.length === 0) {
          <div class="approvals-empty">✅ No payments pending approval.</div>
        } @else {
          <div class="approvals-list">
            @for (charge of pendingApprovals.slice(0, 5); track charge._id) {
              <div class="approval-row">
                <div class="approval-info">
                  <span class="approval-player">{{ getPlayerName(charge) }}</span>
                  <span class="approval-detail">
                    {{ charge.chargeType === 'reservation' ? 'Reservation' : 'Session' }}
                    @if (charge.chargeType === 'reservation' && charge.reservationId) {
                      · {{ charge.reservationId.date | date: 'MMM d' : 'UTC' }}
                    } @else if (charge.chargeType === 'session' && charge.sessionId) {
                      · {{ charge.sessionId.date | date: 'MMM d' : 'UTC' }}
                    }
                    · {{ charge.paymentMethod }}
                  </span>
                </div>
                <div class="approval-actions">
                  <span class="approval-amt">{{ charge.amount | currency: 'PHP' : 'symbol' }}</span>
                  <button class="btn-approve-sm" [disabled]="processingId === charge._id" (click)="quickApprove(charge._id)">
                    {{ processingId === charge._id ? '...' : '✓ Approve' }}
                  </button>
                  <a [routerLink]="['/admin/payment-approvals']" class="btn-review-sm">Review</a>
                </div>
              </div>
            }
            @if (pendingApprovals.length > 5) {
              <div class="approvals-overflow">
                +{{ pendingApprovals.length - 5 }} more —
                <a routerLink="/admin/payment-approvals">See all pending</a>
              </div>
            }
          </div>
        }
      </div>

      <div class="quick-actions">
        <h3>Quick Actions</h3>
        <div class="action-grid">
          <a routerLink="/admin/users" class="action-card">
            <span class="action-icon">👥</span>
            <span>Manage Users</span>
          </a>
          <a routerLink="/admin/rates" class="action-card">
            <span class="action-icon">💰</span>
            <span>Update Rates</span>
          </a>
          <a routerLink="/admin/tournaments" class="action-card">
            <span class="action-icon">🏆</span>
            <span>Tournaments</span>
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
      .stat-approvals {
        border-left-color: #f59e0b;
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

      .approvals-section {
        background: white;
        border-radius: 10px;
        padding: 1.25rem 1.5rem;
        box-shadow: 0 2px 12px rgba(0,0,0,0.07);
        border-left: 4px solid #f59e0b;
        margin-bottom: 2rem;
      }
      .approvals-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;
      }
      .approvals-header h3 {
        color: var(--primary);
        font-size: 1rem;
        margin: 0;
      }
      .view-all-link {
        color: var(--primary);
        font-size: 0.85rem;
        font-weight: 600;
        text-decoration: none;
      }
      .view-all-link:hover { text-decoration: underline; }
      .approvals-list {
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
      }
      .approval-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.65rem 0.9rem;
        background: #fffbeb;
        border: 1px solid #fde68a;
        border-radius: 8px;
        flex-wrap: wrap;
      }
      .approval-info { flex: 1; min-width: 0; }
      .approval-player { font-weight: 700; font-size: 0.9rem; color: #1a1a1a; }
      .approval-detail { font-size: 0.78rem; color: #666; margin-left: 0.5rem; }
      .approval-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-shrink: 0;
      }
      .approval-amt { font-weight: 700; font-size: 0.95rem; color: var(--primary); }
      .btn-approve-sm {
        padding: 0.35rem 0.8rem;
        background: #28a745;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 0.8rem;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s;
      }
      .btn-approve-sm:hover:not(:disabled) { background: #218838; }
      .btn-approve-sm:disabled { opacity: 0.6; cursor: not-allowed; }
      .btn-review-sm {
        padding: 0.35rem 0.8rem;
        background: white;
        color: var(--primary);
        border: 1px solid var(--primary);
        border-radius: 6px;
        font-size: 0.8rem;
        font-weight: 600;
        text-decoration: none;
        transition: all 0.15s;
      }
      .btn-review-sm:hover { background: var(--primary); color: white; }
      .approvals-empty {
        padding: 0.75rem 1rem;
        background: #f8f1e4;
        border-radius: 8px;
        color: #7a5626;
        font-size: 0.875rem;
      }
      .approvals-overflow {
        font-size: 0.82rem;
        color: #666;
        text-align: center;
        padding: 0.4rem;
      }
      .approvals-overflow a { color: var(--primary); font-weight: 600; text-decoration: none; }
      .approvals-overflow a:hover { text-decoration: underline; }

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
  pendingApprovalsCount = 0;
  pendingApprovals: Charge[] = [];
  processingId: string | null = null;

  constructor(
    private usersService: UsersService,
    private sessionsService: SessionsService,
    private chargesService: ChargesService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    console.log('Dashboard ngOnInit — starting API calls');

    forkJoin({
      pending: this.usersService.getPendingUsers(),
      sessions: this.sessionsService.getSessions(),
      approvals: this.chargesService.getPendingApprovals().pipe(catchError(() => of([]))),
    })
      .pipe(timeout(8000))
      .subscribe({
        next: ({ pending, sessions, approvals }) => {
          console.log('Dashboard API success', { pending, sessions, approvals });
          this.pendingCount = pending.length;
          this.sessionCount = sessions.length;
          this.unpaidAmount = sessions.reduce((total, s) => {
            const unpaid = s.players
              .filter((p) => p.status === 'unpaid')
              .reduce((sum, p) => sum + p.charges.total, 0);
            return total + unpaid;
          }, 0);
          this.pendingApprovalsCount = approvals.length;
          this.pendingApprovals = approvals;
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

  getPlayerName(charge: Charge): string {
    if (charge.playerId && typeof charge.playerId === 'object') {
      return (charge.playerId as any).name || 'Unknown';
    }
    return 'Unknown';
  }

  quickApprove(id: string) {
    this.processingId = id;
    this.chargesService.approvePayment(id).subscribe({
      next: (res) => {
        this.pendingApprovals = this.pendingApprovals.filter((c) => c._id !== id);
        this.pendingApprovalsCount = this.pendingApprovals.length;
        this.processingId = null;
        this.cdr.detectChanges();
      },
      error: () => {
        this.processingId = null;
        this.cdr.detectChanges();
      },
    });
  }
}


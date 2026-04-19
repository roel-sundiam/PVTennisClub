import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { UsersService, User } from '../../../core/services/users.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h2>User Management</h2>
    </div>

    <div class="tabs">
      <button [class.active]="activeTab === 'pending'" (click)="activeTab = 'pending'">
        Pending
        @if (pendingUsers.length > 0) {
          <span class="badge">{{ pendingUsers.length }}</span>
        }
      </button>
      <button [class.active]="activeTab === 'all'" (click)="activeTab = 'all'">
        All Users
      </button>
    </div>

    @if (loading) {
      <div class="loading">Loading...</div>
    } @else if (activeTab === 'pending') {
      @if (pendingUsers.length === 0) {
        <div class="empty-state">
          <span>✅</span>
          <p>No pending approvals</p>
        </div>
      } @else {
        <div class="user-list">
          @for (user of pendingUsers; track user._id) {
            <div class="user-card">
              <div class="user-info">
                <div class="user-name">{{ user.name }}</div>
                <div class="user-meta">{{ user.email }}</div>
                @if (user.contactNumber) {
                  <div class="user-meta">{{ user.contactNumber }}</div>
                }
                <div class="user-meta date">Registered {{ user.createdAt | date:'mediumDate' }}</div>
              </div>
              <div class="user-actions">
                <button class="btn-approve" (click)="approve(user)" [disabled]="processing === user._id">
                  Approve
                </button>
                <button class="btn-reject" (click)="reject(user)" [disabled]="processing === user._id">
                  Reject
                </button>
              </div>
            </div>
          }
        </div>
      }
    } @else {
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Registered</th>
            </tr>
          </thead>
          <tbody>
            @for (user of allUsers; track user._id) {
              <tr>
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td><span class="role-badge role-{{ user.role }}">{{ user.role }}</span></td>
                <td><span class="status-badge status-{{ user.status }}">{{ user.status }}</span></td>
                <td>{{ user.createdAt | date:'mediumDate' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
  styles: [`
    .page-header { margin-bottom: 1.25rem; }
    .page-header h2 { color: var(--primary); font-size: 1.4rem; }
    .loading { color: #666; padding: 2rem 0; }
    .tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.25rem;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 0;
    }
    .tabs button {
      background: none;
      border: none;
      padding: 0.6rem 1.2rem;
      font-size: 0.95rem;
      cursor: pointer;
      color: #666;
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .tabs button.active { color: var(--primary); border-bottom-color: var(--primary); font-weight: 600; }
    .badge {
      background: #f59e0b;
      color: white;
      border-radius: 10px;
      padding: 0 0.4rem;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #666;
      font-size: 1rem;
    }
    .empty-state span { font-size: 2.5rem; display: block; margin-bottom: 0.5rem; }
    .user-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .user-card {
      background: white;
      border-radius: 10px;
      padding: 1rem 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.07);
      gap: 1rem;
    }
    .user-name { font-weight: 600; color: #1a1a1a; }
    .user-meta { color: #666; font-size: 0.85rem; }
    .user-meta.date { margin-top: 0.2rem; }
    .user-actions { display: flex; gap: 0.5rem; flex-shrink: 0; }
    .btn-approve, .btn-reject {
      padding: 0.45rem 1rem;
      border-radius: 6px;
      border: none;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s;
      min-height: 44px;
    }
    .btn-approve { background: var(--primary); color: white; }
    .btn-reject { background: #ef4444; color: white; }
    .btn-approve:hover { opacity: 0.85; }
    .btn-reject:hover { opacity: 0.85; }
    .btn-approve:disabled, .btn-reject:disabled { opacity: 0.5; cursor: not-allowed; }

    .table-wrapper { overflow-x: auto; }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.07);
    }
    .data-table th {
      background: #f8faf8;
      padding: 0.75rem 1rem;
      text-align: left;
      font-size: 0.85rem;
      color: #555;
      border-bottom: 1px solid #e5e7eb;
    }
    .data-table td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #f3f4f6;
      font-size: 0.9rem;
    }
    .data-table tr:last-child td { border-bottom: none; }
    .role-badge, .status-badge {
      padding: 0.2rem 0.6rem;
      border-radius: 10px;
      font-size: 0.78rem;
      font-weight: 600;
      text-transform: capitalize;
    }
    .role-admin { background: #dbeafe; color: #1e40af; }
    .role-player { background: #d1fae5; color: #065f46; }
    .status-active { background: #d1fae5; color: #065f46; }
    .status-pending { background: #fef3c7; color: #92400e; }
    .status-rejected { background: #fee2e2; color: #991b1b; }

    @media (max-width: 600px) {
      .user-card { flex-direction: column; align-items: flex-start; }
      .user-actions { width: 100%; }
      .btn-approve, .btn-reject { flex: 1; }
    }
  `]
})
export class AdminUsersComponent implements OnInit {
  activeTab: 'pending' | 'all' = 'pending';
  pendingUsers: User[] = [];
  allUsers: User[] = [];
  loading = true;
  processing: string | null = null;

  constructor(private usersService: UsersService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    forkJoin({
      pending: this.usersService.getPendingUsers(),
      all: this.usersService.getAllUsers()
    }).subscribe({
      next: ({ pending, all }) => {
        this.pendingUsers = pending;
        this.allUsers = all;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  approve(user: User) {
    this.processing = user._id;
    this.usersService.approveUser(user._id).subscribe({
      next: () => { this.processing = null; this.loadData(); },
      error: () => { this.processing = null; }
    });
  }

  reject(user: User) {
    this.processing = user._id;
    this.usersService.rejectUser(user._id).subscribe({
      next: () => { this.processing = null; this.loadData(); },
      error: () => { this.processing = null; }
    });
  }
}

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RatesService } from '../../../core/services/rates.service';

@Component({
  selector: 'app-admin-rates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h2>Rate Management</h2>
      <p class="subtitle">Configure court usage pricing</p>
    </div>

    @if (loading) {
      <div class="loading">Loading current rates...</div>
    } @else {
      <div class="rates-card">
        <form (ngSubmit)="onSave()" #f="ngForm">
          <div class="rates-grid">
            <div class="rate-item">
              <div class="rate-icon">🌙</div>
              <div class="form-group">
                <label for="withoutLightRate">Without Light Rate (per game per player)</label>
                <div class="input-prefix">
                  <span>$</span>
                  <input
                    id="withoutLightRate"
                    type="number"
                    [(ngModel)]="withoutLightRate"
                    name="withoutLightRate"
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div class="rate-item">
              <div class="rate-icon">💡</div>
              <div class="form-group">
                <label for="lightRate">With Light Rate (per game per player)</label>
                <div class="input-prefix">
                  <span>$</span>
                  <input
                    id="lightRate"
                    type="number"
                    [(ngModel)]="lightRate"
                    name="lightRate"
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div class="rate-item">
              <div class="rate-icon">🎯</div>
              <div class="form-group">
                <label for="training2WithoutLightRate"
                  >Training 2 Without Light Rate (per game per player)</label
                >
                <div class="input-prefix">
                  <span>$</span>
                  <input
                    id="training2WithoutLightRate"
                    type="number"
                    [(ngModel)]="training2WithoutLightRate"
                    name="training2WithoutLightRate"
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div class="rate-item">
              <div class="rate-icon">🏟️</div>
              <div class="form-group">
                <label for="training2LightRate"
                  >Training 2 With Light Rate (per game per player)</label
                >
                <div class="input-prefix">
                  <span>$</span>
                  <input
                    id="training2LightRate"
                    type="number"
                    [(ngModel)]="training2LightRate"
                    name="training2LightRate"
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div class="rate-item">
              <div class="rate-icon">🙋</div>
              <div class="form-group">
                <label for="ballBoyRate">Ball Boy Fee (per game per player)</label>
                <div class="input-prefix">
                  <span>$</span>
                  <input
                    id="ballBoyRate"
                    type="number"
                    [(ngModel)]="ballBoyRate"
                    name="ballBoyRate"
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Reservation Court Fees -->
          <div class="section-divider">
            <span>Court Reservation Fees (per hour)</span>
          </div>
          <div class="rates-grid">
            <div class="rate-item">
              <div class="rate-icon">⚡</div>
              <div class="form-group">
                <label for="reservationPeakRate">Peak Rate — 5 AM, 6–9 PM (per hour)</label>
                <div class="input-prefix">
                  <span>$</span>
                  <input
                    id="reservationPeakRate"
                    type="number"
                    [(ngModel)]="reservationPeakRate"
                    name="reservationPeakRate"
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div class="rate-item">
              <div class="rate-icon">🌤️</div>
              <div class="form-group">
                <label for="reservationNonPeakRate">Non-Peak Rate — all other slots (per hour)</label>
                <div class="input-prefix">
                  <span>$</span>
                  <input
                    id="reservationNonPeakRate"
                    type="number"
                    [(ngModel)]="reservationNonPeakRate"
                    name="reservationNonPeakRate"
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          @if (lastUpdated) {
            <p class="last-updated">Last updated: {{ lastUpdated | date: 'medium' }}</p>
          }

          @if (successMsg) {
            <div class="alert alert-success">{{ successMsg }}</div>
          }
          @if (errorMsg) {
            <div class="alert alert-error">{{ errorMsg }}</div>
          }

          <div class="form-actions">
            <button type="submit" class="btn-primary" [disabled]="saving">
              {{ saving ? 'Saving...' : 'Save Rates' }}
            </button>
          </div>
        </form>
      </div>

      <div class="billing-preview">
        <h3>Billing Formula Preview</h3>
        <div class="formula-card">
          <div class="formula-row">
            <span>🌙 Without Light Fee</span>
            <span>= games without light × {{ withoutLightRate | currency }}</span>
          </div>
          <div class="formula-row">
            <span>💡 With Light Fee</span>
            <span>= games with light × {{ lightRate | currency }}</span>
          </div>
          <div class="formula-row">
            <span>🎯 Training 2 Without Light</span>
            <span>= games × {{ training2WithoutLightRate | currency }}</span>
          </div>
          <div class="formula-row">
            <span>🏟️ Training 2 With Light</span>
            <span>= games × {{ training2LightRate | currency }}</span>
          </div>
          <div class="formula-row">
            <span>🙋 Ball Boy Fee (if used)</span>
            <span>= total games × {{ ballBoyRate | currency }}</span>
          </div>
          <div class="formula-row highlight-peak">
            <span>⚡ Reservation — Peak slot</span>
            <span>= {{ reservationPeakRate | currency }} / hr</span>
          </div>
          <div class="formula-row highlight-nonpeak">
            <span>🌤️ Reservation — Non-peak slot</span>
            <span>= {{ reservationNonPeakRate | currency }} / hr</span>
          </div>
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
      .subtitle {
        color: #666;
        font-size: 0.9rem;
        margin-top: 0.25rem;
      }
      .loading {
        color: #666;
        padding: 2rem 0;
      }
      .rates-card {
        background: white;
        border-radius: 12px;
        padding: 1.75rem;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
        margin-bottom: 1.5rem;
      }
      .rates-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1.25rem;
        margin-bottom: 1rem;
      }
      .rate-item {
        display: flex;
        gap: 0.75rem;
        align-items: flex-start;
      }
      .rate-icon {
        font-size: 1.75rem;
        margin-top: 1.5rem;
      }
      .input-prefix {
        display: flex;
        align-items: center;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        overflow: hidden;
      }
      .input-prefix span {
        padding: 0.6rem 0.75rem;
        background: #f9fafb;
        border-right: 1px solid #d1d5db;
        color: #555;
        font-size: 0.95rem;
      }
      .input-prefix input {
        border: none;
        padding: 0.6rem 0.75rem;
        width: 100%;
        font-size: 1rem;
      }
      .input-prefix input:focus {
        outline: none;
      }
      .last-updated {
        color: #888;
        font-size: 0.82rem;
        margin-bottom: 1rem;
      }
      .form-actions {
        margin-top: 1.25rem;
      }
      .billing-preview {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
      }
      .billing-preview h3 {
        color: var(--primary);
        font-size: 1rem;
        margin-bottom: 1rem;
      }
      .formula-card {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .formula-row {
        display: flex;
        justify-content: space-between;
        padding: 0.6rem 0.75rem;
        background: #f8faf8;
        border-radius: 6px;
        font-size: 0.9rem;
      }
      .formula-row span:last-child {
        font-weight: 600;
        color: var(--primary);
      }
      .highlight-peak { background: #fff7ed; }
      .highlight-peak span:last-child { color: #c2410c; }
      .highlight-nonpeak { background: #f0f9ff; }
      .highlight-nonpeak span:last-child { color: #0369a1; }
      .section-divider {
        display: flex; align-items: center; gap: .75rem;
        margin: 1.5rem 0 1rem; color: #6b7280; font-size: .82rem; font-weight: 700; text-transform: uppercase; letter-spacing: .6px;
      }
      .section-divider::before, .section-divider::after {
        content: ''; flex: 1; height: 1px; background: #e5e7eb;
      }
    `,
  ],
})
export class AdminRatesComponent implements OnInit {
  withoutLightRate = 0;
  lightRate = 0;
  training2WithoutLightRate = 0;
  training2LightRate = 0;
  ballBoyRate = 0;
  reservationPeakRate = 0;
  reservationNonPeakRate = 0;
  lastUpdated: string | null = null;
  loading = true;
  saving = false;
  successMsg = '';
  errorMsg = '';

  constructor(
    private ratesService: RatesService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.ratesService.getRates().subscribe({
      next: (rates) => {
        this.withoutLightRate = rates.withoutLightRate;
        this.lightRate = rates.lightRate;
        this.training2WithoutLightRate = rates.training2WithoutLightRate;
        this.training2LightRate = rates.training2LightRate;
        this.ballBoyRate = rates.ballBoyRate;
        this.reservationPeakRate = rates.reservationPeakRate ?? 0;
        this.reservationNonPeakRate = rates.reservationNonPeakRate ?? 0;
        this.lastUpdated = rates.updatedAt;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onSave() {
    this.saving = true;
    this.successMsg = '';
    this.errorMsg = '';

    this.ratesService
      .updateRates({
        withoutLightRate: Number(this.withoutLightRate),
        lightRate: Number(this.lightRate),
        training2WithoutLightRate: Number(this.training2WithoutLightRate),
        training2LightRate: Number(this.training2LightRate),
        ballBoyRate: Number(this.ballBoyRate),
        reservationPeakRate: Number(this.reservationPeakRate),
        reservationNonPeakRate: Number(this.reservationNonPeakRate),
      })
      .subscribe({
        next: (rates) => {
          this.saving = false;
          this.lastUpdated = rates.updatedAt;
          this.successMsg = 'Rates updated successfully!';
          this.cdr.detectChanges();
          setTimeout(() => {
            this.successMsg = '';
            this.cdr.detectChanges();
          }, 3000);
        },
        error: (err) => {
          this.saving = false;
          this.errorMsg = err.error?.error || 'Failed to update rates.';
          this.cdr.detectChanges();
        },
      });
  }
}

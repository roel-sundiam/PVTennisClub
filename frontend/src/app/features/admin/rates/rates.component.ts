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
      <p class="subtitle">Set clear pricing rules for sessions and reservations</p>
    </div>

    @if (loading) {
      <div class="loading">Loading current rates...</div>
    } @else {
      <div class="rates-card">
        <form (ngSubmit)="onSave()" #f="ngForm">
          <div class="description-banner">
            <h3>How Pricing Is Applied</h3>
            <p>
              These values are used in player billing. Session rates are charged per game per player,
              while reservation rates are charged per court hour.
            </p>
          </div>

          <div class="section-divider">
            <span>Session Billing Rates</span>
          </div>
          <p class="section-text">
            Use these rates for court sessions recorded by admin. Light and no-light rates let you
            reflect different operational costs.
          </p>

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
                <p class="field-help">Applied when the game is played without lights.</p>
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
                <p class="field-help">Applied when lights are turned on during gameplay.</p>
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
                <p class="field-help">Training Court 2 sessions billed without light usage.</p>
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
                <p class="field-help">Training Court 2 sessions billed with light usage.</p>
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
                <p class="field-help">Optional per-game fee when a ball boy is requested.</p>
              </div>
            </div>
          </div>

          <!-- Reservation Court Fees -->
          <div class="section-divider">
            <span>Court Reservation Fees (per hour)</span>
          </div>
          <p class="section-text">
            Flat rate per hour — applies to all time slots regardless of lights.
            Mon–Thu use the weekday rate, Fri–Sun use the weekend rate.
            Players can mark a booking as a holiday to apply the holiday rate instead.
          </p>

          <div class="rates-grid">
            <div class="rate-item">
              <div class="rate-icon">📅</div>
              <div class="form-group">
                <label for="reservationWeekdayRate">Weekday Rate — Mon to Thu (per hour)</label>
                <div class="input-prefix">
                  <span>₱</span>
                  <input id="reservationWeekdayRate" type="number"
                    [(ngModel)]="reservationWeekdayRate" name="reservationWeekdayRate"
                    required min="0" step="0.01" placeholder="0.00" />
                </div>
                <p class="field-help">Flat rate applied to all time slots on weekdays.</p>
              </div>
            </div>
            <div class="rate-item">
              <div class="rate-icon">🎉</div>
              <div class="form-group">
                <label for="reservationWeekendRate">Weekend Rate — Fri to Sun (per hour)</label>
                <div class="input-prefix">
                  <span>₱</span>
                  <input id="reservationWeekendRate" type="number"
                    [(ngModel)]="reservationWeekendRate" name="reservationWeekendRate"
                    required min="0" step="0.01" placeholder="0.00" />
                </div>
                <p class="field-help">Flat rate applied to all time slots on weekends.</p>
              </div>
            </div>
            <div class="rate-item">
              <div class="rate-icon">🏖️</div>
              <div class="form-group">
                <label for="reservationHolidayRate">Holiday Rate (per hour)</label>
                <div class="input-prefix">
                  <span>₱</span>
                  <input id="reservationHolidayRate" type="number"
                    [(ngModel)]="reservationHolidayRate" name="reservationHolidayRate"
                    required min="0" step="0.01" placeholder="0.00" />
                </div>
                <p class="field-help">Applied when the player marks the booking as a holiday.</p>
              </div>
            </div>
          </div>
          <p class="section-note">💡 Lights fee uses the <strong>With Light Rate</strong> from Session Billing above.</p>

          <div class="rates-grid" style="margin-top:.75rem">
            <div class="rate-item">
              <div class="rate-icon">🧑‍🤝‍🧑</div>
              <div class="form-group">
                <label for="reservationGuestFee">Guest Fee (per guest)</label>
                <div class="input-prefix">
                  <span>₱</span>
                  <input id="reservationGuestFee" type="number"
                    [(ngModel)]="reservationGuestFee" name="reservationGuestFee"
                    required min="0" step="0.01" placeholder="0.00" />
                </div>
                <p class="field-help">Charged per non-member guest joining the court booking.</p>
              </div>
            </div>
          </div>

          <!-- Rentals -->
          <div class="section-divider"><span>Rentals (per hour)</span></div>
          <p class="section-text">
            Rates for equipment available for rent during court bookings.
          </p>
          <div class="rates-grid">
            <div class="rate-item">
              <div class="rate-icon">🎾</div>
              <div class="form-group">
                <label for="rentalBalls50Rate">Balls — 50 pcs (per hour)</label>
                <div class="input-prefix">
                  <span>₱</span>
                  <input id="rentalBalls50Rate" type="number"
                    [(ngModel)]="rentalBalls50Rate" name="rentalBalls50Rate"
                    required min="0" step="0.01" placeholder="0.00" />
                </div>
                <p class="field-help">50-piece ball set rental per booking hour.</p>
              </div>
            </div>
            <div class="rate-item">
              <div class="rate-icon">🎾</div>
              <div class="form-group">
                <label for="rentalBalls100Rate">Balls — 100 pcs (per hour)</label>
                <div class="input-prefix">
                  <span>₱</span>
                  <input id="rentalBalls100Rate" type="number"
                    [(ngModel)]="rentalBalls100Rate" name="rentalBalls100Rate"
                    required min="0" step="0.01" placeholder="0.00" />
                </div>
                <p class="field-help">100-piece ball set rental per booking hour.</p>
              </div>
            </div>
            <div class="rate-item">
              <div class="rate-icon">🤖</div>
              <div class="form-group">
                <label for="rentalBallMachineRate">Ball Machine (per hour)</label>
                <div class="input-prefix">
                  <span>₱</span>
                  <input id="rentalBallMachineRate" type="number"
                    [(ngModel)]="rentalBallMachineRate" name="rentalBallMachineRate"
                    required min="0" step="0.01" placeholder="0.00" />
                </div>
                <p class="field-help">Ball machine rental per booking hour.</p>
              </div>
            </div>
            <div class="rate-item">
              <div class="rate-icon">🏓</div>
              <div class="form-group">
                <label for="rentalRacketRate">Racket (per racket / hour)</label>
                <div class="input-prefix">
                  <span>₱</span>
                  <input id="rentalRacketRate" type="number"
                    [(ngModel)]="rentalRacketRate" name="rentalRacketRate"
                    required min="0" step="0.01" placeholder="0.00" />
                </div>
                <p class="field-help">Per racket rental per booking hour.</p>
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
            <span>= games without light × {{ withoutLightRate | currency: 'PHP' : 'symbol' }}</span>
          </div>
          <div class="formula-row">
            <span>💡 With Light Fee</span>
            <span>= games with light × {{ lightRate | currency: 'PHP' : 'symbol' }}</span>
          </div>
          <div class="formula-row">
            <span>🎯 Training 2 Without Light</span>
            <span>= games × {{ training2WithoutLightRate | currency: 'PHP' : 'symbol' }}</span>
          </div>
          <div class="formula-row">
            <span>🏟️ Training 2 With Light</span>
            <span>= games × {{ training2LightRate | currency: 'PHP' : 'symbol' }}</span>
          </div>
          <div class="formula-row">
            <span>🙋 Ball Boy Fee (if used)</span>
            <span>= total games × {{ ballBoyRate | currency: 'PHP' : 'symbol' }}</span>
          </div>
          <div class="formula-row highlight-weekday">
            <span>📅 Reservation — Weekday (Mon–Thu)</span>
            <span>= {{ reservationWeekdayRate | currency: 'PHP' : 'symbol' }} / hr</span>
          </div>
          <div class="formula-row highlight-weekend">
            <span>🎉 Reservation — Weekend (Fri–Sun)</span>
            <span>= {{ reservationWeekendRate | currency: 'PHP' : 'symbol' }} / hr</span>
          </div>
          <div class="formula-row highlight-holiday">
            <span>🏖️ Reservation — Holiday</span>
            <span>= {{ reservationHolidayRate | currency: 'PHP' : 'symbol' }} / hr</span>
          </div>
          <div class="formula-row">
            <span>💡 Reservation Lights (if requested)</span>
            <span>= + {{ lightRate | currency: 'PHP' : 'symbol' }}</span>
          </div>
          <div class="formula-row">
            <span>🧑‍🤝‍🧑 Guest Fee (per guest)</span>
            <span>= guests × {{ reservationGuestFee | currency: 'PHP' : 'symbol' }}</span>
          </div>
          <div class="formula-row">
            <span>🎾 Balls 50 pcs rental</span>
            <span>= {{ rentalBalls50Rate | currency: 'PHP' : 'symbol' }} / hr</span>
          </div>
          <div class="formula-row">
            <span>🎾 Balls 100 pcs rental</span>
            <span>= {{ rentalBalls100Rate | currency: 'PHP' : 'symbol' }} / hr</span>
          </div>
          <div class="formula-row">
            <span>🤖 Ball Machine rental</span>
            <span>= {{ rentalBallMachineRate | currency: 'PHP' : 'symbol' }} / hr</span>
          </div>
          <div class="formula-row">
            <span>🏓 Racket rental (per racket)</span>
            <span>= {{ rentalRacketRate | currency: 'PHP' : 'symbol' }} / hr</span>
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
      .description-banner {
        border: 1px solid #ead9bc;
        background: linear-gradient(135deg, #fbf6ec 0%, #f5ead6 100%);
        border-radius: 10px;
        padding: 1rem 1.1rem;
        margin-bottom: 1rem;
      }
      .description-banner h3 {
        margin: 0 0 0.35rem 0;
        color: var(--primary);
        font-size: 0.95rem;
      }
      .description-banner p {
        margin: 0;
        color: #6b7280;
        font-size: 0.86rem;
        line-height: 1.45;
      }
      .section-text {
        margin: -0.35rem 0 1rem;
        color: #6b7280;
        font-size: 0.84rem;
        line-height: 1.45;
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
      .form-group {
        width: 100%;
      }
      .rate-icon {
        font-size: 1.75rem;
        margin-top: 1.5rem;
      }
      .field-help {
        margin: 0.4rem 0 0;
        font-size: 0.78rem;
        color: #6b7280;
        line-height: 1.4;
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
      .section-note {
        font-size: .82rem; color: #6b7280; margin: .25rem 0 .75rem;
        padding: .5rem .75rem; background: #f0fdf4; border-radius: 6px; border-left: 3px solid #86efac;
      }
      .rate-sub-heading {
        font-size: .8rem; font-weight: 700; text-transform: uppercase; letter-spacing: .5px;
        color: #9f7338; margin: .75rem 0 .5rem;
      }
      .highlight-weekday { background: #f0fdf4; }
      .highlight-weekday span:last-child { color: #15803d; }
      .highlight-weekend { background: #fff7ed; }
      .highlight-weekend span:last-child { color: #c2410c; }
      .highlight-holiday { background: #fdf4ff; }
      .highlight-holiday span:last-child { color: #7e22ce; }
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
  reservationWeekdayRate = 0;
  reservationWeekendRate = 0;
  reservationHolidayRate = 0;
  reservationGuestFee = 0;
  rentalBalls50Rate = 0;
  rentalBalls100Rate = 0;
  rentalBallMachineRate = 0;
  rentalRacketRate = 0;
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
        this.reservationWeekdayRate = rates.reservationWeekdayRate ?? 0;
        this.reservationWeekendRate = rates.reservationWeekendRate ?? 0;
        this.reservationHolidayRate = rates.reservationHolidayRate ?? 0;
        this.reservationGuestFee = rates.reservationGuestFee ?? 0;
        this.rentalBalls50Rate = rates.rentalBalls50Rate ?? 0;
        this.rentalBalls100Rate = rates.rentalBalls100Rate ?? 0;
        this.rentalBallMachineRate = rates.rentalBallMachineRate ?? 0;
        this.rentalRacketRate = rates.rentalRacketRate ?? 0;
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
        reservationWeekdayRate: Number(this.reservationWeekdayRate),
        reservationWeekendRate: Number(this.reservationWeekendRate),
        reservationHolidayRate: Number(this.reservationHolidayRate),
        reservationGuestFee: Number(this.reservationGuestFee),
        rentalBalls50Rate: Number(this.rentalBalls50Rate),
        rentalBalls100Rate: Number(this.rentalBalls100Rate),
        rentalBallMachineRate: Number(this.rentalBallMachineRate),
        rentalRacketRate: Number(this.rentalRacketRate),
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

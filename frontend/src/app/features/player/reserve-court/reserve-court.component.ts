import { Component, OnInit, OnDestroy, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReservationService } from '../../../core/services/reservation.service';
import { UsersService } from '../../../core/services/users.service';
import { AuthService } from '../../../core/services/auth.service';
import { RatesService } from '../../../core/services/rates.service';

const ALL_SLOTS = [
  '5am','6am','7am','8am','9am','10am','11am',
  '12pm','1pm','2pm','3pm','4pm','5pm',
  '6pm','7pm','8pm','9pm','10pm',
];
const LIGHT_SLOTS = new Set(['5am','6pm','7pm','8pm','9pm']);

interface ActivePlayer { _id: string; name: string; email: string; }

@Component({
  selector: 'app-reserve-court',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-wrap">
      <div class="court-bg"><div class="court-overlay"></div></div>
      <div class="page-card">
        <div class="card-header">
          <button class="back-btn" (click)="goBack()">← Back</button>
          <h2>Reserve a Court</h2>
        </div>

        <div class="card-body">
          @if (successMsg) {
            <div class="alert alert-success">{{ successMsg }}</div>
          }
          @if (errorMsg) {
            <div class="alert alert-error">{{ errorMsg }}</div>
          }

          <!-- Date -->
          <div class="form-group">
            <label class="form-label">Date</label>
            <input
              type="date"
              class="form-input"
              [(ngModel)]="selectedDate"
              [min]="today"
              (change)="onDateOrCourtChange()"
            />
          </div>

          <!-- Court -->
          <div class="form-group">
            <label class="form-label">Court</label>
            <div class="court-toggle">
              <button class="court-btn" [class.active]="selectedCourt === 1" (click)="selectCourt(1)">Court 1</button>
              <button class="court-btn" [class.active]="selectedCourt === 2" (click)="selectCourt(2)">Court 2</button>
            </div>
          </div>

          <!-- Time Slot -->
          @if (selectedDate && selectedCourt) {
            <div class="form-group">
              <label class="form-label">
                Time Slot
                <span class="legend"><span class="legend-dot lights-dot"></span> with lights</span>
              </label>
              @if (loadingSlots) {
                <div class="slot-loading">Checking availability...</div>
              } @else {
                <div class="slot-grid">
                  @for (slot of allSlots; track slot) {
                    <button
                      class="slot-btn"
                      [class.selected]="selectedSlot === slot"
                      [class.booked]="bookedSlots.has(slot)"
                      [class.has-lights]="lightSlots.has(slot)"
                      [disabled]="bookedSlots.has(slot)"
                      (click)="selectSlot(slot)"
                    >
                      {{ slot }}
                      @if (lightSlots.has(slot)) { <span class="light-icon">💡</span> }
                    </button>
                  }
                </div>
              }
            </div>
          }

          <!-- Playing With -->
          <div class="form-group">
            <label class="form-label">Playing With <span class="optional">(optional)</span></label>

            <!-- Search input -->
            <div class="search-wrap" #searchWrap>
              <input
                type="text"
                class="form-input"
                placeholder="Search member by name..."
                [(ngModel)]="playerSearch"
                (input)="onSearch()"
                (focus)="onInputFocus()"
                autocomplete="off"
              />
              @if (showDropdown && filteredPlayers.length > 0) {
                <div class="dropdown">
                  @for (p of filteredPlayers; track p._id) {
                    <button class="dropdown-item" (click)="addPlayer(p)">
                      <span class="drop-name">{{ p.name }}</span>
                      <span class="drop-email">{{ p.email }}</span>
                    </button>
                  }
                </div>
              }
            </div>

            <!-- Selected players chips -->
            @if (addedPlayers.length > 0) {
              <div class="chips">
                @for (p of addedPlayers; track p._id) {
                  <span class="chip">
                    {{ p.name }}
                    <button class="chip-remove" (click)="removePlayer(p._id)">×</button>
                  </span>
                }
              </div>
            }
          </div>

          <!-- Summary + Confirm -->
          @if (selectedSlot) {
            <div class="summary-box">
              <div class="summary-row"><span>Court</span><strong>Court {{ selectedCourt }}</strong></div>
              <div class="summary-row">
                <span>Date</span>
                <strong>{{ selectedDate | date: 'EEE, MMM d, y' : 'UTC' }}</strong>
              </div>
              <div class="summary-row"><span>Time</span><strong>{{ selectedSlot }}</strong></div>
              <div class="summary-row">
                <span>Lights</span>
                <strong>{{ lightSlots.has(selectedSlot) ? 'Yes 💡' : 'No' }}</strong>
              </div>
              @if (addedPlayers.length > 0) {
                <div class="summary-row">
                  <span>Playing with</span>
                  <strong>{{ addedPlayers.map(p => p.name).join(', ') }}</strong>
                </div>
              }
              <div class="summary-divider"></div>
              <div class="summary-row fee-row">
                <span>
                  Court Fee
                  <span class="fee-tag" [class.peak]="lightSlots.has(selectedSlot)">
                    {{ lightSlots.has(selectedSlot) ? 'Peak ⚡' : 'Non-Peak 🌤️' }}
                  </span>
                </span>
                <strong class="fee-amount">
                  @if (loadingRates) { — }
                  @else { {{ computedFee | currency: 'PHP' : 'symbol' }} }
                </strong>
              </div>
            </div>

            <button class="confirm-btn" [disabled]="booking" (click)="confirm()">
              {{ booking ? 'Booking...' : 'Confirm Reservation' }}
            </button>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
    .page-wrap {
      position: relative; min-height: calc(100vh - 60px);
      display: flex; align-items: flex-start; justify-content: center;
      padding: 1.5rem;
      background: linear-gradient(135deg, rgba(0,18,0,.15), rgba(0,18,0,.05));
    }
    .court-bg {
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      background: url('/tennis-court-surface.png') center/cover no-repeat; z-index: 0;
    }
    .court-overlay { position: absolute; inset: 0; background: rgba(0,18,0,.35); z-index: 0; }
    .page-card {
      position: relative; z-index: 1; background: #fff; border-radius: 20px;
      box-shadow: 0 8px 32px rgba(0,0,0,.45); width: 100%; max-width: 560px;
    }
    .card-header {
      background: linear-gradient(135deg, #2d6a1f 0%, #4a8a2a 100%);
      padding: 1.25rem 1.5rem; display: flex; align-items: center; gap: 1rem;
      border-radius: 20px 20px 0 0;
    }
    .back-btn {
      background: rgba(255,255,255,.2); border: none; color: #fff;
      padding: .4rem .9rem; border-radius: 8px; cursor: pointer; font-size: .85rem; transition: background .2s;
    }
    .back-btn:hover { background: rgba(255,255,255,.35); }
    .card-header h2 { color: #fff; margin: 0; font-size: 1.3rem; }
    .card-body { padding: 1.75rem; display: flex; flex-direction: column; gap: 1.25rem; }

    .alert { padding: .75rem 1rem; border-radius: 8px; font-weight: 600; font-size: .9rem; }
    .alert-success { background: #d1fae5; color: #065f46; }
    .alert-error { background: #fee2e2; color: #991b1b; }

    .form-group { display: flex; flex-direction: column; gap: .5rem; }
    .form-label {
      font-size: .85rem; font-weight: 700; color: #2d6a1f;
      text-transform: uppercase; letter-spacing: .5px;
      display: flex; align-items: center; gap: .75rem;
    }
    .optional { font-size: .78rem; font-weight: 500; color: #9ca3af; text-transform: none; letter-spacing: 0; }
    .legend { display: flex; align-items: center; gap: .3rem; font-weight: 500; color: #555; text-transform: none; letter-spacing: 0; font-size: .8rem; }
    .legend-dot { width: 10px; height: 10px; border-radius: 50%; }
    .lights-dot { background: #f59e0b; }
    .form-input {
      width: 100%; box-sizing: border-box;
      padding: .6rem .9rem; border: 2px solid #e5e7eb; border-radius: 8px;
      font-size: .95rem; outline: none; transition: border-color .2s;
    }
    .form-input:focus { border-color: #2d6a1f; }

    .court-toggle { display: flex; gap: .75rem; }
    .court-btn {
      flex: 1; padding: .65rem; border: 2px solid #e5e7eb; border-radius: 10px;
      background: #f9fafb; font-size: .95rem; font-weight: 700; cursor: pointer;
      transition: all .2s; color: #374151;
    }
    .court-btn.active { border-color: #2d6a1f; background: #2d6a1f; color: #fff; }
    .court-btn:hover:not(.active) { border-color: #2d6a1f; background: #f0faf0; }

    .slot-loading { color: #666; font-size: .9rem; padding: .5rem 0; }
    .slot-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: .5rem; }
    .slot-btn {
      position: relative; padding: .6rem .4rem; border: 2px solid #e5e7eb; border-radius: 8px;
      background: #f9fafb; font-size: .88rem; font-weight: 600; cursor: pointer;
      transition: all .2s; color: #374151; display: flex; flex-direction: column; align-items: center; gap: .1rem;
    }
    .slot-btn.has-lights { border-color: #fcd34d; background: #fffbeb; }
    .slot-btn.selected { border-color: #2d6a1f; background: #2d6a1f; color: #fff; }
    .slot-btn.selected.has-lights { background: #2d6a1f; }
    .slot-btn.booked { background: #f3f4f6; color: #9ca3af; cursor: not-allowed; border-color: #e5e7eb; text-decoration: line-through; }
    .slot-btn:hover:not(.booked):not(.selected) { border-color: #2d6a1f; background: #f0faf0; }
    .light-icon { font-size: .75rem; }

    /* Player search */
    .search-wrap { position: relative; }
    .dropdown {
      position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 10;
      background: #fff; border: 2px solid #e5e7eb; border-radius: 10px;
      box-shadow: 0 8px 24px rgba(0,0,0,.12); max-height: 220px; overflow-y: auto;
    }
    .dropdown-item {
      width: 100%; display: flex; flex-direction: column; align-items: flex-start;
      padding: .65rem 1rem; border: none; background: transparent;
      cursor: pointer; transition: background .15s; text-align: left;
    }
    .dropdown-item:hover { background: #f0faf0; }
    .drop-name { font-weight: 600; color: #1a1a1a; font-size: .9rem; }
    .drop-email { color: #6b7280; font-size: .8rem; }

    .chips { display: flex; flex-wrap: wrap; gap: .4rem; margin-top: .25rem; }
    .chip {
      display: inline-flex; align-items: center; gap: .3rem;
      background: #d1fae5; color: #065f46; border-radius: 20px;
      padding: .3rem .75rem; font-size: .85rem; font-weight: 600;
    }
    .chip-remove {
      background: none; border: none; color: #065f46; cursor: pointer;
      font-size: 1.1rem; line-height: 1; padding: 0; font-weight: 700;
      opacity: .7; transition: opacity .15s;
    }
    .chip-remove:hover { opacity: 1; }

    .summary-box {
      background: #f0faf0; border: 1px solid #bbf7d0; border-radius: 12px;
      padding: 1rem 1.25rem; display: flex; flex-direction: column; gap: .5rem;
    }
    .summary-row { display: flex; justify-content: space-between; align-items: center; font-size: .9rem; color: #374151; }
    .summary-row strong { color: #1a1a1a; }
    .summary-divider { height: 1px; background: #bbf7d0; margin: .25rem 0; }
    .fee-row { font-weight: 700; }
    .fee-row span { display: flex; align-items: center; gap: .5rem; }
    .fee-tag {
      font-size: .72rem; font-weight: 700; padding: .15rem .45rem;
      border-radius: 6px; background: #dbeafe; color: #1d4ed8;
    }
    .fee-tag.peak { background: #ffedd5; color: #c2410c; }
    .fee-amount { font-size: 1.1rem; color: #2d6a1f; }

    .confirm-btn {
      width: 100%; padding: .85rem;
      background: linear-gradient(135deg, #2d6a1f 0%, #4a8a2a 100%);
      color: #fff; border: none; border-radius: 10px;
      font-size: 1rem; font-weight: 700; cursor: pointer; transition: opacity .2s;
    }
    .confirm-btn:disabled { opacity: .6; cursor: not-allowed; }
    .confirm-btn:not(:disabled):hover { opacity: .9; }

    @media (max-width: 480px) {
      .page-wrap { padding: 1rem; }
      .card-body { padding: 1.25rem; }
      .slot-grid { grid-template-columns: repeat(auto-fill, minmax(76px, 1fr)); }
    }
  `],
})
export class ReserveCourtComponent implements OnInit, OnDestroy {
  @ViewChild('searchWrap') searchWrapRef!: ElementRef<HTMLElement>;

  allSlots = ALL_SLOTS;
  lightSlots = LIGHT_SLOTS;

  selectedDate = '';
  selectedCourt: 1 | 2 | null = null;
  selectedSlot = '';
  bookedSlots = new Set<string>();
  loadingSlots = false;
  booking = false;
  successMsg = '';
  errorMsg = '';
  today = new Date().toISOString().split('T')[0];

  allActivePlayers: ActivePlayer[] = [];
  filteredPlayers: ActivePlayer[] = [];
  addedPlayers: ActivePlayer[] = [];
  playerSearch = '';
  showDropdown = false;

  peakRate = 0;
  nonPeakRate = 0;
  loadingRates = true;

  get computedFee(): number {
    if (!this.selectedSlot) return 0;
    return LIGHT_SLOTS.has(this.selectedSlot) ? this.peakRate : this.nonPeakRate;
  }

  constructor(
    private reservationService: ReservationService,
    private usersService: UsersService,
    private ratesService: RatesService,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.usersService.getActivePlayers().subscribe({
      next: (players) => {
        const myId = this.auth.user()?.id;
        this.allActivePlayers = players.filter((p) => p._id !== myId);
        this.cdr.detectChanges();
      },
    });

    this.ratesService.getRates().subscribe({
      next: (rates) => {
        this.peakRate = rates.reservationPeakRate ?? 0;
        this.nonPeakRate = rates.reservationNonPeakRate ?? 0;
        this.loadingRates = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loadingRates = false; this.cdr.detectChanges(); },
    });

    document.addEventListener('click', this.onDocClick);
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.onDocClick);
  }

  private onDocClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.search-wrap')) {
      this.showDropdown = false;
      this.cdr.detectChanges();
    }
  };

  onInputFocus() {
    this.showDropdown = true;
    this.scrollSearchIntoView();
  }

  private scrollSearchIntoView() {
    setTimeout(() => {
      this.searchWrapRef?.nativeElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  }

  onSearch() {
    const q = this.playerSearch.trim().toLowerCase();
    const addedIds = new Set(this.addedPlayers.map((p) => p._id));
    this.filteredPlayers = q
      ? this.allActivePlayers.filter(
          (p) => !addedIds.has(p._id) && p.name.toLowerCase().includes(q),
        )
      : [];
    this.showDropdown = this.filteredPlayers.length > 0;
    if (this.showDropdown) this.scrollSearchIntoView();
    this.cdr.detectChanges();
  }

  addPlayer(p: ActivePlayer) {
    if (!this.addedPlayers.find((x) => x._id === p._id)) {
      this.addedPlayers = [...this.addedPlayers, p];
    }
    this.playerSearch = '';
    this.filteredPlayers = [];
    this.showDropdown = false;
    this.cdr.detectChanges();
  }

  removePlayer(id: string) {
    this.addedPlayers = this.addedPlayers.filter((p) => p._id !== id);
    this.cdr.detectChanges();
  }

  selectCourt(court: 1 | 2) {
    this.selectedCourt = court;
    this.selectedSlot = '';
    this.onDateOrCourtChange();
  }

  onDateOrCourtChange() {
    this.selectedSlot = '';
    this.bookedSlots = new Set();
    if (!this.selectedDate || !this.selectedCourt) return;
    this.loadingSlots = true;
    this.reservationService.getAvailability(this.selectedCourt, this.selectedDate).subscribe({
      next: (res) => {
        this.bookedSlots = new Set(res.bookedSlots);
        this.loadingSlots = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingSlots = false;
        this.cdr.detectChanges();
      },
    });
  }

  selectSlot(slot: string) {
    if (this.bookedSlots.has(slot)) return;
    this.selectedSlot = slot;
    this.successMsg = '';
    this.errorMsg = '';
  }

  confirm() {
    if (!this.selectedDate || !this.selectedCourt || !this.selectedSlot) return;
    this.booking = true;
    this.errorMsg = '';
    this.successMsg = '';
    this.reservationService.create({
      court: this.selectedCourt,
      date: this.selectedDate,
      timeSlot: this.selectedSlot,
      players: this.addedPlayers.map((p) => p._id),
    }).subscribe({
      next: () => {
        this.booking = false;
        const withStr = this.addedPlayers.length
          ? ` with ${this.addedPlayers.map((p) => p.name).join(', ')}`
          : '';
        this.successMsg = `Court ${this.selectedCourt} reserved for ${this.selectedSlot}${withStr}!`;
        this.bookedSlots = new Set([...this.bookedSlots, this.selectedSlot]);
        this.selectedSlot = '';
        this.addedPlayers = [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.booking = false;
        this.errorMsg = err?.error?.error || 'Failed to book. Please try again.';
        this.cdr.detectChanges();
      },
    });
  }

  goBack() {
    this.router.navigate(['/player/dashboard']);
  }
}

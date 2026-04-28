import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../../../core/services/event';
import { NavbarComponent } from '../../../shared/components/navbar/navbar';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, NavbarComponent, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  private eventService = inject(EventService);

  metrics: any = null;
  isLoading = true;
  error = '';

  ngOnInit(): void {
    this.loadMetrics();
  }

  loadMetrics() {
    this.isLoading = true;
    this.eventService.getDashboardMetrics().subscribe({
      next: (data) => {
        this.metrics = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Erro ao carregar métricas.';
        this.isLoading = false;
      },
    });
  }
}

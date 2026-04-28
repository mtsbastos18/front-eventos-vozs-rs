import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EventService } from '../../../core/services/event';
import { EventModel } from '../../../shared/models/event';
import { NavbarComponent } from '../../../shared/components/navbar/navbar';

@Component({
  selector: 'app-landing-page',
  imports: [CommonModule, NavbarComponent, RouterLink],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPageComponent implements OnInit {
  private eventService = inject(EventService);
  private toastr = inject(ToastrService);

  events: EventModel[] = [];
  isLoading = true;
  error = '';

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents() {
    this.isLoading = true;
    this.eventService.getPublicEvents().subscribe({
      next: (data) => {
        this.events = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Não foi possível carregar os eventos. Tente mais tarde.';
        this.toastr.error('Não foi possível carregar os eventos.', 'Erro de Conexão');
        this.isLoading = false;
        console.error(err);
      },
    });
  }
}

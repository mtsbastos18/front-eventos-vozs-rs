import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EventService } from '../../../core/services/event';
import { Participant } from '../../../shared/models/participant';
import { EventModel } from '../../../shared/models/event';
import { NavbarComponent } from '../../../shared/components/navbar/navbar';

@Component({
  selector: 'app-participant-list',
  imports: [CommonModule, NavbarComponent, RouterLink],
  templateUrl: './participant-list.html',
  styleUrl: './participant-list.css',
})
export class ParticipantListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);
  private toastr = inject(ToastrService);

  eventId!: number;
  event: EventModel | null = null;
  participants: Participant[] = [];
  isLoading = true;
  error = '';

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.eventId = +idParam;
      this.loadData();
    }
  }

  loadData() {
    this.isLoading = true;

    // Load event details
    this.eventService.getEventById(this.eventId).subscribe({
      next: (eventData) => {
        this.event = eventData;
      },
      error: () => {
        this.error = 'Erro ao carregar detalhes do evento.';
        this.toastr.error('Não foi possível carregar os detalhes do evento.', 'Erro');
      },
    });

    // Load participants
    this.eventService.getEventParticipants(this.eventId).subscribe({
      next: (data) => {
        this.participants = data;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Erro ao carregar lista de inscritos.';
        this.toastr.error('Não foi possível carregar a lista de inscritos.', 'Erro');
        this.isLoading = false;
      },
    });
  }
}

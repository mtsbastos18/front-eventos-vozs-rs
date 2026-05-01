import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxMaskPipe } from 'ngx-mask';
import { EventService } from '../../../core/services/event';
import { Participant } from '../../../shared/models/participant';
import { EventModel } from '../../../shared/models/event';
import { NavbarComponent } from '../../../shared/components/navbar/navbar';

@Component({
  selector: 'app-participant-list',
  imports: [CommonModule, NavbarComponent, RouterLink, NgxMaskPipe],
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
  deletingParticipantId: number | null = null;

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

  deleteParticipant(participantId: number): void {
    if (confirm('Tem certeza que deseja remover este participante?')) {
      this.deletingParticipantId = participantId;
      this.eventService.deleteParticipant(this.eventId, participantId).subscribe({
        next: () => {
          this.participants = this.participants.filter((p) => p.id !== participantId);
          this.toastr.success('Participante removido com sucesso!', 'Sucesso');
          this.deletingParticipantId = null;
        },
        error: () => {
          this.toastr.error('Erro ao remover o participante.', 'Erro');
          this.deletingParticipantId = null;
        },
      });
    }
  }
}

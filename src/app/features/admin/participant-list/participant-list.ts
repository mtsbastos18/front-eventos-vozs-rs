import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxMaskPipe } from 'ngx-mask';
import { EventService } from '../../../core/services/event';
import { Participant } from '../../../shared/models/participant';
import { EventModel } from '../../../shared/models/event';
import { NavbarComponent } from '../../../shared/components/navbar/navbar';

@Component({
  selector: 'app-participant-list',
  imports: [CommonModule, FormsModule, NavbarComponent, RouterLink, NgxMaskPipe],
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
  filteredParticipants: Participant[] = [];
  isLoading = true;
  error = '';
  deletingParticipantId: number | null = null;

  searchTerm: string = '';

  // Paginação
  currentPage: number = 1;
  pageSize: number = 10;
  get totalPages(): number {
    return Math.ceil(this.filteredParticipants.length / this.pageSize) || 1;
  }
  get paginatedParticipants(): Participant[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredParticipants.slice(start, start + this.pageSize);
  }

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
        this.filteredParticipants = data;
        this.isLoading = false;
        this.currentPage = 1;
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
          this.filteredParticipants = this.filteredParticipants.filter(
            (p) => p.id !== participantId,
          );
          this.toastr.success('Participante removido com sucesso!', 'Sucesso');
          this.deletingParticipantId = null;
          // Ajusta página se necessário
          if (this.paginatedParticipants.length === 0 && this.currentPage > 1) {
            this.currentPage--;
          }
        },
        error: () => {
          this.toastr.error('Erro ao remover o participante.', 'Erro');
          this.deletingParticipantId = null;
        },
      });
    }
  }

  exportParticipants(): void {
    if (!this.eventId) return;
    this.eventService.exportEventParticipants(this.eventId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inscritos-${this.event?.slug}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.toastr.error('Erro ao exportar participantes.', 'Erro');
      },
    });
  }

  onSearchTermChange(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredParticipants = this.participants;
      this.currentPage = 1;
      return;
    }
    this.filteredParticipants = this.participants.filter((p) => {
      return (
        (p.name && p.name.toLowerCase().includes(term)) ||
        (p.email && p.email.toLowerCase().includes(term)) ||
        (p.phone && p.phone.toLowerCase().includes(term)) ||
        (p.document && p.document.toLowerCase().includes(term)) ||
        (p.company && p.company.toLowerCase().includes(term)) ||
        (p.position && p.position.toLowerCase().includes(term)) ||
        (p.city && p.city.toLowerCase().includes(term))
      );
    });
    this.currentPage = 1;
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }
}

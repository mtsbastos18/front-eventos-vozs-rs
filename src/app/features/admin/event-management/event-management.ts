import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { EventService } from '../../../core/services/event';
import { EventModel } from '../../../shared/models/event';
import { NavbarComponent } from '../../../shared/components/navbar/navbar';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-event-management',
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent, RouterLink],
  templateUrl: './event-management.html',
  styleUrl: './event-management.css',
})
export class EventManagementComponent implements OnInit {
  private eventService = inject(EventService);
  private fb = inject(FormBuilder);
  private toastr = inject(ToastrService);

  events: EventModel[] = [];
  isLoading = true;
  isSubmitting = false;
  error = '';

  showForm = false;
  isEditing = false;
  editingId: number | null = null;

  eventForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    date: ['', Validators.required],
    location: ['', Validators.required],
    capacity: ['', [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents() {
    this.isLoading = true;
    this.eventService.getAdminEvents().subscribe({
      next: (data) => {
        this.events = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Erro ao carregar eventos.';
        this.isLoading = false;
      },
    });
  }

  openCreateForm() {
    this.isEditing = false;
    this.editingId = null;
    this.eventForm.reset();
    this.showForm = true;
  }

  openEditForm(event: EventModel) {
    this.isEditing = true;
    this.editingId = event.id;
    // Format date for datetime-local input
    const dateFormatted = event.date ? new Date(event.date).toISOString().slice(0, 16) : '';

    this.eventForm.patchValue({
      title: event.title,
      description: event.description,
      date: dateFormatted,
      location: event.location,
      capacity: event.capacity,
    });
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.eventForm.reset();
  }

  onSubmit() {
    if (this.eventForm.invalid) return;

    this.isSubmitting = true;
    const eventData = this.eventForm.value;

    if (this.isEditing && this.editingId) {
      this.eventService.updateEvent(this.editingId, eventData).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.toastr.success('Evento atualizado com sucesso!', 'Sucesso');
          this.loadEvents();
          this.closeForm();
        },
        error: () => {
          this.isSubmitting = false;
          this.toastr.error('Erro ao atualizar evento.', 'Erro');
        },
      });
    } else {
      this.eventService.createEvent(eventData).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.toastr.success('Evento criado com sucesso!', 'Sucesso');
          this.loadEvents();
          this.closeForm();
        },
        error: () => {
          this.isSubmitting = false;
          this.toastr.error('Erro ao criar evento.', 'Erro');
        },
      });
    }
  }

  deleteEvent(id: number) {
    if (confirm('Tem certeza que deseja excluir este evento?')) {
      this.eventService.deleteEvent(id).subscribe({
        next: () => {
          this.toastr.success('Evento excluído com sucesso!', 'Sucesso');
          this.loadEvents();
        },
        error: () => this.toastr.error('Erro ao excluir evento.', 'Erro'),
      });
    }
  }
}

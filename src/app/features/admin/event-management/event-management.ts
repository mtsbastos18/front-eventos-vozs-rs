import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { QuillModule } from 'ngx-quill';
import { EventService } from '../../../core/services/event';
import { EventModel } from '../../../shared/models/event';
import { NavbarComponent } from '../../../shared/components/navbar/navbar';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-event-management',
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent, RouterLink, QuillModule],
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
    subtitle: ['', [Validators.maxLength(255)]],
    description: ['', Validators.required],
    date: ['', Validators.required],
    location: ['', Validators.required],
    capacity: ['', [Validators.required, Validators.min(1)]],
    image: [null],
  });

  showPostEventForm = false;
  selectedPostEventId: number | null = null;
  selectedVideo: File | null = null;
  selectedImages: File[] = [];

  postEventForm: FormGroup = this.fb.group({
    description: ['', Validators.required],
    flickrUrl: ['', [Validators.pattern('https?://(www.)?flickr.com/.*')]],
  });
  updatePostEvent: boolean = false;

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
      subtitle: event.subtitle || '',
      description: event.description,
      date: dateFormatted,
      location: event.location,
      capacity: event.capacity,
      image: null,
    });
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.eventForm.reset();
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.eventForm.patchValue({ image: file });
    }
  }

  onSubmit() {
    if (this.eventForm.invalid) return;

    this.isSubmitting = true;

    const formData = new FormData();
    const formValue = this.eventForm.value;

    Object.keys(formValue).forEach((key) => {
      const value = formValue[key];
      if (value !== null && value !== undefined && value !== '') {
        formData.append(key, value);
      }
    });

    if (this.isEditing && this.editingId) {
      this.eventService.updateEvent(this.editingId, formData).subscribe({
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
      this.eventService.createEvent(formData).subscribe({
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

  openPostEventForm(event: EventModel) {
    this.postEventForm.reset();

    this.eventService.getPostEventDetails(event.id.toString()).subscribe({
      next: (response) => {
        this.postEventForm.patchValue({
          description: response.description || '',
        });
        this.selectedPostEventId = event.id;
        this.selectedVideo = null;
        this.selectedImages = [];
        this.showPostEventForm = true;
        this.updatePostEvent = true;
      },
      error: () => {
        this.selectedPostEventId = event.id;
        this.selectedVideo = null;
        this.selectedImages = [];
        this.showPostEventForm = true;
      },
    });
  }

  closePostEventForm() {
    this.showPostEventForm = false;
    this.selectedPostEventId = null;
    this.selectedVideo = null;
    this.selectedImages = [];
    this.postEventForm.reset();
  }

  onVideoSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedVideo = file;
    }
  }

  onImagesSelected(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (files) {
      this.selectedImages = Array.from(files); // Converte o FileList para Array
    }
  }

  onSubmitPostEvent() {
    if (this.postEventForm.invalid || !this.selectedPostEventId) return;

    this.isSubmitting = true;
    const formData = new FormData();

    // Adiciona a descrição
    formData.append('description', this.postEventForm.get('description')?.value);
    formData.append('flickrUrl', this.postEventForm.get('flickrUrl')?.value);

    // Adiciona o vídeo se existir
    if (this.selectedVideo) {
      formData.append('video', this.selectedVideo);
    }

    // Adiciona as imagens como um array (images[])
    this.selectedImages.forEach((image) => {
      formData.append('images[]', image);
    });

    this.eventService.savePostEventDetail(this.selectedPostEventId, formData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.toastr.success('Detalhes pós-evento salvos com sucesso!', 'Sucesso');
        this.closePostEventForm();
        this.loadEvents(); // Recarrega a tabela se necessário
      },
      error: () => {
        this.isSubmitting = false;
        this.toastr.error('Erro ao salvar os detalhes do evento.', 'Erro');
      },
    });
  }
}

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxMaskDirective } from 'ngx-mask';
import { EventService } from '../../../core/services/event';
import { EventModel } from '../../../shared/models/event';
import { NavbarComponent } from '../../../shared/components/navbar/navbar';

@Component({
  selector: 'app-event-details',
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent, RouterLink, NgxMaskDirective],
  templateUrl: './event-details.html',
  styleUrl: './event-details.css',
})
export class EventDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);
  private fb = inject(FormBuilder);
  private toastr = inject(ToastrService);

  event: EventModel | null = null;
  isLoading = true;
  error = '';

  registrationForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
  });

  isSubmitting = false;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.loadEventDetails(+idParam);
    } else {
      this.error = 'ID do evento não fornecido.';
      this.isLoading = false;
    }
  }

  loadEventDetails(id: number) {
    this.isLoading = true;
    this.eventService.getPublicEventById(id).subscribe({
      next: (data) => {
        this.event = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Não foi possível carregar os detalhes do evento.';
        this.isLoading = false;
        console.error(err);
      },
    });
  }

  get isSoldOut(): boolean {
    if (!this.event) return false;
    return (this.event.registeredCount || 0) >= this.event.capacity;
  }

  onSubmit() {
    if (this.registrationForm.invalid || !this.event) return;

    this.isSubmitting = true;

    // Converte os dados do formulário para bater com o esperado pela API
    const formData = this.registrationForm.value;
    const participantData = {
      name: formData.name,
      email: formData.email,
      document: formData.cpf, // cpf renomeado para document
      event_id: this.event.id,
    };

    this.eventService.registerParticipant(participantData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.toastr.success(
          'Você receberá um e-mail de confirmação em breve.',
          'Inscrição realizada!',
        );
        this.registrationForm.reset();

        // Atualiza a contagem localmente após inscrição
        if (this.event) {
          this.event.registeredCount = (this.event.registeredCount || 0) + 1;
        }
      },
      error: (err) => {
        console.log('Erro na inscrição:', err);
        this.isSubmitting = false;
        this.toastr.error(
          err.error?.message || 'Erro ao realizar inscrição. Tente novamente.',
          'Erro',
        );
      },
    });
  }
}

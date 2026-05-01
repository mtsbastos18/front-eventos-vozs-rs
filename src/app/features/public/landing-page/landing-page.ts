import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EventService } from '../../../core/services/event';
import { EventModel } from '../../../shared/models/event';
import { NavbarComponent } from '../../../shared/components/navbar/navbar';
import { environment } from '../../../../environments/environment';

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
  storageUrl = environment.storageUrl;

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

  stripHtml(html: string, maxLength: number = 10): string {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const text = this.cleanDescription(doc.body.textContent || '') || '';
    console.log('Original text:', text.length);
    console.log('size:', maxLength);
    if (text.length > maxLength) {
      console.log('Truncating text:', text);
      return text.substring(0, maxLength).trim() + '...';
    }
    return text;
  }

  cleanDescription(html: string) {
    // Substitui todos os non-breaking spaces por espaços normais
    const text = html.replace(/&nbsp;/g, ' ');
    console.log('Cleaned text:', text);
    console.log('Cleaned text length:', text.length);
    if (text.length > 150) {
      return text.substring(0, 180).trim() + '...';
    }
    return text;
  }
}

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { EventService } from '../../../core/services/event';
import { NavbarComponent } from '../../../shared/components/navbar/navbar';
import { environment } from '../../../../environments/environment';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-past-event',
  imports: [CommonModule, NavbarComponent, RouterLink, SafeHtmlPipe],
  templateUrl: './past-event.html',
  styleUrl: './past-event.css',
})
export class PastEventComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);
  private sanitizer = inject(DomSanitizer);

  event: any | null = null; // Usando any caso a model ainda não tenha os campos de video e galeria
  isLoading = true;
  error = '';
  storageUrl = environment.storageUrl;

  // Variáveis para as novas seções
  videoUrl: SafeResourceUrl | null = null;
  galleryImages: string[] = [];
  postEventData: any;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.loadEventDetails(idParam);
    } else {
      this.error = 'ID do evento não fornecido.';
      this.isLoading = false;
    }
  }

  loadEventDetails(id: string) {
    this.isLoading = true;

    const handleRequests$ = {
      event: this.eventService.getPublicEventById(id),
      postEvent: this.eventService.getPostEventDetails(id),
    };

    // forkJoin(handleRequests$).subscribe({
    //   next: ({ event, postEvent }) => {
    //     this.event = event;
    //     console.log('Detalhes do evento:', event);
    //     console.log('Detalhes pós-evento:', postEvent);
    //   },
    //   error: (err) => {
    //     this.error = 'Não foi possível carregar os detalhes do evento passado.';
    //     console.error(err);
    //   },
    // });

    // Utilize o serviço apropriado de busca (ex: getPublicEventById)
    this.eventService.getPublicEventById(id).subscribe({
      next: (data) => {
        this.event = data;
        this.eventService.getPostEventDetails(this.event.id).subscribe((response) => {
          this.postEventData = response;
          const rawVideoUrl =
            this.storageUrl + response.video_path || 'https://www.youtube.com/embed/dQw4w9WgXcQ';
          this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(rawVideoUrl);
          this.galleryImages =
            response.images.map((img: string) => `${this.storageUrl}${img}`) || [];
          console.log('imagens', this.galleryImages);
        });
        // Simulação de Link de Vídeo (Substitua por data.video_url se existir no seu backend)

        // Simulação de Galeria de Fotos (Substitua por data.gallery se existir no seu backend)
        // this.galleryImages = data.gallery || [
        //   'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
        //   'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=800&q=80',
        //   'https://images.unsplash.com/photo-1475721025870-2460665d9118?w=800&q=80',
        //   'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80',
        //   'https://images.unsplash.com/photo-1523580494112-071d16940353?w=800&q=80',
        // ];

        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Não foi possível carregar os detalhes do evento passado.';
        this.isLoading = false;
        console.error(err);
      },
    });
  }

  cleanDescription(html: string) {
    if (!html) return '';
    return html
      .replace(/&nbsp;/g, ' ')
      .replace(/\n/g, '<br>')
      .replace(/<p[^>]*><\/p>/g, '<p><br></p>');
  }
}

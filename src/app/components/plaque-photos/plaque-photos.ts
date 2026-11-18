import { Component, Input, OnInit, OnDestroy, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PhotoService } from '../../services/photo-service';
import { AuthService } from '../../services/auth-service';

const MAX_SIZE = 5 * 1024 * 1024;          // 5 MB limit
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

@Component({
  selector: 'app-plaque-photos',
  imports: [RouterLink],
  templateUrl: './plaque-photos.html',
  styleUrl: './plaque-photos.css'
})
export class PlaquePhotos implements OnInit, OnDestroy {
  @Input({ required: true }) plaqueId!: string;     // given by the parent page: <app-plaque-photos [plaqueId]="...">

  photos: any[] = [];
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  caption: string = '';
  uploading: boolean = false;
  error: string = '';
  message: string = '';
  openPhoto: any = null;          // the photo shown full size

  constructor(private photoService: PhotoService,
              public authService: AuthService) {}

  ngOnInit() {
    this.loadPhotos();
  }

  ngOnDestroy() {
    this.clearPreview();
  }

  loadPhotos() {
    this.photoService.getPhotos(this.plaqueId).subscribe({
      next: (response) => this.photos = response,
      error: () => this.error = 'Could not load the photos.'
    });
  }

  onFileChosen(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.error = '';
    this.message = '';
    this.clearPreview();
    this.selectedFile = null;

    if (!file) { return; }
    if (!ALLOWED_TYPES.includes(file.type)) {
      this.error = 'Please choose a JPG, PNG or WEBP image.';
      input.value = '';
      return;
    }
    if (file.size > MAX_SIZE) {
      this.error = 'This photo is larger than 5 MB. Please choose a smaller one.';
      input.value = '';
      return;
    }
    this.selectedFile = file;
    this.previewUrl = URL.createObjectURL(file);      // a temporary local link
  }

  upload(fileInput: HTMLInputElement) {
    if (!this.selectedFile) { return; }
    this.uploading = true;
    this.error = '';
    this.message = '';

    this.photoService.uploadPhoto(this.plaqueId, this.selectedFile, this.caption.trim()).subscribe({
      next: (photo) => {
        this.photos = [...this.photos, photo];
        this.message = 'Thanks! Your photo was added.';
        fileInput.value = '';
        this.selectedFile = null;
        this.caption = '';
        this.clearPreview();
        this.uploading = false;
      },
      error: (err) => {
        this.error = err.error?.error || 'Could not upload the photo.';
        this.uploading = false;
      }
    });
  }

  clearPreview() {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);       // free the memory the preview used
      this.previewUrl = null;
    }
  }

  deletePhoto(photo: any) {
    if (!confirm('Delete this photo?')) { return; }
    this.error = '';
    this.photoService.deletePhoto(this.plaqueId, photo._id).subscribe({
      next: () => {
        this.photos = this.photos.filter(p => p._id !== photo._id);
        this.message = 'Photo deleted.';
      },
      error: (err) => this.error = err.error?.error || 'Could not delete the photo.'
    });
  }

  canDelete(photo: any): boolean {
    return photo.username === this.authService.getUsername() || this.authService.isAdmin();
  }

  showPhoto(photo: any) {
    this.openPhoto = photo;
    setTimeout(() => document.getElementById('lightbox-close')?.focus());
  }

  closePhoto() {
    this.openPhoto = null;
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.openPhoto) { this.closePhoto(); }
  }
}

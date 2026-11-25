import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';
import { PhotoService } from '../../services/photo-service';
import { AuthService } from '../../services/auth-service';
import { ConfirmService } from '../../services/confirm-service';
import { PhotoViewer } from '../photo-viewer/photo-viewer';

const MAX_SIZE = 5 * 1024 * 1024;          // 5 MB limit
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

@Component({
  selector: 'app-plaque-photos',
  imports: [RouterLink],
  templateUrl: './plaque-photos.html',
  changeDetection: ChangeDetectionStrategy.Eager,
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

  constructor(private photoService: PhotoService,
              public authService: AuthService,
              private dialog: Dialog,
              private confirmService: ConfirmService) {}

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
    this.confirmService.ask({
      title: 'Delete this photo?',
      message: 'The photo will be removed from this plaque for everyone.',
      confirmText: 'Delete photo'
    }).subscribe(yes => {
      if (!yes) { return; }
      this.error = '';
      this.photoService.deletePhoto(this.plaqueId, photo._id).subscribe({
        next: () => {
          this.photos = this.photos.filter(p => p._id !== photo._id);
          this.message = 'Photo deleted.';
        },
        error: (err) => this.error = err.error?.error || 'Could not delete the photo.'
      });
    });
  }

  canDelete(photo: any): boolean {
    return photo.username === this.authService.getUsername() || this.authService.isAdmin();
  }

  // full-size photo in a dialog: focus stays inside, Escape or a click outside closes it,
  // and focus goes back to the photo you opened
  showPhoto(photo: any) {
    this.dialog.open(PhotoViewer, {
      data: photo,
      ariaModal: true,
      ariaLabel: 'Photo, full size',
      autoFocus: '#photo-close',
      maxWidth: '95vw',
      backdropClass: 'photo-backdrop'
    });
  }
}

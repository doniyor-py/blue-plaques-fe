import { Component, Inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

// One photo at full size, opened as a dialog from the photo grid
@Component({
  selector: 'app-photo-viewer',
  templateUrl: './photo-viewer.html',
  styleUrl: './photo-viewer.css'
})
export class PhotoViewer {
  constructor(@Inject(DIALOG_DATA) public photo: any,
              public dialogRef: DialogRef) {}
}

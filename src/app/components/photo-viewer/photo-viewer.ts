import { Component, Inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'app-photo-viewer',
  templateUrl: './photo-viewer.html',
  styleUrl: './photo-viewer.css'
})
export class PhotoViewer {
  constructor(@Inject(DIALOG_DATA) public photo: any,
              public dialogRef: DialogRef) {}
}

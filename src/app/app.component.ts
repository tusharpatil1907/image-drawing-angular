import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// import { ImageDrawingModule } from 'ngx-image-drawing';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;

  private pencil!: CanvasRenderingContext2D;
  private isDrawing = false;
  private img!: HTMLImageElement;
  color: string = 'black';
  private undoStack: ImageData[] = [];
  private redoStack: ImageData[] = [];
  fileselected: boolean = false
  isErasor:boolean = false
  ngAfterViewInit() {

    this.pencil = this.canvas.nativeElement.getContext('2d')!;


  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.img = new Image();
        this.img.src = e.target?.result as string;
        this.img.onload = () => {
          this.pencil.drawImage(this.img, 0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
          this.fileselected = true
        };
      };
      reader.readAsDataURL(file);
    }
  }

  startDrawing(event: MouseEvent) {

    console.log(event)
    this.isDrawing = true;
    this.pencil.strokeStyle = this.color;
    this.pencil.beginPath();
    this.pencil.moveTo(event.offsetX, event.offsetY);
    // saving for undoredo
    this.saveState();
  }


  stopDrawing() {
    this.isDrawing = false;
    this.pencil.closePath();
  }
 

  draw(event: MouseEvent) {
    if (!this.isDrawing) return;
    console.log('mouse is moving')
    this.pencil.lineTo(event.offsetX, event.offsetY);
    this.pencil.stroke();
  }

 


  resetCanvas() {
    this.pencil.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    if (this.img) {
      this.pencil.drawImage(this.img, 0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    }
    this.undoStack = [];
    this.redoStack = [];
  }

  private saveState() {
    let canvasData = this.pencil.getImageData(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    this.undoStack.push(canvasData);
    this.redoStack = []; 
  }

 
  undo() {
    console.log(this.undoStack)
    if (this.undoStack.length === 0) return;
    let lastState = this.undoStack.pop();
    if (lastState) {
      this.redoStack.push(this.pencil.getImageData(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height));
      this.pencil.putImageData(lastState, 0, 0);
    }
  }


  redo() {
    console.log(this.redoStack)

    if (this.redoStack.length === 0) return;
    let lastState = this.redoStack.pop();
    if (lastState) {
      this.undoStack.push(this.pencil.getImageData(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height));
      this.pencil.putImageData(lastState, 0, 0);
    }
  }


  changeColor(color: string) {
    this.color = color;
  }

  size(size:number) {
    this.pencil.globalCompositeOperation = 'source-over';
    this.pencil.lineWidth = size; 
  }

  toggleEraser() {
    this.isErasor = !this.isErasor;
  }
  
  

}




























 // draw(event: MouseEvent) {
  //   if (!this.isDrawing) return;
  
  //   if (this.isErasor) {
      
  //     this.pencil.globalCompositeOperation = 'destination-out';
  //   } else {
   
  //     this.pencil.globalCompositeOperation = 'source-over';
  //     this.pencil.strokeStyle = this.color;
  //     this.pencil.lineWidth = 5; 
  //   }
  
  //   this.pencil.lineTo(event.offsetX, event.offsetY);
  //   this.pencil.stroke();
  // }





  
  // startDrawing(event: MouseEvent) {
  //   this.isDrawing = true;
  //   this.pencil.beginPath();
  //   this.pencil.moveTo(event.offsetX, event.offsetY);
  
  //   // Reset to default drawing mode
  //   if (!this.isErasor) {
  //     this.pencil.globalCompositeOperation = 'source-over';
  //   } else {
  //     this.pencil.globalCompositeOperation = 'destination-out';
  //   }
  
  //   // Save state for undo/redo
  //   this.saveState();
  // }
  

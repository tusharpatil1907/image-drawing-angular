import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IdbService } from './idb.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements AfterViewInit{
  constructor(private idb:IdbService){}
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;

  private pencil!: CanvasRenderingContext2D;
  private isDrawing = false;
  private img!: HTMLImageElement;
  color: string = 'black';
  private undoStack: ImageData[] = [];
  private redoStack: ImageData[] = [];
  fileselected: boolean = false
  isErasor:boolean = false
  saveData(undostate:ImageData[], redostate:ImageData[]) {
    this.idb.saveArrays(undostate, redostate)
      .then(() => console.log('Arrays saved!'))
      .catch(err => console.error('Error saving arrays:', err));
  }

  async loadData() {
    await this.idb.getArrays()
      .then(data => {
        debugger;
        if(data){

          this.undoStack = data.undostate;
          this.redoStack = data.redostate;
        }
        else{
          this.undoStack = []
          this.redoStack = []
        }
      })
      .catch(err => console.error('Error retrieving arrays:', err));
  }
 
  ngAfterViewInit():void {

    this.loadData()
  


    this.pencil = this.canvas.nativeElement.getContext('2d')!;
    this.loadCanvasState();
    this.fileselected = localStorage.getItem('isImageLoaded') ==  "true" ? true:false ;
    


    

  }

  onFileSelected(event: Event):void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.img = new Image();
        this.img.src = e.target?.result as string;
        this.img.onload = () => {
          this.pencil.drawImage(this.img, 0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
          this.fileselected = true
          this.saveToLocal();
        };
      };
      reader.readAsDataURL(file);
    }
  }

  startDrawing(event: MouseEvent):void {

  
    this.isDrawing = true;
    this.pencil.strokeStyle = this.color;
    this.pencil.beginPath();
    this.pencil.moveTo(event.offsetX, event.offsetY);
   
    this.saveState();
  }


  stopDrawing():void {
    this.isDrawing = false;
    this.pencil.closePath();
    this.saveToLocal(); 

  }
 

  draw(event: MouseEvent):void {
    if (!this.isDrawing) return;
    this.pencil.lineTo(event.offsetX, event.offsetY);
    this.pencil.stroke();
  }

 

  resetCanvas():void {
    const currentImageData = this.pencil.getImageData(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    
    this.pencil.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    
    if (this.img) {
        this.pencil.drawImage(this.img, 0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    }

    this.undoStack = [];
    this.redoStack = [];

    this.saveToLocal();
}


  private saveState():void {
    let canvasData = this.pencil.getImageData(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    this.undoStack.push(canvasData);
    this.redoStack = []; 
    this.saveToLocal(); 

  }

 
  undo():void {

    console.log(this.undoStack)
    if (this.undoStack.length === 0) return;
    let lastState = this.undoStack.pop();
    if (lastState) {
      this.redoStack.push(this.pencil.getImageData(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height));
      this.pencil.putImageData(lastState, 0, 0);
      this.saveToLocal(); 
      
    }
  }


  redo() :void{

    if (this.redoStack.length === 0) return;
    let lastState = this.redoStack.pop();
    if (lastState) {
      this.undoStack.push(this.pencil.getImageData(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height));
      this.pencil.putImageData(lastState, 0, 0);

      this.saveToLocal(); 
    }
  }


  changeColor(color: string):void {
    this.color = color;
  }

  size(size:number):void {
    this.pencil.globalCompositeOperation = 'source-over';
    this.pencil.lineWidth = size; 
  }

  toggleEraser() {
    this.isErasor = !this.isErasor;
  }
  

  private saveToLocal() :void{
    const canvasData = this.canvas.nativeElement.toDataURL();
    localStorage.setItem('canvasState', canvasData);
    localStorage.setItem('isImageLoaded',this.fileselected.toString());
    this.saveData(this.undoStack,this.redoStack);
  }

  private loadCanvasState():void {
    const imageUrl = localStorage.getItem('canvasState');
    if (imageUrl) {
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => {
        this.pencil.drawImage(img, 0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
      };
      
    }

  }
  }
  






















  // const undoState = localStorage.getItem('undoStack');
  // const redoState = localStorage.getItem('redoStack');
  // if(undoState){
  //   // if(this.undoStack){
  //     this.undoStack = JSON.parse(undoState);
  //   // }
  //   }
  // if(redoState){
  //     // if(this.undoStack){
  //   this.redoStack = JSON.parse(redoState);
  //     // }
  // }




  // const storedUndoStackString = localStorage.getItem('undoStack');
    // console.log(storedUndoStackString)
    // if (storedUndoStackString !== null) {
    //     this.undoStack = JSON.parse(storedUndoStackString);
    // } else {
    //     this.undoStack = []; 
    // }
    
    // const storedRedoStackString = localStorage.getItem('redoStack');

    // if (storedRedoStackString !== null) {
    //     this.undoStack = JSON.parse(storedRedoStackString);
    // } else {
    //     this.redoStack = []; 
    // }1
    
    // console.log("the undoStack",this.undoStack)


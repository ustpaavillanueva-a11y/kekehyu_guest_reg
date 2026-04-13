import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  output,
  OnDestroy,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-signature-pad',
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="signature-container">
      <canvas #canvas class="signature-canvas"></canvas>
      <button mat-stroked-button type="button" (click)="clear()">
        <mat-icon>clear</mat-icon> Clear
      </button>
    </div>
  `,
  styles: `
    .signature-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .signature-canvas {
      border: 2px dashed #ccc;
      border-radius: 8px;
      cursor: crosshair;
      width: 100%;
      max-width: 500px;
      height: 150px;
      background: white;
      touch-action: none;
    }

    button {
      align-self: flex-start;
    }
  `,
})
export class SignaturePadComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  signatureChange = output<string>();

  private ctx!: CanvasRenderingContext2D;
  private drawing = false;
  private boundHandlers: (() => void)[] = [];

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';

    const onPointerDown = (e: PointerEvent) => {
      this.drawing = true;
      this.ctx.beginPath();
      this.ctx.moveTo(e.offsetX, e.offsetY);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!this.drawing) return;
      this.ctx.lineTo(e.offsetX, e.offsetY);
      this.ctx.stroke();
    };

    const onPointerUp = () => {
      this.drawing = false;
      this.emitSignature();
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointerleave', onPointerUp);

    this.boundHandlers.push(
      () => canvas.removeEventListener('pointerdown', onPointerDown),
      () => canvas.removeEventListener('pointermove', onPointerMove),
      () => canvas.removeEventListener('pointerup', onPointerUp),
      () => canvas.removeEventListener('pointerleave', onPointerUp)
    );
  }

  ngOnDestroy(): void {
    this.boundHandlers.forEach((fn) => fn());
  }

  clear(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.signatureChange.emit('');
  }

  private emitSignature(): void {
    const canvas = this.canvasRef.nativeElement;
    this.signatureChange.emit(canvas.toDataURL('image/png'));
  }
}

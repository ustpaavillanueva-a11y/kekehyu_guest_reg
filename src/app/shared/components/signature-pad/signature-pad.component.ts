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
    <div class="signature-wrapper" [class.has-signature]="hasSigned">
      <div class="canvas-area">
        <canvas #canvas class="signature-canvas"></canvas>
        @if (!hasSigned) {
          <div class="placeholder">
            <mat-icon>draw</mat-icon>
            <span>Sign here</span>
          </div>
        }
      </div>
      <div class="sig-actions">
        <button mat-stroked-button type="button" (click)="clear()" [disabled]="!hasSigned">
          <mat-icon>refresh</mat-icon> Clear
        </button>
      </div>
    </div>
  `,
  styles: `
    .signature-wrapper {
      border: 2px dashed #ccc;
      border-radius: 12px;
      background: #fafafa;
      overflow: hidden;
      transition: border-color 0.2s;
    }
    .signature-wrapper.has-signature {
      border-color: #28a745;
      border-style: solid;
    }
    .canvas-area {
      position: relative;
    }
    .signature-canvas {
      display: block;
      width: 100%;
      height: 180px;
      cursor: crosshair;
      background: white;
      touch-action: none;
    }
    .placeholder {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: #aaa;
      font-size: 15px;
      pointer-events: none;
    }
    .placeholder mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }
    .sig-actions {
      display: flex;
      justify-content: flex-end;
      padding: 8px 12px;
      background: #f5f5f5;
      border-top: 1px solid #eee;
    }
  `,
})
export class SignaturePadComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  signatureChange = output<string>();
  hasSigned = false;

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
      this.hasSigned = true;
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
    this.hasSigned = false;
    this.signatureChange.emit('');
  }

  private emitSignature(): void {
    const canvas = this.canvasRef.nativeElement;
    this.signatureChange.emit(canvas.toDataURL('image/png'));
  }
}

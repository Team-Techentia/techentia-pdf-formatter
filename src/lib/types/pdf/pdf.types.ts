
export interface PdfTemplateConfig {
  title: string;
  outputName: string;
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export interface PdfGenerationResult {
  blob: Blob;
  filename: string;
}

export interface CanvasPosition {
  x: number;
  y: number;
}

export interface DragState {
  isDragging: boolean;
  fieldId: string | null;
  startPosition: CanvasPosition | null;
  currentPosition: CanvasPosition | null;
}

export interface ModalState {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}
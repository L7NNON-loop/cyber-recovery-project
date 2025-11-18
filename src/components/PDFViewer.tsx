import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  fileUrl: string;
}

export const PDFViewer = ({ fileUrl }: PDFViewerProps) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }

  function changePage(offset: number) {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  return (
    <div className="flex flex-col h-full bg-card rounded-lg overflow-hidden">
      <div className="flex-1 overflow-auto bg-muted/30 flex items-center justify-center p-4">
        {loading && (
          <div className="text-muted-foreground">Carregando manual...</div>
        )}
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={(error) => console.error('Error loading PDF:', error)}
          loading=""
        >
          <Page 
            pageNumber={pageNumber}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            className="shadow-lg rounded-md"
            scale={1.2}
          />
        </Document>
      </div>
      
      {!loading && (
        <div className="flex items-center justify-between bg-card border-t border-border p-3">
          <button
            onClick={previousPage}
            disabled={pageNumber <= 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/80 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-xs">Anterior</span>
          </button>
          
          <p className="text-xs text-muted-foreground">
            Página {pageNumber} de {numPages}
          </p>
          
          <button
            onClick={nextPage}
            disabled={pageNumber >= numPages}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/80 transition-colors"
          >
            <span className="text-xs">Próxima</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

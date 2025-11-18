import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

interface PDFViewerProps {
  fileUrl: string;
}

export const PDFViewer = ({ fileUrl }: PDFViewerProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-lg overflow-hidden border border-border">
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-muted-foreground">Carregando manual...</div>
        </div>
      )}
      
      {!loading && (
        <>
          <div className="flex-1 overflow-hidden bg-muted/30">
            <iframe
              src={`${fileUrl}#page=${currentPage}&zoom=${zoom}&toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
              className="w-full h-full"
              title="Manual dos 100x"
              style={{
                border: 'none',
                borderRadius: '6px',
              }}
            />
          </div>
          
          <div className="flex items-center justify-between bg-card border-t border-border p-3 gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomOut}
                disabled={zoom <= 50}
                className="p-1.5 rounded-md bg-secondary text-secondary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/80 transition-colors"
                title="Diminuir zoom"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs text-muted-foreground min-w-[45px] text-center">
                {zoom}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={zoom >= 200}
                className="p-1.5 rounded-md bg-secondary text-secondary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/80 transition-colors"
                title="Aumentar zoom"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage <= 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/80 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="text-xs hidden sm:inline">Anterior</span>
              </button>
              
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={currentPage}
                  onChange={(e) => {
                    const page = parseInt(e.target.value);
                    if (page > 0) setCurrentPage(page);
                  }}
                  className="w-12 px-2 py-1 text-xs text-center bg-secondary text-secondary-foreground rounded border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                  min="1"
                />
                <span className="text-xs text-muted-foreground">/ ∞</span>
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                <span className="text-xs hidden sm:inline">Próxima</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

import { Card } from "@/components/ui/card";

const videos = [
  {
    id: "OiRkW-zdWo8",
    title: "Como o sistema funciona",
    subtitle: "Veja como o robô analisa o Aviator em tempo real e mostra onde vai cair"
  },
  {
    id: "VgsrvceLFiw",
    title: "Como entrar no sistema",
    subtitle: "Tutorial passo a passo de como entrar no Sistema e começar a usar"
  }
];

export const Video = () => {
  return (
    <section id="video-section" className="py-16 px-2 sm:px-4 bg-secondary/20">
      <div className="container mx-auto max-w-4xl px-2 sm:px-0">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Veja o Sistema em Ação
        </h2>
        <p className="text-center text-muted-foreground mb-10 text-base">
          Como o sistema funciona
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {videos.map((video, index) => (
            <div key={index}>
              <Card className="bg-card border-border overflow-hidden mb-4">
                <div className="relative" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${video.id}`}
                    title={video.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </Card>
              <p className="text-sm text-muted-foreground text-center">{video.subtitle}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

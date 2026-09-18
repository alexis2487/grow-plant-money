import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Lightbulb, Pause, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface FinancialTip {
  id: number;
  category: string;
  icon: string;
  title: string;
  description: string;
  takeaway: string;
}

export const FINANCIAL_TIPS: FinancialTip[] = [
  {
    id: 1,
    category: "Presupuesto",
    icon: "📊",
    title: "La regla del 50 / 30 / 20",
    description:
      "Distribuye tus ingresos netos en tres pilares: 50% para necesidades básicas indispensables (vivienda, comida, servicios), 30% para gastos personales o entretenimiento, y un mínimo del 20% para ahorro o inversión. Si tus necesidades superan el 50%, reduce los gastos opcionales antes de recortar tu ahorro.",
    takeaway: "Un presupuesto claro te permite disfrutar de tu dinero sin culpa ni estrés.",
  },
  {
    id: 2,
    category: "Ahorro",
    icon: "💰",
    title: "Págate a ti mismo primero",
    description:
      "No intentes ahorrar lo que te sobra al final del mes; gasta lo que te queda después de apartar tu ahorro. En cuanto recibas tu sueldo o ingresos, traslada automáticamente tu porcentaje de ahorro a una cuenta separada antes de pagar cualquier otra cosa.",
    takeaway: "El ahorro debe ser tu primer pago del mes, no el último.",
  },
  {
    id: 3,
    category: "Seguridad",
    icon: "🛡️",
    title: "Fondo de tranquilidad: 3 a 6 meses",
    description:
      "Construye un colchón equivalente a entre 3 y 6 meses de tus gastos básicos en una cuenta segura y accesible. Este fondo absorbe imprevistos médicos, laborales o familiares, evitando que una urgencia se convierta en una deuda costosa.",
    takeaway: "La paz mental financiera comienza teniendo un respaldo ante lo inesperado.",
  },
  {
    id: 4,
    category: "Autocontrol",
    icon: "⏳",
    title: "La regla de las 48 horas",
    description:
      "Cuando sientas el deseo de comprar algo no esencial que no estaba planificado, espera 48 horas completas antes de pagar. En la mayoría de los casos, la emoción inicial se disipa y descubrirás que en realidad no lo necesitabas.",
    takeaway: "Pausar antes de comprar elimina compras compulsivas y ahorra miles al año.",
  },
  {
    id: 5,
    category: "Crédito",
    icon: "💳",
    title: "Trata el crédito como si fuera débito",
    description:
      "Usa la tarjeta de crédito únicamente como medio de pago, nunca como dinero extra. Si pagas el valor total facturado antes de la fecha límite (sé totalero), acumulas beneficios, seguros e historial crediticio sin pagar un solo peso de interés bancario.",
    takeaway: "Paga siempre el saldo total de tu tarjeta; nunca te limites al pago mínimo.",
  },
  {
    id: 6,
    category: "Optimización",
    icon: "🔍",
    title: "Detecta y frena los gastos hormiga",
    description:
      "Pequeños gastos repetitivos como suscripciones en desuso, cafés diarios o compras impulsivas parecen inofensivos, pero sumados representan una gran fuga de liquidez al año. Revisa tus estados de cuenta mensuales y elimina todo lo que no uses con frecuencia.",
    takeaway: "Tapar pequeñas fugas invisibles equivale a un aumento de sueldo inmediato.",
  },
  {
    id: 7,
    category: "Deudas",
    icon: "🏔️",
    title: "Estrategia para eliminar deudas",
    description:
      "Paga la cuota mínima en todas tus deudas y destina todo el dinero adicional a una sola: o a la de menor saldo para ganar impulso psicológico rápido (Método Bola de Nieve), o a la de mayor interés para minimizar el costo total (Método Avalancha).",
    takeaway: "Tener un método claro te ayuda a liquidar compromisos mucho más rápido.",
  },
  {
    id: 8,
    category: "Consumo Inteligente",
    icon: "⚖️",
    title: "Calcula el costo por uso",
    description:
      "Antes de descartar un artículo de calidad por su precio, evalúa cuántas veces lo vas a utilizar. Un bien duradero que usas a diario tiene un costo por uso mínimo, mientras que artículos baratos que se rompen rápido terminan siendo mucho más costosos a largo plazo.",
    takeaway: "Prioriza durabilidad y funcionalidad sobre lo aparentemente barato.",
  },
  {
    id: 9,
    category: "Crecimiento",
    icon: "📈",
    title: "Evita la inflación del estilo de vida",
    description:
      "Cada vez que recibas un aumento de sueldo o un ingreso extraordinario, no incrementes tus gastos en la misma proporción. Destina al menos el 50% de cada nuevo ingreso a tus metas de ahorro o inversión antes de elevar tu nivel de vida.",
    takeaway: "El verdadero progreso financiero es aumentar tu patrimonio, no tus gastos fijos.",
  },
  {
    id: 10,
    category: "Planificación",
    icon: "🗓️",
    title: "Anticípate a los gastos no mensuales",
    description:
      "Impuestos, seguros anuales, matrículas o regalos de temporada no son emergencias: son gastos predecibles. Suma su costo total estimado del año, divídelo entre 12 y reserva esa cuota cada mes para que no desestabilicen tu presupuesto.",
    takeaway: "Planificar con meses de antelación evita el sobreendeudamiento de fin de año.",
  },
  {
    id: 11,
    category: "Decisiones",
    icon: "🎯",
    title: "Diferencia la deuda buena de la mala",
    description:
      "La deuda productiva financia activos o herramientas que pondrán más dinero en tu bolsillo en el futuro (educación, negocio o patrimonio con plusvalía). La deuda de consumo financia gustos pasajeros que pierden valor inmediatamente.",
    takeaway: "No comprometas meses de tu trabajo futuro en placeres que duran un fin de semana.",
  },
  {
    id: 12,
    category: "Hábitos",
    icon: "🛒",
    title: "Compras con lista estricta",
    description:
      "Ir al supermercado o de compras sin una lista definida o con apetito incrementa el gasto hasta en un 30% en productos superfluos. Planifica con anticipación y apégate estrictamente a lo anotado.",
    takeaway: "La disciplina antes de salir de casa protege tu dinero en la tienda.",
  },
];

const ROTATION_INTERVAL_MS = 60000; // 1 minuto (60 segundos)

export function DynamicFinancialTips() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const currentTip = FINANCIAL_TIPS[currentIndex];

  useEffect(() => {
    if (isPaused) return;

    const tickInterval = 500;
    const step = (tickInterval / ROTATION_INTERVAL_MS) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev + step >= 100) {
          setCurrentIndex((idx) => (idx + 1) % FINANCIAL_TIPS.length);
          return 0;
        }
        return prev + step;
      });
    }, tickInterval);

    return () => clearInterval(timer);
  }, [isPaused]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % FINANCIAL_TIPS.length);
    setProgress(0);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + FINANCIAL_TIPS.length) % FINANCIAL_TIPS.length);
    setProgress(0);
  };

  return (
    <section className="surface relative overflow-hidden p-5 shadow-xs transition-all">
      {/* Barra de progreso de rotación (aprox. 1 minuto) */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-secondary overflow-hidden">
        <div
          className="h-full bg-primary/60 transition-all duration-500 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Encabezado del consejo */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-base shadow-xs">
            {currentTip.icon}
          </span>
          <div>
            <span className="inline-block rounded-md bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {currentTip.category}
            </span>
            <span className="ml-2 text-[11px] text-muted-foreground font-medium">
              Consejo {currentTip.id} de {FINANCIAL_TIPS.length}
            </span>
          </div>
        </div>

        {/* Controles de navegación manual */}
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? "Reanudar rotación automática" : "Pausar rotación automática"}
            aria-label={isPaused ? "Reanudar" : "Pausar"}
          >
            {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
            onClick={handlePrev}
            aria-label="Consejo anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
            onClick={handleNext}
            aria-label="Siguiente consejo"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Contenido principal del consejo con animación fluida */}
      <div key={currentTip.id} className="mt-3.5 animate-in fade-in duration-300">
        <h3 className="text-sm font-bold text-foreground leading-snug">
          {currentTip.title}
        </h3>
        <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
          {currentTip.description}
        </p>

        {/* Píldora de conclusión práctica */}
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/5 p-2.5 text-xs text-foreground/90">
          <Lightbulb className="h-4 w-4 shrink-0 text-primary mt-0.5" />
          <span className="text-[11px] font-medium leading-normal">
            <strong>Clave:</strong> {currentTip.takeaway}
          </span>
        </div>
      </div>
    </section>
  );
}

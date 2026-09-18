# PlantWallet Grow

PLANTWALLET — PROMPT MAESTRO DE DESARROLLO

Quiero construir una aplicación web financiera personal llamada PlantWallet.

La aplicación debe ser mobile-first, diseñada principalmente para teléfonos Android con pantallas táctiles, pero también debe funcionar perfectamente en tablets y computadores.

El objetivo es crear una aplicación de administración de finanzas personales que permita registrar ingresos y gastos, organizar categorías, visualizar la salud financiera de forma extremadamente intuitiva, generar reportes completos y ayudar al usuario a mejorar progresivamente sus hábitos financieros mediante retos y recompensas visuales.

1. OBJETIVO GENERAL

Construye una aplicación web completa y funcional de finanzas personales llamada:

PlantWallet

Concepto de marca:

"Cultiva mejor tus finanzas."

La identidad visual gira alrededor de una planta como representación de la salud financiera del usuario.

Además de administrar el dinero, PlantWallet debe ayudar al usuario a desarrollar mejores hábitos financieros de manera gradual, lógica y no agresiva.

La aplicación debe evitar un tono culpabilizador.

No se trata simplemente de decir al usuario que deje de gastar, sino de ayudarle a identificar gastos que puede optimizar, establecer pequeños retos y recompensar el progreso.

2. PRIORIDAD ABSOLUTA: EXPERIENCIA MOBILE-FIRST

La aplicación será utilizada principalmente desde teléfonos Android.

Diseñar primero pensando en:

pantallas táctiles;

uso con una sola mano;

botones suficientemente grandes;

controles fáciles de tocar;

navegación inferior;

formularios cortos;

teclado numérico para cantidades;

excelente legibilidad;

animaciones suaves;

tiempos de carga bajos;

mínimo desplazamiento innecesario;

componentes adaptables a diferentes tamaños de pantalla.

Evitar interfaces pensadas originalmente para escritorio.

En móvil:

ningún elemento debe quedar cortado;

ningún botón debe ser demasiado pequeño;

evitar tablas extremadamente anchas;

convertir tablas complejas en tarjetas o layouts adaptativos;

los filtros deben ser cómodos de utilizar con los dedos;

los gráficos deben adaptarse al ancho disponible;

los formularios deben sentirse como formularios nativos de una app móvil.

La aplicación debe ser completamente responsive en:

Android teléfonos;

iPhone;

tablets;

laptops;

monitores de escritorio.

3. ESTILO VISUAL

Quiero una estética inspirada en interfaces premium y minimalistas de Apple, pero sin copiar diseños propietarios.

Características:

minimalismo;

elegancia;

mucho espacio visual;

tipografía moderna;

jerarquía visual muy clara;

bordes suavemente redondeados;

tarjetas limpias;

sombras muy sutiles;

iconografía consistente;

animaciones discretas;

microinteracciones;

apariencia premium;

diseño limpio y sofisticado.

La aplicación debe sentirse moderna en 2026.

Evitar:

interfaces saturadas;

gradientes exagerados;

demasiados colores;

botones pequeños;

apariencia de dashboard empresarial antiguo;

tablas con aspecto de Excel;

exceso de líneas;

elementos decorativos que no aporten utilidad.

Usar una paleta elegante basada principalmente en:

fondos claros;

blanco;

tonos neutros;

negro/gris oscuro para texto;

verde como color asociado a salud financiera;

amarillo/naranja para advertencias;

rojo para situaciones críticas.

También crear un Dark Mode completo.

El modo oscuro debe ser diseñado específicamente, no simplemente invertir colores.

4. TECNOLOGÍA Y ARQUITECTURA

Construir la aplicación utilizando una arquitectura moderna y mantenible.

Preferencias:

React

TypeScript

Vite

Tailwind CSS

componentes reutilizables

arquitectura modular

diseño responsive

Supabase para backend

PostgreSQL para base de datos

Supabase Auth para autenticación

Row Level Security (RLS)

Supabase Storage cuando sea necesario

El proyecto debe quedar estructurado para poder continuar posteriormente en GitHub y VS Code.

No crear una aplicación cerrada que dependa innecesariamente de Lovable.

El código debe ser limpio, modular y mantenible.

Evitar duplicación de código.

Crear componentes reutilizables.

5. AUTENTICACIÓN Y CUENTA

Implementar sistema real de usuarios.

Debe existir:

Registro

Campos:

nombre;

correo electrónico;

contraseña;

confirmación de contraseña.

Validaciones:

correo válido;

contraseña segura;

contraseñas coincidentes.

Inicio de sesión

Permitir:

correo;

contraseña;

recordar sesión;

cerrar sesión.

Recuperación de contraseña

Implementar flujo completo de recuperación mediante correo.

Perfil

El usuario debe poder modificar:

nombre;

foto/avatar opcional;

correo cuando Supabase lo permita mediante flujo seguro;

moneda principal;

preferencias;

tema;

formato de fecha;

preferencias de notificaciones.

6. ADMINISTRACIÓN DE SESIONES DE USUARIO

Crear una sección llamada:

Seguridad y sesiones

Debe permitir visualizar las sesiones/dispositivos activos del usuario cuando técnicamente esté disponible mediante la infraestructura de autenticación.

Mostrar:

dispositivo;

navegador;

sistema operativo;

última actividad;

sesión actual;

posibilidad de cerrar/revocar una sesión.

También incluir:

cerrar todas las demás sesiones;

cambiar contraseña;

cerrar sesión.

La seguridad de las cuentas debe ser tratada como una característica importante.

Nunca almacenar contraseñas directamente en la base de datos.

7. CONFIGURACIÓN GENERAL

Crear una sección de configuración muy bien organizada.

Secciones:

Cuenta

nombre;

correo;

avatar.

Preferencias

moneda principal;

formato de fecha;

inicio de semana;

idioma;

tema claro/oscuro/sistema.

Finanzas

moneda principal;

configuración de presupuesto;

límites de gasto;

preferencias para recomendaciones;

preferencias de retos.

Seguridad

contraseña;

sesiones;

cerrar todas las sesiones.

Datos

exportar información;

importar datos si posteriormente se implementa;

eliminar cuenta.

Zona peligrosa

Implementar:

eliminar cuenta;

borrar datos financieros.

Todas las operaciones destructivas deben requerir confirmación explícita.

8. PANTALLA PRINCIPAL / HOME

La pantalla principal es una de las partes más importantes de toda la aplicación.

Debe ser visualmente excelente.

Debe responder rápidamente a estas preguntas:

¿Cómo están mis finanzas?

¿Cuánto dinero tengo?

¿Cuánto ingresé?

¿Cuánto gasté?

¿Estoy gastando demasiado?

¿Qué debería hacer?

¿Tengo algún reto activo?

¿Qué recompensa estoy cerca de desbloquear?

Crear una pantalla similar a un dashboard financiero premium.

Encabezado

Mostrar:

"Buenos días, [nombre]"

o adaptar saludo según la hora.

Debajo:

Estado financiero actual.

Ejemplo:

Tu salud financiera es buena 🌱

9. PLANTA DE SALUD FINANCIERA

Crear un componente central llamado:

FinancialPlant

La planta representa la salud financiera.

Debe existir un indicador numérico de salud:

0 — 100

Ejemplo:

93/100

Mostrar un mensaje:

"Excelente"

o

"Tu dinero está creciendo saludablemente."

La planta debe cambiar visualmente dependiendo de la puntuación.

Propuesta:

90-100

🌳 Planta grande, frondosa y saludable.

75-89

🌿 Planta saludable en crecimiento.

60-74

🌱 Planta joven.

40-59

🌱 Planta pequeña con signos de estrés.

20-39

🥀 Planta deteriorada.

1-19

🌵 Planta casi marchita.

0

🔥 Estado crítico / planta marchita o elegantemente representada con fuego.

No utilizar emojis como sustituto principal del diseño.

Crear ilustraciones/componentes visuales profesionales.

La planta debe tener animaciones sutiles.

Ejemplo:

crecimiento progresivo;

movimiento suave;

aparición de hojas;

pequeñas partículas;

transición visual al cambiar de nivel.

No exagerar.

10. CÁLCULO DE SALUD FINANCIERA

Crear un algoritmo interno de puntuación entre 0 y 100.

Debe tener una arquitectura que permita modificar fácilmente los pesos.

La puntuación puede considerar:

ingresos;

gastos;

ahorro;

porcentaje de ahorro;

relación gastos/ingresos;

tendencia mensual;

cumplimiento del presupuesto;

gastos excesivos;

frecuencia de gastos;

evolución de los últimos meses;

progreso en retos financieros.

Ejemplo conceptual:

30% capacidad de ahorro

25% relación ingresos/gastos

20% cumplimiento del presupuesto

15% tendencia financiera

10% estabilidad

No presentar estas ponderaciones como recomendaciones financieras universales.

Se deben utilizar como una métrica orientativa de la aplicación.

Mostrar también una explicación:

"Tu puntuación bajó porque tus gastos aumentaron un 18% este mes."

11. INDICADOR FINANCIERO

Crear un componente muy visible:

Estado financiero

Posibles estados:

🟢 Excelente
🟢 Saludable
🟡 Atención
🟠 Riesgo
🔴 Crítico

Utilizar:

barra de progreso;

porcentaje;

icono;

mensaje corto;

explicación.

Ejemplo:

"Tu situación financiera está saludable"

"Has gastado el 62% de tus ingresos este mes."

Cuando exista déficit:

"Estás gastando más de lo que ingresas."

Mostrar claramente cuánto falta o cuánto excede.

12. ACCIONES PRINCIPALES

En la pantalla principal deben existir accesos extremadamente visibles:

+ Añadir ingreso

− Añadir gasto

Ambos deben ser fáciles de tocar con una mano.

Idealmente utilizar botones flotantes o botones principales grandes.

No esconder estas acciones dentro de menús.

13. AÑADIR INGRESO

Crear una pantalla/formulario dedicado.

Debe ser extremadamente sencillo.

Campos:

Valor

Utilizar teclado numérico cuando se encuentre en dispositivo móvil.

Mostrar formato de moneda automáticamente.

Ejemplo:

$ 1.250.000

No permitir entradas inválidas.

Moneda

Selector sencillo.

Incluir inicialmente:

COP — Peso colombiano;

USD — Dólar estadounidense;

EUR — Euro;

MXN — Peso mexicano;

GBP — Libra esterlina;

BRL — Real brasileño;

CAD — Dólar canadiense.

Permitir ampliar posteriormente.

Fecha

Utilizar calendario interactivo.

Debe ser sencillo seleccionar:

hoy;

ayer;

cualquier fecha.

Categoría

Selector visual.

Descripción opcional

Notas opcionales

Método de pago opcional

Opciones iniciales:

efectivo;

tarjeta débito;

tarjeta crédito;

transferencia;

otro.

Recurrente

Permitir marcar:

"Este ingreso se repite"

Preparar soporte para:

semanal;

mensual;

anual.

Guardar ingreso

Botón grande.

Después de guardar:

mostrar confirmación;

actualizar dashboard;

actualizar gráficos;

actualizar saldo;

actualizar la salud financiera;

evaluar progreso de retos activos.

14. AÑADIR GASTO

Crear una experiencia prácticamente idéntica pero optimizada para gastos.

Campos:

valor;

moneda;

fecha;

categoría;

descripción;

notas;

método de pago;

recurrente.

El flujo debe requerir el menor número posible de pasos.

La categoría debe poder seleccionarse visualmente.

Ejemplo:

🍔 Alimentación

🚗 Transporte

🏠 Vivienda

💡 Servicios

🎓 Educación

🎮 Entretenimiento

💊 Salud

🛍️ Compras

🐶 Mascotas

✈️ Viajes

💰 Finanzas

📦 Otros

15. CATEGORÍAS

Crear un administrador completo de categorías.

Cada usuario debe poder:

Crear categoría

Campos:

nombre;

emoji/icono;

tipo: ingreso o gasto;

color/acento visual opcional;

descripción opcional.

Editar categoría

Eliminar categoría

Activar/desactivar categoría

Nunca eliminar datos históricos accidentalmente cuando una categoría sea utilizada por transacciones existentes.

Preferiblemente utilizar eliminación lógica o reasignación.

16. CATEGORÍAS PREDETERMINADAS

Crear categorías comunes inicialmente.

Gastos:

🏠 Vivienda

🍔 Alimentación

🛒 Mercado

🚗 Transporte

⛽ Combustible

💡 Servicios

📱 Telefonía

🌐 Internet

🎓 Educación

💊 Salud

🐶 Mascotas

👕 Ropa

🎮 Entretenimiento

🛍️ Compras

✈️ Viajes

💳 Deudas

🏦 Finanzas

🎁 Regalos

📦 Otros

Ingresos:

💼 Salario

💻 Trabajo freelance

🏦 Rendimientos

💰 Inversión

🎁 Regalo

🧾 Reembolso

📦 Venta

➕ Otros ingresos

17. TRANSACCIONES

Crear sección:

Movimientos

Mostrar todos los ingresos y gastos.

Cada movimiento debe mostrar:

categoría;

emoji;

descripción;

fecha;

importe;

moneda;

tipo;

método de pago.

Utilizar tarjetas limpias en móvil.

Permitir:

búsqueda;

filtrado;

ordenar;

editar;

eliminar.

Filtros:

rango de fechas;

ingreso/gasto;

categoría;

moneda;

método de pago;

rango de valor.

Implementar confirmación antes de eliminar.

18. DASHBOARD FINANCIERO

Crear un dashboard muy visual y completo.

Debe incluir:

Resumen

ingresos del período;

gastos del período;

balance;

ahorro;

porcentaje de ahorro.

Gráfico ingresos vs gastos

Comparación por día/semana/mes.

Gastos por categoría

Utilizar gráfico visual.

Evolución financiera

Mostrar evolución temporal.

Categorías con mayor gasto

Mostrar ranking.

Ejemplo:

🏠 Vivienda — 32%

🍔 Alimentación — 18%

🚗 Transporte — 13%

Balance

Ingresos − gastos.

Tasa de ahorro

Ahorro / ingresos.

19. SISTEMA DE RETOS FINANCIEROS — FUNCIÓN CENTRAL DE GAMIFICACIÓN

Crear un sistema llamado:

Financial Challenges

El propósito es ayudar al usuario a mejorar progresivamente sus hábitos financieros mediante pequeños retos mensuales o semanales.

Los retos deben ser:

realistas;

alcanzables;

progresivos;

personalizados;

basados en los datos reales del usuario;

medibles;

orientados principalmente a gastos discrecionales;

no culpabilizantes.

NO convertir esto en un sistema que castigue al usuario por gastos necesarios como:

vivienda;

salud;

educación;

servicios básicos;

alimentación esencial;

transporte necesario;

deudas obligatorias.

La aplicación debe distinguir entre:

Gastos esenciales

y

Gastos discrecionales

cuando sea posible.

Los retos deben concentrarse principalmente en categorías donde exista margen razonable de optimización.

20. CÓMO GENERAR LOS RETOS

Los retos deben analizar el historial del usuario.

Usar preferentemente los últimos:

3 meses;

6 meses;

cuando exista suficiente información.

Nunca generar retos basándose en un solo gasto aislado.

Ejemplo:

Si el usuario gasta normalmente:

Entretenimiento:
$300.000/mes

PlantWallet podría sugerir:

🌿 Reto: Entretenimiento consciente

"Intenta gastar hasta un máximo de $240.000 en entretenimiento este mes."

Reducción propuesta:

20%

No empezar automáticamente con reducciones absurdamente altas.

21. RETOS DE REDUCCIÓN DE GASTOS

Crear diferentes tipos.

Reto de reducción

"Reduce tus gastos en restaurantes un 10% respecto a tu promedio reciente."

Reto de límite

"No superar $150.000 en entretenimiento este mes."

Reto de frecuencia

"Limita las compras impulsivas a 2 durante esta semana."

Reto de días

"Completa 3 días esta semana sin gastos de ocio."

Reto de sustitución

"Durante 4 ocasiones, elige una actividad gratuita o de bajo costo en lugar de una actividad de ocio pagada."

Reto de tendencia

"Gasta menos en entretenimiento que el mes anterior."

Reto de ahorro

"Consigue ahorrar $100.000 adicionales este mes."

22. RETOS ADAPTATIVOS

No mostrar siempre los mismos retos.

El sistema debe seleccionar retos utilizando:

comportamiento histórico;

categorías donde más aumentó el gasto;

categorías discrecionales;

capacidad aproximada de ahorro;

presupuestos;

retos anteriores;

dificultad anterior;

porcentaje de éxito.

Ejemplo:

Usuario gasta mucho en:

🎮 Entretenimiento

🍔 Restaurantes

🛍️ Compras

Generar retos relacionados con esas áreas.

Pero no activar simultáneamente demasiados retos.

Recomendación:

1 a 3 retos activos máximo.

23. DIFICULTAD PROGRESIVA

Crear niveles:

Fácil

Reducción aproximada del 5-10%.

Medio

Reducción aproximada del 10-20%.

Difícil

Reducción aproximada del 20-30%.

Nunca establecer objetivos extremos automáticamente.

Si el usuario completa repetidamente los retos fáciles:

incrementar gradualmente la dificultad.

Si falla varias veces:

reducir la dificultad.

El sistema debe aprender del comportamiento del usuario.

24. VALIDACIÓN AUTOMÁTICA DE RETOS

Los retos deben comprobarse automáticamente a partir de las transacciones.

Ejemplo:

Reto:

"Reduce entretenimiento un 15% respecto al promedio de los últimos 3 meses."

El sistema compara:

promedio histórico:

$300.000

objetivo:

$255.000

gasto actual:

$230.000

Resultado:

✅ Reto completado.

No permitir que el usuario simplemente marque un reto como completado sin que exista evidencia en los datos.

25. PROGRESO DE LOS RETOS

Mostrar una tarjeta muy visual:

🌿 Reto activo

Menos ocio

$180.000 / $250.000

72%

"Vas muy bien."

Mostrar:

porcentaje;

tiempo restante;

dinero utilizado;

objetivo;

progreso;

dificultad;

recompensa.

26. RECOMPENSAS Y SKINS PARA LA PLANTA

Los retos exitosos deben otorgar:

Growth Points / Plant Points

Estos puntos desbloquean elementos cosméticos.

Las recompensas NO deben ser dinero real.

Son exclusivamente visuales.

Crear sistema:

🌱 Plant Points

Ejemplo:

Reto fácil → +50 puntos

Reto medio → +100 puntos

Reto difícil → +200 puntos

Los puntos pueden utilizarse para desbloquear:

skins;

macetas;

fondos;

hojas;

flores;

árboles;

efectos ambientales;

pequeños animales;

accesorios visuales;

temas de planta.

27. SISTEMA DE COLECCIÓN DE PLANTAS

Crear una sección:

Plant Collection

El usuario puede visualizar elementos desbloqueados y bloqueados.

Categorías:

Plantas

planta clásica;

cactus;

bonsái;

monstera;

bambú;

árbol joven;

árbol premium;

plantas estacionales.

Macetas

cerámica;

madera;

minimalista;

metálica;

futurista.

Fondos

habitación minimalista;

jardín;

escritorio;

bosque;

noche;

amanecer.

Efectos

pequeñas hojas;

partículas;

lluvia;

luciérnagas;

brillo;

pequeñas flores.

Todos deben mantener un estilo visual premium.

28. DESBLOQUEO POR PROGRESO

No todo debe desbloquearse únicamente mediante dinero o puntos.

Crear varios métodos:

Retos

Completar retos.

Rachas

Mantener buenos hábitos durante determinados períodos.

Hitos

Ejemplo:

completar 10 retos;

ahorrar durante 3 meses;

registrar 100 movimientos;

mantener balance positivo durante un período.

Salud financiera

Llegar a:

70/100

80/100

90/100

100/100

Cada hito puede desbloquear una recompensa cosmética.

29. SKINS DE TEMPORADA

Preparar arquitectura para eventos temporales.

Ejemplo:

🌸 Primavera

🌙 Noches

🎃 Halloween

🎄 Navidad

🌧️ Temporada de lluvia

Los elementos estacionales deben ser opcionales y cosméticos.

No utilizar recompensas que obliguen al usuario a gastar dinero.

30. ECONOMÍA INTERNA DEL SISTEMA

Crear una economía virtual sencilla.

Nombre:

Growth Points

Reglas:

no comprables con dinero real en la primera versión;

obtenidos mediante hábitos positivos;

utilizados exclusivamente para desbloquear cosméticos;

sin apuestas;

sin loot boxes;

sin mecánicas de azar que inciten a gastar.

El objetivo es recompensar el progreso financiero, no monetizar impulsivamente al usuario.

31. RACHA FINANCIERA

Crear un sistema de:

Financial Streak

Ejemplos:

🔥 3 días

🔥 7 días

🔥 14 días

🔥 30 días

Una racha puede basarse en comportamientos definidos, por ejemplo:

registrar movimientos;

respetar un presupuesto;

evitar exceder determinado límite;

completar un reto;

mantener balance positivo.

No debe penalizar injustamente al usuario por una transacción necesaria.

La racha debe ser educativa y motivacional, no punitiva.

32. RETOS ESPECIALES PARA OCIO

Dar especial atención a:

restaurantes;

entretenimiento;

compras impulsivas;

videojuegos;

suscripciones;

salidas;

compras no esenciales.

Ejemplos:

🍿 Fin de semana consciente

"Completa un fin de semana manteniendo tus gastos de ocio por debajo de $X."

🎮 Ocio inteligente

"Reduce tus gastos de entretenimiento un 15% respecto a tu promedio."

🛍️ Compra pausada

"Durante 7 días evita compras no planificadas."

☕ Alternativa

"Reemplaza 3 compras pequeñas por alternativas gratuitas o caseras."

📺 Suscripciones

"Revisa tus suscripciones y determina cuáles utilizas realmente."

Estas recomendaciones deben presentarse como opciones.

No asumir que todos los gastos de ocio son innecesarios.

33. RETOS DE AHORRO

Crear retos que no dependan únicamente de recortar gastos.

Ejemplos:

💰 Reto de ahorro

"Reserva $50.000 esta semana."

🌱 Fondo creciente

"Consigue aumentar tu ahorro mensual un 10%."

🪴 Primer objetivo

"Completa tu primer objetivo de ahorro."

Preparar la arquitectura para relacionar estos retos con la función futura de objetivos financieros.

34. RECOMPENSA VISUAL INMEDIATA

Al completar un reto:

Mostrar una experiencia especial.

Ejemplo:

🎉

¡Reto completado!

"Has reducido tus gastos de entretenimiento en $47.000."

+100 Growth Points

mostrar la nueva skin desbloqueada.

La planta debe reaccionar visualmente.

Ejemplo:

aparecer una nueva hoja;

crecer ligeramente;

florecer;

aparecer una pequeña partícula;

desbloquear un accesorio.

La animación debe ser elegante y breve.

35. PANTALLA PRINCIPAL Y RETOS

En Home mostrar:

Reto actual

🌱 "Menos restaurantes"

$120.000 / $180.000

66%

⏳ 12 días restantes

🎁 Recompensa:

Skin Bonsái

Debajo:

"Vas $23.000 por debajo de tu ritmo habitual."

Esto conecta directamente la gamificación con información financiera real.

36. CENTRO DE RETOS

Crear una pantalla:

Retos

Con secciones:

Activos

Retos actualmente en progreso.

Recomendados

Retos sugeridos por el sistema.

Completados

Historial.

Logros

Hitos desbloqueados.

Recompensas

Skins y objetos obtenidos.

37. RETOS PERSONALIZADOS

Permitir que el usuario cree su propio reto.

Ejemplo:

"Quiero gastar máximo $100.000 en restaurantes este mes."

La aplicación debe permitir convertirlo en un reto.

Campos:

nombre;

categoría;

límite;

período;

dificultad;

recompensa estimada.

La aplicación debe advertir si el objetivo parece excesivamente agresivo en comparación con el historial, pero permitir que el usuario decida.

38. RECOMENDACIONES FINANCIERAS

En base a los datos reales registrados por el usuario, crear una sección:

Consejos para mejorar tus finanzas

Las recomendaciones deben basarse en principios financieros personales básicos.

Ejemplos:

"Tu gasto en alimentación representa el 24% de tus gastos."

"Este mes gastaste más en entretenimiento que durante los dos meses anteriores."

"Has mantenido un ahorro positivo durante tres meses consecutivos."

"Estás gastando más de lo que ingresas."

"Tu categoría con mayor crecimiento este mes fue transporte."

"Podrías intentar reducir ligeramente tus gastos de entretenimiento este mes."

No dar recomendaciones financieras peligrosamente específicas ni afirmar que son asesoría profesional.

Utilizar lenguaje:

orientativo;

educativo;

comprensible.

No recomendar inversiones específicas basándose únicamente en los datos.

39. SISTEMA DE ALERTAS

Crear alertas inteligentes.

Ejemplos:

🔴 "Tus gastos superaron tus ingresos."

🟠 "Tu gasto en restaurantes aumentó 32%."

🟡 "Estás cerca de alcanzar tu presupuesto mensual."

🟢 "Has ahorrado más que el mes anterior."

🌱 "Estás cerca de completar tu reto."

Las alertas deben actualizarse automáticamente.

No crear spam.

Agrupar alertas similares.

40. PRESUPUESTOS

Agregar función de presupuestos.

El usuario puede asignar un presupuesto mensual:

Ejemplo:

🍔 Alimentación — $500.000

🚗 Transporte — $300.000

🎮 Entretenimiento — $150.000

Mostrar:

presupuesto;

gasto;

porcentaje utilizado;

restante;

estado.

Ejemplo:

$420.000 / $500.000

84%

Cuando se acerque al límite:

"Has utilizado el 84% de tu presupuesto."

Cuando supere:

"Has superado tu presupuesto."

Los retos pueden utilizar los presupuestos como referencia, pero no deben duplicar confusamente ambas funcionalidades.

41. INGRESOS Y GASTOS RECURRENTES

Preparar sistema para transacciones recurrentes.

Frecuencias:

semanal;

mensual;

anual.

Ejemplo:

Netflix — $XX.XXX mensual.

Alquiler — $X.XXX mensual.

Salario — $X.XXX mensual.

La arquitectura debe permitir generar o gestionar dichas transacciones de forma consistente.

42. SOPORTE MULTIMONEDA

Cada usuario debe poder seleccionar una moneda principal.

Las transacciones pueden tener una moneda específica.

Guardar siempre la moneda original de la transacción.

No modificar artificialmente el importe original.

Para dashboards que necesiten sumar monedas diferentes, crear una arquitectura preparada para conversión.

Si no existe servicio de tasas de cambio configurado inicialmente:

permitir una tasa configurable;

dejar la arquitectura preparada para conectar posteriormente una API de tasas de cambio;

indicar claramente cuando una conversión sea estimada.

No realizar conversiones silenciosas que puedan generar errores financieros.

43. EXPORTAR CSV

Crear una función:

Exportar CSV

Permitir exportar:

todos los movimientos;

período seleccionado;

categorías seleccionadas;

ingresos;

gastos.

El CSV debe incluir columnas como:

fecha;

tipo;

categoría;

descripción;

importe;

moneda;

método de pago;

notas.

El archivo debe ser compatible con:

Excel;

Google Sheets;

LibreOffice.

44. EXPORTAR PDF

Crear una función:

Exportar reporte PDF

Debe producir un PDF profesional y visualmente bonito.

Debe incluir:

nombre PlantWallet;

usuario;

período;

ingresos;

gastos;

balance;

ahorro;

salud financiera;

puntuación;

gráficos;

categorías;

recomendaciones;

principales gastos;

comparaciones;

retos completados;

progreso financiero.

El PDF debe tener:

diseño profesional;

buena tipografía;

márgenes adecuados;

encabezados;

secciones;

numeración;

fecha de generación.

No generar simplemente una captura de pantalla del dashboard.

Debe ser un documento estructurado.

45. DASHBOARD RESPONSIVE

Todos los gráficos deben funcionar correctamente en móviles.

En teléfonos:

gráficos simplificados;

interacción táctil;

tooltips legibles;

posibilidad de desplazamiento horizontal únicamente cuando sea realmente necesario.

En desktop:

aprovechar espacio adicional.

Crear layouts adaptativos.

46. NAVEGACIÓN PRINCIPAL EN MÓVIL

Utilizar navegación inferior.

Propuesta:

🏠 Inicio
💸 Movimientos
📊 Reportes
🏆 Retos
⚙️ Configuración

El botón "+" para añadir transacciones puede ser flotante y visualmente destacado.

La navegación debe ser consistente y fácil de entender.

47. NAVEGACIÓN DESKTOP

En escritorio utilizar sidebar o navegación lateral elegante.

No utilizar exactamente el mismo layout móvil escalado.

Adaptar la experiencia.

48. ANIMACIONES

Agregar microinteracciones.

Ejemplos:

guardar transacción;

actualizar planta;

cambiar puntuación;

abrir tarjetas;

cambiar filtros;

cambiar período;

completar retos;

desbloquear skins;

obtener Growth Points.

Animaciones rápidas y suaves.

No utilizar animaciones excesivas que ralenticen la aplicación.

Respetar preferencia de movimiento reducido cuando el sistema operativo lo solicite.

49. ESTADO VACÍO

Crear estados vacíos bonitos.

Ejemplo:

"No tienes movimientos todavía."

Mostrar:

🌱

"Empieza a cultivar tus finanzas agregando tu primer ingreso o gasto."

Botón:

"+ Añadir movimiento"

No mostrar pantallas vacías sin contexto.

En retos:

"Con unos pocos movimientos más podremos proponerte retos personalizados."

50. CARGA Y ERRORES

Crear:

skeleton loaders;

indicadores de carga;

estados de error;

mensajes comprensibles;

reintentos.

Nunca mostrar errores técnicos directamente al usuario final.

51. BASE DE DATOS

Diseñar una base de datos PostgreSQL limpia.

Crear como mínimo tablas para:

profiles

id

user_id

name

avatar_url

base_currency

locale

theme

created_at

updated_at

categories

id

user_id

name

emoji

type

color

is_active

created_at

updated_at

transactions

id

user_id

category_id

type

amount

currency

description

notes

transaction_date

payment_method

is_recurring

recurring_rule

created_at

updated_at

budgets

id

user_id

category_id

amount

currency

period

start_date

end_date

created_at

updated_at

financial_goals

Preparar arquitectura para objetivos financieros.

Campos sugeridos:

id

user_id

name

target_amount

current_amount

currency

target_date

created_at

updated_at

user_preferences

cuando sea necesario separar preferencias del perfil.

52. BASE DE DATOS PARA GAMIFICACIÓN

Crear tablas adicionales.

challenges

Debe representar los retos disponibles.

Campos sugeridos:

id;

title;

description;

challenge_type;

difficulty;

target_value;

target_percentage;

category_id cuando corresponda;

duration_days;

reward_points;

active;

created_at.

user_challenges

Relaciona los retos con cada usuario.

Campos:

id;

user_id;

challenge_id;

status;

start_date;

end_date;

progress;

target;

completed_at;

reward_claimed;

created_at;

updated_at.

Estados:

available;

active;

completed;

failed;

abandoned.

plant_items

Catálogo de recompensas cosméticas.

Campos:

id;

name;

description;

item_type;

rarity;

asset_url;

unlock_requirement;

created_at.

user_plant_items

Elementos desbloqueados por el usuario.

Campos:

id;

user_id;

plant_item_id;

unlocked_at;

equipped;

created_at.

user_rewards

Historial de recompensas.

Campos:

id;

user_id;

source;

points;

challenge_id;

created_at.

financial_streaks

Campos:

id;

user_id;

streak_type;

current_streak;

best_streak;

last_activity_date;

created_at;

updated_at.

achievements

Catálogo de logros.

user_achievements

Logros desbloqueados por el usuario.

53. SEGURIDAD DE BASE DE DATOS

Implementar Row Level Security de forma estricta.

Un usuario únicamente puede leer/modificar sus propios:

perfiles;

categorías;

transacciones;

presupuestos;

objetivos;

configuraciones;

retos;

progreso de retos;

recompensas;

elementos desbloqueados;

rachas;

logros.

Nunca permitir que un usuario consulte los registros financieros de otro usuario.

No confiar únicamente en restricciones del frontend.

Las reglas importantes deben estar protegidas por backend/database.

Nunca exponer claves secretas o service-role keys en el frontend.

54. INTEGRIDAD DE DATOS

Validar:

cantidades mayores que cero cuando corresponda;

fechas válidas;

categorías existentes;

usuario propietario;

monedas válidas;

datos obligatorios.

Evitar duplicación accidental de transacciones.

El sistema de retos debe calcular progreso utilizando datos reales y consistentes.

No permitir manipular el progreso desde el cliente para obtener recompensas.

55. ACCESIBILIDAD

La aplicación debe considerar:

contraste adecuado;

tamaños de texto legibles;

navegación mediante teclado;

labels accesibles;

aria-labels donde sea necesario;

estados de foco;

botones suficientemente grandes para uso táctil.

No depender exclusivamente del color.

Esto es importante también para usuarios con dificultades de percepción de color.

56. PWA

Preparar PlantWallet para funcionar como Progressive Web App.

Debe incluir:

manifest;

iconos;

nombre PlantWallet;

nombre corto;

color de aplicación;

pantalla de inicio;

configuración adecuada para instalación;

comportamiento standalone.

La aplicación debe poder instalarse en Android desde el navegador.

El diseño no debe dar sensación de "sitio web abierto en Chrome".

Debe sentirse como una aplicación.

57. PREPARACIÓN PARA APK

No es necesario crear el APK todavía.

Sin embargo, toda la aplicación debe construirse de manera compatible con una futura envoltura utilizando:

Capacitor

La arquitectura no debe depender de funciones que impidan posteriormente empaquetarla como aplicación Android.

Pensar desde el comienzo:

Mobile Web → PWA → Capacitor → Android APK/AAB

58. RENDIMIENTO

Optimizar para teléfonos Android de gama media.

Evitar:

bundles innecesariamente grandes;

imágenes enormes;

renderizados repetitivos;

consultas excesivas;

llamadas innecesarias a Supabase.

Implementar paginación o carga incremental cuando el número de transacciones aumente.

Crear índices adecuados en PostgreSQL.

El motor de retos debe evitar consultas innecesarias y utilizar datos agregados cuando sea posible.

59. DATOS DE DEMOSTRACIÓN

Durante desarrollo, puedes utilizar datos de prueba.

Pero separar claramente:

Demo data

de

real user data

No mezclar datos entre usuarios.

Nunca crear datos ficticios como si fueran movimientos reales del usuario sin indicarlo claramente.

Para demostrar retos, se pueden crear escenarios de prueba controlados.

60. COMPONENTES REUTILIZABLES

Crear componentes reutilizables para:

botones;

inputs;

selectores;

modal;

bottom sheet;

cards;

gráficos;

badges;

alertas;

transaction cards;

category selector;

calendar;

financial plant;

financial health indicator;

challenge card;

progress bar;

reward card;

plant skin selector;

empty states;

loaders.

Evitar crear componentes gigantes difíciles de mantener.

61. ESTRUCTURA DE CÓDIGO

Mantener una estructura modular.

Separar:

páginas;

componentes;

hooks;

servicios;

utilidades;

tipos;

lógica financiera;

lógica de gamificación;

acceso a datos.

No mezclar toda la lógica de negocio dentro de los componentes visuales.

La lógica para calcular:

salud financiera;

progreso de retos;

recompensas;

puntos;

rachas;

debe mantenerse separada de la presentación visual.

62. EXPERIENCIA DE USUARIO

La aplicación debe priorizar estas acciones:

Ver rápidamente la situación financiera.

Registrar un gasto en pocos segundos.

Registrar un ingreso en pocos segundos.

Entender dónde se está gastando el dinero.

Detectar problemas.

Entender tendencias.

Mejorar hábitos progresivamente.

Completar pequeños retos.

Ver recompensas y progreso.

Exportar información.

Configurar categorías y presupuestos fácilmente.

Un usuario debe poder añadir un gasto cotidiano rápidamente sin sentirse atrapado en un formulario largo.

63. DETALLES DE UX IMPORTANTES

Al abrir "Añadir gasto":

Primero enfocar:

¿Cuánto gastaste?

Después:

¿En qué categoría?

Después:

¿Cuándo?

Después:

Opcional: descripción, método de pago, notas.

No obligar al usuario a llenar campos innecesarios.

Utilizar defaults inteligentes:

fecha = hoy;

moneda = moneda principal;

categorías recientemente utilizadas disponibles rápidamente.

Crear "categorías recientes" o "favoritas".

64. INFORMACIÓN FINANCIERA EN TIEMPO REAL

Después de cada modificación:

recalcular balance;

actualizar dashboard;

actualizar presupuesto;

actualizar gráficos;

recalcular salud financiera;

actualizar recomendaciones;

actualizar progreso de retos.

El usuario nunca debería tener que recargar manualmente la página.

65. SEGURIDAD Y PRIVACIDAD

Esta aplicación manejará información financiera personal.

Por lo tanto:

no mostrar datos sensibles innecesariamente;

proteger rutas privadas;

proteger consultas;

utilizar autenticación;

utilizar RLS;

validar operaciones;

evitar exposición de secretos;

utilizar HTTPS en producción;

no almacenar credenciales de usuario en texto plano.

No inventar características de seguridad que realmente no estén implementadas.

66. DISEÑO DE MARCA

Crear identidad visual para:

PlantWallet

Concepto:

Una combinación entre:

🌱 crecimiento

💰 dinero

📊 organización

Crear un logotipo minimalista relacionado con una hoja/planta y una billetera.

El logo debe verse bien:

en la aplicación;

favicon;

PWA;

pantalla de inicio Android;

documentos PDF.

67. TONO DE LA APLICACIÓN

La aplicación debe comunicarse de forma:

amigable;

tranquila;

clara;

profesional;

motivadora.

Evitar mensajes culpabilizadores.

En lugar de:

"Estás gastando demasiado."

Preferir:

"Tu gasto aumentó este mes. Revisemos qué categorías están impulsándolo."

En retos:

En lugar de:

"Debes dejar de gastar."

Preferir:

"Este mes puedes intentar reducir ligeramente tus gastos de ocio."

68. DASHBOARD IDEAL

La pantalla inicial debería tener aproximadamente esta jerarquía:

SALUDO

↓

SALUD FINANCIERA + PLANTA

↓

BALANCE ACTUAL

↓

INGRESOS / GASTOS

↓

BOTONES:

INGRESO

GASTO

↓

RESUMEN DEL PERÍODO

↓

RETO ACTIVO

↓

PROGRESO DE LA PLANTA / RECOMPENSA

↓

GASTOS POR CATEGORÍA

↓

PRESUPUESTOS

↓

RECOMENDACIONES

↓

ÚLTIMOS MOVIMIENTOS

No colocar todo simultáneamente si genera saturación en móvil.

Utilizar tarjetas y secciones plegables cuando sea apropiado.

69. DETALLE DE TRANSACCIÓN

Al tocar un movimiento abrir una vista o modal elegante.

Mostrar:

categoría;

emoji;

tipo;

importe;

moneda;

fecha;

descripción;

notas;

método de pago.

Acciones:

Editar

Eliminar

70. REPORTES VISUALES

Los reportes deben tener sensación de producto premium.

Usar distintos tipos de gráficos cuando tengan sentido:

barras;

líneas;

donut;

área;

comparación;

ranking;

calendario/heatmap.

No utilizar gráficos únicamente por decoración.

Cada visualización debe responder una pregunta financiera concreta.

71. MÉTRICAS IMPORTANTES

El dashboard/reportes puede incluir:

ingresos totales;

gastos totales;

balance;

ahorro;

tasa de ahorro;

gasto promedio diario;

gasto promedio mensual;

categoría principal;

día de mayor gasto;

mes de mayor gasto;

variación respecto al período anterior;

cantidad de movimientos;

porcentaje de presupuesto utilizado;

ahorro conseguido mediante retos;

porcentaje de retos completados;

racha actual;

Growth Points conseguidos.

72. ANÁLISIS DE IMPACTO DE LOS RETOS

Crear una sección que permita al usuario ver:

"Lo que has conseguido"

Ejemplo:

Este mes:

💰 $127.000 menos en gastos de ocio

🌱 +8 puntos de salud financiera

🏆 3 retos completados

🔥 12 días de buena racha

Esto debe reforzar la percepción de progreso.

73. CRITERIO DE CALIDAD

No quiero únicamente una UI bonita.

Quiero una aplicación funcional.

Cada botón importante debe realizar realmente su acción.

Evitar:

botones decorativos;

páginas falsas;

gráficos con números estáticos;

formularios sin persistencia;

datos simulados en funcionalidades reales;

funcionalidades "Coming Soon" para las funciones solicitadas.

Las funcionalidades principales deben estar conectadas a la base de datos.

74. ORDEN DE IMPLEMENTACIÓN

Construir el proyecto siguiendo aproximadamente este orden:

FASE 1

arquitectura;

Supabase;

autenticación;

perfil;

base de datos;

RLS.

FASE 2

categorías;

ingresos;

gastos;

movimientos;

edición/eliminación.

FASE 3

dashboard;

balance;

estadísticas;

salud financiera;

planta.

FASE 4

presupuestos;

recomendaciones;

alertas;

transacciones recurrentes.

FASE 5

motor de retos;

retos personalizados;

puntos;

rachas;

logros;

recompensas;

skins de planta.

FASE 6

reportes;

filtros avanzados;

comparación de meses;

análisis de categorías;

análisis diario.

FASE 7

CSV;

PDF.

FASE 8

PWA;

optimización mobile;

accesibilidad;

performance;

dark mode.

75. CRITERIOS DE ACEPTACIÓN DEL SISTEMA DE RETOS

Antes de considerar terminada la gamificación, verificar:

los retos se basan en datos reales;

la dificultad se adapta al historial;

los retos priorizan gastos discrecionales;

no se penalizan injustamente gastos esenciales;

el progreso se calcula automáticamente;

el usuario no puede falsificar progreso desde el frontend;

completar un reto otorga correctamente Growth Points;

las recompensas se desbloquean correctamente;

las skins pueden equiparse/desequiparse;

los logros se registran;

las rachas se actualizan;

el sistema funciona independientemente por usuario;

eliminar una transacción recalcula correctamente el progreso de retos;

editar una transacción también recalcula correctamente el progreso;

el sistema no genera retos absurdos o imposibles;

el usuario puede abandonar un reto;

el usuario puede crear retos personalizados;

existen estados de carga y error.

76. RESULTADO FINAL ESPERADO

El resultado debe sentirse como una aplicación financiera moderna de producción.

No como:

"un proyecto generado por IA".

Debe sentirse como:

PlantWallet — Personal Finance, beautifully organized.

La sensación general debe ser:

🌱 simple

💰 inteligente

📊 visual

🏆 motivadora

📱 mobile-first

🔐 privada

✨ premium

El concepto diferencial debe ser:

PlantWallet convierte tus buenos hábitos financieros en crecimiento visual.

Tu planta representa cómo administras tu dinero.

Tus retos representan pequeños cambios sostenibles.

Tus Growth Points representan progreso.

Tus skins representan los hábitos que has construido.

La gamificación debe ser secundaria a las finanzas, nunca al revés.

La prioridad máxima es:

USABILIDAD + DISEÑO + EXPERIENCIA MÓVIL + DATOS REALES + SEGURIDAD + PROGRESO FINANCIERO.

Construye el proyecto completo y funcional siguiendo todas estas especificaciones.

Cuando exista una decisión de diseño no especificada, elegir la opción que produzca la experiencia más simple, elegante, moderna y apropiada para una aplicación financiera móvil premium.

No sacrificar funcionalidad por estética y no sacrificar simplicidad por agregar funciones innecesarias.

## PlantWallet — Cultiva mejor tus finanzas

Aplicación financiera personal interactiva, gamificada y 100% offline con gestión de débito, crédito y salud financiera viva.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

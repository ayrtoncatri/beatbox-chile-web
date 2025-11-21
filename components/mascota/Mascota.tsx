'use client';
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import type { User as CustomUser } from 'next-auth';
import Image from 'next/image';

interface ChatMessage {
    id: string;
    type: 'user' | 'bot';
    content: string;
    timestamp: Date;
}

const Mascota: React.FC = () => {
    const pathname = usePathname();
    const [isChatOpen, setIsChatOpen] = useState(false); 
    const [showTooltip, setShowTooltip] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [page, setPage] = useState(1);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [currentView, setCurrentView] = useState<'questions' | 'chat'>('questions');
    const [hasUserClicked, setHasUserClicked] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [answeredQuestions, setAnsweredQuestions] = useState<string[]>([]);
    const [showPreviousQuestions, setShowPreviousQuestions] = useState(false);
    const [isNavigatingToPrevious, setIsNavigatingToPrevious] = useState(false);
    const { data: session } = useSession();
    const user = session?.user as CustomUser | undefined;
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    const toggleChat = () => {
        setIsChatOpen(prevState => !prevState); 
        setShowTooltip(false);
        setHasUserClicked(true); // Marcar que el usuario ha hecho clic
        setShowNotification(false); // Ocultar la notificación
        
        if (!isChatOpen) {
            // Solo agregar mensaje de bienvenida si no hay mensajes previos
            if (messages.length === 0) {
                setMessages([{
                    id: '1',
                    type: 'bot',
                    content: `¡Hola${user?.name ? ` ${user.name}` : ''}! 👋 Soy tu asistente de Beatbox Chile. ¿En qué puedo ayudarte hoy?`,
                    timestamp: new Date()
                }]);
            }
            setCurrentView('questions');
        }
    };

    const handleImageError = () => {
        setImageError(true);
    };

    // Función para manejar la interacción inicial del usuario
    const handleFirstInteraction = () => {
        // Esta función se mantiene por compatibilidad pero ya no hace nada especial
    };

    // Función para limpiar todo el estado del chat
    const clearChatHistory = () => {
        setMessages([]);
        setAnsweredQuestions([]);
        setCurrentView('questions');
        setShowPreviousQuestions(false);
        setPage(1);
        setIsNavigatingToPrevious(false);
    };

    const faqData = [
        // Preguntas básicas para principiantes
        { question: "¿Qué es el Beatbox?", answer: "El Beatbox es una técnica vocal que imita sonidos de percusión, batería y otros instrumentos usando solo la boca, labios, lengua y voz. Es una forma de arte que combina ritmo, música y creatividad vocal. En Chile, tenemos una comunidad muy activa de beatboxers que se reúne regularmente para compartir técnicas y competir." },
        
        { question: "¿Cómo puedo empezar a aprender Beatbox?", answer: "¡Perfecto! Te recomiendo empezar con los sonidos básicos: el kick (bombo), hi-hat (charleston) y snare (redoblante). Practica 15-30 minutos diarios. En Beatbox Chile organizamos workshops y eventos donde puedes aprender de beatboxers experimentados. También tenemos recursos en línea y una comunidad muy acogedora para principiantes." },
        
        { question: "¿Dónde puedo encontrar tutoriales?", answer: "En nuestra plataforma web tienes acceso a tutoriales básicos y avanzados. También organizamos workshops presenciales en Santiago y otras ciudades. Te recomiendo seguir a nuestros beatboxers chilenos en redes sociales, muchos comparten técnicas y consejos gratuitamente. ¡La comunidad es muy generosa compartiendo conocimiento!" },
        
        // Preguntas sobre eventos y participación
        { question: "¿Cómo puedo participar en eventos?", answer: "¡Excelente pregunta! Puedes participar de varias formas: 1) Audiciones para eventos oficiales a través de nuestro formulario, 2) Wildcards (entradas especiales) para competencias, 3) Eventos abiertos donde cualquiera puede presentarse. También organizamos jams (sesiones improvisadas) donde puedes practicar en público. ¡Todos los niveles son bienvenidos!" },
        
        { question: "¿Qué es la liga competitiva de Beatbox Chile?", answer: "La liga competitiva es nuestro circuito oficial de competencias. Los beatboxers compiten en diferentes categorías (solo, loop, tag team) y acumulan puntos durante la temporada. Los mejores representan a Chile en competencias internacionales como el Grand Beatbox Battle. Es una oportunidad increíble para crecer y conectar con la escena mundial." },
        
        { question: "¿Qué es la Liga Terapéutica?", answer: "La Liga Terapéutica es una iniciativa única donde usamos el Beatbox como herramienta de terapia y autoexpresión. Ayudamos a personas con ansiedad, depresión, problemas de comunicación y más. El Beatbox mejora la respiración, confianza y creatividad. Es un espacio seguro donde la música se convierte en sanación." },
        
        // Preguntas técnicas
        { question: "¿Cómo puedo mejorar mi técnica de Beatbox?", answer: "La práctica constante es clave. Te recomiendo: 1) Ejercicios de respiración diafragmática, 2) Practicar con metrónomo para mejorar el timing, 3) Grabar tus sesiones para autoevaluarte, 4) Participar en jams para ganar experiencia en vivo, 5) Estudiar a beatboxers internacionales. En Beatbox Chile organizamos sesiones de práctica grupal donde puedes recibir feedback." },
        
        { question: "¿Cuáles son los sonidos básicos que debo dominar?", answer: "Los fundamentales son: Kick (bombo) - 'B' o 'P', Hi-hat (charleston) - 'T' o 'K', Snare (redoblante) - 'K' o 'Pf'. Una vez que domines estos, puedes avanzar a sonidos más complejos como rimshots, basslines y efectos especiales. La clave es empezar lento y aumentar la velocidad gradualmente." },
        
        // Preguntas sobre la comunidad
        { question: "¿Cómo puedo conectarme con otros Beatboxers en Chile?", answer: "¡La comunidad chilena es muy activa! Puedes conectarte a través de: 1) Nuestros eventos y jams regulares, 2) Grupos en redes sociales, 3) Workshops y competencias, 4) Nuestra plataforma web donde puedes encontrar otros beatboxers por región. También organizamos encuentros informales en parques y espacios públicos. ¡Todos son bienvenidos!" },
        
        { question: "¿Hay beatboxers famosos en Chile?", answer: "¡Sí! Chile tiene una escena muy talentosa. Tenemos beatboxers que han competido internacionalmente y representado al país en eventos mundiales. Algunos han ganado reconocimiento en competencias latinoamericanas y han colaborado con artistas internacionales. La escena chilena es conocida por su creatividad y técnica innovadora." },
        
        // Preguntas sobre recursos y equipamiento
        { question: "¿Qué equipamiento necesito para empezar?", answer: "¡La belleza del Beatbox es que solo necesitas tu voz! Para empezar no necesitas equipamiento. Si quieres grabar o hacer loops, puedes usar apps gratuitas en tu teléfono. Para presentaciones en vivo, eventualmente podrías considerar un micrófono y sistema de sonido, pero eso es para más adelante. ¡Lo más importante es practicar!" },
        
        { question: "¿Cómo puedo grabar mi Beatbox?", answer: "Para empezar, usa la app de grabación de tu teléfono. Apps como Voice Memos (iOS) o Grabadora (Android) son perfectas. Para mejor calidad, considera apps como BandLab o GarageBand. Si quieres hacer loops, Loop Station es excelente. Para presentaciones, un micrófono USB básico puede hacer una gran diferencia. ¡Lo importante es empezar a grabar para mejorar!" },
        
        // Preguntas sobre competencias y eventos
        { question: "¿Cuándo son los próximos eventos de Beatbox Chile?", answer: "Organizamos eventos regularmente durante todo el año. Tenemos competencias trimestrales, jams mensuales, workshops especializados y eventos temáticos. Las fechas se publican en nuestra web y redes sociales. También participamos en festivales de música y eventos culturales. ¡Síguenos para estar al día con todas las actividades!" },
        
        { question: "¿Puedo participar aunque sea principiante?", answer: "¡Absolutamente! En Beatbox Chile creemos que todos pueden participar. Tenemos categorías para diferentes niveles, desde principiantes hasta avanzados. Los eventos son espacios de aprendizaje y crecimiento. La comunidad es muy acogedora y siempre hay alguien dispuesto a ayudar. ¡No tengas miedo de participar, todos empezamos en algún momento!" },
        
        // Preguntas sobre la cultura beatbox en Chile
        { question: "¿Cómo es la escena de Beatbox en Chile?", answer: "La escena chilena es vibrante y diversa. Tenemos beatboxers de todas las edades y estilos, desde hip-hop hasta electrónica. La comunidad es muy unida y colaborativa. Santiago es el epicentro, pero también hay grupos activos en Valparaíso, Concepción y otras ciudades. La escena ha crecido mucho en los últimos años y Chile se está posicionando como referente en Latinoamérica." },
        
        { question: "¿Hay oportunidades de colaboración con otros artistas?", answer: "¡Sí! Muchos beatboxers chilenos colaboran con músicos, raperos, productores y otros artistas. El Beatbox se ha integrado en diferentes géneros musicales. Organizamos eventos donde beatboxers y músicos se conectan para crear proyectos conjuntos. También tenemos programas de mentoría donde artistas experimentados guían a los más nuevos." }
    ];

    // Función para reproducir sonido de notificación
    const playNotificationSound = () => {
        try {
            // Crear un sonido de notificación usando Web Audio API
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            
            // Verificar si el contexto está suspendido y reanudarlo
            if (audioContext.state === 'suspended') {
                audioContext.resume().then(() => {
                    createNotificationSound(audioContext);
                }).catch(() => {
                    console.log('No se pudo reanudar el contexto de audio');
                });
            } else {
                createNotificationSound(audioContext);
            }
        } catch (error) {
            console.log('No se pudo reproducir el sonido de notificación');
        }
    };

    // Función auxiliar para crear el sonido de mensaje
    const createNotificationSound = (audioContext: AudioContext) => {
        // Crear múltiples osciladores para un sonido más complejo tipo "ding"
        const oscillator1 = audioContext.createOscillator();
        const oscillator2 = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filterNode = audioContext.createBiquadFilter();
        
        // Configurar el filtro para un sonido más suave
        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(2000, audioContext.currentTime);
        
        // Conectar los osciladores
        oscillator1.connect(filterNode);
        oscillator2.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Configurar frecuencias para un sonido tipo "ding" de mensaje
        oscillator1.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator1.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
        oscillator1.frequency.setValueAtTime(600, audioContext.currentTime + 0.2);
        
        oscillator2.frequency.setValueAtTime(1200, audioContext.currentTime);
        oscillator2.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
        
        // Configurar volumen con fade out
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        
        // Iniciar y detener los osciladores
        oscillator1.start(audioContext.currentTime);
        oscillator2.start(audioContext.currentTime);
        oscillator1.stop(audioContext.currentTime + 0.4);
        oscillator2.stop(audioContext.currentTime + 0.4);
    };

    // Función para hacer scroll automático al final del chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Función para simular escritura del bot
    const simulateTyping = (message: string, callback: () => void) => {
        setIsTyping(true);
        // Hacer scroll cuando empieza a escribir
        setTimeout(() => scrollToBottom(), 100);
        
        setTimeout(() => {
            setIsTyping(false);
            callback();
            // Hacer scroll cuando termina de escribir
            setTimeout(() => scrollToBottom(), 100);
        }, 1500 + Math.random() * 1000); // Entre 1.5 y 2.5 segundos
    };

    // Función para manejar el clic en una pregunta
    const handleQuestionClick = (question: string) => {
        // Agregar mensaje del usuario
        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: question,
            timestamp: new Date()
        };
        
        setMessages(prev => [...prev, userMessage]);
        setCurrentView('chat');
        
        // Agregar la pregunta a la lista de respondidas si no está ya
        if (!answeredQuestions.includes(question)) {
            setAnsweredQuestions(prev => [...prev, question]);
        }
        
        // Hacer scroll inmediatamente cuando se agrega el mensaje del usuario
        setTimeout(() => scrollToBottom(), 100);
        
        // Simular respuesta del bot
        const selected = faqData.find(faq => faq.question === question);
        if (selected) {
            simulateTyping(selected.answer, () => {
                const botMessage: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    type: 'bot',
                    content: selected.answer,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, botMessage]);
                
                // Reproducir sonido cuando llega la respuesta
                setTimeout(() => playNotificationSound(), 100);
            });
        }
    };

    // Función para volver a las preguntas
    const backToQuestions = () => {
        setCurrentView('questions');
        setShowPreviousQuestions(false);
    };

    // Función para manejar clic en pregunta anterior
    const handlePreviousQuestionClick = (question: string) => {
        // Buscar la conversación de esa pregunta en los mensajes
        const questionIndex = messages.findIndex(msg => 
            msg.type === 'user' && msg.content === question
        );
        
        if (questionIndex !== -1) {
            // Marcar que estamos navegando a una pregunta anterior
            setIsNavigatingToPrevious(true);
            
            // Ir al chat
            setCurrentView('chat');
            setShowPreviousQuestions(false);
            
            // Hacer scroll a la pregunta específica después de que se renderice
            setTimeout(() => {
                const messageElement = document.querySelector(`[data-message-id="${messages[questionIndex].id}"]`);
                if (messageElement) {
                    // Hacer scroll al elemento específico
                    messageElement.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center',
                        inline: 'nearest'
                    });
                } else {
                    // Fallback: hacer scroll al final si no encuentra el elemento
                    scrollToBottom();
                }
                
                // Resetear el estado después del scroll
                setTimeout(() => {
                    setIsNavigatingToPrevious(false);
                }, 1000);
            }, 300); // Aumentar el delay para asegurar que el DOM se haya actualizado
        }
    };

    // Función para alternar la vista de preguntas anteriores
    const togglePreviousQuestions = () => {
        setShowPreviousQuestions(prev => !prev);
    };

    // Función para paginar las preguntas
    const handlePagination = (direction: 'next' | 'prev') => {
        if (direction === 'next') {
            setPage(prev => Math.min(prev + 1, Math.ceil(unansweredQuestions.length / 5)));
        } else {
            setPage(prev => Math.max(prev - 1, 1));
        }
    };

    // Filtrar preguntas no respondidas
    const unansweredQuestions = faqData.filter(faq => !answeredQuestions.includes(faq.question));
    
    // Mostrar las 5 preguntas actuales (solo las no respondidas)
    const currentFaqPage = unansweredQuestions.slice((page - 1) * 5, page * 5);
    
    // Preguntas anteriores (ya respondidas)
    const previousQuestions = faqData.filter(faq => answeredQuestions.includes(faq.question));

    // Efecto para hacer scroll automático cuando cambie la vista a chat
    useEffect(() => {
        if (currentView === 'chat' && !isNavigatingToPrevious) {
            // Solo hacer scroll al final si no estamos navegando a una pregunta específica
            setTimeout(() => scrollToBottom(), 200);
        }
    }, [currentView, messages, isNavigatingToPrevious]);

    // Efecto para mostrar notificación después de 5 segundos si el usuario no ha hecho clic
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!hasUserClicked) {
                setShowNotification(true);
            }
        }, 5000); // 5 segundos

        return () => clearTimeout(timer);
    }, [hasUserClicked]);

    // No renderizar Mascota en rutas de admin o juez (después de todos los hooks)
    if (pathname?.startsWith("/admin") || pathname?.startsWith("/judge")) {
        return null;
    }

    return (
        <div>
            {/* Mascota en la esquina inferior derecha */}
            <div 
                className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 cursor-pointer z-[9999]"
                onClick={() => {
                    handleFirstInteraction();
                    toggleChat();
                }}
                onMouseEnter={() => {
                    handleFirstInteraction();
                    setShowTooltip(true);
                }}
                onMouseLeave={() => setShowTooltip(false)}
                onTouchStart={() => {
                    handleFirstInteraction();
                    setShowTooltip(true);
                }}
                onTouchEnd={() => setTimeout(() => setShowTooltip(false), 2000)}
            >
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-blue-500 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors relative">
                    {!imageError ? (
                        <Image
                            src="https://res.cloudinary.com/dfd1byvwn/image/upload/v1763746365/mascotabtx_ym0hyc.webp"
                            alt="Mascota"
                            width={48} height={48}                // tamaño base (md)
                            sizes="(max-width: 640px) 32px, (max-width: 768px) 40px, 48px"
                            className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-cover rounded-full"
                            onError={handleImageError}
                        />
                    ) : (
                        <span className="text-white text-sm sm:text-lg md:text-xl font-bold">🤖</span>
                    )}
                    
                    {/* Burbuja de notificación */}
                    {showNotification && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg animate-bounce scale-110">
                            <span className="text-white text-xs sm:text-sm font-bold">1</span>
                        </div>
                    )}
                </div>

                {/* Globito de mensaje */}
                {showTooltip && (
                    <div className="absolute bottom-full right-0 mb-2 bg-neutral-950 bg-opacity-95 backdrop-blur-sm text-blue-100 text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2 rounded-lg shadow-lg whitespace-nowrap z-[10000] max-w-[200px] sm:max-w-none border border-blue-800/50 animate-pulse">
                        ¿Quieres saber más?
                        {/* Flecha del globito */}
                        <div className="absolute top-full right-2 sm:right-4 w-0 h-0 border-l-2 border-r-2 border-t-2 sm:border-l-4 sm:border-r-4 sm:border-t-4 border-l-transparent border-r-transparent border-t-neutral-950"></div>
                    </div>
                )}
            </div>

            {/* Chat con interfaz de chatbot real */}
            {isChatOpen && (
                <div className="fixed bottom-16 right-2 sm:bottom-20 sm:right-4 md:bottom-20 md:right-5 bg-neutral-950 bg-opacity-95 backdrop-blur-sm rounded-lg shadow-2xl w-72 sm:w-80 md:w-96 z-[9998] border border-blue-800 max-h-[80vh] flex flex-col">
                    {/* Header del chat */}
                    <div className="p-3 sm:p-4 border-b border-blue-800/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                {!imageError ? (
                                    <Image
                                        src="https://res.cloudinary.com/dfd1byvwn/image/upload/v1763746365/mascotabtx_ym0hyc.webp"
                                        alt="Mascota"
                                        width={20} height={20}
                                        sizes="20px"
                                        className="w-5 h-5 object-cover rounded-full"
                                        onError={handleImageError}
                                    />
                                ) : (
                                    <span className="text-white text-xs">🤖</span>
                                )}
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-blue-100">Beatbox Chile Bot</h3>
                                {answeredQuestions.length > 0 && (
                                    <p className="text-xs text-blue-300">
                                        {answeredQuestions.length} pregunta{answeredQuestions.length !== 1 ? 's' : ''} respondida{answeredQuestions.length !== 1 ? 's' : ''}
                                    </p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={toggleChat}
                            className="text-blue-300 hover:text-blue-100 text-lg"
                        >
                            ×
                        </button>
                    </div>

                    {/* Área de mensajes */}
                    <div className="flex-1 p-3 sm:p-4 overflow-y-auto max-h-[60vh] space-y-3">
                        {currentView === 'questions' ? (
                            // Vista de preguntas
                    <div className="space-y-2">
                                <div className="text-center mb-4">
                                    <p className="text-xs sm:text-sm text-blue-200">Selecciona una pregunta:</p>
                                </div>
                                
                                {!showPreviousQuestions ? (
                                    // Preguntas no respondidas
                                    <>
                                        {currentFaqPage.length > 0 ? (
                                            currentFaqPage.map(faq => (
                                                <button
                                                    key={faq.question}
                                                    className="w-full bg-blue-900/30 text-blue-100 p-2 sm:p-2.5 rounded-lg text-xs sm:text-sm hover:bg-blue-800/50 hover:text-blue-300 transition-colors border border-blue-800/50 text-left"
                                                    onClick={() => handleQuestionClick(faq.question)}
                                                >
                                                    {faq.question}
                                                </button>
                                            ))
                                        ) : (
                                            <div className="text-center py-4">
                                                <p className="text-blue-300 text-sm">¡Has visto todas las preguntas!</p>
                                                <p className="text-blue-400 text-xs mt-1">Revisa las preguntas anteriores si quieres</p>
                                            </div>
                                        )}
                                        
                                        {/* Paginación para preguntas no respondidas */}
                                        {unansweredQuestions.length > 5 && (
                                            <div className="flex justify-between mt-4 pt-2 border-t border-blue-800/30">
                                                <button
                                                    className="text-blue-300 text-xs hover:text-blue-100 transition-colors disabled:opacity-50"
                                                    onClick={() => handlePagination('prev')}
                                                    disabled={page === 1}
                                                >
                                                    ← Anterior
                                                </button>
                                                <span className="text-blue-300 text-xs">
                                                    {page} de {Math.ceil(unansweredQuestions.length / 5)}
                                                </span>
                                                <button
                                                    className="text-blue-300 text-xs hover:text-blue-100 transition-colors disabled:opacity-50"
                                                    onClick={() => handlePagination('next')}
                                                    disabled={page === Math.ceil(unansweredQuestions.length / 5)}
                                                >
                                                    Siguiente →
                                                </button>
                                            </div>
                                        )}
                                        
                                        {/* Botón para revisar preguntas anteriores */}
                                        {previousQuestions.length > 0 && (
                                            <button
                                                className="w-full bg-neutral-800 text-blue-200 p-2 sm:p-2.5 rounded-lg text-xs sm:text-sm hover:bg-neutral-700 hover:text-blue-100 transition-colors border border-blue-800/50 mt-4"
                                                onClick={togglePreviousQuestions}
                                            >
                                                📋 Revisar preguntas anteriores ({previousQuestions.length})
                        </button>
                                        )}
                                    </>
                                ) : (
                                    // Preguntas anteriores
                                    <>
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-xs sm:text-sm text-blue-200 font-semibold">Preguntas anteriores:</h4>
                                            <button
                                                className="text-blue-300 text-xs hover:text-blue-100 transition-colors"
                                                onClick={togglePreviousQuestions}
                                            >
                                                ← Volver
                        </button>
                                        </div>
                                        
                                        {previousQuestions.map(faq => (
                                            <button
                                                key={faq.question}
                                                className="w-full bg-neutral-800 text-blue-200 p-2 sm:p-2.5 rounded-lg text-xs sm:text-sm hover:bg-neutral-700 hover:text-blue-100 transition-colors border border-blue-800/50 text-left"
                                                onClick={() => handlePreviousQuestionClick(faq.question)}
                                            >
                                                {faq.question}
                        </button>
                                        ))}
                                    </>
                                )}
                            </div>
                        ) : (
                            // Vista de chat
                            <div className="space-y-3">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex items-end gap-2 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                        data-message-id={message.id}
                                    >
                                        {/* Avatar del bot (izquierda) */}
                                        {message.type === 'bot' && (
                                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                {!imageError ? (
                                                    <Image
                                                        src="https://res.cloudinary.com/dfd1byvwn/image/upload/v1763746365/mascotabtx_ym0hyc.webp"
                                                        alt="Mascota"
                                                        width={20} height={20}
                                                        sizes="20px"
                                                        className="w-5 h-5 object-cover rounded-full"
                                                        onError={handleImageError}
                                                    />
                                                ) : (
                                                    <span className="text-white text-xs">🤖</span>
                                                )}
                                            </div>
                                        )}
                                        
                                        {/* Mensaje */}
                                        <div
                                            className={`max-w-[75%] p-2 sm:p-3 rounded-lg ${
                                                message.type === 'user'
                                                    ? 'bg-blue-600 text-white rounded-br-sm'
                                                    : 'bg-neutral-800 text-blue-100 rounded-bl-sm border border-blue-800/50'
                                            }`}
                                        >
                                            <p className="text-xs sm:text-sm leading-relaxed">{message.content}</p>
                                            <p className="text-xs opacity-70 mt-1">
                                                {message.timestamp.toLocaleTimeString('es-CL', { 
                                                    hour: '2-digit', 
                                                    minute: '2-digit' 
                                                })}
                                            </p>
                                        </div>
                                        
                                        {/* Avatar del usuario (derecha) */}
                                        {message.type === 'user' && (
                                            <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                {user?.image ? (
                                                    <Image
                                                        src={user.image}
                                                        alt="Usuario"
                                                        width={24} height={24}
                                                        sizes="24px"
                                                        className="w-6 h-6 object-cover rounded-full"
                                                    />
                                                ) : (
                                                    <span className="text-white text-xs">👤</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                
                                {/* Indicador de escritura */}
                                {isTyping && (
                                    <div className="flex items-end gap-2 justify-start">
                                        {/* Avatar del bot */}
                                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                            {!imageError ? (
                                                <Image
                                                    src="https://res.cloudinary.com/dfd1byvwn/image/upload/v1763746365/mascotabtx_ym0hyc.webp"
                                                    alt="Mascota"
                                                    width={20} height={20}
                                                    sizes="20px"
                                                    className="w-5 h-5 object-cover rounded-full"
                                                    onError={handleImageError}
                                                />
                                            ) : (
                                                <span className="text-white text-xs">🤖</span>
                                            )}
                                        </div>
                                        
                                        <div className="bg-neutral-800 text-blue-100 p-2 sm:p-3 rounded-lg rounded-bl-sm border border-blue-800/50">
                                            <div className="flex items-center space-x-1">
                                                <span className="text-xs">Beatbox Chile Bot está escribiendo</span>
                                                <div className="flex space-x-1">
                                                    <div className="w-1 h-1 bg-blue-300 rounded-full animate-bounce"></div>
                                                    <div className="w-1 h-1 bg-blue-300 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                                    <div className="w-1 h-1 bg-blue-300 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Indicador de navegación a pregunta anterior */}
                                {isNavigatingToPrevious && (
                                    <div className="flex justify-center">
                                        <div className="bg-blue-900/50 text-blue-200 p-2 rounded-lg border border-blue-800/50">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-3 h-3 border-2 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
                                                <span className="text-xs">Navegando a la conversación...</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Elemento de referencia para el auto-scroll */}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Footer con botones de acción */}
                    {currentView === 'chat' && (
                        <div className="p-3 sm:p-4 border-t border-blue-800/50">
                            <div className="flex gap-2">
                                <button
                                    className="flex-1 bg-blue-900/30 text-blue-100 p-2 rounded text-xs hover:bg-blue-800/50 hover:text-blue-300 transition-colors border border-blue-800/50"
                                    onClick={backToQuestions}
                                >
                                    Más preguntas
                                </button>
                                <button
                                    className="flex-1 bg-neutral-800 text-blue-100 p-2 rounded text-xs hover:bg-neutral-700 hover:text-blue-300 transition-colors border border-blue-800/50"
                                    onClick={toggleChat}
                                >
                                    Cerrar chat
                                </button>
                            </div>
                            {messages.length > 1 && (
                                <div className="mt-2">
                                    <button
                                        className="w-full bg-red-900/30 text-red-200 p-2 rounded text-xs hover:bg-red-800/50 hover:text-red-100 transition-colors border border-red-800/50"
                                        onClick={clearChatHistory}
                                    >
                                        🗑️ Limpiar historial
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Mascota;

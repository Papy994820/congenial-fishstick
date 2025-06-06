import { useState, useEffect } from 'react';

const slides = [
  {
    title: 'Formation en ligne flexible',
    description: 'Apprenez à votre rythme avec nos cours en ligne accessibles 24/7.',
  },
  {
    title: 'Contenu interactif',
    description: 'Profitez de vidéos, quiz et exercices pour une meilleure compréhension.',
  },
  {
    title: 'Suivi personnalisé',
    description: 'Bénéficiez d’un accompagnement adapté à vos besoins et objectifs.',
  },
];

const backgroundUrl =
  'https://th.bing.com/th/id/R.15b3622c5ccfb48f33a50f641006c34f?rik=mx6F3vPubqNVGA&pid=ImgRaw&r=0';

const ElearningSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-16 px-4 overflow-hidden">
      {/* Background image without blur */}
      <div
        className="absolute inset-0 z-0"
        aria-hidden="true"
        style={{
          backgroundImage: `url("${backgroundUrl}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {/* Overlay for color tint */}
      <div className="absolute inset-0 z-10 bg-blue-900 bg-opacity-40" aria-hidden="true" />
      {/* Card content */}
      <div className="relative z-20 max-w-3xl mx-auto text-center bg-white bg-opacity-90 rounded-2xl shadow-xl p-10">
        <h2 className="text-4xl font-extrabold mb-8 text-blue-800 tracking-tight drop-shadow">
          E-learning
        </h2>
        <div>
          <h3 className="text-2xl font-semibold mb-3 text-blue-900">{slides[currentIndex].title}</h3>
          <p className="text-lg text-blue-700 mb-6">{slides[currentIndex].description}</p>
          <div className="flex justify-center items-center space-x-4 mt-6">
            <button
              className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-300 text-blue-800 transition"
              onClick={() =>
                setCurrentIndex((currentIndex - 1 + slides.length) % slides.length)
              }
              aria-label="Précédent"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex space-x-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={`w-4 h-4 rounded-full border-2 border-blue-700 transition ${
                    index === currentIndex
                      ? 'bg-blue-700 scale-110 shadow-lg'
                      : 'bg-white'
                  }`}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Slide ${index + 1}`}
                />
              ))}
            </div>
            <button
              className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-300 text-blue-800 transition"
              onClick={() =>
                setCurrentIndex((currentIndex + 1) % slides.length)
              }
              aria-label="Suivant"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ElearningSlider;

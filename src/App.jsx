import { useEffect, useState } from 'react';
import './index.css';
const ruta = import.meta.env.VITE_APIFY_DATASET_URL;

function limpiarHashtagsFinales(texto) {
  const palabras = texto.trim().split(" ");
  const resultado = [];

  let eliminando = true;

  for (let i = palabras.length - 1; i >= 0; i--) {
    const palabra = palabras[i];
    if (eliminando && palabra.startsWith("#")) {
      continue;
    } else {
      eliminando = false;
      resultado.unshift(palabra);
    }
  }

  return resultado.join(" ");
}

function App() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch(ruta);
        const data = await res.json();
        setVideos(data);
      } catch (error) {
        console.error('Error al obtener datos:', error);
      }
    };

    fetchVideos();
  }, []);

  const formatearFecha = (fechaUnix) => {
    const fecha = new Date(fechaUnix * 1000);

    const opciones = { day: '2-digit', month: 'short', year: 'numeric' };
    const fechaFormateada = fecha
      .toLocaleDateString('en-GB', opciones)
      .replace(/ /g, '-');

    const hoy = new Date();
    const diffEnMs = hoy - fecha;
    const diffEnDias = Math.floor(diffEnMs / (1000 * 60 * 60 * 24));

    return `${fechaFormateada} (${diffEnDias === 1 ? '1 día' : `${diffEnDias} días`})`;
  }


  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Videos del Chef Nicolás Prieto</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 auto-rows-fr">
        {videos.map((video) => (
          <div key={video.id} className="flex flex-col rounded-xl shadow-md overflow-hidden bg-white">
            <img
              src={video.videoMeta.originalCoverUrl}
              alt="Miniatura del video"
              className="h-[400px] sm:h-[300px] md:h-[350px] object-cover object-top rounded-t-xl"
            />
            <div className="p-4 flex flex-col flex-grow">
              <p className="text-sm text-gray-700 mb-2">
                {limpiarHashtagsFinales(video.text)}
              </p>
              <p className="text-xs text-gray-500 mt-auto">
                {formatearFecha(video.createTime)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

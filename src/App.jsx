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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('Todos');
  const filtros = ['Todos', 'Receta en casa', 'Clases en instituto'];

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

  const videosFiltrados = videos.filter((video) => {
    const texto = limpiarHashtagsFinales(video.text);
    const coincideTexto = texto.toLowerCase().includes(searchTerm.toLowerCase());
    if (selectedTag === 'Todos') return coincideTexto && true;

    if (selectedTag === 'Receta en casa') {
      if (video.locationMeta?.locationName?.toLowerCase() === 'en mi casa') {
        return coincideTexto && true;
      }
    } else if (selectedTag === 'Clases en instituto') {
      const uno = texto.includes('clase');
      const dos = texto.includes('instituto');
      const tres = texto.includes('universidad');
      const cuatro = texto.includes('parciales');
      const cinco = texto.includes('examen');
      if (uno || dos || tres || cuatro || cinco) {
        return coincideTexto && true;
      }
    }

    return false;
  });



  const formatearFecha = (fechaUnix) => {
    const fecha = new Date(fechaUnix * 1000);

    const opciones = { day: '2-digit', month: 'short', year: 'numeric' };
    const fechaFormateada = fecha
      .toLocaleDateString('en-GB', opciones)
      .replace(/ /g, '-');

    const hoy = new Date();
    const diffEnMs = hoy - fecha;
    const diffEnDias = Math.floor(diffEnMs / (1000 * 60 * 60 * 24));
    return `${fechaFormateada} (${diffEnDias === 1 ? '1 día' : diffEnDias === 0 ? 'Hoy' : `${diffEnDias} días`})`;
  }


  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Videos del Chef Nicolás Prieto</h1>

      {/* 🔍 Buscador */}
      <input
        type="text"
        placeholder="Buscar por descripción..."
        className="w-full max-w-xl mx-auto mb-4 px-4 py-2 border rounded-lg shadow-sm block"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* 🏷️ Filtros */}
      {/* <div className="flex flex-wrap justify-center gap-2 mb-6">
        {filtros.map((filtro) => (
          <button
            key={filtro}
            onClick={() => setSelectedTag(filtro)}
            className={`px-4 py-2 rounded-full border ${selectedTag === filtro ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
              } hover:bg-blue-500 hover:text-white transition`}
          >
            {filtro}
          </button>
        ))}
      </div> */}

      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-6">
        {videos.map((video) => (
          <a
            href={video.webVideoUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div key={video.id} className="flex flex-col rounded-xl shadow-md overflow-hidden bg-white transform transition duration-300 hover:scale-[1.02] hover:shadow-xl rounded-xl">
              <img
                src={video.videoMeta.originalCoverUrl}
                alt="Miniatura del video"
                className="h-[300px] sm:h-[200px] md:h-[250px] object-cover object-top rounded-t-xl"
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
          </a>
        ))}
      </div>
    </div>
  );
}

export default App;

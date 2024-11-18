document.addEventListener("DOMContentLoaded", () => {
  // Crear el audio para el sonido de atmósfera
  const atmosphereAudio = new Audio('sounds/atmosphere.mp3');
  atmosphereAudio.loop = true;
  atmosphereAudio.volume = 0.3;
  
  // Intentar reproducir el sonido al cargar
  atmosphereAudio.play().catch((err) => {
    console.warn("El navegador bloqueó la reproducción automática del audio:", err);
  });

  // Desbloquear la reproducción del audio en interacción
  document.body.addEventListener("click", () => {
    if (atmosphereAudio.paused) {
      atmosphereAudio.play().catch((err) => console.warn("No se pudo reproducir el audio:", err));
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const replieContainer = document.getElementById("replie-container");
  const pathContainer = document.getElementById("path-container");
  const imgContainer = document.getElementById("img-container");
  const htmlContainer = document.getElementById("html-container");
  const staticContainer = document.getElementById("static-container");
  const audio = new Audio('sounds/keyclick.mp3');

  let replies = [];
  let initialReplieShown = false;

  // Cargar respuestas desde el archivo JSON
  fetch('replies.json')
    .then((response) => response.json())
    .then((data) => {
      replies = data;
      displayInteractiveReplie(0);
    })
    .catch((error) => console.error("Error al cargar las respuestas:", error));

  // Función para escribir el texto con efecto
  function typeText(element, text, callback) {
    let index = 0;
    const typingInterval = 50;

    function type() {
      if (index < text.length) {
        element.innerHTML += text[index++];
        audio.currentTime = 0; // Reiniciar sonido
        audio.play();
        setTimeout(type, typingInterval);
      } else if (callback) {
        callback();
      }
    }

    element.innerHTML = '';
    type();
  }

  // Función para mostrar HTML con Glitch
  function displayHtmlWithEffect(container, html) {
    container.innerHTML = '';
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = html.trim();

    const elements = Array.from(tempContainer.children);
    container.style.opacity = 0;

    setTimeout(() => {
      container.style.opacity = 1;
      elements.forEach((el, i) => {
        const delay = i * 200;
        setTimeout(() => {
          el.style.opacity = 0;
          el.style.filter = 'blur(5px)';
          container.appendChild(el);

          // Aplicar transición
          setTimeout(() => {
            el.style.transition = 'opacity 0.5s, filter 0.5s';
            el.style.opacity = 1;
            el.style.filter = 'blur(0)';
          }, 100);
        }, delay);
      });
    }, 500);
  }

  // Función para mostrar las respuestas interactivas
  function displayInteractiveReplie(id) {
    const replie = replies[id];

    if (!replie) {
      console.error("Respuesta no encontrada:", id);
      return;
    }

    htmlContainer.innerHTML = '';

    // Mostrar imagen si existe
    if (replie.img) {
      imgContainer.innerHTML = `<img src="${replie.img}" alt="${replie.alt}" class="story-img">`;
    } else {
      imgContainer.innerHTML = '';
    }

    // Ocultar botones antes de cambiar de texto
    pathContainer.innerHTML = '';

    // Mostrar texto con efecto de escritura
    const replieText = document.createElement('p');
    replieText.classList.add('replie-text');
    replieContainer.innerHTML = '';
    replieContainer.appendChild(replieText);

    // Evitar efecto de escritura para el texto inicial si ya se mostró
    if (id === 0 && initialReplieShown) {
      replieText.innerHTML = replie.text;
      if (replie.html) {
        displayHtmlWithEffect(htmlContainer, replie.html);
      }
      displayPaths(replie.paths);
    } else {
      typeText(replieText, replie.text, () => {
        if (id === 0) initialReplieShown = true;
        if (replie.html) {
          displayHtmlWithEffect(htmlContainer, replie.html);
        }
        displayPaths(replie.paths);
      });
    }
  }

  // Función para mostrar los botones de preguntas/respuestas
  function displayPaths(paths) {
    if (paths) {
      pathContainer.innerHTML = paths
        .map((path) => `<button class="path-btn" data-target="${path.target}">${path.text}</button>`)
        .join('');
    } else {
      pathContainer.innerHTML = `<button class="path-btn" data-target="replay">Volver</button>`;
    }
  }

  // Función para mostrar el efecto de estática
  function showStaticEffect(callback) {
    const staticAudio = new Audio('sounds/static.mp3');
    staticAudio.volume = 0.7;
    
    staticContainer.style.display = 'block';
    staticAudio.play();

    setTimeout(() => {
      staticAudio.pause();
      staticAudio.currentTime = 0;
      staticContainer.style.display = 'none';
      callback();
    }, 1700);
  }

  // Manejo de eventos para los botones
  pathContainer.addEventListener("click", (event) => {
    const target = event.target.getAttribute("data-target");

    if (target === "replay") {
      showStaticEffect(() => displayInteractiveReplie(0));
    } else if (target) {
      displayInteractiveReplie(parseInt(target, 10));
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const audio2 = new Audio('sounds/keyclick.mp3'); // Sonido de tecla

  function attachKeySoundToInputs(container) {
    const inputs = container.querySelectorAll("input, textarea"); // Buscar inputs y textareas dentro del contenedor
    inputs.forEach(input => {
      // Evitar agregar múltiples listeners al mismo elemento
      if (!input.dataset.listenerAdded) {
        input.addEventListener("input", () => {
          audio2.currentTime = 0; // Reiniciar el sonido
          audio2.play(); // Reproducir el sonido
        });
        input.style.fontFamily = "Retro, monospace"; // Aplicar la fuente Retro
        input.dataset.listenerAdded = true; // Marcar el input como manejado
      }
    });
  }

  // Observar cambios en el contenedor principal donde se agrega contenido dinámico
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Solo procesar nodos de tipo elemento
            attachKeySoundToInputs(node); // Adjuntar comportamiento a los inputs encontrados
          }
        });
      }
    });
  });

  // Iniciar el observer en el contenedor donde se inserta el formulario
  const dynamicContainer = document.getElementById("html-container");
  observer.observe(dynamicContainer, { childList: true, subtree: true });

  // También aplicamos inmediatamente en caso de que los inputs ya existan
  attachKeySoundToInputs(dynamicContainer);
});;
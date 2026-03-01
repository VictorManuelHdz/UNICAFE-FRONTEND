# ☕ Unicafe - Frontend V3

Proyecto de interfaz para la aplicación Unicafe utilizando **Tailwind CSS v4**.

## 🚀 Cómo empezar

1. **Clonar el repositorio:**
   ```bash
   git clone [URL-de-tu-repo]

2. **Instalar dependencias**
npm install

3. **Copilar tailwind**
npx @tailwindcss/cli -i ./SRC/input.css -o ./public/css/output.css --content "./public/**/*.html" --watch

4. **Flujo de trabajo en GitHub**
Para que el trabajo fluya, sigan estos pasos:
    1. **Sincronizar:** Antes de empezar a diseñar, haz un `git pull` para tener lo último que hizo tu equipo.
    2. **Ramas:** Si vas a hacer la página de "Menú Detalle", crea una rama.
    3. **Commit:** Guarda tus cambios con mensajes claros: `git commit -m "Añadidos colores de Unicafe al header"`.
    4. **Push:** Sube tu rama y pide a alguien que la revise en un **Pull Request**.

5. **Estructura de carpetas**
/UNICAFE-PROYECTO-V3
├── /node_modules          <-- Instalaciones de Tailwind
├── /public                <-- TODO lo que el navegador puede ver
│   ├── /css
│   │   └── output.css     <-- El archivo que genera Tailwind
│   ├── /assets            <-- Imágenes, logos y fotos de café
│   ├── index.html         <-- Páginas HTML movidas aquí
│   ├── mi_cuenta.html
│   └── barra_navegacion.html
├── /src                   <-- Archivos de configuración y lógica original
│   └── input.css          <-- Tu archivo con @theme y colores sin puntos y coma
├── .gitignore             <-- Para no subir basura a GitHub
├── package.json           <-- Configuración de scripts
└── README.md              <-- Instrucciones para tu equipo 
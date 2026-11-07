# Portfolio Soukayna Betahi

Portfolio construit avec Next.js 16, React 19 et TypeScript. L'interface est déployée sur Vercel. L'API du chatbot est un service FastAPI séparé, déployable avec le `render.yaml` fourni.

## Développement local

```bash
npm ci
npm run dev
```

Copiez `.env.example` vers `.env.local` et renseignez `PYTHON_SERVICE_URL` si le service Python est démarré. En local, l'API Next.js utilise `http://localhost:8000` par défaut.


<!-- ..\.venv\Scripts\python.exe -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload -->

## Déploiement du site sur Vercel

1. Importez le dépôt GitHub dans Vercel.
2. Définissez le **Root Directory** sur le dossier qui contient ce README et `package.json` (le dossier `portfolio-template/portfolio-template/portfolio-template` si vous conservez l'arborescence actuelle).
3. Gardez les commandes de build par défaut de Next.js (`npm run build`).
4. Après le déploiement de l'API Python, ajoutez `PYTHON_SERVICE_URL` aux variables d'environnement Vercel pour les environnements souhaités. Sa valeur est l'URL publique du service, sans slash final.

## Déploiement de l'API du chatbot sur Render

Le fichier `render.yaml` décrit le service Docker. Dans Render, créez un Blueprint à partir du dépôt et renseignez les secrets `GROQ_API_KEY` et `JINA_API_KEY` lorsque Render les demande. La base ChromaDB du projet est incluse dans l'image comme données initiales.

L'API vérifie son état sur `/health`. Une fois le service créé, copiez son URL publique dans `PYTHON_SERVICE_URL` sur Vercel. Les clés Groq et Jina restent uniquement dans les variables Render ; ne les ajoutez pas à `.env.example`, au code client ou à Git.

## Git et secrets

Le `.gitignore` exclut les fichiers `.env`, les environnements Python et les sorties de build. `.env.example` ne contient que des noms de variables et des valeurs d'exemple non sensibles. Le CV servi par le site est `public/cv.pdf`.

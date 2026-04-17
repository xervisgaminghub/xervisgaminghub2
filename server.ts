import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API Route for News (Proxy to bypass client-side restrictions)
  app.get("/api/news", async (req, res) => {
    try {
      const { q = 'gaming esports', sortBy = 'publishedAt' } = req.query;
      const apiKey = process.env.NEWS_API_KEY || "644767f56dd348f3925649b23cd33aa6";
      
      const response = await axios.get(`https://newsapi.org/v2/everything`, {
        params: {
          q,
          sortBy,
          apiKey,
          pageSize: 20,
          language: 'en'
        },
        headers: {
          'User-Agent': 'XervisGamingHub/1.0'
        }
      });
      
      if (response.data.status !== 'ok') {
        throw new Error(response.data.message || 'NewsAPI error');
      }
      
      res.json(response.data);
    } catch (error: any) {
      console.error("News API Error:", error.response?.data || error.message);
      res.status(error.response?.status || 500).json({
        error: "Failed to fetch news",
        details: error.response?.data || error.message
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

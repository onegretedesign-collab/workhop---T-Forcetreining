import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
app.use(express.json());

const MP_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN || 'APP_USR-3076148594854282-110211-b2225ead7724b64ec13341b056e86ea0-327248121';

// Dynamic Mercado Pago Checkout Preference Endpoint
app.post('/api/create-preference', async (req, res) => {
  try {
    const { buyer, saleId } = req.body || {};
    const origin = req.headers.origin || 'https://ais-pre-zk3mewypumi3oysvl2lgb5-215875140479.us-east1.run.app';

    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            id: 'passaporte-performance-360',
            title: 'Passaporte Congresso Presencial - Performance 360º',
            description: 'Workshop T-Forcetreining Dragon Gym - 20 de Fevereiro',
            quantity: 1,
            currency_id: 'BRL',
            unit_price: 200.00,
          },
        ],
        payer: buyer ? {
          name: buyer.fullName || undefined,
          email: buyer.email || undefined,
          phone: buyer.phone ? { number: buyer.phone.replace(/\D/g, '') } : undefined,
          identification: buyer.cpf ? { type: 'CPF', number: buyer.cpf.replace(/\D/g, '') } : undefined,
        } : undefined,
        back_urls: {
          success: `${origin}/?mode=retorno-pagamento`,
          failure: `${origin}/?mode=retorno-pagamento`,
          pending: `${origin}/?mode=retorno-pagamento`,
        },
        auto_return: 'approved',
        external_reference: saleId || undefined,
        statement_descriptor: 'PERF 360 DRAGON',
      }),
    });

    const data = await mpRes.json();
    if (data.init_point) {
      return res.json({ url: data.init_point, id: data.id });
    }
    return res.status(400).json({ error: 'Erro ao gerar preferência Mercado Pago', details: data });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Vite Middleware for Dev, Static serving for Prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
  });
}

startServer();

# 🛒 Compra Inteligente

App web para comparar preços de produtos entre diferentes mercados, identificar o menor preço e gerar uma lista de compras otimizada em PDF.

## Funcionalidades

- **Comparação de preços** — adicione o mesmo produto em dois ou mais mercados e veja automaticamente qual tem o menor preço, com destaque visual
- **Economia calculada** — mostra quanto você economiza escolhendo sempre o menor preço
- **Lista final inteligente** — gera automaticamente uma lista com apenas os itens mais baratos de cada mercado
- **Download em PDF** — exporta a lista final formatada com total estimado
- **Leitor de código de barras** — usa a câmera do dispositivo para escanear produtos
- **Identificação automática** — consulta a base Open Food Facts para preencher o nome do produto pelo código de barras

## Como usar

### Localmente

Basta abrir o arquivo `index.html` no navegador. Não precisa de servidor ou instalação.

> **Nota:** o leitor de código de barras requer HTTPS ou `localhost` para acessar a câmera. Para testar localmente com câmera, use um servidor simples:

```bash
# Python 3
python -m http.server 8080

# Node.js (npx)
npx serve .
```

Depois acesse `http://localhost:8080` no navegador.

### GitHub Pages

1. Faça o fork ou suba o repositório no GitHub
2. Vá em **Settings → Pages**
3. Em "Branch", selecione `main` e pasta `/root`
4. Clique em **Save**
5. Acesse a URL gerada (ex: `https://seu-usuario.github.io/compra-inteligente`)

## Estrutura de arquivos

```
compra-inteligente/
├── index.html   # Estrutura da página
├── style.css    # Estilos e layout
├── app.js       # Lógica da aplicação
└── README.md    # Este arquivo
```

## Tecnologias

| Lib | Uso |
|-----|-----|
| [ZXing JS](https://github.com/zxing-js/library) | Leitura de código de barras via câmera |
| [jsPDF](https://github.com/parallax/jsPDF) | Geração de PDF no navegador |
| [Open Food Facts API](https://world.openfoodfacts.org/) | Identificação de produtos pelo código de barras |

Carregadas via CDN — nenhuma instalação necessária.

## Compatibilidade

- Funciona em qualquer navegador moderno (Chrome, Firefox, Safari, Edge)
- Totalmente responsivo para celular e tablet
- O leitor de código de barras funciona melhor no celular com câmera traseira

## Licença

MIT

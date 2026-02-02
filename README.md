# API Maker

Web sitelerinden veri çekip REST API'ye dönüştüren esnek bir web scraping aracı.

## Ozellikler

- **Web Scraping to API**: Herhangi bir web sitesinden veri çekerek REST API endpoint'leri olarak sunar
- **Headless Browser Desteği**: Puppeteer ile dinamik içerikli sitelerden veri çekebilir
- **YAML Konfigürasyon**: API tanımlamalarını YAML dosyası ile kolayca yönetin
- **CSS Seçicileri**: HTML elementlerini CSS seçicileri ile hedefleyin
- **TypeScript**: Tip-güvenli kod tabanı
- **Docker Desteği**: Kolay deploy için Docker image'i hazır

## Kurulum

```bash
npm install
```

## Kullanim

### 1. API Konfigürasyonu Olustur

`api.yaml` dosyası oluşturun:

```yaml
port: 8080
apis:
  - name: "Ornek API"
    path: "ornek-api"
    url: "https://example.com"
    headlessBrowser: false
    headers:
      "User-Agent": "API Maker"
    fields:
      - name: "baslik"
        process:
          method: "textContent"
          query: "h1"
```

### 2. Server'i Başlat

```bash
npm start
```

### 3. API'ye Eriş

```bash
curl http://localhost:8080/ornek-api
```

## Yapilandirma Secenekleri

| Parametre | Tip | Zorunlu | Aciklama |
|-----------|-----|---------|----------|
| `port` | number | Evet | Server portu |
| `apis` | array | Evet | API tanimlari dizisi |
| `apis[].name` | string | Evet | API adi |
| `apis[].path` | string | Evet | URL path'i |
| `apis[].url` | string | Evet | Hedef web sitesi URL'i |
| `apis[].headlessBrowser` | boolean | Hayir | Puppeteer kullan (default: false) |
| `apis[].headers` | object | Hayir | HTTP header'lari |
| `apis[].fields` | array | Evet | Veri cikarma kurallari |

### Alan (Field) Tanimlama

Her alan için iki secenek vardir:

**Basit Alan:**
```yaml
fields:
  - name: "baslik"
    process:
      method: "textContent"  # textContent, innerHTML, href, src, etc.
      query: "h1"           # CSS secici
```

**Ic Ice Alanlar:**
```yaml
fields:
  - name: "icerik"
    fields:
      - name: "baslik"
        process:
          method: "textContent"
          query: ".title"
```

## Docker Kullanimi

```bash
# Build
docker build -t api-maker .

# Run
docker run -p 8080:8080 -v $(pwd)/api.yaml:/usr/src/app/api.yaml api-maker
```

## Ortam Degiskenleri

| Degisken | Default | Aciklama |
|----------|---------|----------|
| `API_FILE` | `{PWD}/api.yaml` | API konfigürasyon dosyasi yolu |

## Proje Yapisi

```
api-maker/
├── src/
│   ├── app.ts           # Express server ana uygulama
│   ├── api.ts           # API model sinifi
│   ├── browser.ts       # Puppeteer browser yonetimi
│   ├── config.ts        # YAML konfigürasyon okuyucu
│   ├── content-fetch.ts # HTTP/Headless browser istekleri
│   ├── field.ts         # Field model arayuzu
│   ├── parser.ts        # HTML parsing ve veri cikarma
│   └── process.ts       # Process arayuzu
├── package.json
├── tsconfig.json
├── Dockerfile
└── api.yaml             # API konfigürasyon dosyasi (kullanici tarafindan olusturulur)
```

## Lisans

MIT

## Author

İbrahim Akyel <ibrahim@ibrahimakyel.com>

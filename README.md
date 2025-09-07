# MDM / CPD ERP API (Node.js + TypeScript + MongoDB)

ItemType, Category ve Family varlıkları ile hiyerarşik bir yapı ve bunları bağlayan esnek `Association` modeli.

## Özellikler
- ItemType / Category / Family CRUD
- Category ve Family için parent-child hiyerarşisi + ağaç çıkışı (`/tree`)
- Esnek ilişkilendirme: `Association` (ItemType, Category, Family arası)
- Swagger UI ile API dokümantasyonu (`/docs`)
- Express, Mongoose, TypeScript

## Kurulum
1. Bağımlılıkları yükle:
   ```bash
   npm install
   ```
2. Ortam değişkenlerini ayarla:
   ```bash
   cp .env.example .env
   # .env içindeki MONGO_URI ve PORT değerlerini gerekirse düzenleyin
   ```
3. Geliştirme modunda çalıştır:
   ```bash
   npm run dev
   ```
   veya derleyip çalıştır:
   ```bash
   npm run build && npm start
   ```

Varsayılan olarak sunucu `http://localhost:3000` üzerinde açılır ve Swagger UI `http://localhost:3000/docs` altındadır.

## Veri Modelleri (Özet)
- ItemType: `name`, `code (unique)`, `description`, `attributes`
- Category: `name`, `code (unique)`, `parent`, `ancestors[]`, `attributes`
- Family: `name`, `code (unique)`, `parent`, `ancestors[]`, `attributes`
- Association: `fromModel`, `fromId`, `toModel`, `toId`, `kind`, `metadata`

`Association` ile ItemType-Category-Family arasında yönlü ve tür etiketli bağlantılar kurabilirsiniz. Duplicate'e karşı unique index bulunmaktadır.

## API Örnekleri

### ItemType
- POST `/api/item-types` body:
  ```json
  { "name": "Product", "code": "PROD", "description": "Product type" }
  ```
- GET `/api/item-types`
- GET `/api/item-types/{id}`
- PATCH `/api/item-types/{id}`
- DELETE `/api/item-types/{id}`

### Category
- POST `/api/categories` body:
  ```json
  { "name": "Electronics", "code": "ELEC" }
  ```
- Alt kategoriler için `parent` alanı ObjectId olur.
- GET `/api/categories`
- GET `/api/categories/tree`
- GET `/api/categories/{id}`
- PATCH `/api/categories/{id}`
- DELETE `/api/categories/{id}`

### Family
- Benzer uçlar: `/api/families`, `/api/families/tree`, `/{id}`

### Association
- POST `/api/associations` body:
  ```json
  {
    "fromModel": "ItemType",
    "fromId": "<itemTypeId>",
    "toModel": "Category",
    "toId": "<categoryId>",
    "kind": "allowed-in"
  }
  ```
- GET `/api/associations?fromModel=ItemType&fromId=<id>`
- GET `/api/associations/{id}`
- DELETE `/api/associations/{id}`

## Notlar
- Category ve Family kayıtlarında `parent` değiştiğinde `ancestors` otomatik güncellenir.
- Swagger şemaları rotalardaki JSDoc üzerinden üretilmektedir (`src/routes/*.ts`).


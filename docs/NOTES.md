# System Notes / İş Kuralları

Bu doküman, sistemde uygulanan iş kuralları ve API davranışlarını özetler.

## Silme Kısıtları (Delete Guards)
- ItemType: Bu item type'a bağlı herhangi bir Item varsa silinemez.
- Category: Aşağıdaki durumlardan biri varsa silinemez:
  - Bu kategoriye bağlı Family kayıtları var.
  - Bu kategoriye bağlı Item kayıtları var.
  - Herhangi bir ItemType bu kategoriyi referanslıyor (Category.itemType üzerinden).
- Family: Bu family'e bağlı Item kayıtları varsa silinemez.
- AttributeGroup: Aşağıdaki durumlardan biri varsa silinemez:
  - Grup içinde Attribute var.
  - Grup, herhangi bir ItemType/Category/Family kaydında `attributeGroups` alanında referanslanıyor.

Tüm bu durumlarda API `409 Conflict` ile anlamlı bir kod/mesaj döndürür.

## AttributeGroup Çıkarma (Detachment) Kısıtları
ItemType/Category/Family üzerinde `attributeGroups` listesinden bir grup çıkartılırken, ilgili kapsamda Item varsa işlem engellenir ve `409 Conflict` döner.
- ItemType için kapsam: `Item.itemType == <id>`
- Category için kapsam: `Item.category == <id>`
- Family için kapsam: `Item.family == <id>`

## Item Oluşturma / Güncelleme Kuralları
- Item yalnızca bir ItemType'a bağlıdır ve `categoryId` zorunludur.
- Seçilen Category, seçilen ItemType'a ait olmalıdır (`Category.itemType == ItemType._id`).
- (Opsiyonel) Family seçilecekse, seçilen Category'ye ait olmalıdır (`Family.category == Category._id`).
- Efektif Attribute Groups şu birleşimden oluşur:
  - ItemType.attributeGroups
  - Seçilen Category ve onun tüm atalarının (`ancestors`) attributeGroups'u
  - Seçilen Family (varsa) ve onun tüm atalarının attributeGroups'u
- Zorunlu (required) attribute'lar create sırasında sağlanmalıdır.
- READONLY attribute'lar create edildikten sonra update sırasında değiştirilemez.

## Yardımcı Listeleme Uçları
- `GET /api/item-types/{id}/categories`: İlgili ItemType'a ait kategorileri listeler.
- `GET /api/categories/{id}/families`: İlgili Category'ye ait family'leri listeler.

## Resolve Ucu
`GET /api/items/attributes/resolve?itemTypeId=...&categoryId=...&familyId=...`
- `itemTypeId` ve `categoryId` zorunludur.
- Dönen `attributeGroupIds`, yukarıdaki birleşim (itemType + kategori ataları + family ataları) ile oluşur.

## Kimlik Doğrulama ve Yetkilendirme
- JWT tabanlı kimlik doğrulama vardır. `Authorization: Bearer <accessToken>` ile erişilir.
- Refresh token desteği vardır: `/api/auth/refresh` ile yeni access token alınır.
- Session modeli ile refresh token süreci yönetilir; logout ile (refresh token) session revoke edilir.
- Roller ve izinler:
  - `PermissionGroup`: İzin grupları ve içerdiği izin listeleri (code, description).
  - `Role`: `grants` alanında `permissionCode -> boolean` eşleşmeleri bulunur. `isAdmin=true` ise tüm izinler verilir.
  - `User`: Her kullanıcının bir rolü vardır.
- Dinamik izin güncelleme: `requirePermission` middleware'i her istek için rolü DB'den okuyarak karar verdiği için, rol/izin değişiklikleri logout olmadan anında geçerlidir.

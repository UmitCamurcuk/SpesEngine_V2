import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

export const setupSwagger = (app: Express) => {
  const options: swaggerJsdoc.Options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'MDM/CPD ERP API',
        version: '1.0.0',
        description: 'ItemType - Category - Family hierarchy with associations',
      },
      servers: [{ url: '/'}],
      tags: [
        { name: 'ItemType' },
        { name: 'Category' },
        { name: 'Family' },
        { name: 'Association' },
        { name: 'Attribute' },
        { name: 'AttributeGroup' },
      ],
      components: {
        schemas: {
          AttributeType: {
            type: 'string',
            description: 'Attribute türü',
            enum: [
              'text','number','boolean','date','datetime','time',
              'select','multiselect',
              'file','image','attachment',
              'object','array','json','formula','expression','table',
              'color','rich_text','rating','barcode','qr','readonly'
            ],
          },
          AttributeOption: {
            type: 'object',
            properties: {
              value: { type: 'string' },
              label: { type: 'string' }
            },
            required: ['value']
          },
          AttributeTextConfig: {
            type: 'object',
            properties: {
              minLength: { type: 'integer', minimum: 0 },
              maxLength: { type: 'integer', minimum: 0 },
              pattern: { type: 'string', description: 'RegExp source' }
            }
          },
          AttributeNumberConfig: {
            type: 'object',
            properties: {
              min: { type: 'number' },
              max: { type: 'number' },
              decimals: { type: 'integer', minimum: 0 },
              step: { type: 'number', minimum: 0 }
            }
          },
          AttributeDateLikeConfig: {
            type: 'object',
            properties: {
              min: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
              max: { type: 'string', example: '2026-12-31T23:59:59.999Z' }
            }
          },
          AttributeTimeConfig: {
            type: 'object',
            properties: {
              min: { type: 'string', example: '09:00:00' },
              max: { type: 'string', example: '18:00:00' }
            }
          },
          AttributeSelectConfig: {
            type: 'object',
            properties: {
              options: { type: 'array', items: { $ref: '#/components/schemas/AttributeOption' } }
            },
            required: ['options']
          },
          AttributeMultiSelectConfig: {
            type: 'object',
            properties: {
              options: { type: 'array', items: { $ref: '#/components/schemas/AttributeOption' } }
            },
            required: ['options']
          },
          AttributeFileLikeConfig: {
            type: 'object',
            properties: {
              maxSize: { type: 'number', description: 'bytes' },
              maxFiles: { type: 'integer', minimum: 1 },
              allowedMimeTypes: { type: 'array', items: { type: 'string' } }
            }
          },
          AttributeObjectConfig: {
            type: 'object',
            properties: {
              properties: { type: 'object', additionalProperties: true },
              required: { type: 'array', items: { type: 'string' } }
            }
          },
          AttributeArrayConfig: {
            type: 'object',
            properties: {
              itemType: { type: 'string', description: 'string|number|boolean' }
            },
            required: ['itemType']
          },
          AttributeFormulaConfig: {
            type: 'object',
            properties: { expression: { type: 'string' } },
            required: ['expression']
          },
          AttributeExpressionConfig: {
            type: 'object',
            properties: { expression: { type: 'string' } },
            required: ['expression']
          },
          AttributeTableConfig: {
            type: 'object',
            properties: {
              columns: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['key', 'label'],
                  properties: {
                    key: { type: 'string' },
                    label: { type: 'string' }
                  }
                }
              }
            },
            required: ['columns']
          },
          AttributeColorConfig: {
            type: 'object',
            properties: {
              format: { type: 'string', enum: ['hex', 'rgb', 'hsl'] }
            }
          },
          AttributeRichTextConfig: {
            type: 'object',
            properties: {
              allowedTags: { type: 'array', items: { type: 'string' } }
            }
          },
          AttributeRatingConfig: {
            type: 'object',
            properties: { max: { type: 'integer', minimum: 1 } }
          },
          AttributeBarcodeConfig: {
            type: 'object',
            properties: { format: { type: 'string' } }
          },
          AttributeQRConfig: {
            type: 'object',
            properties: { errorCorrectionLevel: { type: 'string', enum: ['L', 'M', 'Q', 'H'] } }
          },
          AttributeReadonlyConfig: { type: 'object' },

          AttributeCreate: {
            type: 'object',
            required: ['name', 'code', 'type'],
            properties: {
              name: { type: 'string' },
              code: { type: 'string' },
              description: { type: 'string' },
              type: { $ref: '#/components/schemas/AttributeType' },
              required: { type: 'boolean', default: false },
              active: { type: 'boolean', default: true },
              defaultValue: {
                description: 'Varsayılan değer (type ile uyumlu olmalı)',
                oneOf: [
                  { type: 'string' },
                  { type: 'number' },
                  { type: 'boolean' },
                  { type: 'object' },
                  { type: 'array' },
                  { type: 'null' }
                ]
              },
              config: {
                description: 'type\'a göre değişen yapı',
                oneOf: [
                  { $ref: '#/components/schemas/AttributeTextConfig' },
                  { $ref: '#/components/schemas/AttributeNumberConfig' },
                  { $ref: '#/components/schemas/AttributeDateLikeConfig' },
                  { $ref: '#/components/schemas/AttributeDateLikeConfig' },
                  { $ref: '#/components/schemas/AttributeTimeConfig' },
                  { $ref: '#/components/schemas/AttributeSelectConfig' },
                  { $ref: '#/components/schemas/AttributeMultiSelectConfig' },
                  { $ref: '#/components/schemas/AttributeFileLikeConfig' },
                  { $ref: '#/components/schemas/AttributeFileLikeConfig' },
                  { $ref: '#/components/schemas/AttributeFileLikeConfig' },
                  { $ref: '#/components/schemas/AttributeObjectConfig' },
                  { $ref: '#/components/schemas/AttributeArrayConfig' },
                  { type: 'object', description: 'JSON serbest' },
                  { $ref: '#/components/schemas/AttributeFormulaConfig' },
                  { $ref: '#/components/schemas/AttributeExpressionConfig' },
                  { $ref: '#/components/schemas/AttributeTableConfig' },
                  { $ref: '#/components/schemas/AttributeColorConfig' },
                  { $ref: '#/components/schemas/AttributeRichTextConfig' },
                  { $ref: '#/components/schemas/AttributeRatingConfig' },
                  { $ref: '#/components/schemas/AttributeBarcodeConfig' },
                  { $ref: '#/components/schemas/AttributeQRConfig' },
                  { $ref: '#/components/schemas/AttributeReadonlyConfig' }
                ]
              }
            }
          },
          // Common primitives
          ObjectIdString: { type: 'string', description: 'Mongo ObjectId', example: '66e882f3e3a9f3b2a1c4d789' },
          AttributesMap: { type: 'object', additionalProperties: true, description: 'Attribute code -> value haritası' },
          EntityModel: { type: 'string', enum: ['ItemType','Category','Family'] },

          // ItemType
          ItemTypeCreate: {
            type: 'object',
            required: ['name','code'],
            properties: {
              name: { type: 'string' },
              code: { type: 'string' },
              description: { type: 'string' },
              attributeGroups: { type: 'array', items: { $ref: '#/components/schemas/ObjectIdString' } },
              attributes: { $ref: '#/components/schemas/AttributesMap' }
            }
          },
          ItemTypeUpdate: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              code: { type: 'string' },
              description: { type: 'string' },
              attributeGroups: { type: 'array', items: { $ref: '#/components/schemas/ObjectIdString' } },
              attributes: { $ref: '#/components/schemas/AttributesMap' }
            }
          },

          // Category
          CategoryCreate: {
            type: 'object',
            required: ['name','code'],
            properties: {
              name: { type: 'string' },
              code: { type: 'string' },
              parent: { $ref: '#/components/schemas/ObjectIdString' },
              attributeGroups: { type: 'array', items: { $ref: '#/components/schemas/ObjectIdString' } }
            }
          },
          CategoryUpdate: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              code: { type: 'string' },
              parent: { $ref: '#/components/schemas/ObjectIdString' },
              attributeGroups: { type: 'array', items: { $ref: '#/components/schemas/ObjectIdString' } },
              attributes: { $ref: '#/components/schemas/AttributesMap' }
            }
          },

          // Family
          FamilyCreate: {
            type: 'object',
            required: ['name','code'],
            properties: {
              name: { type: 'string' },
              code: { type: 'string' },
              parent: { $ref: '#/components/schemas/ObjectIdString' },
              attributeGroups: { type: 'array', items: { $ref: '#/components/schemas/ObjectIdString' } }
            }
          },
          FamilyUpdate: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              code: { type: 'string' },
              parent: { $ref: '#/components/schemas/ObjectIdString' },
              attributeGroups: { type: 'array', items: { $ref: '#/components/schemas/ObjectIdString' } },
              attributes: { $ref: '#/components/schemas/AttributesMap' }
            }
          },

          // Association
          AssociationCreate: {
            type: 'object',
            required: ['fromModel','fromId','toModel','toId'],
            properties: {
              fromModel: { $ref: '#/components/schemas/EntityModel' },
              fromId: { $ref: '#/components/schemas/ObjectIdString' },
              toModel: { $ref: '#/components/schemas/EntityModel' },
              toId: { $ref: '#/components/schemas/ObjectIdString' },
              kind: { type: 'string', example: 'relates' },
              metadata: { type: 'object' }
            }
          },

          // AttributeGroup
          AttributeGroupCreate: {
            type: 'object',
            required: ['name','code'],
            properties: {
              name: { type: 'string' },
              code: { type: 'string' },
              description: { type: 'string' },
              attributes: { type: 'array', items: { $ref: '#/components/schemas/ObjectIdString' } }
            }
          },
          AttributeGroupUpdate: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              code: { type: 'string' },
              description: { type: 'string' },
              attributes: { type: 'array', items: { $ref: '#/components/schemas/ObjectIdString' } }
            }
          }
        },
        examples: {
          Attribute_Text: {
            summary: 'TEXT - min/max/pattern',
            value: {
              name: 'Ürün Adı',
              code: 'product_name',
              type: 'text',
              required: true,
              config: { minLength: 3, maxLength: 120, pattern: '^.+$' },
              defaultValue: 'İsimsiz Ürün'
            }
          },
          Attribute_Number: {
            summary: 'NUMBER - min/max/decimals/step',
            value: {
              name: 'KDV Oranı',
              code: 'vat_rate',
              type: 'number',
              config: { min: 0, max: 100, decimals: 2, step: 0.5 },
              defaultValue: 20
            }
          },
          Attribute_Select: {
            summary: 'SELECT - options',
            value: {
              name: 'Beden',
              code: 'size',
              type: 'select',
              required: true,
              config: { options: [ { value: 's', label: 'Small' }, { value: 'm', label: 'Medium' }, { value: 'l', label: 'Large' } ] }
            }
          },
          Attribute_MultiSelect: {
            summary: 'MULTISELECT - options',
            value: {
              name: 'Renkler',
              code: 'colors',
              type: 'multiselect',
              config: { options: [ { value: 'red' }, { value: 'green' }, { value: 'blue' } ] }
            }
          },
          Attribute_File: {
            summary: 'FILE - tekli dosya',
            value: {
              name: 'Teknik Çizim',
              code: 'tech_drawing',
              type: 'file',
              config: { maxSize: 5242880, allowedMimeTypes: ['application/pdf'] }
            }
          },
          Attribute_Image: {
            summary: 'IMAGE - görsel',
            value: {
              name: 'Kapak Görseli',
              code: 'cover_image',
              type: 'image',
              config: { maxSize: 2097152, allowedMimeTypes: ['image/jpeg','image/png'] }
            }
          },
          Attribute_Attachment: {
            summary: 'ATTACHMENT - çoklu dosya',
            value: {
              name: 'Ekler',
              code: 'attachments',
              type: 'attachment',
              config: { maxFiles: 5, allowedMimeTypes: ['application/pdf','image/jpeg'] }
            }
          },
          Attribute_Object: {
            summary: 'OBJECT - iç içe',
            value: {
              name: 'Ölçüler',
              code: 'dimensions',
              type: 'object',
              config: { properties: { width: {}, height: {}, depth: {} }, required: ['width','height'] },
              defaultValue: { width: 0, height: 0 }
            }
          },
          Attribute_Array: {
            summary: 'ARRAY - itemType',
            value: {
              name: 'Anahtar Kelimeler',
              code: 'keywords',
              type: 'array',
              config: { itemType: 'string' }
            }
          },
          Attribute_JSON: {
            summary: 'JSON - serbest',
            value: {
              name: 'Ek Veri',
              code: 'extra_data',
              type: 'json',
              defaultValue: { any: 'thing' }
            }
          },
          Attribute_Formula: {
            summary: 'FORMULA - expression',
            value: {
              name: 'Net Fiyat',
              code: 'net_price',
              type: 'formula',
              config: { expression: 'gross_price / (1 + vat_rate/100)' }
            }
          },
          Attribute_Expression: {
            summary: 'EXPRESSION - görünürlük/koşul',
            value: {
              name: 'İndirim Koşulu',
              code: 'discount_rule',
              type: 'expression',
              config: { expression: 'category == "promo" && stock > 0' }
            }
          },
          Attribute_Table: {
            summary: 'TABLE - sütunlar',
            value: {
              name: 'Beden Tablosu',
              code: 'size_table',
              type: 'table',
              config: { columns: [ { key: 'size', label: 'Beden' }, { key: 'chest', label: 'Göğüs' }, { key: 'waist', label: 'Bel' } ] }
            }
          },
          Attribute_Color: {
            summary: 'COLOR - format',
            value: {
              name: 'Renk',
              code: 'color',
              type: 'color',
              config: { format: 'hex' },
              defaultValue: '#ffffff'
            }
          },
          Attribute_RichText: {
            summary: 'RICH_TEXT - allowedTags',
            value: {
              name: 'Açıklama',
              code: 'description_rt',
              type: 'rich_text',
              config: { allowedTags: ['p','b','i','ul','li','a'] }
            }
          },
          Attribute_Rating: {
            summary: 'RATING - max',
            value: {
              name: 'Kalite Puanı',
              code: 'quality_rating',
              type: 'rating',
              config: { max: 5 },
              defaultValue: 3
            }
          },
          Attribute_Barcode: {
            summary: 'BARCODE - format',
            value: {
              name: 'Barkod',
              code: 'barcode',
              type: 'barcode',
              config: { format: 'ean13' }
            }
          },
          Attribute_QR: {
            summary: 'QR - ECC',
            value: {
              name: 'QR Kod',
              code: 'qr_code',
              type: 'qr',
              config: { errorCorrectionLevel: 'H' }
            }
          },
          Attribute_Readonly: {
            summary: 'READONLY - salt okunur',
            value: {
              name: 'Oluşturulma Tarihi',
              code: 'created_at_ro',
              type: 'readonly',
              defaultValue: 'otomatik set edilebilir'
            }
          },

          // ItemType / Category / Family / Association / AttributeGroup examples
          ItemType_Create_1_Minimal: {
            summary: 'ItemType minimal',
            value: { name: 'Ürün', code: 'product' }
          },
          ItemType_Create_2_WithDesc: {
            summary: 'ItemType açıklama ile',
            value: { name: 'Hizmet', code: 'service', description: 'Hizmet tipi' }
          },
          ItemType_Create_3_WithGroups: {
            summary: 'ItemType attributeGroups ile',
            value: { name: 'Parça', code: 'part', attributeGroups: ['66e882f3e3a9f3b2a1c4d789'] }
          },
          ItemType_Create_4_WithGroupsAndAttrs: {
            summary: 'ItemType groups + attributes',
            value: {
              name: 'Ürün', code: 'product2', attributeGroups: ['66e882f3e3a9f3b2a1c4d789'],
              attributes: { product_name: 'Örnek Ürün', size: 'm', colors: ['red','blue'] }
            }
          },
          ItemType_Create_5_EmptyGroups: {
            summary: 'ItemType boş attributeGroups',
            value: { name: 'Bundle', code: 'bundle', attributeGroups: [] }
          },

          Category_Create_1_Minimal: {
            summary: 'Category minimal (parent null, sadece attributeGroups)',
            value: {
              name: 'Giyim',
              code: 'apparel',
              parent: null,
              attributeGroups: ['66e882f3e3a9f3b2a1c4d789']
            }
          },
          Category_Create_2_WithParent: {
            summary: 'Category parent ile (ItemType için association ayrı örneklerde)',
            value: {
              name: 'Erkek Giyim',
              code: 'mens_apparel',
              parent: '66e8b2b2b2b2b2b2b2b2b2b2',
              attributeGroups: ['66e882f3e3a9f3b2a1c4d78a']
            }
          },
          Category_Create_3_NoGroups: {
            summary: 'Category sadece name/code (grup yok)',
            value: {
              name: 'Aksesuar',
              code: 'accessories'
            }
          },
          Category_Create_4_EmptyGroups: {
            summary: 'Category boş attributeGroups',
            value: {
              name: 'Ayakkabı',
              code: 'shoes',
              parent: null,
              attributeGroups: []
            }
          },
          Category_Create_5_TwoGroups: {
            summary: 'Category iki attributeGroup ile',
            value: {
              name: 'Kışlık Giyim',
              code: 'winter_apparel',
              parent: null,
              attributeGroups: ['66e882f3e3a9f3b2a1c4d789', '66e882f3e3a9f3b2a1c4d78a']
            }
          },

          Family_Create_1_Minimal: {
            summary: 'Family minimal (parent null, sadece attributeGroups)',
            value: {
              name: 'Tişört',
              code: 'tshirt',
              parent: null,
              attributeGroups: ['66e882f3e3a9f3b2a1c4d789']
            }
          },
          Family_Create_2_WithParent: {
            summary: 'Family parent ile',
            value: {
              name: 'V Yaka Tişört',
              code: 'vneck_tshirt',
              parent: '66e8f1234567890abcdef123',
              attributeGroups: ['66e882f3e3a9f3b2a1c4d789']
            }
          },
          Family_Create_3_NoGroups: {
            summary: 'Family sadece name/code',
            value: {
              name: 'Sweatshirt',
              code: 'sweatshirt'
            }
          },
          Family_Create_4_EmptyGroups: {
            summary: 'Family boş attributeGroups',
            value: {
              name: 'Mont',
              code: 'jacket',
              parent: null,
              attributeGroups: []
            }
          },
          Family_Create_5_TwoGroups: {
            summary: 'Family iki attributeGroup ile',
            value: {
              name: 'Polar',
              code: 'fleece',
              parent: null,
              attributeGroups: ['66e882f3e3a9f3b2a1c4d789', '66e882f3e3a9f3b2a1c4d78a']
            }
          },

          Association_Create_1_CategoryToItemType: {
            summary: 'Category -> ItemType (belongs_to)',
            value: {
              fromModel: 'Category', fromId: '66e8b2b2b2b2b2b2b2b2b2b2',
              toModel: 'ItemType', toId: '66e8a1a21a21a1a21a21a1a2',
              kind: 'belongs_to'
            }
          },
          Association_Create_2_FamilyToCategory: {
            summary: 'Family -> Category (belongs_to)',
            value: {
              fromModel: 'Family', fromId: '66e8f1234567890abcdef123',
              toModel: 'Category', toId: '66e8b2b2b2b2b2b2b2b2b2b2',
              kind: 'belongs_to'
            }
          },
          Association_Create_3_ItemTypeToCategory: {
            summary: 'ItemType -> Category (supports)',
            value: {
              fromModel: 'ItemType', fromId: '66e8a1a21a21a1a21a21a1a2',
              toModel: 'Category', toId: '66e8b2b2b2b2b2b2b2b2b2b2',
              kind: 'supports'
            }
          },
          Association_Create_4_FamilyToItemType: {
            summary: 'Family -> ItemType (compatible_with)',
            value: {
              fromModel: 'Family', fromId: '66e8f1234567890abcdef124',
              toModel: 'ItemType', toId: '66e8a1a21a21a1a21a21a1a3',
              kind: 'compatible_with'
            }
          },
          Association_Create_5_CategoryContainsFamily: {
            summary: 'Category -> Family (contains)',
            value: {
              fromModel: 'Category', fromId: '66e8b2b2b2b2b2b2b2b2b2b3',
              toModel: 'Family', toId: '66e8f1234567890abcdef125',
              kind: 'contains',
              metadata: { note: 'Kategori bu aileyi içerir' }
            }
          },

          AttributeGroup_Create_1_Minimal: {
            summary: 'AttributeGroup minimal',
            value: { name: 'Temel Özellikler', code: 'basic_features' }
          },
          AttributeGroup_Create_2_WithDesc: {
            summary: 'AttributeGroup açıklama ile',
            value: { name: 'Görseller', code: 'media', description: 'Medya alanları' }
          },
          AttributeGroup_Create_3_WithAttributes: {
            summary: 'AttributeGroup attribute idleri ile',
            value: { name: 'Teknik', code: 'technical', attributes: ['66e8c3c3c3c3c3c3c3c3c3c3','66e8c3c3c3c3c3c3c3c3c3c4'] }
          },
          AttributeGroup_Create_4_EmptyAttributes: {
            summary: 'AttributeGroup boş attributes',
            value: { name: 'Pazarlama', code: 'marketing', attributes: [] }
          },
          AttributeGroup_Create_5_Another: {
            summary: 'AttributeGroup başka bir örnek',
            value: { name: 'Lojistik', code: 'logistics' }
          }
        }
      }
    },
    apis: ['src/routes/*.ts'],
  };

  const specs = swaggerJsdoc(options);
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }));
};

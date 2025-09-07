import mongoose, { Schema, InferSchemaType } from 'mongoose';
import { validateValueForAttribute } from '../utils/attributeValidation';

export enum AttributeType {
  // Basic (Temel) Types
  TEXT = 'text',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  DATE = 'date',
  DATETIME = 'datetime',
  TIME = 'time',

  // Enum / Seçilebilir Değerler
  SELECT = 'select',
  MULTISELECT = 'multiselect',

  // Dosya / Medya Tipleri
  FILE = 'file',
  IMAGE = 'image',
  ATTACHMENT = 'attachment',

  // Kompozit / Gelişmiş Tipler
  OBJECT = 'object',
  ARRAY = 'array',
  JSON = 'json',
  FORMULA = 'formula',
  EXPRESSION = 'expression',
  TABLE = 'table',

  // UI / Görsel Bileşen Tipleri
  COLOR = 'color',
  RICH_TEXT = 'rich_text',
  RATING = 'rating',
  BARCODE = 'barcode',
  QR = 'qr',

  // Special Types
  READONLY = 'readonly',
}

export const attributeTypes = Object.values(AttributeType);

const AttributeSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, unique: true },
    description: { type: String, default: '' },
    type: { type: String, enum: attributeTypes, required: true },
    required: { type: Boolean, default: false },
    defaultValue: { type: Schema.Types.Mixed, default: undefined },
    // Type-specific yapılandırma (her tipe göre doğrulanır)
    config: { type: Schema.Types.Mixed, default: {} },
    // Soft flags
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

AttributeSchema.index({ code: 1 }, { unique: true });
AttributeSchema.index({ name: 1 });

// Basit yardımcılar
const isNumber = (v: any) => typeof v === 'number' && Number.isFinite(v);
const isString = (v: any) => typeof v === 'string';
const isBoolean = (v: any) => typeof v === 'boolean';
const isDate = (v: any) => v instanceof Date || (isString(v) && !Number.isNaN(Date.parse(v)));
const isArray = (v: any) => Array.isArray(v);
const isObject = (v: any) => v && typeof v === 'object' && !Array.isArray(v);

// Attribute config doğrulama
AttributeSchema.pre('validate', function (next) {
  try {
    const self: any = this;
    const type: AttributeType = self.type;
    const cfg = self.config || {};

    const ensure = (cond: boolean, msg: string) => {
      if (!cond) {
        const err: any = new Error(msg);
        err.status = 400;
        throw err;
      }
    };

    switch (type) {
      case AttributeType.TEXT: {
        if (cfg.minLength !== undefined) ensure(Number.isInteger(cfg.minLength) && cfg.minLength >= 0, 'minLength must be a non-negative integer');
        if (cfg.maxLength !== undefined) ensure(Number.isInteger(cfg.maxLength) && cfg.maxLength >= 0, 'maxLength must be a non-negative integer');
        if (cfg.minLength !== undefined && cfg.maxLength !== undefined) ensure(cfg.maxLength >= cfg.minLength, 'maxLength must be >= minLength');
        if (cfg.pattern !== undefined) ensure(isString(cfg.pattern), 'pattern must be string (RegExp source)');
        break;
      }
      case AttributeType.NUMBER: {
        if (cfg.min !== undefined) ensure(isNumber(cfg.min), 'min must be number');
        if (cfg.max !== undefined) ensure(isNumber(cfg.max), 'max must be number');
        if (cfg.min !== undefined && cfg.max !== undefined) ensure(cfg.max >= cfg.min, 'max must be >= min');
        if (cfg.decimals !== undefined) ensure(Number.isInteger(cfg.decimals) && cfg.decimals >= 0, 'decimals must be non-negative integer');
        if (cfg.step !== undefined) ensure(isNumber(cfg.step) && cfg.step > 0, 'step must be positive number');
        if (cfg.allowNegative !== undefined) ensure(typeof cfg.allowNegative === 'boolean', 'allowNegative must be boolean');
        if (cfg.allowZero !== undefined) ensure(typeof cfg.allowZero === 'boolean', 'allowZero must be boolean');
        break;
      }
      case AttributeType.BOOLEAN: {
        // no extra config
        break;
      }
      case AttributeType.DATE:
      case AttributeType.DATETIME:
      case AttributeType.TIME: {
        if (cfg.min !== undefined) ensure(isString(cfg.min) || isDate(cfg.min), 'min must be date string');
        if (cfg.max !== undefined) ensure(isString(cfg.max) || isDate(cfg.max), 'max must be date string');
        break;
      }
      case AttributeType.SELECT:
      case AttributeType.MULTISELECT: {
        ensure(isArray(cfg.options) && cfg.options.length > 0, 'options must be non-empty array');
        for (const opt of cfg.options as any[]) {
          ensure(isObject(opt) && isString(opt.value), 'each option must be { value: string, label?: string }');
          if (opt.label !== undefined) ensure(isString(opt.label), 'option.label must be string');
        }
        break;
      }
      case AttributeType.FILE:
      case AttributeType.IMAGE:
      case AttributeType.ATTACHMENT: {
        if (cfg.maxSize !== undefined) ensure(isNumber(cfg.maxSize) && cfg.maxSize > 0, 'maxSize must be positive number (bytes)');
        if (cfg.maxFiles !== undefined) ensure(Number.isInteger(cfg.maxFiles) && cfg.maxFiles > 0, 'maxFiles must be positive integer');
        if (cfg.allowedMimeTypes !== undefined) {
          ensure(isArray(cfg.allowedMimeTypes), 'allowedMimeTypes must be array');
          for (const mt of cfg.allowedMimeTypes as any[]) ensure(isString(mt), 'allowedMimeTypes entries must be string');
        }
        break;
      }
      case AttributeType.OBJECT: {
        if (cfg.properties !== undefined) ensure(isObject(cfg.properties), 'properties must be object');
        if (cfg.required !== undefined) ensure(isArray(cfg.required), 'required must be array of strings');
        break;
      }
      case AttributeType.ARRAY: {
        ensure(isString(cfg.itemType), 'itemType is required (string)');
        if (cfg.minItems !== undefined) ensure(Number.isInteger(cfg.minItems) && cfg.minItems >= 0, 'minItems must be non-negative integer');
        if (cfg.maxItems !== undefined) ensure(Number.isInteger(cfg.maxItems) && cfg.maxItems >= 0, 'maxItems must be non-negative integer');
        if (cfg.minItems !== undefined && cfg.maxItems !== undefined) ensure(cfg.maxItems >= cfg.minItems, 'maxItems must be >= minItems');
        break;
      }
      case AttributeType.JSON: {
        // free-form
        break;
      }
      case AttributeType.FORMULA:
      case AttributeType.EXPRESSION: {
        ensure(isString(cfg.expression), 'expression is required (string)');
        break;
      }
      case AttributeType.TABLE: {
        ensure(isArray(cfg.columns) && cfg.columns.length > 0, 'columns must be non-empty array');
        for (const col of cfg.columns as any[]) {
          ensure(isObject(col) && isString(col.key) && isString(col.label), 'each column must have key and label');
        }
        break;
      }
      case AttributeType.COLOR: {
        if (cfg.format !== undefined) ensure(['hex', 'rgb', 'hsl'].includes(cfg.format), 'format must be one of hex|rgb|hsl');
        break;
      }
      case AttributeType.RICH_TEXT: {
        if (cfg.allowedTags !== undefined) ensure(isArray(cfg.allowedTags), 'allowedTags must be array');
        break;
      }
      case AttributeType.RATING: {
        if (cfg.max !== undefined) ensure(Number.isInteger(cfg.max) && cfg.max > 0, 'max must be positive integer');
        break;
      }
      case AttributeType.BARCODE: {
        if (cfg.format !== undefined) ensure(isString(cfg.format), 'format must be string');
        break;
      }
      case AttributeType.QR: {
        if (cfg.errorCorrectionLevel !== undefined) ensure(['L', 'M', 'Q', 'H'].includes(cfg.errorCorrectionLevel), 'errorCorrectionLevel must be L|M|Q|H');
        break;
      }
      case AttributeType.READONLY: {
        // no extra config
        break;
      }
      default:
        break;
    }
    // defaultValue type-check (varsa)
    if (self.defaultValue !== undefined) {
      validateValueForAttribute(self, self.defaultValue);
    }
    next();
  } catch (e) {
    next(e as any);
  }
});

export type AttributeDoc = InferSchemaType<typeof AttributeSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Attribute = mongoose.model('Attribute', AttributeSchema);

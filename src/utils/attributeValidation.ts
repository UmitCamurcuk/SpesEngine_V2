import { Attribute, AttributeType, type AttributeDoc } from '../models/Attribute';
import { AttributeGroup } from '../models/AttributeGroup';

type AttrMap = Map<string, AttributeDoc>;

const toAttrMap = (attrs: AttributeDoc[]): AttrMap => {
  const map: AttrMap = new Map();
  for (const a of attrs) map.set(a.code, a);
  return map;
};

const err = (message: string, details?: any) => {
  const e: any = new Error(message);
  e.status = 400;
  if (details) e.details = details;
  return e;
};

const isString = (v: any) => typeof v === 'string';
const isNumber = (v: any) => typeof v === 'number' && Number.isFinite(v);
const isBoolean = (v: any) => typeof v === 'boolean';
const isArray = (v: any) => Array.isArray(v);
const isObject = (v: any) => v && typeof v === 'object' && !Array.isArray(v);

const countDecimals = (num: number) => {
  const s = String(num);
  const i = s.indexOf('.');
  return i === -1 ? 0 : s.length - i - 1;
};

export const validateValueForAttribute = (attr: AttributeDoc, value: any) => {
  const t = attr.type as AttributeType;
  const cfg: any = attr.config || {};
  const path = attr.code;

  switch (t) {
    case AttributeType.TEXT: {
      if (!isString(value)) throw err(`${path} must be string`);
      if (cfg.minLength !== undefined && value.length < cfg.minLength) throw err(`${path} length < minLength`);
      if (cfg.maxLength !== undefined && value.length > cfg.maxLength) throw err(`${path} length > maxLength`);
      if (cfg.pattern) {
        const re = new RegExp(cfg.pattern);
        if (!re.test(value)) throw err(`${path} does not match pattern`);
      }
      break;
    }
    case AttributeType.NUMBER: {
      if (!isNumber(value)) throw err(`${path} must be number`);
      if (cfg.min !== undefined && value < cfg.min) throw err(`${path} < min`);
      if (cfg.max !== undefined && value > cfg.max) throw err(`${path} > max`);
      if (cfg.decimals !== undefined && countDecimals(value) > cfg.decimals) throw err(`${path} decimals exceed limit`);
      if (cfg.step !== undefined) {
        const base = cfg.min ?? 0;
        const diff = Math.abs((value - base) / cfg.step - Math.round((value - base) / cfg.step));
        if (diff > 1e-9) throw err(`${path} not aligned to step`);
      }
      break;
    }
    case AttributeType.BOOLEAN: {
      if (!isBoolean(value)) throw err(`${path} must be boolean`);
      break;
    }
    case AttributeType.DATE:
    case AttributeType.DATETIME: {
      if (!isString(value) || Number.isNaN(Date.parse(value))) throw err(`${path} must be ISO date string`);
      if (cfg.min && Date.parse(value) < Date.parse(cfg.min)) throw err(`${path} < min`);
      if (cfg.max && Date.parse(value) > Date.parse(cfg.max)) throw err(`${path} > max`);
      break;
    }
    case AttributeType.TIME: {
      if (!isString(value) || !/^\d{2}:\d{2}(:\d{2})?$/.test(value)) throw err(`${path} must be time string HH:MM[:SS]`);
      break;
    }
    case AttributeType.SELECT: {
      const opts = (cfg.options || []).map((o: any) => o.value);
      if (!opts.includes(value)) throw err(`${path} must be one of options`);
      break;
    }
    case AttributeType.MULTISELECT: {
      if (!isArray(value)) throw err(`${path} must be array`);
      const opts = new Set((cfg.options || []).map((o: any) => o.value));
      for (const v of value) if (!opts.has(v)) throw err(`${path} contains invalid option`);
      break;
    }
    case AttributeType.FILE:
    case AttributeType.IMAGE: {
      if (!isString(value)) throw err(`${path} must be string (url or path)`);
      break;
    }
    case AttributeType.ATTACHMENT: {
      if (!isArray(value)) throw err(`${path} must be array of strings`);
      for (const v of value) if (!isString(v)) throw err(`${path} entries must be strings`);
      if (cfg.maxFiles !== undefined && value.length > cfg.maxFiles) throw err(`${path} exceeds maxFiles`);
      break;
    }
    case AttributeType.OBJECT: {
      if (!isObject(value)) throw err(`${path} must be object`);
      break;
    }
    case AttributeType.ARRAY: {
      if (!isArray(value)) throw err(`${path} must be array`);
      // optional shallow type check on items
      if (cfg.itemType) {
        const it = String(cfg.itemType);
        for (const v of value) {
          // basic enforcement
          if (it === 'number' && !isNumber(v)) throw err(`${path} items must be number`);
          if (it === 'string' && !isString(v)) throw err(`${path} items must be string`);
          if (it === 'boolean' && !isBoolean(v)) throw err(`${path} items must be boolean`);
        }
      }
      break;
    }
    case AttributeType.JSON: {
      // Accept anything JSON-serializable
      break;
    }
    case AttributeType.FORMULA:
    case AttributeType.EXPRESSION: {
      // Typically computed; accept provided value as-is
      break;
    }
    case AttributeType.TABLE: {
      if (!isArray(value)) throw err(`${path} must be array of rows`);
      for (const row of value) if (!isObject(row)) throw err(`${path} rows must be objects`);
      break;
    }
    case AttributeType.COLOR: {
      if (!isString(value)) throw err(`${path} must be string`);
      if ((cfg.format ?? 'hex') === 'hex') {
        if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value)) throw err(`${path} must be hex color`);
      }
      break;
    }
    case AttributeType.RICH_TEXT: {
      if (!isString(value)) throw err(`${path} must be string`);
      break;
    }
    case AttributeType.RATING: {
      if (!isNumber(value)) throw err(`${path} must be number`);
      if (!Number.isInteger(value)) throw err(`${path} must be integer`);
      if (cfg.max !== undefined && value > cfg.max) throw err(`${path} > max`);
      if (value < 0) throw err(`${path} must be >= 0`);
      break;
    }
    case AttributeType.BARCODE:
    case AttributeType.QR: {
      if (!isString(value)) throw err(`${path} must be string`);
      break;
    }
    case AttributeType.READONLY: {
      // Accept any, modification rule is handled at controller level
      break;
    }
    default:
      break;
  }
};

export const loadAttributesForGroups = async (groupIds: Array<string>) => {
  if (!groupIds || groupIds.length === 0) return { attrs: [] as AttributeDoc[], map: new Map<string, AttributeDoc>() };
  const groups = await AttributeGroup.find({ _id: { $in: groupIds } }).populate('attributes');
  const attrs: AttributeDoc[] = [];
  for (const g of groups) {
    const docs = (g as any).attributes as AttributeDoc[];
    for (const a of docs) attrs.push(a);
  }
  return { attrs, map: toAttrMap(attrs) };
};

export const validateEntityAttributes = async (options: {
  attributeGroupIds: string[];
  values?: Record<string, any> | null;
  existingValues?: Record<string, any> | null;
  isUpdate?: boolean;
}) => {
  const { attributeGroupIds, values, existingValues, isUpdate } = options;
  const { map } = await loadAttributesForGroups(attributeGroupIds);
  const provided = values || {};
  const existing = existingValues || {};

  // Unknown keys
  for (const key of Object.keys(provided)) {
    if (!map.has(key)) throw err(`Unknown attribute: ${key}`);
  }

  // Validate required (on create) or when provided (on update)
  for (const a of map.values()) {
    const hasProvided = Object.prototype.hasOwnProperty.call(provided, a.code);
    const hasExisting = Object.prototype.hasOwnProperty.call(existing, a.code);
    if (a.required && !isUpdate) {
      if (!hasProvided && !hasExisting && a.defaultValue === undefined) throw err(`Missing required attribute: ${a.code}`);
    }
    if (hasProvided) {
      // READONLY protection on update: value cannot change
      if (isUpdate && a.type === AttributeType.READONLY && hasExisting) {
        const before = existing[a.code];
        const after = provided[a.code];
        const changed = JSON.stringify(before) !== JSON.stringify(after);
        if (changed) throw err(`Attribute ${a.code} is readonly and cannot be changed`);
      }
      validateValueForAttribute(a, provided[a.code]);
    }
  }

  // Build normalized
  const normalized: Record<string, any> = { ...existing };
  for (const [k, v] of Object.entries(provided)) normalized[k] = v;
  // fill defaults
  for (const a of map.values()) {
    if (normalized[a.code] === undefined && a.defaultValue !== undefined) {
      normalized[a.code] = a.defaultValue;
    }
  }
  return normalized;
};


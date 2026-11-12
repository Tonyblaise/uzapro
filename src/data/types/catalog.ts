import type { Pill } from "./common";

export interface ExtraUnitPrice {
  unit: string;
  price: number;
  cost: number;
}

export interface Variant {
  name: string;
  price: number;
  cost: number;
  unit: string;
  extraUnits: ExtraUnitPrice[];
}

export interface ProductImage {
  name: string;
  url: string;
}

/** The product form's Tax section (design `prodTaxes`). Absent on seed products = the design defaults. */
export interface ProductTax {
  /** "No tax", "VAT (16%)", "Zero-rated (0%)" or "Exempt" (Settings › Taxes). */
  sales: string;
  purchase: string;
  /** "Selling price includes tax" */
  salesInclusive: boolean;
  /** "Buying price includes tax" */
  purchaseInclusive: boolean;
}

export interface Product {
  name: string;
  category: string;
  /** Price label as shown in the design list ("34,500", "From 12,900"). */
  priceLabel: string;
  taxable: boolean;
  status: Pill;
  image?: ProductImage;
  tax?: ProductTax;
  /** False when the product has a single "Standard" variant (design `prodVar`). */
  hasVariants?: boolean;
  addedAt: string;
  addedBy: string;
  variants: Variant[];
}

export interface Category {
  name: string;
  description: string;
  parent: string;
  image?: ProductImage;
}

export interface NewProduct {
  name: string;
  category: string;
  taxable: boolean;
  image?: ProductImage;
  tax?: ProductTax;
  hasVariants?: boolean;
  variants: Variant[];
}

export interface NewCategory {
  name: string;
  description: string;
  parent?: string;
  image?: ProductImage;
}

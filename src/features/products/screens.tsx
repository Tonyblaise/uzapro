import type { ScreenMap } from "../types";
import { CategoryActions, CategoryList } from "./CategoryList";
import { ProductActions, ProductList } from "./ProductList";
import { OverviewActions, ProductsOverview } from "./ProductsOverview";
import { UnitActions, UnitList } from "./UnitList";

/** Tab slug → screen for Products (design `headerActions` per tab). */
export const productsScreens: ScreenMap = {
  overview: { Body: ProductsOverview, Actions: OverviewActions },
  "all-products": { Body: ProductList, Actions: ProductActions },
  categories: { Body: CategoryList, Actions: CategoryActions },
  "units-of-measure": { Body: UnitList, Actions: UnitActions },
};

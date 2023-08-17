export interface IInventoryProductDataType {
    id: null | number;
    vpid: string;
    vendor: string | null;
    title: string | null;
    link: string;
    image: string;
    thumbnail: string;
    sold: number;
    stock: null | number | string;
    rating: number | null;
    rating_count: null | number;
    status: null | string;
    countdown: null | string | number;
    badge: null | string;
    price: {
      min: number;
      max: number;
    } | null;
    discount_price: {
      min: number | null;
      max: number | null;
    };
    meta: null;
    wholesales: any[];
    shipping_cost: null | number;
    slug: string;
    product_code: string;
    country_id: number;
    shop_id: number;
    fx: string;
  }
  
  export interface IInventoryProductsPaginateType {
    per_page: number;
    total: number;
    current_page: number;
    last_page: number;
    prev_page: null | number;
    next_page: null | number;
    from: number;
    to: number;
  }
  export interface IInventoryProductsFilterType {
    keyword: string;
    shop_id: number;
    page?: number;
  }
  
  // filters type declearation
  export interface ISorterValue {
    title: string;
    key: string;
    value: string;
    selected: boolean;
  }
  
  export interface ISorter {
    typeKey: string;
    orderKey: string;
    values: ISorterValue[];
  }
  
  export interface IConfiguratorPropertyValue {
    value: string;
    image: string | null;
    label: string;
    selected: boolean;
  }
  
  export interface IConfiguratorProperty<T extends string> {
    title: string;
    type: string;
    key: T;
    separator: string;
    values: IConfiguratorPropertyValue[];
  }
  
  export interface IAttrValue {
    value: string;
    image: string | null;
    label: string;
    selected: boolean;
    values?: IAttrValue[];
  }
  
  export interface IAttr<T extends string, U extends string> {
    title: string;
    type: string;
    key: T;
    separator: U;
    values: IAttrValue[];
  }
  
  export type PrType = IConfiguratorProperty<"pr">;
  export type CidType = IConfiguratorProperty<"cid">;
  export type FeaturesType = IConfiguratorProperty<"features">;
  
  export interface IConfigurator {
    pr: PrType;
    cid?: CidType;
    features: FeaturesType;
    attr: IAttr<string, string>;
  }
  
  export interface IFilters {
    sorter: ISorter;
    configurator: IConfigurator;
  }
  
  export interface IProductQuery {
    limit?: number;
    offset?: number;
    attr?: string;
    keyword?: string;
    shop_id?: number;
    features?: string;
    sortType?: string;
    sortOrder?: string;
    cid?: number;
    pr?: number;
  }
  
  export interface IRetriveInventoryProductQuery extends Pick<IProductQuery, 'limit' | 'offset'> {}
  
  // after getting inventory response we will modify this response and define our own type
  export interface IInventoryProductInternalType {
    products: IInventoryProductDataType[];
    filters: IFilters;
    offset: number;
    limit: number;
    count: number;
  }
  
  // inventory response type that comes from external inventory api
  export interface IInventoryResponseType extends IInventoryProductsPaginateType {
    success: boolean;
    message: string;
    filters: IFilters;
    data: IInventoryProductDataType[];
  }
  
  ////// inventory product details //////
  export interface IProductDetailsResponseData {
    id: number;
    shop_id: number;
    vid: string;
    seller_id: number;
    vendor: string;
    title: string;
    description: null | string;
    price: {
      discount: {
        max: null | null;
        min: null | number;
      };
      original: {
        max: number;
        min: number;
      };
    };
    stock: number;
    sales: number;
    link: string;
    image: string;
    meta: {
      vendor: string;
      videos: { url: string; preview: string }[];
      product_id: string;
    };
  
    gallery: {
      url: string;
      thumb: string;
      title: string | null;
    }[];
    ratings: null | string | number;
    ratings_count: null | string | number;
    ratings_average: null | string;
    created_at: string;
    updated_at: string;
    shop: {
      id: number;
      name: string;
      url: string;
      identifier: string;
      country_code: string;
      currency_code: string;
      currency_symbol: string;
      fx: string;
    };
    seller: {
      id: number;
      name: string;
      vendor: string;
      vendor_id: string;
      link: string;
      description: string;
      meta: null;
      opened_at: null | string;
    };
    categories: {
      id: number;
      name: string;
    }[];
    specifications: {
      label: {
        id: number;
        name: string;
      };
      value: {
        id: number;
        name: string;
      };
    }[];
  }
  
  export interface IProductDetailsResponse {
    status: string;
    code: number;
    message: string;
    data: IProductDetailsResponseData;
  }
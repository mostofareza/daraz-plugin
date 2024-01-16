interface ProductData {
    id: string;
    title: string;
    subtitle: string | null;
    images: { id: string; url: string }[];
    variants: {
      id: string;
      title: string;
      inventory_quantity: number;
      prices: { currency_code: string; amount: number }[];
      options: { value: string }[];
    }[];
    weight: number | null;
}

interface DarazProduct {
  PrimaryCategory: string;
  SPUId: string;
  AssociatedSku: null;
  Images: {
    Image: string[];
  };
  Attributes: {
    name: string;
    short_description: string | null;
    brand: null;
    model: null;
    kid_years: null;
    delivery_option_sof: null;
  }[];
  Skus: {
    SellerSku: string;
    color_family: null;
    size: string;
    quantity: number;
    price: { currency_code: string; amount: number }[];
    package_length: null;
    package_height: null;
    package_weight: number;
    package_width: null;
    package_content: null;
    Images: {
      Image: string[];
    };
  }[];
}

export function convertToDarazProduct(productData: ProductData): DarazProduct {
  const darazProductData: DarazProduct = {
    PrimaryCategory: "Default",
    SPUId: productData.id,
    AssociatedSku: null,
    Images: {
      Image: productData.images.map((image) => image.url),
    },
    Attributes: [
      {
        name: productData.title,
        short_description: productData.subtitle,
        brand: null,
        model: null,
        kid_years: null,
        delivery_option_sof: null,
      },
    ],
    Skus: productData.variants.map((variant) => ({
      SellerSku: variant.id,
      color_family: null,
      size: variant.title,
      quantity: variant.inventory_quantity,
      price: variant.prices.map((price) => ({
        currency_code: price.currency_code,
        amount: price.amount,
      })),
      package_length: null,
      package_height: null,
      package_weight: productData.weight || 0,
      package_width: null,
      package_content: null,
      Images: {
        Image: [variant.options[0].value],
      },
    })),
  };

  return darazProductData;
}

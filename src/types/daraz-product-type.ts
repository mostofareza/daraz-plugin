interface Image {
    Image: string[];
  }
  
  interface Sku {
    SellerSku: string;
    color_family: string | null;
    size: string;
    quantity: number;
    price: number;
    package_length: number | null;
    package_height: number | null;
    package_weight: number | null;
    package_width: number | null;
    package_content: string | null;
    Images: Image;
  }
  
  interface Attributes {
    name: string;
    short_description: string;
    brand: string | null;
    model: string | null;
    kid_years: string | null;
    delivery_option_sof: string | null;
  }
  
  interface Product {
    medusa_id: string;
    PrimaryCategory: string;
    SPUId: string;
    AssociatedSku: string;
    Images: Image;
    Attributes: Attributes;
    Skus: Sku;
  }
  
  export interface DarazProduct {
    Product: Product;
  }
  
  // Example usage:
    const darazProductData: DarazProduct = {
    Product: {
      medusa_id: "prod_01HK4RFBZRVRCMVD2X9GWADT7P",
      PrimaryCategory: "Merch",
      SPUId: "prod_01HK4RFBZRVRCMVD2X9GWADT7P",
      AssociatedSku: "variant_01HK4RFC06K3GQ6Q1CFX1Q8A9Q",
      Images: {
        Image: ["https://medusa-public-images.s3.eu-west-1.amazonaws.com/coffee-mug.png"],
      },
      Attributes: {
        name: "Medusa Coffee Mug",
        short_description: "Every programmer's best friend.",
        brand: null,
        model: null,
        kid_years: null,
        delivery_option_sof: null,
      },
      Skus: {
        SellerSku: "variant_01HK4RFC06K3GQ6Q1CFX1Q8A9Q",
        color_family: null,
        size: "One Size",
        quantity: 100,
        price: 1000,
        package_length: null,
        package_height: null,
        package_weight: null,
        package_width: null,
        package_content: null,
        Images: {
          Image: ["https://medusa-public-images.s3.eu-west-1.amazonaws.com/coffee-mug.png"],
        },
      },
    },
  };
  
  console.log(darazProductData);
  
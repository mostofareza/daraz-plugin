interface DarazProduct {
  Request: {
    Product: {
      PrimaryCategory: string;
      SPUId: string;
      AssociatedSku: string;
      Images: string[];
      Attributes: {
        name: string;
        short_description: string;
        brand: string;
        model: string;
        kid_years: string;
        delivery_option_sof: string;
      };
      Skus: {
        Sku: {
          SellerSku: string;
          color_family: string;
          size: string;
          quantity: string;
          price: string;
          package_length: string;
          package_height: string;
          package_weight: string;
          package_width: string;
          package_content: string;
          Images: string[];
        };
      };
    };
  };
}

export function convertToDarazProduct(input: any): DarazProduct {
  return {
    Request: {
      Product: {
        PrimaryCategory: input.variant.product.id,
        SPUId: "",
        AssociatedSku: "",
        Images: [input.variant.product.thumbnail], // Assuming you want to use the product thumbnail as the main image
        Attributes: {
          name: input.variant.product.title,
          short_description: input.variant.product.description,
          brand: input.variant.product.brand, // Assuming your product has a "brand" property
          model: input.variant.title,
          kid_years: "Kids (6-10yrs)", // Modify as needed
          delivery_option_sof: "Yes", // Modify as needed
        },
        Skus: {
          Sku: {
            SellerSku: input.variant.sku,
            color_family: input.variant.options.find((opt: any) => opt.id.includes("color_family"))?.value || "",
            size: input.variant.options.find((opt: any) => opt.id.includes("size"))?.value || "",
            quantity: input.variant.inventory_quantity.toString(),
            price: input.variant.prices.find((price: any) => price.currency_code === "usd")?.amount.toString() || "",
            package_length: input.variant.length || "",
            package_height: input.variant.height || "",
            package_weight: input.variant.weight || "",
            package_width: input.variant.width || "",
            package_content: "This is what's in the box", // Modify as needed
            Images: input.variant.options.map((opt: any) => opt.metadata?.thumbnail || ""), // Assuming you have thumbnail data in metadata
          },
        },
      },
    },
  };
}


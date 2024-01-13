import { Product } from "@medusajs/medusa";

export async function convertToDarazProduct(productData:Product) {
    console.log('productData: ', productData);
    const darazProductData = {
      Product: {
        medusa_id: productData.id,
        PrimaryCategory: "Merch", // Assuming a default category for now
        SPUId: productData.id,
        AssociatedSku: productData.variants[0].id, // Assuming the first variant as the AssociatedSku
        Images: {
          Image: [productData.thumbnail],
        },
        Attributes: {
          name: productData.title,
          short_description: productData.description,
          brand: null, // You can fill in the brand information if available in your data
          model: null, // You can fill in the model information if available in your data
          kid_years: null, // You can fill in the kid_years information if available in your data
          delivery_option_sof: null, // You can fill in the delivery_option_sof information if available in your data
        },
        Skus: {
          SellerSku: productData.variants[0].id, // Assuming the first variant as the SellerSku
          color_family: null, // You can fill in the color_family information if available in your data
          size: productData.variants[0].options[0].value, // Assuming the first variant's option as the size
          quantity: productData.variants[0].inventory_quantity,
          price: productData.variants[0].prices[0].amount, // Assuming the first price in EUR
          package_length: null, // You can fill in the package_length information if available in your data
          package_height: null, // You can fill in the package_height information if available in your data
          package_weight: null, // You can fill in the package_weight information if available in your data
          package_width: null, // You can fill in the package_width information if available in your data
          package_content: null, // You can fill in the package_content information if available in your data
          Images: {
            Image: [productData.thumbnail],
          },
        },
      },
    };
  
    return darazProductData;
  }
  
  
import { Product } from "@medusajs/medusa";

export function convertToXml(product: Product) {
    const imagesXml = product.images.map((image) => `<Image>${image.url}</Image>`).join('\n');
    const skusXml = product.variants.map((variant) => `
      <Sku>
        <SellerSku>${variant.id}</SellerSku>
        <color_family>${product.options.find((opt) => opt.title === 'Color')?.values[0] || ''}</color_family>
        <size>${product.options.find((opt) => opt.title === 'Size')?.values[0] || ''}</size>
        <quantity>${variant.inventory_quantity}</quantity>
        <price>${variant.prices.find((price) => price.currency_code === 'usd')?.amount || ''}</price>
        <package_length>${variant.length || ''}</package_length>
        <package_height>${variant.height || ''}</package_height>
        <package_weight>${variant.weight || ''}</package_weight>
        <package_width>${variant.width || ''}</package_width>
        <package_content>${variant.title}</package_content>
        <Images>${product.images.map((image) => `<Image>${image.url}</Image>`).join('\n')}</Images>
      </Sku>
    `).join('\n');
  
    const xmlProduct = `<?xml version="1.0" encoding="UTF-8"?>
  <Request>
      <Product>
          <PrimaryCategory>Category</PrimaryCategory>
          <SPUId>${product.id}</SPUId>
          <AssociatedSku/>
          <Images>${imagesXml}</Images>
          <Attributes>
              <name>${product.title}</name>
              <short_description>${product.description}</short_description>
              <brand>Remark</brand>
              <model>asdf</model>
              <kid_years>Kids (6-10yrs)</kid_years>
              <delivery_option_sof>Yes</delivery_option_sof>
          </Attributes>
          <Skus>${skusXml}</Skus>
      </Product>
  </Request>
  `;
    return xmlProduct;
  }
  
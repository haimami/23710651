import { PRICE_MULTIPLIER } from '@constants/student';

export type CategoryId = 'all' | 'food' | 'drink' | 'study';

export interface Product {
  id: number;
  title: string;
  price: number;
  formattedPrice: string;
  description: string;
  category: Exclude<CategoryId, 'all'>;
  rawCategory: string;
  image: string;
}

interface RawApiProduct {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
}

export function mapCategory(apiCategory: string): Exclude<CategoryId, 'all'> {
  const catLower = (apiCategory || '').toLowerCase();
  if (catLower.includes('clothing')) {
    return 'study';
  }
  if (catLower.includes('jewel')) {
    return 'drink';
  }
  return 'food';
}

export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch('https://fakestoreapi.com/products?limit=8');

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  const data: RawApiProduct[] = await response.json();

  return data.map((item) => {
    const calculatedPrice = Math.round(item.price * PRICE_MULTIPLIER);
    const formattedPrice = `${calculatedPrice.toLocaleString('vi-VN')} đ`;

    return {
      id: item.id,
      title: item.title,
      price: calculatedPrice,
      formattedPrice,
      description: item.description,
      category: mapCategory(item.category),
      rawCategory: item.category,
      image: item.image,
    };
  });
}

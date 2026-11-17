import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as productsService from './products-service.js';
import * as productsRepository from '../db/products-repository.js';
import { ValidationError } from '../errors.js';
import type { Product, ProductFields } from '../models/product.js';

beforeEach(() => {
  vi.restoreAllMocks();
});

const makeProduct = (fields: ProductFields): Product => {
  return {
    id: fields.id ?? 'aaaaaaaaaaaaaaaaaaaaaaaa',
    modelName: fields.modelName ?? 'Test Product',
    modelNumber: fields.modelNumber ?? 'TP-1',
    manufacturer: fields.manufacturer ?? 'Test',
    color: fields.color ?? 'Black',
    price: fields.price ?? 10,
    quantity: fields.quantity ?? 10
  };
};

describe('getLowStockProducts', () => {
  it('returns only the products below the threshold', async () => {
    vi.spyOn(productsRepository, 'findAllProducts').mockResolvedValue([
      makeProduct({ modelName: 'Plenty', quantity: 100 }),
      makeProduct({ modelName: 'Few', quantity: 2 }),
      makeProduct({ modelName: 'None', quantity: 0 })
    ]);

    const low = await productsService.getLowStockProducts(5);

    const names = low.map((product) => product.modelName);

    expect(names).toEqual(['Few', 'None']);
  });

  it('does not count a product sitting on the threshold', async () => {
    vi.spyOn(productsRepository, 'findAllProducts').mockResolvedValue([
      makeProduct({ modelName: 'Exactly five', quantity: 5 })
    ]);

    const low = await productsService.getLowStockProducts(5);

    expect(low).toHaveLength(0);
  });
});

describe('updateProduct', () => {
  it('asks the repository to change only what it was given', async () => {
    vi.spyOn(productsRepository, 'findProduct').mockResolvedValue(
      makeProduct({ price: 10 })
    );
    const update = vi
      .spyOn(productsRepository, 'updateProduct')
      .mockResolvedValue(makeProduct({ price: 12.5 }));

    await productsService.updateProduct('abc', { price: 12.5 });

    expect(update).toHaveBeenCalledWith('abc', { price: 12.5 });
  });

  it('writes nothing when quantity would go negative', async () => {
    vi.spyOn(productsRepository, 'findProduct').mockResolvedValue(
      makeProduct({ quantity: 10 })
    );
    const update = vi.spyOn(productsRepository, 'updateProduct');

    await expect(
      productsService.updateProduct('abc', { quantity: -1 })
    ).rejects.toThrow(ValidationError);

    expect(update).not.toHaveBeenCalled();
  });

  // Now You Try
  it('writes nothing when the price would go negative', async () => {
    vi.spyOn(productsRepository, 'findProduct').mockResolvedValue(
      makeProduct({ price: 10 })
    );
    const update = vi.spyOn(productsRepository, 'updateProduct');

    await expect(
      productsService.updateProduct('abc', { price: -1 })
    ).rejects.toThrow(ValidationError);

    expect(update).not.toHaveBeenCalled();
  });

  // Now You Try
  it('returns null when there is no product with that id', async () => {
    vi.spyOn(productsRepository, 'findProduct').mockResolvedValue(null);
    const update = vi.spyOn(productsRepository, 'updateProduct');

    const result = await productsService.updateProduct('abc', {
      price: 12.5
    });

    expect(result).toBeNull();
    expect(update).not.toHaveBeenCalled();
  });
});

describe('createProduct', () => {
  // Now You Try
  it('fills in defaults before handing it to the repository', async () => {
    const insert = vi
      .spyOn(productsRepository, 'insertProduct')
      .mockResolvedValue(makeProduct({}));

    await productsService.createProduct({ modelName: 'Just a name' });

    expect(insert).toHaveBeenCalledWith({
      modelName: 'Just a name',
      modelNumber: '',
      manufacturer: '',
      color: '',
      price: 0,
      quantity: 0
    });
  });
});

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { AddCartItemDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private readonly cartRepo: Repository<Cart>,
    @InjectRepository(CartItem) private readonly itemRepo: Repository<CartItem>,
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
  ) {}

  private async getOrCreateCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepo.findOne({
      where: { userId },
      relations: { items: { product: true, variant: true } },
    });
    if (!cart) {
      cart = this.cartRepo.create({ userId });
      await this.cartRepo.save(cart);
      cart.items = [];
    }
    return cart;
  }

  async getCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    return this.buildCartResponse(cart);
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    const cart = await this.getOrCreateCart(userId);

    const product = await this.productRepo.findOne({ where: { id: dto.productId } });
    if (!product || !product.enabled) {
      throw new NotFoundException('المنتج غير موجود أو غير متاح');
    }

    if (dto.variantId) {
      const variant = await this.variantRepo.findOne({ where: { id: dto.variantId } });
      if (!variant || !variant.enabled) {
        throw new NotFoundException('الـVariant المطلوب غير متاح');
      }
    }

    const existing = await this.itemRepo.findOne({
      where: {
        cartId: cart.id,
        productId: dto.productId,
        variantId: dto.variantId ?? IsNull(),
      },
    });

    if (existing) {
      existing.quantity += dto.quantity;
      await this.itemRepo.save(existing);
    } else {
      const item = this.itemRepo.create({
        cartId: cart.id,
        productId: dto.productId,
        variantId: dto.variantId ?? null,
        quantity: dto.quantity,
      });
      await this.itemRepo.save(item);
    }

    return this.getCart(userId);
  }

  async updateItemQuantity(userId: string, itemId: string, quantity: number) {
    const cart = await this.getOrCreateCart(userId);
    const item = await this.itemRepo.findOne({ where: { id: itemId, cartId: cart.id } });
    if (!item) throw new NotFoundException('العنصر غير موجود في السلة');
    item.quantity = quantity;
    await this.itemRepo.save(item);
    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.getOrCreateCart(userId);
    const item = await this.itemRepo.findOne({ where: { id: itemId, cartId: cart.id } });
    if (!item) throw new NotFoundException('العنصر غير موجود في السلة');
    await this.itemRepo.remove(item);
    return this.getCart(userId);
  }

  // ---- الحساب الفعلي - يُستخدم أيضًا من OrdersService وقت Checkout ----
  // السعر يُقرأ دائمًا من قاعدة البيانات (Product/Variant) الآن، وليس من أي قيمة يرسلها العميل.
  private async buildCartResponse(cart: Cart) {
    let subtotal = 0;
    const items = (cart.items || []).map((item) => {
      const unitPrice = item.variant ? Number(item.variant.price) : Number(item.product.basePrice);
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;
      return {
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        productName: item.product?.nameAr,
        image: item.product?.images?.[0] ?? null,
        unitPrice,
        quantity: item.quantity,
        lineTotal,
      };
    });

    return {
      cartId: cart.id,
      items,
      subtotal: Math.round(subtotal * 100) / 100,
    };
  }

  async getRawCartWithItems(userId: string): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('السلة فارغة');
    }
    return cart;
  }

  async clearCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    if (cart.items?.length) {
      await this.itemRepo.remove(cart.items);
    }
    return { message: 'تم تفريغ السلة' };
  }
}

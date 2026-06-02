import "dotenv/config";

import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { z } from "zod";

import { PrismaClient } from "../src/generated/prisma/client";
import {
  AddressType,
  CouponDiscountType,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  UserRole,
  UserStatus
} from "../src/generated/prisma/enums";

const devSeedEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  DEV_SEED_PASSWORD: z.string().min(8).max(72).default("Password123!")
});

const parsedEnv = devSeedEnvSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid development seed configuration", parsedEnv.error.flatten().fieldErrors);
  process.exit(1);
}

const env = parsedEnv.data;
const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL
});
const prisma = new PrismaClient({
  adapter
});

const imageUrl = (text: string) => `https://placehold.co/900x700/png?text=${encodeURIComponent(text)}`;

const categories = [
  { name: "Fresh Vegetables", slug: "fresh-vegetables" },
  { name: "Fresh Fruits", slug: "fresh-fruits" },
  { name: "Dairy & Eggs", slug: "dairy-eggs" },
  { name: "Bakery", slug: "bakery" },
  { name: "Rice & Staples", slug: "rice-staples" },
  { name: "Snacks", slug: "snacks" },
  { name: "Beverages", slug: "beverages" },
  { name: "Household Essentials", slug: "household-essentials" }
] as const;

const products = [
  {
    categorySlug: "fresh-vegetables",
    name: "Tomato",
    slug: "tomato",
    description: "Ripe red tomatoes for curries, salads, and sauces.",
    variants: [
      { name: "Regular", price: "36.00", stock: 48, sku: "JMV-VEG-TOM-500G", unit: "500 g" },
      { name: "Family Pack", price: "68.00", stock: 30, sku: "JMV-VEG-TOM-1KG", unit: "1 kg" }
    ]
  },
  {
    categorySlug: "fresh-vegetables",
    name: "Potato",
    slug: "potato",
    description: "Firm potatoes suitable for daily cooking.",
    variants: [
      { name: "Regular", price: "32.00", stock: 64, sku: "JMV-VEG-POT-1KG", unit: "1 kg" },
      { name: "Bulk Pack", price: "148.00", stock: 22, sku: "JMV-VEG-POT-5KG", unit: "5 kg" }
    ]
  },
  {
    categorySlug: "fresh-vegetables",
    name: "Onion",
    slug: "onion",
    description: "Everyday red onions with a sharp, fresh bite.",
    variants: [
      { name: "Regular", price: "42.00", stock: 55, sku: "JMV-VEG-ONI-1KG", unit: "1 kg" },
      { name: "Bulk Pack", price: "198.00", stock: 16, sku: "JMV-VEG-ONI-5KG", unit: "5 kg" }
    ]
  },
  {
    categorySlug: "fresh-fruits",
    name: "Banana Robusta",
    slug: "banana-robusta",
    description: "Naturally sweet bananas for breakfast and snacks.",
    variants: [
      { name: "Half Dozen", price: "38.00", stock: 42, sku: "JMV-FRT-BAN-6PC", unit: "6 pcs" },
      { name: "Dozen", price: "72.00", stock: 27, sku: "JMV-FRT-BAN-12PC", unit: "12 pcs" }
    ]
  },
  {
    categorySlug: "fresh-fruits",
    name: "Apple Royal Gala",
    slug: "apple-royal-gala",
    description: "Crisp and sweet apples for lunch boxes and desserts.",
    variants: [
      { name: "Regular", price: "165.00", stock: 34, sku: "JMV-FRT-APL-500G", unit: "500 g" },
      { name: "Family Pack", price: "315.00", stock: 18, sku: "JMV-FRT-APL-1KG", unit: "1 kg" }
    ]
  },
  {
    categorySlug: "fresh-fruits",
    name: "Orange Nagpur",
    slug: "orange-nagpur",
    description: "Juicy oranges with balanced sweetness and tang.",
    variants: [
      { name: "Regular", price: "88.00", stock: 8, sku: "JMV-FRT-ORG-1KG", unit: "1 kg" }
    ]
  },
  {
    categorySlug: "dairy-eggs",
    name: "JMV Fresh Milk",
    slug: "jmv-fresh-milk",
    description: "Pasteurized toned milk for tea, coffee, and cooking.",
    variants: [
      { name: "Pouch", price: "27.00", stock: 90, sku: "JMV-DRY-MLK-500ML", unit: "500 ml" },
      { name: "Pouch", price: "54.00", stock: 76, sku: "JMV-DRY-MLK-1L", unit: "1 L" }
    ]
  },
  {
    categorySlug: "dairy-eggs",
    name: "Paneer",
    slug: "paneer",
    description: "Soft paneer blocks for gravies, snacks, and rolls.",
    variants: [
      { name: "Classic", price: "92.00", stock: 21, sku: "JMV-DRY-PAN-200G", unit: "200 g" },
      { name: "Classic", price: "178.00", stock: 13, sku: "JMV-DRY-PAN-400G", unit: "400 g" }
    ]
  },
  {
    categorySlug: "dairy-eggs",
    name: "Farm Eggs",
    slug: "farm-eggs",
    description: "Fresh eggs packed for everyday breakfast and baking.",
    variants: [
      { name: "Half Dozen", price: "48.00", stock: 44, sku: "JMV-DRY-EGG-6PC", unit: "6 pcs" },
      { name: "Dozen", price: "92.00", stock: 19, sku: "JMV-DRY-EGG-12PC", unit: "12 pcs" }
    ]
  },
  {
    categorySlug: "bakery",
    name: "Whole Wheat Bread",
    slug: "whole-wheat-bread",
    description: "Soft whole wheat bread for sandwiches and toast.",
    variants: [
      { name: "Loaf", price: "48.00", stock: 26, sku: "JMV-BAK-WWB-400G", unit: "400 g" }
    ]
  },
  {
    categorySlug: "bakery",
    name: "Burger Buns",
    slug: "burger-buns",
    description: "Fresh buns for burgers, sliders, and quick snacks.",
    variants: [
      { name: "Pack", price: "42.00", stock: 14, sku: "JMV-BAK-BUN-4PC", unit: "4 pcs" }
    ]
  },
  {
    categorySlug: "rice-staples",
    name: "Sona Masoori Rice",
    slug: "sona-masoori-rice",
    description: "Lightweight daily rice with medium grains.",
    variants: [
      { name: "Daily Pack", price: "365.00", stock: 35, sku: "JMV-STP-RIC-5KG", unit: "5 kg" },
      { name: "Monthly Pack", price: "715.00", stock: 12, sku: "JMV-STP-RIC-10KG", unit: "10 kg" }
    ]
  },
  {
    categorySlug: "rice-staples",
    name: "Toor Dal",
    slug: "toor-dal",
    description: "Protein-rich dal for sambar, dal fry, and khichdi.",
    variants: [
      { name: "Regular", price: "178.00", stock: 24, sku: "JMV-STP-TDR-1KG", unit: "1 kg" }
    ]
  },
  {
    categorySlug: "rice-staples",
    name: "Sunflower Oil",
    slug: "sunflower-oil",
    description: "Refined sunflower oil for everyday cooking.",
    variants: [
      { name: "Bottle", price: "142.00", stock: 29, sku: "JMV-STP-OIL-1L", unit: "1 L" },
      { name: "Can", price: "682.00", stock: 7, sku: "JMV-STP-OIL-5L", unit: "5 L" }
    ]
  },
  {
    categorySlug: "snacks",
    name: "Salted Potato Chips",
    slug: "salted-potato-chips",
    description: "Crispy salted chips for quick snacking.",
    variants: [
      { name: "Regular", price: "20.00", stock: 70, sku: "JMV-SNK-CHP-52G", unit: "52 g" },
      { name: "Party Pack", price: "99.00", stock: 25, sku: "JMV-SNK-CHP-200G", unit: "200 g" }
    ]
  },
  {
    categorySlug: "snacks",
    name: "Roasted Peanuts",
    slug: "roasted-peanuts",
    description: "Crunchy roasted peanuts with a simple salted finish.",
    variants: [
      { name: "Pouch", price: "58.00", stock: 32, sku: "JMV-SNK-PNT-200G", unit: "200 g" }
    ]
  },
  {
    categorySlug: "beverages",
    name: "Masala Tea",
    slug: "masala-tea",
    description: "Aromatic tea blend with warming spices.",
    variants: [
      { name: "Pack", price: "128.00", stock: 23, sku: "JMV-BEV-TEA-250G", unit: "250 g" },
      { name: "Pack", price: "248.00", stock: 9, sku: "JMV-BEV-TEA-500G", unit: "500 g" }
    ]
  },
  {
    categorySlug: "beverages",
    name: "Tender Coconut Water",
    slug: "tender-coconut-water",
    description: "Ready-to-drink coconut water with no added sugar.",
    variants: [
      { name: "Bottle", price: "45.00", stock: 38, sku: "JMV-BEV-COC-200ML", unit: "200 ml" }
    ]
  },
  {
    categorySlug: "household-essentials",
    name: "Dishwash Liquid",
    slug: "dishwash-liquid",
    description: "Lemon fresh dishwash liquid for everyday cleaning.",
    variants: [
      { name: "Bottle", price: "112.00", stock: 18, sku: "JMV-HSH-DWL-500ML", unit: "500 ml" },
      { name: "Refill", price: "208.00", stock: 11, sku: "JMV-HSH-DWL-1L", unit: "1 L" }
    ]
  },
  {
    categorySlug: "household-essentials",
    name: "Floor Cleaner",
    slug: "floor-cleaner",
    description: "Disinfecting floor cleaner for home hygiene.",
    variants: [
      { name: "Bottle", price: "168.00", stock: 6, sku: "JMV-HSH-FLC-1L", unit: "1 L" }
    ]
  }
] as const;

const users = [
  {
    name: "JMV Admin",
    email: "admin@jmv.local",
    phone: "9000000001",
    role: UserRole.ADMIN
  },
  {
    name: "Asha Rao",
    email: "asha.rao@example.com",
    phone: "9000000002",
    role: UserRole.CUSTOMER,
    address: {
      type: AddressType.HOME,
      fullName: "Asha Rao",
      phone: "9000000002",
      line1: "42 Green Avenue",
      line2: "Near City Park",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560001"
    }
  },
  {
    name: "Vikram Mehta",
    email: "vikram.mehta@example.com",
    phone: "9000000003",
    role: UserRole.CUSTOMER,
    address: {
      type: AddressType.WORK,
      fullName: "Vikram Mehta",
      phone: "9000000003",
      line1: "Plot 18, Lake View Road",
      line2: "Indiranagar",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560038"
    }
  }
] as const;

const carts = [
  {
    userEmail: "asha.rao@example.com",
    items: [
      { sku: "JMV-VEG-TOM-1KG", quantity: 2 },
      { sku: "JMV-DRY-MLK-1L", quantity: 1 },
      { sku: "JMV-BAK-WWB-400G", quantity: 1 }
    ]
  },
  {
    userEmail: "vikram.mehta@example.com",
    items: [
      { sku: "JMV-STP-OIL-1L", quantity: 1 },
      { sku: "JMV-FRT-BAN-6PC", quantity: 2 }
    ]
  }
] as const;

const orders = [
  {
    orderNumber: "JMV-DEV-1001",
    userEmail: "asha.rao@example.com",
    status: OrderStatus.CONFIRMED,
    paymentMethod: PaymentMethod.COD,
    paymentStatus: PaymentStatus.PENDING,
    deliveryFee: "30.00",
    notes: "Leave at reception if customer is unavailable.",
    items: [
      { sku: "JMV-FRT-APL-1KG", quantity: 1 },
      { sku: "JMV-DRY-EGG-12PC", quantity: 1 },
      { sku: "JMV-SNK-CHP-200G", quantity: 2 }
    ]
  },
  {
    orderNumber: "JMV-DEV-1002",
    userEmail: "asha.rao@example.com",
    status: OrderStatus.DELIVERED,
    paymentMethod: PaymentMethod.RAZORPAY,
    paymentStatus: PaymentStatus.PAID,
    deliveryFee: "0.00",
    notes: "Paid online.",
    items: [
      { sku: "JMV-STP-RIC-5KG", quantity: 1 },
      { sku: "JMV-STP-TDR-1KG", quantity: 1 },
      { sku: "JMV-BEV-TEA-250G", quantity: 1 }
    ]
  },
  {
    orderNumber: "JMV-DEV-1003",
    userEmail: "vikram.mehta@example.com",
    status: OrderStatus.OUT_FOR_DELIVERY,
    paymentMethod: PaymentMethod.COD,
    paymentStatus: PaymentStatus.PENDING,
    deliveryFee: "25.00",
    notes: "Call before delivery.",
    items: [
      { sku: "JMV-VEG-POT-5KG", quantity: 1 },
      { sku: "JMV-HSH-DWL-500ML", quantity: 1 },
      { sku: "JMV-BEV-COC-200ML", quantity: 4 }
    ]
  }
] as const;

const coupons = [
  {
    code: "SAVE20",
    title: "20% off groceries",
    description: "Introductory basket discount with a cap.",
    discountType: CouponDiscountType.PERCENTAGE,
    discountValue: "20.00",
    minOrderAmount: "299.00",
    maxDiscountAmount: "100.00",
    usageLimit: 500
  },
  {
    code: "JMV50",
    title: "Rs. 50 off",
    description: "Flat savings for larger baskets.",
    discountType: CouponDiscountType.FIXED,
    discountValue: "50.00",
    minOrderAmount: "399.00",
    maxDiscountAmount: null,
    usageLimit: 300
  }
] as const;

const seedCategories = async () => {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        imageUrl: imageUrl(category.name),
        imagePublicId: `dev/categories/${category.slug}`,
        isActive: true,
        deletedAt: null
      },
      create: {
        name: category.name,
        slug: category.slug,
        imageUrl: imageUrl(category.name),
        imagePublicId: `dev/categories/${category.slug}`,
        isActive: true
      }
    });
  }
};

const seedProducts = async () => {
  const categoryBySlug = new Map(
    (await prisma.category.findMany({
      where: {
        slug: {
          in: categories.map((category) => category.slug)
        }
      }
    })).map((category) => [category.slug, category])
  );

  for (const product of products) {
    const category = categoryBySlug.get(product.categorySlug);

    if (!category) {
      throw new Error(`Category ${product.categorySlug} was not found`);
    }

    const savedProduct = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        categoryId: category.id,
        name: product.name,
        description: product.description,
        imageUrl: imageUrl(product.name),
        imagePublicId: `dev/products/${product.slug}`,
        isActive: true,
        deletedAt: null
      },
      create: {
        categoryId: category.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        imageUrl: imageUrl(product.name),
        imagePublicId: `dev/products/${product.slug}`,
        isActive: true
      }
    });

    for (const variant of product.variants) {
      await prisma.productVariant.upsert({
        where: { sku: variant.sku },
        update: {
          productId: savedProduct.id,
          name: variant.name,
          price: variant.price,
          stock: variant.stock,
          unit: variant.unit,
          isActive: true
        },
        create: {
          productId: savedProduct.id,
          name: variant.name,
          price: variant.price,
          stock: variant.stock,
          sku: variant.sku,
          unit: variant.unit,
          isActive: true
        }
      });
    }
  }
};

const seedUsers = async () => {
  const passwordHash = await bcrypt.hash(env.DEV_SEED_PASSWORD, 12);

  for (const user of users) {
    const savedUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        phone: user.phone,
        role: user.role,
        status: UserStatus.ACTIVE,
        deletedAt: null
      },
      create: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        passwordHash,
        role: user.role,
        status: UserStatus.ACTIVE
      }
    });

    if ("address" in user) {
      const existingAddress = await prisma.address.findFirst({
        where: {
          userId: savedUser.id,
          isDefault: true
        }
      });

      const addressData = {
        ...user.address,
        userId: savedUser.id,
        country: "India",
        isDefault: true
      };

      if (existingAddress) {
        await prisma.address.update({
          where: { id: existingAddress.id },
          data: addressData
        });
      } else {
        await prisma.address.create({
          data: addressData
        });
      }
    }
  }
};

const seedCarts = async () => {
  for (const cartSeed of carts) {
    const user = await prisma.user.findUnique({
      where: {
        email: cartSeed.userEmail
      }
    });

    if (!user) {
      throw new Error(`User ${cartSeed.userEmail} was not found`);
    }

    const cart = await prisma.cart.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id
      }
    });

    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id
      }
    });

    for (const item of cartSeed.items) {
      const variant = await prisma.productVariant.findUnique({
        where: { sku: item.sku }
      });

      if (!variant) {
        throw new Error(`Variant ${item.sku} was not found`);
      }

      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId: variant.id,
          quantity: item.quantity
        }
      });
    }
  }
};

const seedOrders = async () => {
  for (const orderSeed of orders) {
    const user = await prisma.user.findUnique({
      where: {
        email: orderSeed.userEmail
      }
    });

    if (!user) {
      throw new Error(`User ${orderSeed.userEmail} was not found`);
    }

    const address = await prisma.address.findFirst({
      where: {
        userId: user.id,
        isDefault: true
      }
    });

    const orderItems = [];

    for (const item of orderSeed.items) {
      const variant = await prisma.productVariant.findUnique({
        where: { sku: item.sku },
        include: {
          product: true
        }
      });

      if (!variant) {
        throw new Error(`Variant ${item.sku} was not found`);
      }

      const unitPrice = Number(variant.price);

      orderItems.push({
        variantId: variant.id,
        productName: variant.product.name,
        variantName: variant.name,
        sku: variant.sku,
        unit: variant.unit,
        quantity: item.quantity,
        unitPrice: unitPrice.toFixed(2),
        total: (unitPrice * item.quantity).toFixed(2)
      });
    }

    const subtotal = orderItems.reduce((sum, item) => sum + Number(item.total), 0);
    const deliveryFee = Number(orderSeed.deliveryFee);
    const total = subtotal + deliveryFee;

    await prisma.order.upsert({
      where: { orderNumber: orderSeed.orderNumber },
      update: {
        userId: user.id,
        addressId: address?.id,
        status: orderSeed.status,
        paymentMethod: orderSeed.paymentMethod,
        paymentStatus: orderSeed.paymentStatus,
        subtotal: subtotal.toFixed(2),
        deliveryFee: orderSeed.deliveryFee,
        total: total.toFixed(2),
        notes: orderSeed.notes,
        items: {
          deleteMany: {},
          create: orderItems
        }
      },
      create: {
        orderNumber: orderSeed.orderNumber,
        userId: user.id,
        addressId: address?.id,
        status: orderSeed.status,
        paymentMethod: orderSeed.paymentMethod,
        paymentStatus: orderSeed.paymentStatus,
        subtotal: subtotal.toFixed(2),
        deliveryFee: orderSeed.deliveryFee,
        total: total.toFixed(2),
        notes: orderSeed.notes,
        items: {
          create: orderItems
        }
      }
    });
  }
};

const seedCoupons = async () => {
  for (const coupon of coupons) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: {
        title: coupon.title,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscountAmount: coupon.maxDiscountAmount,
        usageLimit: coupon.usageLimit,
        isActive: true,
        deletedAt: null
      },
      create: {
        code: coupon.code,
        title: coupon.title,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscountAmount: coupon.maxDiscountAmount,
        usageLimit: coupon.usageLimit,
        isActive: true
      }
    });
  }
};

const main = async () => {
  await seedCategories();
  await seedProducts();
  await seedUsers();
  await seedCoupons();
  await seedCarts();
  await seedOrders();

  console.log("Development data seeded.");
  console.log("Admin login: admin@jmv.local");
  console.log("Customer logins: asha.rao@example.com, vikram.mehta@example.com");
  console.log(`Password for seeded users: ${env.DEV_SEED_PASSWORD}`);
};

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

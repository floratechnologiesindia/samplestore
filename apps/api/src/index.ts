import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import bcrypt from "bcryptjs";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT) || 4000;

// Simple helper to convert integer cents to formatted price if needed on the API
const toMoney = (value: number) => value / 100;

// Simple schemas for validation
const loginSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  password: z.string().min(6).max(100).optional(),
});

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  password: z.string().min(6).max(100),
});

const checkoutSchema = z.object({
  cartId: z.number().int().positive(),
  email: z.string().email(),
  name: z.string().optional(),
  address: z.object({
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    region: z.string().optional(),
    country: z.string().min(1),
    postalCode: z.string().min(1),
    phone: z.string().optional(),
  }),
  customerId: z.number().int().positive().optional(),
});

const adminCreateProductSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  basePrice: z.number().int().positive(),
  status: z.string().min(1),
  brand: z.string().optional(),
  categorySlug: z.string().min(1),
  imageUrl: z.string().url().optional(),
  imageAlt: z.string().optional(),
});

const adminUpdateOrderStatusSchema = z.object({
  status: z.string().min(1),
  shippingStatus: z.string().optional(),
});

const updateCustomerProfileSchema = z.object({
  name: z.string().min(1).optional(),
});

const createAddressSchema = z.object({
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  region: z.string().optional(),
  country: z.string().min(1),
  postalCode: z.string().min(1),
  phone: z.string().optional(),
});

const updateCustomerPasswordSchema = z.object({
  currentPassword: z.string().min(6).max(100).optional(),
  newPassword: z.string().min(6).max(100),
});

const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const verifyPassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};

// Admin guard (simple token-based)
const requireAdmin: express.RequestHandler = (req, res, next) => {
  const expected = process.env.ADMIN_API_TOKEN;
  if (!expected) return next(); // if not set, skip guard (dev convenience)
  const token = req.header("x-admin-token");
  if (!token || token !== expected) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

async function seedIfEmpty() {
  // Seed a small curated catalog suitable for testing
  const categories = [
    { name: "Streetwear", slug: "streetwear" },
    { name: "Essentials", slug: "essentials" },
    { name: "Accessories", slug: "accessories" },
  ];

  const categoryBySlug: Record<string, number> = {};

  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { name: cat.name, slug: cat.slug },
    });
    categoryBySlug[cat.slug] = created.id;
  }

  type SeedProduct = {
    name: string;
    slug: string;
    description: string;
    basePrice: number;
    status: string;
    brand: string;
    categorySlug: string;
    imageUrl: string;
    imageAlt: string;
    variants: { sku: string; size?: string; color?: string; stock: number; price?: number }[];
  };

  const products: SeedProduct[] = [
    {
      name: "Oversized Graphic Tee",
      slug: "oversized-graphic-tee",
      description:
        "Relaxed-fit cotton tee with bold back print. Heavyweight jersey with a soft, washed hand-feel.",
      basePrice: 2999,
      status: "published",
      brand: "TrendVibes",
      categorySlug: "streetwear",
      imageUrl:
        "https://images.pexels.com/photos/6311579/pexels-photo-6311579.jpeg?auto=compress&cs=tinysrgb&w=800",
      imageAlt: "Model wearing an oversized graphic tee in the city",
      variants: [
        { sku: "TV-TEE-BLK-S", size: "S", color: "Black", stock: 10 },
        { sku: "TV-TEE-BLK-M", size: "M", color: "Black", stock: 12 },
        { sku: "TV-TEE-BLK-L", size: "L", color: "Black", stock: 8 },
      ],
    },
    {
      name: "Cropped Puffer Jacket",
      slug: "cropped-puffer-jacket",
      description:
        "Boxy cropped puffer with oversized collar and matte finish. Built to keep you warm on late-night city walks.",
      basePrice: 8999,
      status: "published",
      brand: "TrendVibes",
      categorySlug: "streetwear",
      imageUrl:
        "https://images.pexels.com/photos/6311653/pexels-photo-6311653.jpeg?auto=compress&cs=tinysrgb&w=800",
      imageAlt: "Person wearing a cropped puffer jacket outdoors at night",
      variants: [
        { sku: "TV-PUFF-BLK-S", size: "S", color: "Black", stock: 4 },
        { sku: "TV-PUFF-BLK-M", size: "M", color: "Black", stock: 6 },
        { sku: "TV-PUFF-GRN-M", size: "M", color: "Olive", stock: 3 },
      ],
    },
    {
      name: "Everyday Wide-Leg Pants",
      slug: "everyday-wide-leg-pants",
      description:
        "Relaxed wide-leg trousers with a soft drape and elastic back waistband. Dress them up or down.",
      basePrice: 6499,
      status: "published",
      brand: "TrendVibes",
      categorySlug: "essentials",
      imageUrl:
        "https://images.pexels.com/photos/6311572/pexels-photo-6311572.jpeg?auto=compress&cs=tinysrgb&w=800",
      imageAlt: "Wide-leg pants styled with minimal sneakers",
      variants: [
        { sku: "TV-PANT-STN-XS", size: "XS", color: "Stone", stock: 5 },
        { sku: "TV-PANT-STN-S", size: "S", color: "Stone", stock: 7 },
        { sku: "TV-PANT-STN-M", size: "M", color: "Stone", stock: 8 },
      ],
    },
    {
      name: "Minimal Leather Crossbody",
      slug: "minimal-leather-crossbody",
      description:
        "Clean, structured crossbody bag with adjustable strap and hidden magnetic closure. Fits phone, wallet, and keys.",
      basePrice: 5599,
      status: "published",
      brand: "TrendVibes",
      categorySlug: "accessories",
      imageUrl:
        "https://images.pexels.com/photos/6311665/pexels-photo-6311665.jpeg?auto=compress&cs=tinysrgb&w=800",
      imageAlt: "Minimal leather crossbody bag on a chair",
      variants: [
        { sku: "TV-BAG-BLK-OS", size: "One Size", color: "Black", stock: 9 },
        { sku: "TV-BAG-CRM-OS", size: "One Size", color: "Cream", stock: 5 },
      ],
    },
    {
      name: "Chunky Platform Sneakers",
      slug: "chunky-platform-sneakers",
      description:
        "High-stack platform sneakers with layered panels and contrast stitching. Lightweight foam midsole for all-day comfort.",
      basePrice: 7999,
      status: "published",
      brand: "TrendVibes",
      categorySlug: "streetwear",
      imageUrl:
        "https://images.pexels.com/photos/6311658/pexels-photo-6311658.jpeg?auto=compress&cs=tinysrgb&w=800",
      imageAlt: "Close-up of chunky platform sneakers",
      variants: [
        { sku: "TV-SNK-WHT-37", size: "37", color: "White", stock: 3 },
        { sku: "TV-SNK-WHT-38", size: "38", color: "White", stock: 6 },
        { sku: "TV-SNK-WHT-39", size: "39", color: "White", stock: 5 },
      ],
    },
    {
      name: "Layered Zip Hoodie",
      slug: "layered-zip-hoodie",
      description:
        "Midweight zip hoodie with layered hem and contrast drawcords. Perfect for cool evenings and airport runs.",
      basePrice: 7499,
      status: "published",
      brand: "TrendVibes",
      categorySlug: "streetwear",
      imageUrl:
        "https://images.pexels.com/photos/7671166/pexels-photo-7671166.jpeg?auto=compress&cs=tinysrgb&w=800",
      imageAlt: "Person wearing a layered zip hoodie in the city",
      variants: [
        { sku: "TV-HOOD-GRY-S", size: "S", color: "Grey", stock: 6 },
        { sku: "TV-HOOD-GRY-M", size: "M", color: "Grey", stock: 9 },
        { sku: "TV-HOOD-GRY-L", size: "L", color: "Grey", stock: 5 },
      ],
    },
    {
      name: "Tapered Cargo Trousers",
      slug: "tapered-cargo-trousers",
      description:
        "Cotton cargo trousers with a tapered leg and utility pockets. Pairs well with oversized tees and sneakers.",
      basePrice: 6899,
      status: "published",
      brand: "TrendVibes",
      categorySlug: "essentials",
      imageUrl:
        "https://images.pexels.com/photos/6311568/pexels-photo-6311568.jpeg?auto=compress&cs=tinysrgb&w=800",
      imageAlt: "Tapered cargo trousers styled with sneakers",
      variants: [
        { sku: "TV-CARGO-SND-30", size: "30", color: "Sand", stock: 4 },
        { sku: "TV-CARGO-SND-32", size: "32", color: "Sand", stock: 7 },
        { sku: "TV-CARGO-SND-34", size: "34", color: "Sand", stock: 5 },
      ],
    },
    {
      name: "Varsity Denim Jacket",
      slug: "varsity-denim-jacket",
      description:
        "Cropped denim jacket with varsity-inspired stripes at the collar and cuffs. Lightly washed for a lived-in feel.",
      basePrice: 9999,
      status: "published",
      brand: "TrendVibes",
      categorySlug: "streetwear",
      imageUrl:
        "https://images.pexels.com/photos/7671280/pexels-photo-7671280.jpeg?auto=compress&cs=tinysrgb&w=800",
      imageAlt: "Denim varsity jacket styled over a tee",
      variants: [
        { sku: "TV-DENIM-LT-S", size: "S", color: "Light Blue", stock: 4 },
        { sku: "TV-DENIM-LT-M", size: "M", color: "Light Blue", stock: 6 },
        { sku: "TV-DENIM-LT-L", size: "L", color: "Light Blue", stock: 4 },
      ],
    },
    {
      name: "Ribbed Knit Beanie",
      slug: "ribbed-knit-beanie",
      description:
        "Soft ribbed knit beanie with a shallow fit and subtle woven label. Designed to sit just above the ear.",
      basePrice: 2499,
      status: "published",
      brand: "TrendVibes",
      categorySlug: "accessories",
      imageUrl:
        "https://images.pexels.com/photos/6311660/pexels-photo-6311660.jpeg?auto=compress&cs=tinysrgb&w=800",
      imageAlt: "Ribbed knit beanie on a minimal background",
      variants: [
        { sku: "TV-BEAN-BLK-OS", size: "One Size", color: "Black", stock: 12 },
        { sku: "TV-BEAN-CRM-OS", size: "One Size", color: "Cream", stock: 8 },
      ],
    },
    {
      name: "Oversized Hoodie Dress",
      slug: "oversized-hoodie-dress",
      description:
        "Fleece hoodie dress with dropped shoulders, side slits, and kangaroo pocket. Throw on and go.",
      basePrice: 8499,
      status: "published",
      brand: "TrendVibes",
      categorySlug: "essentials",
      imageUrl:
        "https://images.pexels.com/photos/6311576/pexels-photo-6311576.jpeg?auto=compress&cs=tinysrgb&w=800",
      imageAlt: "Oversized hoodie dress styled with chunky sneakers",
      variants: [
        { sku: "TV-HOODDRS-CRM-S", size: "S", color: "Cream", stock: 6 },
        { sku: "TV-HOODDRS-CRM-M", size: "M", color: "Cream", stock: 7 },
      ],
    },
    {
      name: "Everyday Sport Socks (3-pack)",
      slug: "everyday-sport-socks-3-pack",
      description:
        "Three-pack of cushioned sport socks with a subtle TrendVibes logo at the cuff.",
      basePrice: 1999,
      status: "published",
      brand: "TrendVibes",
      categorySlug: "accessories",
      imageUrl:
        "https://images.pexels.com/photos/6311672/pexels-photo-6311672.jpeg?auto=compress&cs=tinysrgb&w=800",
      imageAlt: "Sport socks arranged on a neutral background",
      variants: [
        { sku: "TV-SOCK-WHT-SM", size: "S/M", color: "White", stock: 10 },
        { sku: "TV-SOCK-WHT-LXL", size: "L/XL", color: "White", stock: 10 },
      ],
    },
  ];

  let createdCount = 0;

  for (const p of products) {
    const existing = await prisma.product.findUnique({
      where: { slug: p.slug },
      select: { id: true },
    });
    if (existing) continue;

    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        basePrice: p.basePrice,
        status: p.status,
        brand: p.brand,
        categoryId: categoryBySlug[p.categorySlug],
        media: {
          create: [
            {
              url: p.imageUrl,
              altText: p.imageAlt,
            },
          ],
        },
        variants: {
          create: p.variants,
        },
      },
    });

    createdCount += 1;
    console.log("Seeded product:", product.slug);
  }

  if (createdCount > 0) {
    console.log(`Seeded ${createdCount} TrendVibes products with images.`);
  }
}

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "trendvibes-api" });
});

app.post("/auth/login", async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid login payload" });
  }
  const { email, name, password } = parsed.data;

  try {
    const existing = await prisma.customer.findUnique({
      where: { email },
    });

    // Existing customer with password: require correct password
    if (existing && existing.hashedPassword) {
      if (!password) {
        return res
          .status(400)
          .json({ message: "Password required to sign in to this account." });
      }
      const valid = await verifyPassword(password, existing.hashedPassword);
      if (!valid) {
        return res
          .status(401)
          .json({ message: "Invalid email or password." });
      }

      // Optionally update name
      if (name && name !== existing.name) {
        const updated = await prisma.customer.update({
          where: { id: existing.id },
          data: { name },
        });
        return res.json({
          id: updated.id,
          email: updated.email,
          name: updated.name,
        });
      }

      return res.json({
        id: existing.id,
        email: existing.email,
        name: existing.name,
      });
    }

    // Existing customer without password yet: reject and ask to register
    if (existing && !existing.hashedPassword) {
      return res.status(400).json({
        message: "This account was created without a password. Please sign up again to set one.",
      });
    }

    // No existing customer: do not auto-register here
    if (!existing) {
      return res
        .status(404)
        .json({ message: "Account not found. Please sign up first." });
    }
  } catch (err) {
    console.error("Login failed", err);
    res.status(500).json({ message: "Failed to sign in" });
  }
});

app.post("/auth/register", async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid sign up payload" });
  }
  const { email, name, password } = parsed.data;
  try {
    const existing = await prisma.customer.findUnique({
      where: { email },
    });
    if (existing && existing.hashedPassword) {
      return res
        .status(400)
        .json({ message: "An account with this email already exists." });
    }

    const hashed = await hashPassword(password);

    if (existing && !existing.hashedPassword) {
      const updated = await prisma.customer.update({
        where: { id: existing.id },
        data: {
          name: name ?? undefined,
          hashedPassword: hashed,
        },
      });
      return res.json({
        id: updated.id,
        email: updated.email,
        name: updated.name,
      });
    }

    const created = await prisma.customer.create({
      data: {
        email,
        name,
        hashedPassword: hashed,
      },
    });

    res.json({
      id: created.id,
      email: created.email,
      name: created.name,
    });
  } catch (err) {
    console.error("Register failed", err);
    res.status(500).json({ message: "Failed to sign up" });
  }
});

// Catalog endpoints
app.get("/products", async (_req: Request, res: Response) => {
  const products = await prisma.product.findMany({
    where: { status: "published" },
    include: {
      variants: true,
      media: true,
      category: true,
    },
  });
  res.json(products);
});

app.get("/products/:slug", async (req: Request, res: Response) => {
  const { slug } = req.params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      variants: true,
      media: true,
      category: true,
    },
  });
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.json(product);
});

app.get("/categories", async (_req: Request, res: Response) => {
  const categories = await prisma.category.findMany();
  res.json(categories);
});

// Cart endpoints
app.post("/cart", async (_req: Request, res: Response) => {
  const cart = await prisma.cart.create({
    data: {},
  });
  res.status(201).json(cart);
});

app.get("/cart/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const cart = await prisma.cart.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          productVariant: {
            include: {
              product: {
                include: { media: true },
              },
            },
          },
        },
      },
    },
  });
  if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }
  res.json(cart);
});

app.post("/cart/:id/items", async (req: Request, res: Response) => {
  const cartId = Number(req.params.id);
  const { productVariantId, quantity } = req.body as {
    productVariantId: number;
    quantity: number;
  };

  const cart = await prisma.cart.findUnique({ where: { id: cartId } });
  if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }

  const variant = await prisma.productVariant.findUnique({
    where: { id: productVariantId },
    include: { product: true },
  });
  if (!variant || !variant.product) {
    return res.status(400).json({ message: "Invalid product variant" });
  }

  const unitPrice = variant.price ?? variant.product.basePrice;

  const item = await prisma.cartItem.create({
    data: {
      cartId,
      productVariantId,
      quantity,
      unitPrice,
    },
  });

  res.status(201).json(item);
});

app.patch("/cart/:id/items/:itemId", async (req: Request, res: Response) => {
  const cartId = Number(req.params.id);
  const itemId = Number(req.params.itemId);
  const { quantity } = req.body as { quantity: number };

  const cart = await prisma.cart.findUnique({ where: { id: cartId } });
  if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: itemId } });
    return res.status(204).send();
  }

  const updated = await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
  });

  res.json(updated);
});

app.delete(
  "/cart/:id/items/:itemId",
  async (req: Request, res: Response) => {
    const itemId = Number(req.params.itemId);
    await prisma.cartItem.delete({ where: { id: itemId } });
    res.status(204).send();
  },
);

// Checkout + dummy payment
app.post("/checkout", async (req: Request, res: Response) => {
  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid checkout payload" });
  }

  const { cartId, email, name, address, customerId } = parsed.data;

  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          productVariant: {
            include: { product: true },
          },
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: "Cart is empty or not found" });
  }

  // Compute totals
  let subtotal = 0;
  for (const item of cart.items) {
    const variant = item.productVariant;
    const product = variant.product;
    const price = variant.price ?? product.basePrice;
    subtotal += item.quantity * price;
  }
  const shippingTotal = 500; // flat 5.00
  const discountTotal = 0;
  const taxTotal = 0;
  const grandTotal = subtotal + shippingTotal - discountTotal + taxTotal;

  // Create order + payment (dummy success)
  const orderNumber = `TVB-${Date.now()}`;

  const createdAddress = await prisma.address.create({
    data: {
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      region: address.region,
      country: address.country,
      postalCode: address.postalCode,
      phone: address.phone,
    },
  });

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerId: customerId ?? undefined,
      addressId: createdAddress.id,
      status: "paid",
      paymentStatus: "succeeded",
      shippingStatus: "not_shipped",
      subtotal,
      shippingTotal,
      discountTotal,
      taxTotal,
      grandTotal,
      items: {
        create: cart.items.map((item) => ({
          productVariantId: item.productVariantId,
          quantity: item.quantity,
          unitPrice:
            item.productVariant.price ?? item.productVariant.product.basePrice,
        })),
      },
      payment: {
        create: {
          provider: "dummy",
          status: "succeeded",
          amount: grandTotal,
          reference: `DUMMY-${Date.now()}`,
        },
      },
    },
    include: {
      items: {
        include: {
          productVariant: {
            include: { product: true },
          },
        },
      },
      payment: true,
      address: true,
    },
  });

  res.status(201).json({
    message: "Order placed successfully (dummy payment succeeded).",
    order,
    totals: {
      subtotal,
      shippingTotal,
      discountTotal,
      taxTotal,
      grandTotal,
      subtotalDisplay: toMoney(subtotal),
      grandTotalDisplay: toMoney(grandTotal),
    },
  });
});

app.get("/orders/:orderNumber", async (req: Request, res: Response) => {
  const { orderNumber } = req.params;
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: {
        include: {
          productVariant: {
            include: { product: true },
          },
        },
      },
      payment: true,
      address: true,
    },
  });
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  res.json(order);
});

// Customer orders for account area
app.get("/customers/:id/orders", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ message: "Invalid customer id" });
  }

  const orders = await prisma.order.findMany({
    where: { customerId: id },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          productVariant: {
            include: { product: true },
          },
        },
      },
      payment: true,
      address: true,
    },
  });

  res.json(orders);
});

app.patch("/customers/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ message: "Invalid customer id" });
  }
  const parsed = updateCustomerProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid profile payload" });
  }
  const { name } = parsed.data;
  try {
    const updated = await prisma.customer.update({
      where: { id },
      data: {
        name: name ?? undefined,
      },
    });
    res.json({
      id: updated.id,
      email: updated.email,
      name: updated.name,
    });
  } catch (err) {
    console.error("Failed to update customer", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

app.get("/customers/:id/addresses", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ message: "Invalid customer id" });
  }
  const addresses = await prisma.address.findMany({
    where: { customerId: id },
    orderBy: { id: "desc" },
  });
  res.json(addresses);
});

app.post("/customers/:id/addresses", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ message: "Invalid customer id" });
  }
  const parsed = createAddressSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid address payload" });
  }
  try {
    const created = await prisma.address.create({
      data: {
        ...parsed.data,
        customerId: id,
      },
    });
    res.status(201).json(created);
  } catch (err) {
    console.error("Failed to create address", err);
    res.status(500).json({ message: "Failed to create address" });
  }
});

app.post(
  "/customers/:id/password",
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid customer id" });
    }
    const parsed = updateCustomerPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid password payload" });
    }
    const { currentPassword, newPassword } = parsed.data;

    try {
      const customer = await prisma.customer.findUnique({
        where: { id },
      });
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      if (customer.hashedPassword) {
        if (!currentPassword) {
          return res
            .status(400)
            .json({ message: "Current password is required." });
        }
        const valid = await verifyPassword(
          currentPassword,
          customer.hashedPassword,
        );
        if (!valid) {
          return res
            .status(401)
            .json({ message: "Current password is incorrect." });
        }
      }

      const hashed = await hashPassword(newPassword);
      await prisma.customer.update({
        where: { id },
        data: { hashedPassword: hashed },
      });

      res.json({ message: "Password updated." });
    } catch (err) {
      console.error("Failed to update customer password", err);
      res.status(500).json({ message: "Failed to update password" });
    }
  },
);

// Simple admin endpoints (guarded by token if configured)
app.get("/admin/products", requireAdmin, async (_req: Request, res: Response) => {
  const products = await prisma.product.findMany({
    include: {
      variants: true,
      category: true,
    },
    orderBy: { id: "desc" },
  });
  res.json(products);
});

app.post("/admin/products", requireAdmin, async (req: Request, res: Response) => {
  const parsed = adminCreateProductSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid product payload" });
  }
  const {
    name,
    slug,
    description,
    basePrice,
    status,
    brand,
    categorySlug,
    imageUrl,
    imageAlt,
  } = parsed.data;

  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
  });
  if (!category) {
    return res.status(400).json({ message: "Unknown category slug" });
  }

  try {
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        basePrice,
        status,
        brand,
        categoryId: category.id,
        media: imageUrl
          ? {
              create: [
                {
                  url: imageUrl,
                  altText: imageAlt,
                },
              ],
            }
          : undefined,
      },
      include: {
        variants: true,
        category: true,
      },
    });
    res.status(201).json(product);
  } catch (err) {
    console.error("Failed to create product", err);
    res.status(500).json({ message: "Failed to create product" });
  }
});

app.delete("/admin/products/:id", requireAdmin, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  try {
    // For safety, archive the product instead of hard-deleting,
    // so existing orders remain intact.
    const updated = await prisma.product.update({
      where: { id },
      data: { status: "archived" },
    });
    res.json({ message: "Product archived", product: updated });
  } catch (err) {
    console.error("Failed to archive product", err);
    res.status(500).json({ message: "Failed to delete product" });
  }
});

app.get("/admin/orders", requireAdmin, async (_req: Request, res: Response) => {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          productVariant: {
            include: { product: true },
          },
        },
      },
      payment: true,
      address: true,
    },
    take: 50,
  });
  res.json(orders);
});

app.patch("/admin/orders/:id/status", requireAdmin, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ message: "Invalid order id" });
  }
  const parsed = adminUpdateOrderStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid status payload" });
  }
  const { status, shippingStatus } = parsed.data;

  try {
    const updated = await prisma.order.update({
      where: { id },
      data: {
        status,
        shippingStatus:
          shippingStatus ??
          (status === "shipped" || status === "delivered"
            ? status
            : "not_shipped"),
      },
    });
    res.json(updated);
  } catch (err) {
    console.error("Failed to update order status", err);
    res.status(500).json({ message: "Failed to update order status" });
  }
});

async function start() {
  await seedIfEmpty();

  app.listen(PORT, () => {
    console.log(`TrendVibes API listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start API", err);
  process.exit(1);
});


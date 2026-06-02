import swaggerJsdoc from "swagger-jsdoc";

import { env } from "@/config/env";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "JMV Grocery API",
      version: "0.1.0",
      description: "API documentation for the JMV grocery ecommerce platform",
      contact: {
        name: "JMV Support",
        email: "support@jmvgrocery.com"
      }
    },
    servers: [
      {
        url: `${env.API_BASE_URL}${env.API_PREFIX}`,
        description: env.NODE_ENV === "production" ? "Production API server" : "Local API server"
      }
    ],
    tags: [
      {
        name: "Auth",
        description: "Authentication and token management"
      },
      {
        name: "Categories",
        description: "Product category catalog"
      },
      {
        name: "Banners",
        description: "Storefront promotional banners"
      },
      {
        name: "Products",
        description: "Product and variant catalog"
      },
      {
        name: "Uploads",
        description: "Image upload and deletion"
      },
      {
        name: "Cart",
        description: "Customer shopping cart"
      },
      {
        name: "Users",
        description: "Customer profile and address management"
      },
      {
        name: "Orders",
        description: "Order placement and management"
      },
      {
        name: "Inventory",
        description: "Inventory and stock management"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },
      schemas: {
        ApiResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true
            },
            message: {
              type: "string",
              example: "Success"
            },
            data: {
              type: "object",
              nullable: true
            },
            errors: {
              nullable: true
            },
            meta: {
              type: "object",
              nullable: true
            }
          }
        },
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false
            },
            message: {
              type: "string",
              example: "Error message"
            },
            errors: {
              nullable: true
            },
            meta: {
              type: "object",
              nullable: true
            }
          }
        },
        AuthUser: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid"
            },
            name: {
              type: "string",
              example: "John Doe"
            },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com"
            },
            phone: {
              type: "string",
              nullable: true,
              example: "+919876543210"
            },
            role: {
              type: "string",
              enum: ["ADMIN", "CUSTOMER"],
              example: "CUSTOMER"
            },
            status: {
              type: "string",
              enum: ["ACTIVE", "BLOCKED"],
              example: "ACTIVE"
            },
            createdAt: {
              type: "string",
              format: "date-time"
            }
          }
        },
        AuthTokens: {
          type: "object",
          properties: {
            accessToken: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            },
            refreshToken: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            }
          }
        },
        PaginationMeta: {
          type: "object",
          properties: {
            page: {
              type: "integer",
              example: 1
            },
            limit: {
              type: "integer",
              example: 20
            },
            total: {
              type: "integer",
              example: 42
            },
            totalPages: {
              type: "integer",
              example: 3
            }
          }
        },
        Category: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid"
            },
            name: {
              type: "string",
              example: "Fresh Fruits"
            },
            slug: {
              type: "string",
              example: "fresh-fruits"
            },
            imageUrl: {
              type: "string",
              nullable: true,
              example: "https://res.cloudinary.com/demo/image/upload/fruits.jpg"
            },
            imagePublicId: {
              type: "string",
              nullable: true,
              example: "categories/fruits"
            },
            isActive: {
              type: "boolean",
              example: true
            },
            productsCount: {
              type: "integer",
              example: 12
            },
            createdAt: {
              type: "string",
              format: "date-time"
            },
            updatedAt: {
              type: "string",
              format: "date-time"
            },
            deletedAt: {
              type: "string",
              format: "date-time",
              nullable: true
            }
          }
        },
        Banner: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid"
            },
            title: {
              type: "string",
              example: "Fresh Deals This Week"
            },
            subtitle: {
              type: "string",
              nullable: true,
              example: "Save on fruits, snacks, and daily essentials."
            },
            imageUrl: {
              type: "string",
              nullable: true,
              example: "https://res.cloudinary.com/demo/image/upload/banner.jpg"
            },
            imagePublicId: {
              type: "string",
              nullable: true,
              example: "jmv/banners/fresh-deals"
            },
            imageUrls: {
              type: "object",
              nullable: true
            },
            ctaLabel: {
              type: "string",
              nullable: true,
              example: "Shop now"
            },
            ctaUrl: {
              type: "string",
              nullable: true,
              example: "/products?categorySlug=snacks"
            },
            sortOrder: {
              type: "integer",
              example: 1
            },
            isActive: {
              type: "boolean",
              example: true
            },
            startsAt: {
              type: "string",
              format: "date-time",
              nullable: true
            },
            endsAt: {
              type: "string",
              format: "date-time",
              nullable: true
            },
            createdAt: {
              type: "string",
              format: "date-time"
            },
            updatedAt: {
              type: "string",
              format: "date-time"
            },
            deletedAt: {
              type: "string",
              format: "date-time",
              nullable: true
            }
          }
        },
        ProductVariant: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid"
            },
            name: {
              type: "string",
              example: "1 kg"
            },
            price: {
              type: "string",
              example: "120.00"
            },
            stock: {
              type: "integer",
              example: 25
            },
            sku: {
              type: "string",
              example: "APPLE-1KG"
            },
            unit: {
              type: "string",
              example: "kg"
            },
            isActive: {
              type: "boolean",
              example: true
            },
            createdAt: {
              type: "string",
              format: "date-time"
            },
            updatedAt: {
              type: "string",
              format: "date-time"
            }
          }
        },
        Product: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid"
            },
            categoryId: {
              type: "string",
              format: "uuid"
            },
            name: {
              type: "string",
              example: "Shimla Apple"
            },
            slug: {
              type: "string",
              example: "shimla-apple"
            },
            description: {
              type: "string",
              nullable: true,
              example: "Fresh and crisp apples."
            },
            imageUrl: {
              type: "string",
              nullable: true,
              example: "https://res.cloudinary.com/demo/image/upload/apple.jpg"
            },
            imagePublicId: {
              type: "string",
              nullable: true,
              example: "products/apple"
            },
            isActive: {
              type: "boolean",
              example: true
            },
            category: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  format: "uuid"
                },
                name: {
                  type: "string",
                  example: "Fresh Fruits"
                },
                slug: {
                  type: "string",
                  example: "fresh-fruits"
                },
                isActive: {
                  type: "boolean",
                  example: true
                }
              }
            },
            variants: {
              type: "array",
              items: {
                $ref: "#/components/schemas/ProductVariant"
              }
            },
            createdAt: {
              type: "string",
              format: "date-time"
            },
            updatedAt: {
              type: "string",
              format: "date-time"
            },
            deletedAt: {
              type: "string",
              format: "date-time",
              nullable: true
            }
          }
        },
        UploadedImage: {
          type: "object",
          properties: {
            imageUrl: {
              type: "string",
              example: "https://res.cloudinary.com/demo/image/upload/v123/jmv/products/apple.jpg"
            },
            imagePublicId: {
              type: "string",
              example: "jmv/products/apple"
            }
          }
        },
        CartItem: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid"
            },
            variantId: {
              type: "string",
              format: "uuid"
            },
            quantity: {
              type: "integer",
              example: 2
            },
            unitPrice: {
              type: "string",
              example: "120.00"
            },
            lineTotal: {
              type: "string",
              example: "240.00"
            },
            variant: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  format: "uuid"
                },
                name: {
                  type: "string",
                  example: "1 kg"
                },
                sku: {
                  type: "string",
                  example: "APPLE-1KG"
                },
                unit: {
                  type: "string",
                  example: "kg"
                },
                stock: {
                  type: "integer",
                  example: 25
                },
                isActive: {
                  type: "boolean",
                  example: true
                }
              }
            },
            product: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  format: "uuid"
                },
                name: {
                  type: "string",
                  example: "Shimla Apple"
                },
                slug: {
                  type: "string",
                  example: "shimla-apple"
                },
                imageUrl: {
                  type: "string",
                  nullable: true
                },
                isActive: {
                  type: "boolean",
                  example: true
                }
              }
            },
            category: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  format: "uuid"
                },
                name: {
                  type: "string",
                  example: "Fresh Fruits"
                },
                slug: {
                  type: "string",
                  example: "fresh-fruits"
                }
              }
            },
            createdAt: {
              type: "string",
              format: "date-time"
            },
            updatedAt: {
              type: "string",
              format: "date-time"
            }
          }
        },
        Cart: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              nullable: true
            },
            userId: {
              type: "string",
              format: "uuid",
              nullable: true
            },
            items: {
              type: "array",
              items: {
                $ref: "#/components/schemas/CartItem"
              }
            },
            subtotal: {
              type: "string",
              example: "240.00"
            },
            totalItems: {
              type: "integer",
              example: 2
            },
            createdAt: {
              type: "string",
              format: "date-time"
            },
            updatedAt: {
              type: "string",
              format: "date-time"
            }
          }
        },
        Address: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid"
            },
            userId: {
              type: "string",
              format: "uuid"
            },
            type: {
              type: "string",
              enum: ["HOME", "WORK", "OTHER"],
              example: "HOME"
            },
            fullName: {
              type: "string",
              example: "John Doe"
            },
            phone: {
              type: "string",
              example: "+919876543210"
            },
            line1: {
              type: "string",
              example: "12 Market Street"
            },
            line2: {
              type: "string",
              nullable: true,
              example: "Near City Mall"
            },
            city: {
              type: "string",
              example: "Kolkata"
            },
            state: {
              type: "string",
              example: "West Bengal"
            },
            postalCode: {
              type: "string",
              example: "700001"
            },
            country: {
              type: "string",
              example: "India"
            },
            isDefault: {
              type: "boolean",
              example: true
            },
            createdAt: {
              type: "string",
              format: "date-time"
            },
            updatedAt: {
              type: "string",
              format: "date-time"
            }
          }
        },
        Order: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid"
            },
            orderNumber: {
              type: "string",
              example: "JMV-MB7N2P5A-ABC123"
            },
            userId: {
              type: "string",
              format: "uuid"
            },
            addressId: {
              type: "string",
              format: "uuid",
              nullable: true
            },
            status: {
              type: "string",
              enum: ["PENDING", "CONFIRMED", "PACKED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"]
            },
            paymentMethod: {
              type: "string",
              enum: ["COD", "RAZORPAY"]
            },
            paymentStatus: {
              type: "string",
              enum: ["PENDING", "PAID", "FAILED", "REFUNDED"]
            },
            subtotal: {
              type: "string",
              example: "240.00"
            },
            deliveryFee: {
              type: "string",
              example: "0.00"
            },
            total: {
              type: "string",
              example: "240.00"
            },
            notes: {
              type: "string",
              nullable: true
            },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  productName: {
                    type: "string",
                    example: "Shimla Apple"
                  },
                  variantName: {
                    type: "string",
                    example: "1 kg"
                  },
                  sku: {
                    type: "string",
                    example: "APPLE-1KG"
                  },
                  quantity: {
                    type: "integer",
                    example: 2
                  },
                  unitPrice: {
                    type: "string",
                    example: "120.00"
                  },
                  total: {
                    type: "string",
                    example: "240.00"
                  }
                }
              }
            },
            createdAt: {
              type: "string",
              format: "date-time"
            },
            updatedAt: {
              type: "string",
              format: "date-time"
            }
          }
        }
      }
    }
  },
  apis: [
    "src/modules/**/*.routes.ts",
    "src/routes/index.ts",
    "dist/modules/**/*.routes.js",
    "dist/routes/index.js"
  ]
};

export const swaggerSpec = swaggerJsdoc(options);

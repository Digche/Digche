import { apiRequest } from "@/shared/api/api-client";
import { endpoints } from "@/shared/api/endpoints";
import { foodsApi } from "@/features/foods/api/foods.api";
import type { CartItem } from "@/store/cart-store";

type CoreResult<T> = {
  isSuccess?: boolean;
  errorMessage?: string | null;
  data?: T;
};

type CoreCartDto = {
  id: string;
  userId: string;
  items: CoreCartItemDto[];
  totalPrice?: number;
};

type CoreCartItemDto = {
  dishId: string;
  dishName: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
};

type AddCartItemPayload = {
  dishId: number | string;
  quantity?: number;
};

function unwrapCoreResult<T>(response: T | CoreResult<T>): T {
  if (
    response &&
    typeof response === "object" &&
    "data" in response
  ) {
    return (response as CoreResult<T>).data as T;
  }

  return response as T;
}

function buildFallbackCartItem(item: CoreCartItemDto): CartItem {
  return {
    id: item.dishId,
    title: item.dishName || "غذا",
    category: "",
    rating: 0,
    remaining: "",
    chef: "",
    chefId: "",
    location: "",
    price: String(item.unitPrice ?? ""),
    unit: "تومان",
    image: "/images/cake.webp",
    quantity: item.quantity,
  };
}

export const cartApi = {
  async getCart(): Promise<CartItem[]> {
    const response = await apiRequest<CoreResult<CoreCartDto> | CoreCartDto>(
      endpoints.cart.get,
      {
        method: "GET",
        auth: true,
      }
    );

    const cart = unwrapCoreResult(response);
    const items = cart?.items ?? [];

    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        try {
          const food = await foodsApi.getFoodById(item.dishId);

          return {
            ...food,
            id: item.dishId,
            title: food.title || item.dishName,
            price: String(item.unitPrice ?? food.price ?? ""),
            unit: food.unit ?? "تومان",
            quantity: item.quantity,
          };
        } catch {
          return buildFallbackCartItem(item);
        }
      })
    );

    return enrichedItems;
  },

  async addItem(payload: AddCartItemPayload) {
    return apiRequest<CoreResult<boolean>>(
      endpoints.cart.addItem,
      {
        method: "POST",
        auth: true,
        body: {
          dishId: payload.dishId,
          quantity: payload.quantity ?? 1,
        },
      }
    );
  },

  async removeItem(dishId: number | string) {
    return apiRequest<CoreResult<boolean>>(
      endpoints.cart.removeItem(dishId),
      {
        method: "DELETE",
        auth: true,
      }
    );
  },

  async setItemQuantity(input: {
    dishId: number | string;
    quantity: number;
  }) {
    await cartApi.removeItem(input.dishId);

    if (input.quantity > 0) {
      await cartApi.addItem({
        dishId: input.dishId,
        quantity: input.quantity,
      });
    }

    return true;
  },

  async clearCart() {
    return apiRequest<CoreResult<boolean>>(
      endpoints.cart.clear,
      {
        method: "DELETE",
        auth: true,
      }
    );
  },
};
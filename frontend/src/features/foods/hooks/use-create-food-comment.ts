"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { foodsApi } from "../api/foods.api";
import type { CreateFoodCommentPayload } from "../types/food-comment.types";

export function useCreateFoodComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateFoodCommentPayload) =>
      foodsApi.createFoodComment(payload),

    onSuccess: (_comment, payload) => {
      void queryClient.invalidateQueries({
        queryKey: ["foods", payload.dishId, "comments"],
      });

      void queryClient.invalidateQueries({
        queryKey: ["foods", payload.dishId],
      });
    },
  });
}
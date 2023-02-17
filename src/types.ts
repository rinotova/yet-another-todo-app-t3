import type { inferRouterOutputs } from "@trpc/server";
import { z } from "zod";
import type { AppRouter } from "./server/api/root";

type RouterOutputs = inferRouterOutputs<AppRouter>;
type allTodosOutput = RouterOutputs["todo"]["getAllTodos"];

export type Todo = allTodosOutput[number];

export const TodoSchema = z
  .string({
    required_error: "Describe your todo",
  })
  .min(3, "Enter a text of min length 3 please.")
  .max(50, "Enter a text of max length 3 please.");

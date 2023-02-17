import React from "react";
import { Todo } from "../types";
import { api } from "../utils/api";
import { toast } from "react-hot-toast";

function Todo({ todo }: { todo: Todo }) {
  const trpcUtils = api.useContext();
  const { id, text, done } = todo;
  const { mutate: toggleTodo } = api.todo.toggleTodo.useMutation({
    onMutate: async ({ id, done }) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update.
      await trpcUtils.todo.getAllTodos.cancel();

      // Snapshot of the previous value
      const previousTodos = trpcUtils.todo.getAllTodos.getData();

      // Optimistically update to the new value
      trpcUtils.todo.getAllTodos.setData(undefined, (prev) => {
        if (!prev) {
          return previousTodos;
        }

        return prev.map((todo) => {
          if (todo.id === id) {
            return { ...todo, done };
          }
          return todo;
        });
      });
      return { previousTodos };
    },
    onError: (err, newTodo, context) => {
      toast.error("There was an error when updating the todo");
      trpcUtils.todo.getAllTodos.setData(
        undefined,
        () => context?.previousTodos
      );
    },
    onSettled: async () => {
      await trpcUtils.todo.getAllTodos.invalidate();
    },

    onSuccess: (err, { done }) => {
      if (done) {
        toast.success("Todo completed");
      }
    },
  });
  const { mutate: deleteTodo } = api.todo.deleteTodo.useMutation({
    onMutate: async ({ id }) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update.
      await trpcUtils.todo.getAllTodos.cancel();

      // Snapshot of the previous value
      const previousTodos = trpcUtils.todo.getAllTodos.getData();

      // Optimistically update to the new value
      trpcUtils.todo.getAllTodos.setData(undefined, (prev) => {
        if (!prev) {
          return previousTodos;
        }

        return prev.filter((todo) => todo.id !== id);
      });
      return { previousTodos };
    },
    onError: (err, newTodo, context) => {
      toast.error("There was an error when deleting the todo");
      trpcUtils.todo.getAllTodos.setData(
        undefined,
        () => context?.previousTodos
      );
    },
    onSettled: async () => {
      await trpcUtils.todo.getAllTodos.invalidate();
    },
  });
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <input
          className="focus:ring-3 h-4 w-4 cursor-pointer rounded border border-gray-300 bg-gray-50 focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
          type="checkbox"
          name="done"
          id={id}
          checked={done}
          onChange={(e) => {
            toggleTodo({
              id: todo.id,
              done: e.target.checked,
            });
          }}
        />
        <label
          htmlFor={id}
          className={`cursor-pointer ${done ? "line-through" : ""}`}
        >
          {text}
        </label>
      </div>
      <button
        className="w-full rounded-lg bg-blue-700 px-2 py-1 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 sm:w-auto"
        onClick={() => {
          deleteTodo({ id: todo.id });
        }}
      >
        Delete
      </button>
    </div>
  );
}

export default Todo;

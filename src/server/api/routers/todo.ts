import { z } from "zod";
import { TodoSchema } from "../../../types";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const todoRouter = createTRPCRouter({
  getAllTodos: protectedProcedure.query(async ({ ctx }) => {
    const todos = await ctx.prisma.todo.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    });

    return todos.map(({ id, text, done }) => ({ id, text, done }));

    // return todos.map(({ id, text, done }) => ({ id, text, done }));
  }),
  createTodo: protectedProcedure
    .input(TodoSchema)
    .mutation(({ ctx, input }) => {
      const { prisma, session } = ctx;

      return prisma.todo.create({
        data: {
          text: input,
          user: {
            connect: {
              id: session.user.id,
            },
          },
        },
      });
    }),
  deleteTodo: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      const { prisma, session } = ctx;
      const { id } = input;

      return prisma.todo.delete({
        where: {
          id_userId: {
            id,
            userId: session.user.id,
          },
        },
      });
    }),
  toggleTodo: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        done: z.boolean(),
      })
    )
    .mutation(({ ctx, input }) => {
      const { session, prisma } = ctx;
      const { id, done } = input;

      return prisma.todo.update({
        where: {
          id_userId: { id, userId: session.user.id },
        },
        data: {
          done,
        },
      });
    }),
});

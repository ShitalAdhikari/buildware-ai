"use server"

import { auth } from "@clerk/nextjs/server"
import { and, desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "../db"
import {
  InsertProject,
  SelectProject,
  projectsTable
} from "../schema/projects-schema"

export async function createProject(
  data: Omit<InsertProject, "userId">
): Promise<SelectProject> {
  if (process.env.NEXT_PUBLIC_SIMPLE_MODE) {
    try {
      const [result] = await db
        .insert(projectsTable)
        .values({ ...data, userId: "simple" })
        .returning()
      revalidatePath("/")
      return result
    } catch (error) {
      console.error("Error creating project record:", error)
      throw error
    }
  } else {
    const { userId } = auth()
    if (!userId) throw new Error("User not authenticated")

    try {
      const [result] = await db
        .insert(projectsTable)
        .values({ ...data, userId })
        .returning()
      revalidatePath("/")
      return result
    } catch (error) {
      console.error("Error creating project record:", error)
      throw error
    }
  }
}

export async function getProjectById(
  id: string
): Promise<SelectProject | undefined> {
  try {
    return await db.query.projects.findFirst({
      where: eq(projectsTable.id, id)
    })
  } catch (error) {
    console.error(`Error getting project by id ${id}:`, error)
    throw error
  }
}

export async function getProjectsByUserId(): Promise<SelectProject[]> {
  const { userId } = auth()
  if (!userId) throw new Error("User not authenticated")

  try {
    return db.query.projects.findMany({
      where: eq(projectsTable.userId, userId),
      orderBy: desc(projectsTable.updatedAt)
    })
  } catch (error) {
    console.error("Error getting projects for user:", error)
    throw error
  }
}

export async function getProjectByLinearOrganizationId(
  linearOrganizationId: string
): Promise<SelectProject | undefined> {
  return db.query.projects.findFirst({
    where: eq(projectsTable.linearOrganizationId, linearOrganizationId)
  })
}

export async function updateProject(
  id: string,
  data: Partial<InsertProject>
): Promise<void> {
  try {
    await db
      .update(projectsTable)
      .set(data)
      .where(and(eq(projectsTable.id, id)))
    revalidatePath("/")
  } catch (error) {
    console.error(`Error updating project ${id}:`, error)
    throw error
  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    await db.delete(projectsTable).where(and(eq(projectsTable.id, id)))
    revalidatePath("/")
  } catch (error) {
    console.error(`Error deleting project ${id}:`, error)
    throw error
  }
}

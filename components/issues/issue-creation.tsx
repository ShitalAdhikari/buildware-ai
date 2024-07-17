import { getTemplatesWithInstructionsByProjectId } from "@/db/queries/template-queries"
import { NewIssueForm } from "./new-issue-form"

export const IssueCreation = async ({ projectId }: { projectId: string }) => {
  const templates = await getTemplatesWithInstructionsByProjectId(projectId)

  return <NewIssueForm templates={templates} />
}

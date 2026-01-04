import { Step, StepType } from "@/types";

export class StreamingXmlParser {
  private buffer: string = "";
  private steps: Step[] = [];
  private stepId: number = 1;
  private artifactTitleAdded: boolean = false;
  private lastProcessedIndex: number = 0;

  parseChunk(chunk: string): Step[] {
    this.buffer += chunk;
    const newSteps: Step[] = [];

    // Try to extract artifact title if not already done
    if (!this.artifactTitleAdded) {
      const titleMatch = this.buffer.match(/title="([^"]*)"/);
      if (titleMatch) {
        const step: Step = {
          id: this.stepId++,
          title: titleMatch[1],
          description: "",
          type: StepType.CreateFolder,
          status: "pending",
        };
        this.steps.push(step);
        newSteps.push(step);
        this.artifactTitleAdded = true;
      }
    }

    // Parse complete boltAction tags
    const actionRegex =
      /<boltAction\s+type="([^"]*)"(?:\s+filePath="([^"]*)")?>([\s\S]*?)<\/boltAction>/g;
    
    // Reset regex to search from last processed position
    actionRegex.lastIndex = this.lastProcessedIndex;
    
    let match;
    while ((match = actionRegex.exec(this.buffer)) !== null) {
      const [_, type, filePath, content] = match;
      
      if (type === "file") {
        const step: Step = {
          id: this.stepId++,
          title: `Create ${filePath || "file"}`,
          description: "",
          type: StepType.CreateFile,
          status: "pending",
          code: content.trim(),
          path: filePath,
        };
        this.steps.push(step);
        newSteps.push(step);
      } else if (type === "shell") {
        const step: Step = {
          id: this.stepId++,
          title: `Run command`,
          description: "",
          type: StepType.RunScript,
          status: "pending",
          code: content.trim(),
        };
        this.steps.push(step);
        newSteps.push(step);
      }
      
      this.lastProcessedIndex = actionRegex.lastIndex;
    }

    return newSteps;
  }

  getAllSteps(): Step[] {
    return this.steps;
  }

  reset() {
    this.buffer = "";
    this.steps = [];
    this.stepId = 1;
    this.artifactTitleAdded = false;
    this.lastProcessedIndex = 0;
  }
}

export function parseXml(response: string): Step[] {
  const xmlMatch = response.match(
    /<boltArtifact[^>]*>([\s\S]*?)<\/boltArtifact>/
  );

  if (!xmlMatch) {
    return [];
  }

  const xmlContent = xmlMatch[1];
  const steps: Step[] = [];
  let stepId = 1;

  const titleMatch = response.match(/title="([^"]*)"/);
  const artifactTitle = titleMatch ? titleMatch[1] : "Project Files";

  steps.push({
    id: stepId++,
    title: artifactTitle,
    description: "",
    type: StepType.CreateFolder,
    status: "pending",
  });

  const actionRegex =
    /<boltAction\s+type="([^"]*)"(?:\s+filePath="([^"]*)")?>([\s\S]*?)<\/boltAction>/g;

  let match;
  while ((match = actionRegex.exec(xmlContent)) !== null) {
    const [, type, filePath, content] = match;
     
    
    if (type === "file") {
      steps.push({
        id: stepId++,
        title: `Create ${filePath || "file"}`,
        description: "",
        type: StepType.CreateFile,
        status: "pending",
        code: content.trim(),
        path: filePath,
      });
    } else if (type === "shell") {
      steps.push({
        id: stepId++,
        title: `Run command`,
        description: "",
        type: StepType.RunScript,
        status: "pending",
        code: content.trim(),
      });
    }
  }
  return steps;
}

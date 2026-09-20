export interface BlenderScript {
  name: string;
  content: string;
}

export interface RenderAsset {
  name: string;
  url: string;
  timestamp: number;
}

export interface RenderStatus {
  activeJobs: number;
  progress: number;
  currentFrame: number;
  totalFrames: number;
  nodeStatus: string;
  performance: {
    cpu: number;
    memory: number;
    gpu: number;
    temp: number;
  };
  queue: RenderJob[];
}

export interface RenderJob {
  id: string;
  scriptName: string;
  status: 'pending' | 'rendering' | 'completed' | 'failed';
  progress: number;
}

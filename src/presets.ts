export interface RenderPreset {
  id: string;
  name: string;
  code: string;
}

export const RENDER_PRESETS: RenderPreset[] = [
  {
    id: 'cycles-4k',
    name: 'Cycles 4K Ultra',
    code: `# Cycles 4K Render Preset
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.device = 'GPU'
scene.render.resolution_x = 3840
scene.render.resolution_y = 2160
scene.render.resolution_percentage = 100
scene.cycles.samples = 1024
scene.cycles.use_denoising = True
`
  },
  {
    id: 'eevee-draft',
    name: 'Eevee Draft (1080p)',
    code: `# Eevee Draft Preset
scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE_NEXT'
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.resolution_percentage = 50
scene.eevee.taa_render_samples = 16
`
  },
  {
    id: 'workbench-clay',
    name: 'Workbench Clay',
    code: `# Workbench Clay Preset
scene = bpy.context.scene
scene.render.engine = 'BLENDER_WORKBENCH'
scene.display.shading.light = 'MATCAP'
scene.display.shading.studio_light = 'clay.exr'
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
`
  }
];

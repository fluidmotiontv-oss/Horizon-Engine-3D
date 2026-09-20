import bpy

# Clear existing objects
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# Create a cube
bpy.ops.mesh.primitive_cube_add(size=2, enter_editmode=False, align='WORLD', location=(0, 0, 1))
cube = bpy.context.active_object

# Add a material
mat = bpy.data.materials.new(name="BlueMaterial")
mat.use_nodes = True
nodes = mat.node_tree.nodes
nodes["Principled BSDF"].inputs[0].default_value = (0.0, 0.4, 0.8, 1.0)
cube.data.materials.append(mat)

# Setup Camera
bpy.ops.object.camera_add(location=(7, -7, 5), rotation=(1.1, 0, 0.78))
bpy.context.scene.camera = bpy.context.active_object

# Setup Lighting
bpy.ops.object.light_add(type='SUN', location=(5, 5, 10))

# Render Settings
bpy.context.scene.render.filepath = "/tmp/render.png"
bpy.context.scene.render.resolution_x = 1920
bpy.context.scene.render.resolution_y = 1080

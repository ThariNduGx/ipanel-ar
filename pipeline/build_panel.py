#!/usr/bin/env python3
"""Usage: blender --background --python build_panel.py -- profiles/f10.json <slug> 3050"""
import sys, json
from pathlib import Path
import bpy

BASE = Path(__file__).resolve().parent

def hex_rgb(h):
    h = h.lstrip('#'); return tuple(int(h[i:i+2], 16)/255 for i in (0, 2, 4)) + (1.0,)

def main():
    argv = sys.argv[sys.argv.index('--')+1:]
    P = json.loads(Path(argv[0]).read_text()); slug = argv[1]; Lmm = int(argv[2])
    t = P['thickness_mm']/1000; gd = P['slats']['groove_depth_mm']/1000
    sw = P['slats']['slat_width_mm']/1000; gw = P['slats']['groove_width_mm']/1000
    n = P['slats']['count']; L = Lmm/1000
    for o in list(bpy.data.objects): bpy.data.objects.remove(o, do_unlink=True)
    top = []; x = 0.0
    for i in range(n):
        top += [(x, t), (x+sw, t)]; x += sw
        if i < n-1: top += [(x, t-gd), (x+gw, t-gd)]; x += gw
    W = x
    pts = [(0.0, 0.0)] + top + [(W, 0.0)]
    m = len(pts)
    verts = [(px, 0.0, pz) for px, pz in pts] + [(px, L, pz) for px, pz in pts]
    faces = [list(range(m-1, -1, -1)), list(range(m, 2*m))]
    faces += [[i, i+1, m+i+1, m+i] for i in range(m-1)]
    me = bpy.data.meshes.new('panel'); me.from_pydata(verts, [], faces); me.update()
    ob = bpy.data.objects.new('panel', me); bpy.context.collection.objects.link(ob)
    bpy.context.view_layer.objects.active = ob; ob.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.normals_make_consistent(inside=False); bpy.ops.object.mode_set(mode='OBJECT')
    # materials: slot0 face albedo, slot1 core
    td = BASE/'textures'/slug
    side = json.loads((td/'albedo.json').read_text())
    img = bpy.data.images.load(str(td/'albedo.png'))
    mf = bpy.data.materials.new('face'); mf.use_nodes = True
    nt = mf.node_tree; bsdf = nt.nodes['Principled BSDF']
    tex = nt.nodes.new('ShaderNodeTexImage'); tex.image = img; tex.extension = 'REPEAT'
    mp = nt.nodes.new('ShaderNodeMapping'); tc = nt.nodes.new('ShaderNodeTexCoord')
    ltex = img.size[0]/side['px_per_mm']/1000.0
    wtex = side['face_height_px']/side['px_per_mm']/1000.0
    mp.inputs['Scale'].default_value = (1.0/ltex, 1.0/wtex, 1.0)
    nt.links.new(tc.outputs['UV'], mp.inputs['Vector']); nt.links.new(mp.outputs['Vector'], tex.inputs['Vector'])
    nt.links.new(tex.outputs['Color'], bsdf.inputs['Base Color'])
    bsdf.inputs['Roughness'].default_value = 0.6
    mc = bpy.data.materials.new('core'); mc.use_nodes = True
    cb = mc.node_tree.nodes['Principled BSDF']
    cb.inputs['Base Color'].default_value = hex_rgb(P['slats']['core_color_hex'])
    cb.inputs['Roughness'].default_value = P['slats']['core_roughness']
    me.materials.append(mf); me.materials.append(mc)
    uvl = me.uv_layers.new(name='UVMap')
    for poly in me.polygons:
        zc = sum(me.vertices[v].co.z for v in poly.vertices)/len(poly.vertices)
        is_face = poly.normal.z > 0.9 and abs(zc - t) < 1e-6
        poly.material_index = 0 if is_face else 1
        for li in poly.loop_indices:
            co = me.vertices[me.loops[li].vertex_index].co
            uvl.data[li].uv = (co.y, co.x)
    me.calc_loop_triangles(); tris = len(me.loop_triangles)
    out = BASE/'output'; out.mkdir(exist_ok=True)
    glb = str(out/f'{P["profile"]}-{slug}-{Lmm}.glb')
    try:
        bpy.ops.export_scene.gltf(filepath=glb, export_format='GLB', use_selection=True,
            export_draco_mesh_compression_enable=True, export_image_format='WEBP')
    except TypeError:
        bpy.ops.export_scene.gltf(filepath=glb, export_format='GLB', use_selection=True,
            export_draco_mesh_compression_enable=True)
    usdz = str(out/f'{P["profile"]}-{slug}-{Lmm}.usdz')
    try:
        bpy.ops.wm.usd_export(filepath=usdz, export_textures=True, export_materials=True)
    except TypeError:
        bpy.ops.wm.usd_export(filepath=usdz)
    gm = Path(glb).stat().st_size/1e6; um = Path(usdz).stat().st_size/1e6
    assert gm <= P['budgets']['glb_max_mb'], f'GLB too big {gm:.2f}MB'
    assert um <= P['budgets']['usdz_max_mb'], f'USDZ too big {um:.2f}MB'
    assert tris <= P['budgets']['max_tris']
    print(f'OK {slug} {Lmm}mm: GLB {gm:.2f}MB | USDZ {um:.2f}MB | tris {tris}')

if __name__ == '__main__':
    main()

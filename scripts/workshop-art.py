"""Render the original workshop key art with Blender, then convert the PNG to WebP."""
import bpy, math, random, os
from mathutils import Vector
from math import pi, cos, sin
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
rng=random.Random(8)
def material(name,color,metal=.0,rough=.32,glow=0):
    mat=bpy.data.materials.new(name);mat.diffuse_color=(*color,1);mat.use_nodes=True
    p=mat.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value=(*color,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough
    if glow:
        p.inputs['Emission Color'].default_value=(*color,1);p.inputs['Emission Strength'].default_value=glow
    return mat
iron=material('Blackened iron',(.033,.056,.073),.79)
titanium=material('Brushed titanium',(.19,.255,.28),.82)
copper=material('Burnished copper',(.61,.24,.068),.8)
brass=material('Warm alloy',(.92,.61,.25),.83)
teal=material('Ceramic enamel',(.019,.24,.25),.68)
mint=material('Live circuit',(.12,.98,.82),.2,.21,3)
amber=material('Ignition', (1,.31,.035),.28,.2,3)
dark=material('Insulation',(.012,.021,.031),.35)
def finish(o,mat,bevel=.035):
    o.data.materials.append(mat)
    if bevel:
        mod=o.modifiers.new('Machined edges','BEVEL');mod.width=bevel;mod.segments=2
        mod=o.modifiers.new('Face normals','WEIGHTED_NORMAL')
    return o
def block(pos,scale,mat,rot=0,b=.04):
    bpy.ops.mesh.primitive_cube_add(size=1,location=pos);o=bpy.context.object;o.dimensions=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.rotation_euler.z=rot;return finish(o,mat,b)
def disk(x,y,z,r,h,mat,n=48):
    bpy.ops.mesh.primitive_cylinder_add(vertices=n,radius=r,depth=h,location=(x,y,z));return finish(bpy.context.object,mat,min(h*.2,.04))
def pipe(points,r,mat):
    c=bpy.data.curves.new('Bent conduit','CURVE');c.dimensions='3D';c.bevel_depth=r;c.bevel_resolution=3
    s=c.splines.new('POLY');s.points.add(len(points)-1)
    for p,v in zip(s.points,points):p.co=(*v,1)
    o=bpy.data.objects.new('Conduit',c);bpy.context.collection.objects.link(o);c.materials.append(mat)
def ring(x,y,z,r,t,mat):
    bpy.ops.mesh.primitive_torus_add(location=(x,y,z),major_radius=r,minor_radius=t,major_segments=64,minor_segments=8);return finish(bpy.context.object,mat,0)
# The plinth is assembled in layers; perimeter lugs carry the electrical bus.
for z,r,h,m in [(.10,2.72,.2,iron),(.24,2.63,.09,titanium),(.31,2.66,.06,copper),(.42,2.58,.17,dark),(.54,2.52,.09,teal)]:
    disk(0,0,z,r,h,m,8)
for i in range(8):
    a=i*pi/4
    block((2.3*cos(a),2.3*sin(a),.65),(.48,.64,.19),iron,a)
    block((2.36*cos(a),2.36*sin(a),.755),(.24,.38,.035),copper,a)
    for off in [-.11,.11]:
        disk(2.34*cos(a)-off*sin(a),2.34*sin(a)+off*cos(a),.79,.045,.035,brass,6)
for z,r,h,m in [(.67,1.95,.19,iron),(.80,1.87,.07,brass),(.89,1.82,.13,dark),(.99,1.78,.06,mint),(1.08,1.82,.13,titanium),(1.20,1.64,.12,iron),(1.29,1.47,.06,copper),(1.35,1.31,.10,dark)]:
    disk(0,0,z,r,h,m)
for i in range(44):
    a=i*2*pi/44
    block((1.70*cos(a),1.70*sin(a),1.16),(.31,.055,.15),copper if i%4==0 else titanium,a)
for r,m in [(1.18,brass),(.98,amber),(.81,iron),(.68,mint)]:ring(0,0,1.44,r,.043,m)
# Four forked transformer clamps wrap around the floating faceted core.
for i in range(4):
    a=pi/4+i*pi/2
    for rr,z,w,d,h,m in [(1.45,1.45,.42,.59,.48,iron),(1.45,1.76,.38,.49,.46,teal),(1.41,2.05,.31,.45,.19,copper),(1.29,2.25,.41,.37,.29,titanium),(1.15,2.44,.29,.30,.18,brass)]:
        block((rr*cos(a),rr*sin(a),z),(w,d,h),m,a)
    for j in range(4):
        block((1.60*cos(a),1.60*sin(a),1.45+j*.12),(.10,.55,.035),copper,a)
    block((1.17*cos(a),1.17*sin(a),2.55),(.20,.22,.04),mint,a)
# Hand-defined mineral facets graduate from deep amber at the rim to a white-hot cut face.
def crystal(x,y,z,r,h):
    n=6;v=[(x,y,z+h*.04)]
    for zz,rr,phase in [(.34,.83,0),(.63,1,.08),(.82,.64,.16)]:
        for i in range(n):
            a=2*pi*i/n+phase;v.append((x+r*rr*cos(a),y+r*rr*sin(a),z+h*zz))
    v.append((x-.09*r,y+.1*r,z+h))
    faces=[(0,1+(i+1)%n,1+i) for i in range(n)]
    for j in [0,1]:
        for i in range(n):
            a=1+j*n+i;b=1+j*n+(i+1)%n;faces.extend([(a,b,b+n),(a,b+n,a+n)])
    faces.extend([(13+i,13+(i+1)%n,19) for i in range(n)])
    mesh=bpy.data.meshes.new('Crystal facets');mesh.from_pydata(v,[],faces);mesh.update();o=bpy.data.objects.new('Ignition crystal',mesh);bpy.context.collection.objects.link(o)
    palette=[(1,.20,.018),(.96,.44,.037),(.99,.66,.15),(.80,.123,.01),(1,.84,.42),(.94,.34,.021)]
    for j,c in enumerate(palette):o.data.materials.append(material('Cut amber '+str(j),c,.45,.20,.35 if j%2 else .7))
    for f in o.data.polygons:f.material_index=(f.index*7+f.index//6)%6
crystal(0,0,1.66,.84,2.64)
for x,y in [(-2.9,-1),(2.6,1.7),(-1.5,2.6)]:
    disk(x,y,.23,.8,.46,iron,6);disk(x,y,.5,.68,.09,copper,6)
    for i in range(6):disk(x,y,.59+i*.102,.53,.045,teal if i%2 else titanium,12)
    disk(x,y,1.19,.42,.13,iron,12);ring(x,y,1.28,.32,.038,mint)
    for k in [-.10,.10]:pipe([(x+k,y,.36),(x+k,y*.66,.36),(x*.61+k,y*.66,.36),(x*.51+k,y*.44,.36)],.065,copper)
def light(name,pos,color,power,size):
    d=bpy.data.lights.new(name,'AREA');d.energy=power;d.color=color;d.shape='DISK';d.size=size;o=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(o);o.location=pos;o.rotation_euler=(Vector((0,0,1))-o.location).to_track_quat('-Z','Y').to_euler()
light('Softbox',(2,-4,8),(1,.86,.69),1000,5);light('Cold rim',(-4,2,5),(.21,.9,1),1300,4);light('Copper edge',(4,3,3),(1,.39,.14),850,3);light('Front fill',(-1,-5,4),(.43,.62,.78),450,5)
bpy.ops.object.camera_add(location=(6.8,-9,7.1));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,1.75))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=7.9
sc=bpy.context.scene;sc.camera=cam;sc.render.engine='CYCLES';sc.cycles.samples=30;sc.cycles.use_denoising=False;sc.world.color=(.13,.16,.17);sc.render.film_transparent=True;sc.render.resolution_x=900;sc.render.resolution_y=710;sc.render.resolution_percentage=100;sc.render.image_settings.file_format='PNG';sc.render.filepath=os.environ.get('ART_PATH','/tmp/werkstatt.png');bpy.ops.render.render(write_still=True)

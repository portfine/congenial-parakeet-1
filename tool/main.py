import numpy as np
import SimpleITK as sitk
import imageio as imio
from threading import RLock

from pathlib import Path

from concurrent.futures import ThreadPoolExecutor

iolock = RLock()
def convert(imgno):
    with iolock:
        img = sitk.ReadImage(f"/media/paul/extra-data/{imgno}/wta.mhd")
        mask = sitk.ReadImage(f"/media/paul/extra-data/{imgno}/brainmask.mhd")

    origin = np.array(img.GetOrigin())
    size = np.array(img.GetSize())
    spacing = np.array(img.GetSpacing())
    world_size = size * spacing

    out_spacing = np.array([.5, .5, 1])
    out_size = np.array([512, 512, 1])
    out_world_size = out_spacing * out_size

    rif = sitk.ResampleImageFilter()
    rif.SetOutputSpacing(out_spacing)
    rif.SetSize([int(x) for x in out_size])
    base_out_origin = origin + np.array(list(-out_world_size[:2] / 2) + [0])

    wl_center = 200
    wl_width = 500

    out_dir = Path(f"/media/paul/extra-data/out/{imgno}")
    if not out_dir.exists():
        out_dir.mkdir()

    for z in range(size[2]):
        print(f"{imgno}: {z+1} / {size[2]}")
        out_origin = base_out_origin + world_size / 2
        out_origin[2] += z * spacing[2] - world_size[2] / 2
        rif.SetOutputOrigin(out_origin)
   
        out_img = rif.Execute(img)
        out_array = sitk.GetArrayFromImage(out_img)[0]        
        out_array = (1 + (out_array.astype(np.float32) - wl_center) / (wl_width / 2)) / 2 * 255
        out_array[out_array < 0] = 0
        out_array[out_array > 255] = 255
        out_array = out_array.astype(np.uint8)

        out_mask = rif.Execute(mask)
        out_marray = sitk.GetArrayFromImage(out_mask)[0]
        out_marray = ((out_marray > 0) * 255).astype(np.uint8)
        
        img_stack = np.array([out_marray * .5 + out_array, out_array, out_array], dtype=np.uint8)
        img_stack = np.transpose(img_stack, (1, 2, 0))
        
        imio.imwrite(out_dir / f"img_{z}.jpg", img_stack)

import time
with ThreadPoolExecutor(8) as tp:
    for i in range(1, 101):
        tp.submit(convert, i)

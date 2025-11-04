Purpose: calculate NDVI and NBR before/after a fire, compute differences (dNDVI, dNBR), classify burned areas using thresholds, compute burned area in hectares and produce maps and summary tables.

For the post-fire analysis, Copernicus images with 15% cloud cover taken between July 3 and July 11 were used. For the pre-fire analysis, Copernicus images with 15% cloud cover taken between June 15 and June 16 were used. The images were obtained through the Google Earth Engine platform, where NDVI and NBR indices were also calculated.

Key decisions & thresholds (from analysis):

dNDVI thresholds used in the analysis:

• dNDVI < -0.2 -> vegetation loss

• dNDVI < -0.4 -> probable burned area

Pixel area (example from current imagery): ~230.800273 m² (Pixel sizes: X=15.19663938891937 m, Y= -15.199472843208387 m). Use actual raster metadata in scripts.

Outputs & Example results

The original analysis produced the following example numbers (see İzmir_Seferihisar_Yangın.docx attached):

• NDVI mean before: 0.3697858273984446

• NDVI mean after: 0.318539030628077

• dNDVI mean change: ~0.0513

Burned area estimates (example from the document):

• By NDVI-based mask: ~5,077.83 ha

• By NBR-based mask: ~4,479.34 ha

Approximate difference: ~600 ha (~13–14%) — depends on preprocessing and thresholds.



// Seferihisar borders
var districts = ee.FeatureCollection("FAO/GAUL/2015/level2");

var seferihisar = districts.filter(ee.Filter.and(
  ee.Filter.eq('ADM0_NAME', 'Turkey'),
  ee.Filter.eq('ADM1_NAME', 'Izmir'),
  ee.Filter.eq('ADM2_NAME', 'Seferihisar')
)).geometry();

Map.centerObject(seferihisar, 11);
Map.addLayer(seferihisar, {color: 'red'}, 'Seferihisar Sınırı');

// Cloud Mask (SCL bandı)
function maskS2sr(image) {
  var scl = image.select('SCL');
  var mask = scl.neq(3).and(scl.neq(8)).and(scl.neq(9)).and(scl.neq(10)).and(scl.neq(11));
  return image.updateMask(mask);
}

// Function of NDVI Computation
function addNDVI(image) {
  var ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI');
  return image.addBands(ndvi);
}

// 2025 June 15 Image
var imageJune15 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(seferihisar)
  .filterDate('2025-06-15', '2025-06-16')
  .map(maskS2sr)
  .map(addNDVI)
  .sort('CLOUDY_PIXEL_PERCENTAGE')
  .first();

// 2025 July Image
var imageJulyBest = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(seferihisar)
  .filterDate('2025-07-03', '2025-07-11')
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 15))
  .map(maskS2sr)
  .map(addNDVI)
  .first();

// 6. NDVI and To Clip
var ndviJune15 = imageJune15.select('NDVI').clip(seferihisar);
var ndviJuly = imageJulyBest.select('NDVI').clip(seferihisar);

// 7. Projection to Difference Calculation
var proj = ndviJune15.projection();
var ndviJulyReproj = ndviJuly.reproject({crs: proj.crs(), scale: proj.nominalScale()});

// 8. Calculation the Difference NDVI (July - June)
var ndviDiff = ndviJulyReproj.subtract(ndviJune15).rename('NDVI_Fark');

// 9. Mapping
Map.addLayer(ndviJune15, {min: 0, max: 1, palette: ['white', 'green']}, 'NDVI 15 Haziran 2025');
Map.addLayer(ndviJuly, {min: 0, max: 1, palette: ['white', 'darkgreen']}, 'NDVI Temmuz (3–11) 2025');
Map.addLayer(ndviDiff, {min: -0.5, max: 0.5, palette: ['red', 'white', 'green']}, 'NDVI Farkı (Temmuz - Haziran)');

// 10. ID's of Selected Iamges (to control)
imageJulyBest.get('system:index').evaluate(function(id) {
  print('Seçilen Temmuz görüntüsü ID:', id);
});



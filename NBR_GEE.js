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

// Function for NBR Computation
function addNBR(image) {
  var nbr = image.normalizedDifference(['B8', 'B12']).rename('NBR');
  return image.addBands(nbr);
}

// 2025 June 15 Image
var imageJune15 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(seferihisar)
  .filterDate('2025-06-15', '2025-06-16')
  .map(maskS2sr)
  .map(addNBR)
  .sort('CLOUDY_PIXEL_PERCENTAGE')
  .first();

// 2025 July Image
var imageJulyBest = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(seferihisar)
  .filterDate('2025-07-03', '2025-07-11')
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 15))
  .map(maskS2sr)
  .map(addNBR)
  .first();

// Clip NBR
var nbrJune15 = imageJune15.select('NBR').clip(seferihisar);
var nbrJuly = imageJulyBest.select('NBR').clip(seferihisar);

// Reproject July NBR to June NBR projection
var proj = nbrJune15.projection();
var nbrJulyReproj = nbrJuly.reproject({crs: proj.crs(), scale: proj.nominalScale()});

// Calculate NBR Difference (July - June)
var nbrDiff = nbrJulyReproj.subtract(nbrJune15).rename('NBR_Fark');

// Mapping
Map.addLayer(nbrJune15, {min: 0, max: 1, palette: ['white', 'orange']}, 'NBR 15 Haziran 2025');
Map.addLayer(nbrJuly, {min: 0, max: 1, palette: ['white', 'red']}, 'NBR Temmuz (3–11) 2025');
Map.addLayer(nbrDiff, {min: -0.5, max: 0.5, palette: ['blue', 'white', 'red']}, 'NBR Farkı (Temmuz - Haziran)');

// Selected July Image ID
imageJulyBest.get('system:index').evaluate(function(id) {
  print('Seçilen Temmuz görüntüsü ID:', id);
});

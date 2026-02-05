var size = 0;
var placement = 'point';

var style_polygon_GeoJSON_1 = function(feature, resolution){
    var context = {
        feature: feature,
        variables: {}
    };

    // Default opacity
    var opacity = 0.5;
    // Exception for specific feature
    if (feature.get('名称') === 'JR松山駅前（仮称）') {
        opacity = 1.0;
    }

    // Get color from feature attribute, default to a gray color if attribute is missing
    var featureColor = feature.get('色') || '#808080';
    var color = ol.color.fromString(featureColor);
    // Apply the opacity
    color[3] = opacity;
    
    var labelText = ""; 
    var value = feature.get("");
    var labelFont = "16.900000000000002px \'Open Sans\', sans-serif";
    var labelFill = "#ff3232";
    var bufferColor = "#fafafa";
    var bufferWidth = 3.0;
    var textAlign = "left";
    var offsetX = 0;
    var offsetY = 0;
    var placement = 'point';
    if ("" !== null) {
        labelText = String("");
    }
    var style = [ new ol.style.Style({
        fill: new ol.style.Fill({
            color: color
        }),
        text: createTextStyle(feature, resolution, labelText, labelFont,
                              labelFill, placement, bufferColor,
                              bufferWidth)
    }),new ol.style.Style({
        stroke: new ol.style.Stroke({color: feature.get('色') || 'rgba(0,0,0,1.0)', lineDash: null, lineCap: 'square', lineJoin: 'bevel', width: 1.748}),
        text: createTextStyle(feature, resolution, labelText, labelFont,
                              labelFill, placement, bufferColor,
                              bufferWidth)
    })];

    return style;
};

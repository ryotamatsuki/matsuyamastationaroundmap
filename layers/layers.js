var wms_layers = [];


        var lyr___0 = new ol.layer.Tile({
            'title': '国土地理院_淡色地図',
            'type':'base',
            'opacity': 1.000000,
            
            
            source: new ol.source.XYZ({
            attributions: ' ',
                url: 'https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png'
            })
        });
var format_polygon_GeoJSON_1 = new ol.format.GeoJSON();
var features_polygon_GeoJSON_1 = format_polygon_GeoJSON_1.readFeatures(json_polygon_GeoJSON_1, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_polygon_GeoJSON_1 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_polygon_GeoJSON_1.addFeatures(features_polygon_GeoJSON_1);
var lyr_polygon_GeoJSON_1 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_polygon_GeoJSON_1, 
                style: style_polygon_GeoJSON_1,
                popuplayertitle: 'polygon_GeoJSON',
                interactive: true,
                title: '<img src="styles/legend/polygon_GeoJSON_1.png" /> polygon_GeoJSON'
            });
var format_line_GeoJSON_2 = new ol.format.GeoJSON();
var features_line_GeoJSON_2 = format_line_GeoJSON_2.readFeatures(json_line_GeoJSON_2, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_line_GeoJSON_2 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_line_GeoJSON_2.addFeatures(features_line_GeoJSON_2);
var lyr_line_GeoJSON_2 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_line_GeoJSON_2, 
                style: style_line_GeoJSON_2,
                popuplayertitle: 'line_GeoJSON',
                interactive: true,
                title: '<img src="styles/legend/line_GeoJSON_2.png" /> line_GeoJSON'
            });
var format_point_GeoJSON_3 = new ol.format.GeoJSON();
var features_point_GeoJSON_3 = format_point_GeoJSON_3.readFeatures(json_point_GeoJSON_3, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_point_GeoJSON_3 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_point_GeoJSON_3.addFeatures(features_point_GeoJSON_3);
var lyr_point_GeoJSON_3 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_point_GeoJSON_3, 
                style: style_point_GeoJSON_3,
                popuplayertitle: 'point_GeoJSON',
                interactive: true,
                title: '<img src="styles/legend/point_GeoJSON_3.png" /> point_GeoJSON'
            });

lyr___0.setVisible(true);lyr_polygon_GeoJSON_1.setVisible(true);lyr_line_GeoJSON_2.setVisible(true);lyr_point_GeoJSON_3.setVisible(true);
var layersList = [lyr___0,lyr_polygon_GeoJSON_1,lyr_line_GeoJSON_2,lyr_point_GeoJSON_3];
lyr_polygon_GeoJSON_1.set('fieldAliases', {'fid': 'fid', '名称': '名称', '役割分担': '役割分担', '色': '色', '完成時期': '完成時期', });
lyr_line_GeoJSON_2.set('fieldAliases', {'fid': 'fid', '名称': '名称', '役割分担': '役割分担', '色': '色', '完成時期': '完成時期', });
lyr_point_GeoJSON_3.set('fieldAliases', {'fid': 'fid', '名称': '名称', '役割分担': '役割分担', '色': '色', '完成時期': '完成時期', });
lyr_polygon_GeoJSON_1.set('fieldImages', {'fid': 'TextEdit', '名称': 'TextEdit', '役割分担': 'TextEdit', '色': 'Color', '完成時期': 'TextEdit', });
lyr_line_GeoJSON_2.set('fieldImages', {'fid': 'TextEdit', '名称': 'TextEdit', '役割分担': 'TextEdit', '色': 'Color', '完成時期': 'TextEdit', });
lyr_point_GeoJSON_3.set('fieldImages', {'fid': 'Range', '名称': 'TextEdit', '役割分担': 'TextEdit', '色': 'TextEdit', '完成時期': 'TextEdit', });
lyr_polygon_GeoJSON_1.set('fieldLabels', {'fid': 'no label', '名称': 'inline label - always visible', '役割分担': 'inline label - always visible', '色': 'no label', '完成時期': 'inline label - always visible', });
lyr_line_GeoJSON_2.set('fieldLabels', {'fid': 'no label', '名称': 'inline label - always visible', '役割分担': 'inline label - always visible', '色': 'no label', '完成時期': 'inline label - always visible', });
lyr_point_GeoJSON_3.set('fieldLabels', {'fid': 'no label', '名称': 'inline label - always visible', '役割分担': 'inline label - always visible', '色': 'no label', '完成時期': 'inline label - always visible', });
lyr_point_GeoJSON_3.on('precompose', function(evt) {
    evt.context.globalCompositeOperation = 'normal';
});
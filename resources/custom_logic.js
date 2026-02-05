document.addEventListener('DOMContentLoaded', (event) => {
    // This script assumes that the map object, layer variables (e.g., lyr_polygon_GeoJSON_1),
    // and style functions (e.g., style_point_GeoJSON_3) are available in the global scope
    // once the qgis2web-generated scripts have run.

    // Wait for the map to be fully initialized before manipulating it.
    map.on('rendercomplete', function() {
        // This is a one-time setup
        if (window.customLogicSetupDone) {
            return;
        }
        window.customLogicSetupDone = true;

        // --- Cache DOM Elements ---
        const filterButtonsContainer = document.getElementById('filter-buttons');
        const polygonListContainer = document.getElementById('polygon-list-container');
        const flowchartOverlay = document.getElementById('flowchart-overlay');
        const labelToggleCheckbox = document.getElementById('label-toggle');

        // =========================================================================
        // === 1. STYLING AND FILTERING LOGIC
        // =========================================================================

        let labelsVisible = true; // State for label/point visibility

        // Style for filtered-out ('off') features
        const offStyle = new ol.style.Style({
            fill: new ol.style.Fill({ color: 'rgba(128, 128, 128, 0.5)' }),
            stroke: new ol.style.Stroke({ color: 'rgba(128, 128, 128, 0.5)', width: 1.748 }),
            image: new ol.style.Circle({
                radius: 4.0,
                fill: new ol.style.Fill({ color: 'rgba(128, 128, 128, 0.5)' }),
                stroke: new ol.style.Stroke({ color: 'rgba(128, 128, 128, 0.5)', width: 0 })
            })
        });

        // Style function for filtered-out labels
        function offLabelStyle(feature, resolution) {
            var labelText = (feature.get("名称") !== null) ? String(feature.get("名称")) : "";
            if (!labelText) return null;

            return new ol.style.Style({
                text: createTextStyle(
                    feature, resolution, labelText,
                    "15.6px 'Open Sans', sans-serif", '#808080', 'point',
                    'rgba(255, 255, 255, 0.5)', 3.0
                )
            });
        };

        // Combined style function for the 'off' state
        function getOffStyle(feature, resolution) {
            const styles = [offStyle];
            if (feature.getGeometry().getType().includes('Point')) {
                const label = offLabelStyle(feature, resolution);
                if (label) styles.push(label);
            }
            return styles;
        }
        
        // --- Filter Implementation ---
        const buttons = [
            { id: 'ehime-btn', text: '愛媛県' },
            { id: 'matsuyama-btn', text: '松山市' },
            { id: 'jr-btn', text: 'ＪＲ四国' },
            { id: 'iyotetsu-btn', text: '伊予鉄道' }
            // 'dev-step-btn' is handled separately.
        ];

        const layers = [
            { layer: lyr_polygon_GeoJSON_1, originalStyle: style_polygon_GeoJSON_1 },
            { layer: lyr_line_GeoJSON_2, originalStyle: style_line_GeoJSON_2 },
            { layer: lyr_point_GeoJSON_3, originalStyle: style_point_GeoJSON_3 }
        ];

        const allManagedCategories = buttons.map(b => normalizeText(b.text));

        function normalizeText(text) {
            if (!text) return '';
            return text.replace(/[Ａ-Ｚａ-ｚ０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0)).toLowerCase();
        }

        function isFeatureOff(feature) {
            const onCategories = buttons
                .filter(b => !document.getElementById(b.id).classList.contains('off'))
                .map(b => normalizeText(b.text));
            
            const rolesStr = feature.get('役割分担');
            const normalizedRolesStr = normalizeText(rolesStr);
            if (!normalizedRolesStr) return false;

            const isManaged = allManagedCategories.some(cat => normalizedRolesStr.includes(cat));
            if (!isManaged) return false;

            const matchesOn = onCategories.some(cat => normalizedRolesStr.includes(cat));
            return !matchesOn;
        }

        function updateFilter() {
            layers.forEach(l => {
                l.layer.setStyle(function(feature, resolution) {
                    let style = isFeatureOff(feature) ?
                        getOffStyle(feature, resolution) :
                        l.originalStyle(feature, resolution);

                    if (!labelsVisible) {
                        if (l.layer === lyr_point_GeoJSON_3) return null; // Hide points completely
                        
                        if (style) { // For other layers, just hide labels
                            if (Array.isArray(style)) {
                                return style.map(s => {
                                    if (s.getText()) {
                                        const newS = s.clone();
                                        newS.setText(null);
                                        return newS;
                                    }
                                    return s;
                                }).filter(s => s);
                            } else if (style.getText()) {
                                const newStyle = style.clone();
                                newStyle.setText(null);
                                return newStyle;
                            }
                        }
                    }
                    return style;
                });
            });
            updateFeatureListStyle();
        }

        // =========================================================================
        // === 2. FEATURE LIST LOGIC
        // =========================================================================
        
        const highlightSource = new ol.source.Vector();
        const highlightLayer = new ol.layer.Vector({
            source: highlightSource,
            style: new ol.style.Style({
                stroke: new ol.style.Stroke({ color: 'rgba(255,0,0,0.8)', width: 8 }),
                fill: new ol.style.Fill({ color: 'rgba(255,0,0,0.5)' })
            }),
            zIndex: 999
        });
        map.addLayer(highlightLayer);

        function populateFeatureList() {
            const tableBody = document.querySelector("#polygon-list-table tbody");
            const featuresToList = lyr_polygon_GeoJSON_1.getSource().getFeatures()
                .concat(lyr_line_GeoJSON_2.getSource().getFeatures());

            featuresToList.forEach(feature => {
                const row = tableBody.insertRow();
                row.id = 'list-item-' + feature.get('fid');

                const cellName = row.insertCell();
                cellName.textContent = feature.get('名称') || '';
                cellName.style.cursor = 'pointer';
                cellName.addEventListener('click', function() {
                    highlightSource.clear();
                    highlightSource.addFeature(feature);
                    setTimeout(() => highlightSource.clear(), 1000);
                });

                const cellRole = row.insertCell();
                cellRole.innerHTML = (feature.get('役割分担') || '').replace(/,/g, '<br>');
                
                const cellDate = row.insertCell();
                cellDate.textContent = feature.get('完成時期') || '';
            });
        }

        function updateFeatureListStyle() {
            const features = lyr_polygon_GeoJSON_1.getSource().getFeatures()
                .concat(lyr_line_GeoJSON_2.getSource().getFeatures());

            features.forEach(feature => {
                const row = document.getElementById('list-item-' + feature.get('fid'));
                if (row) {
                    row.classList.toggle('list-item-off', isFeatureOff(feature));
                    const color = isFeatureOff(feature) ? '' : feature.get('色');
                    Array.from(row.cells).forEach(cell => cell.style.color = color);
                }
            });
        }

        // =========================================================================
        // === 3. FLOWCHART LOGIC
        // =========================================================================

        function toggleFlowchartView(show) {
            filterButtonsContainer.style.display = show ? 'none' : 'flex';
            polygonListContainer.style.display = show ? 'none' : 'block';
            flowchartOverlay.style.display = show ? 'block' : 'none';
        }

        function findFeatureByName(name) {
            const layersToSearch = [lyr_polygon_GeoJSON_1, lyr_line_GeoJSON_2, lyr_point_GeoJSON_3];
            for (const layer of layersToSearch) {
                const feature = layer.getSource().getFeatures().find(f => f.get('名称') === name);
                if (feature) return feature;
            }
            return null;
        }

        const highlightStyles = {
            Polygon: new ol.style.Style({
                fill: new ol.style.Fill({ color: 'rgba(255, 0, 0, 0.5)' }),
                stroke: new ol.style.Stroke({ color: 'rgba(255, 0, 0, 0.8)', width: 3 })
            }),
            LineString: new ol.style.Style({
                stroke: new ol.style.Stroke({ color: 'rgba(255,0,0,0.8)', width: 8 })
            }),
            Point: new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 10,
                    fill: new ol.style.Fill({ color: 'rgba(255, 0, 0, 0.5)' }),
                    stroke: new ol.style.Stroke({ color: 'red', width: 2 })
                })
            })
        };

        function highlightFeature(featureName) {
            const feature = findFeatureByName(featureName);
            if (!feature) {
                console.warn(`[Custom Logic] Feature not found for highlight: ${featureName}`);
                return;
            }
            const geomType = feature.getGeometry().getType();
            const style = highlightStyles[geomType] || highlightStyles.Point; // Default for Multi-types
            feature.setStyle(style);
            setTimeout(() => feature.setStyle(null), 1000);
        }

        // =========================================================================
        // === 4. EVENT LISTENERS
        // =========================================================================

        // Filter buttons
        buttons.forEach(b => {
            document.getElementById(b.id).addEventListener('click', function() {
                this.classList.toggle('off');
                updateFilter();
            });
        });
        
        // Special button for flowchart
        document.getElementById('dev-step-btn').addEventListener('click', (e) => {
            e.preventDefault();
            toggleFlowchartView(true);
        });
        
        // Flowchart close button
        document.getElementById('close-flowchart-btn').addEventListener('click', () => {
            toggleFlowchartView(false);
        });
        
        // Flowchart clickable items
        document.querySelectorAll('.flow-item').forEach(item => {
            item.addEventListener('click', function() {
                const featureName = this.getAttribute('data-name');
                if (featureName) highlightFeature(featureName);
            });
        });
        
        // Label/point visibility toggle
        labelToggleCheckbox.addEventListener('change', function() {
            labelsVisible = this.checked;
            updateFilter();
        });

        // =========================================================================
        // === 5. INITIALIZATION
        // =========================================================================
        populateFeatureList();
        updateFilter();

    }); // End map.on('rendercomplete')
}); // End DOMContentLoaded

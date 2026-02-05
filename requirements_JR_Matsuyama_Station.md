## Webマップ「JR松山駅周辺」要件定義書

### 1. 概要
QGISで作成した地理空間情報HTMLを、Webサイトで一般公開するために必要なインタラクティブ機能を実装する。本ドキュメントは、その要件と、新規qgis2web出力物への実装手順を定義する。

### 2. デザイン要件
| 項目 | 内容 |
| :--- | :--- |
| **Webページタイトル** | 「JR松山駅周辺」と設定する。 |
| **ボタン類** | ・画面右上に、フィルター機能のためのボタン群を配置する。<br>・ボタン群全体を、白色透過度50%の背景と枠線で囲む。<br>・各ボタンが「オフ」の状態では、ボタン自体をグレーアウト表示する。<br>・文字サイズは20ptとし、それに合わせてボタンの大きさも調整する。<br>・オン時の背景色は薄いオレンジ色とする。<br>・「整備ステップ」ボタンを背景色水色で追加する。 |
| **ラベルON/OFF UI** | ・ボタン類の下に、「ラベルon/off」のチェックボックスを設置する。<br>・文字サイズは16ptとする。 |
| **属性一覧** | ・画面右下に、地図と連動する属性一覧テーブルを追加する。<br>・背景は白色透過度15%（`rgba(255, 255, 255, 0.85)`）とする。 |
| **整備ステップフローチャート** | ・「整備ステップ」ボタン押下時に表示されるオーバーレイ。<br>・背景は不透明の白（透過度0%）とする。<br>・タイトル「整備のステップ（イメージ）」を18ptで表示。<br>・各ステップの項目を16ptで表示。 |
| **ヘッダー/フッター** | 追加しない。 |
| **レイヤーコントロール** | 不要なため、画面から削除する。 |

### 3. 機能要件
| 項目 | 内容 |
| :--- | :--- |
| **初期表示** | ・JR松山駅を中心とし、主要な地物がすべて収まる縮尺で表示する。 |
| **地図操作** | ・すべての縮尺レベルで、すべての地物が常に表示されるようにする。<br>・ポップアップには「名称」をタイトルとして表示し、その下に「役割分担」「完成時期」を表示する。 |
| **フィルター機能** | ・「愛媛県」「松山市」「ＪＲ四国」「伊予鉄道」のボタンで地物をフィルタリングする。<br>・地物の属性「役割分担」に、オン状態のボタン名が一つでも含まれていれば、その地物は元のスタイルで表示される。<br>・どのオン状態のボタン名も含まない地物のみ、グレーアウト表示される。 |
| **ラベル・ポイント表示制御** | ・「ラベルon/off」チェックボックスで、地図上のラベルとポイントの表示を一括で制御する。<br>・**オン（デフォルト）**: すべてのラベルとポイントを通常通り表示する。<br>・**オフ**: ポイントレイヤー(`point_GeoJSON_3`)の地物をすべて非表示にし、他のレイヤー（ポリゴン、ライン）に付随するラベルも非表示にする。 |
| **属性一覧の操作** | ・一覧の「名称」をクリックすると、地図上の対応する地物が1秒間ハイライト表示される。 |
| **整備ステップボタン** | ・クリックすると、他のすべてのボタンと属性一覧が非表示になり、「整備ステップフローチャート」が表示される。<br>・フローチャート内の各項目名をクリックすると、地図上の対応する地物（ポリゴン優先）が1秒間赤くハイライトされる。<br>・フローチャート右上の「閉じる」ボタンで元の表示に戻る。 |

---

## 4. 実装ガイド
このセクションは、QGISから**新たに出力したファイル**に対して、上記のすべてのカスタム要件を**簡単かつ一括で再現**するための実装手順を記録する。

### 4.1. 概要
本ガイドは、qgis2webが生成したファイルにカスタム機能を追加するための**すべての変更点**を網羅する。カスタム機能は外部ファイルに分離し、qgis2webが生成する既存のJavaScriptファイル（`qgis2web.js`、スタイルファイル、レイヤーファイル）に対しても直接的な修正を行うことで、完全な再現性を確保する。

### 4.2. カスタムファイルの配置と`index.html`の修正
以下の2つのファイルを、qgis2webが出力した`resources`フォルダ内に配置する。

1.  `resources/custom_style.css` （すべてのカスタムCSS）
2.  `resources/custom_logic.js` （すべてのカスタムJavaScript）

その後、qgis2webが出力した直後の`index.html`に対し、以下の**3つの修正**を行う。

#### 4.2.1. 修正1: カスタムCSSの読み込み
`<head>`タグ内にある`<style>...</style>`ブロックの**直後**に、作成したカスタムCSSファイルを読み込むための`<link>`タグを1行追加する。

```html
        ...
        <style>
        html, body, #map {
            width: 100%;
            height: 100%;
            padding: 0;
            margin: 0;
        }
        </style>
        <link rel="stylesheet" href="resources/custom_style.css"> <%-- この行を追加 --%>
    </head>
```

#### 4.2.2. 修正2: カスタムUI要素のHTMLを追加
`<body>`タグ内にある`<div id="map">...</div>`の**直後**に、ボタンやテーブル、フローチャートの骨格となるHTMLブロックを挿入する。

```html
    <body>
        <div id="map">
            <div id="popup" class="ol-popup">
                <a href="#" id="popup-closer" class="ol-popup-closer"></a>
                <div id="popup-content"></div>
            </div>
        </div>

        <%-- ここから挿入 --%>
        <div id="filter-buttons">
            <button id="ehime-btn" class="filter-button">愛媛県</button>
            <button id="matsuyama-btn" class="filter-button">松山市</button>
            <button id="jr-btn" class="filter-button">ＪＲ四国</button>
            <button id="iyotetsu-btn" class="filter-button">伊予鉄道</button>
            <button id="dev-step-btn" class="filter-button">整備ステップ</button>
            <div id="label-toggle-container">
                <input type="checkbox" id="label-toggle" checked>
                <label for="label-toggle" id="label-toggle-label">ラベルon/off</label>
            </div>
        </div>

        <div id="polygon-list-container">
            <table id="polygon-list-table">
                <thead>
                    <tr>
                        <th>名称</th>
                        <th>役割分担</th>
                        <th>完成時期</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>

        <div id="flowchart-overlay" style="display: none;">
            <button id="close-flowchart-btn">閉じる</button>
            <h3>整備のステップ（イメージ）</h3>
            <div class="flow-step"><span class="flow-item" data-name="鉄道高架化">①高速高架化</span></div>
            <div class="flow-arrow">↓</div>
            <div class="flow-step"><span class="flow-item" data-name="三番町線">②三番町線</span><br><span class="flow-item" data-name="松山駅西南北線①">松山駅西南北線</span></div>
            <div class="flow-arrow">↓</div>
            <div class="flow-step"><span class="flow-item" data-name="松山駅西口南江戸線">③松山駅西口南江戸線</span><br><span class="flow-item" data-name="西口駅前広場">西口駅前広場</span></div>
            <div class="flow-arrow">↓</div>
            <div class="flow-step"><span class="flow-item" data-name="アリーナ予定地">④アリーナ予定地</span></div>
        </div>
        <%-- ここまで挿入 --%>

        <script src="resources/qgis2web_expressions.js"></script>
        ...
```

#### 4.2.3. 修正3: カスタムJavaScriptの読み込み
`<body>`タグの末尾（`</body>`の直前）に、作成したカスタムJSファイルを読み込むための`<script>`タグを1行追加する。**必ず`qgis2web.js`よりも後**に読み込むこと。

```html
        ...
        <script src="./resources/Autolinker.min.js"></script>
        <script src="./resources/qgis2web.js"></script>
        <script src="resources/custom_logic.js"></script> <%-- この行を追加 --%>
    </body>
</html>
```

### 4.3. `resources/qgis2web.js`への変更
qgis2webが出力する`resources/qgis2web.js`ファイルを直接修正する。

#### 4.3.1. レイヤーコントロールの削除
ファイルの末尾近くにある、`ol.control.LayerSwitcher`をインスタンス化しているブロックを削除またはコメントアウトする。

```javascript
//layerswitcher

// var layerSwitcher = new ol.control.LayerSwitcher({ /* ... */ }); // 削除またはコメントアウト
// map.addControl(layerSwitcher); // 削除またはコメントアウト
// if (hasTouchScreen || isSmallScreen) { /* ... */ } // 関連するブロックも削除またはコメントアウト
```

#### 4.3.2. 地図の初期表示とズーム制限の解除
`ol.Map`のインスタンス化部分を変更し、ズームレベルの制限を無くし、初期表示が`polygon_GeoJSON_1`レイヤー全体にフィットするように変更する。

**変更前**:
```javascript
var map = new ol.Map({
    /* ... */
    view: new ol.View({
         maxZoom: 28, minZoom: 1
    })
});
map.getView().fit([14777068.371611, 4006852.899055, 14777968.696019, 4007684.028896], map.getSize());
```
**変更後**:
```javascript
var map = new ol.Map({
    /* ... */
    view: new ol.View({
        // maxZoom, minZoomの指定を削除
    })
});
// map.getView().fit([14777068.371611, 4006852.899055, 14777968.696019, 4007684.028896], map.getSize()); // 削除
map.getView().fit(jsonSource_polygon_GeoJSON_1.getExtent(), map.getSize()); // この行を追加
```

#### 4.3.3. ポップアップの表示内容とレイアウトの変更
`createPopupField`関数と`onSingleClickFeatures`関数（または`onPointerMove`関数内のポップアップ生成部分）を修正し、表示する属性を「役割分担」と「完成時期」のみに限定し、「名称」をタイトルとして表示する。

**`createPopupField`関数の変更**:
```javascript
function createPopupField(currentFeature, currentFeatureKeys, layer) {
    var popupText = '';
    const allowedFields = ['役割分担', '完成時期']; // 表示を許可するフィールドを定義

    for (var i = 0; i < currentFeatureKeys.length; i++) {
        const currentKey = currentFeatureKeys[i];
        // 許可されたフィールドのみを処理する
        if (allowedFields.includes(currentKey) && currentFeature.get(currentKey) !== null) {
            // ここに元のpopupTextへの追加ロジックを維持
            // 例: popupText += '<tr><th>' + currentKey + '</th><td>' + currentFeature.get(currentKey) + '</td></tr>';
            // ただし、元の実装に合わせて調整すること
            if (layer.get('fieldLabels')[currentKey] == 'inline label - always visible') {
                popupText += '<li><span class="popup-title">' + currentKey + ':</span> ' + autolinker.link(String(currentFeature.get(currentKey))) + '</li>';
            } else {
                popupText += '<tr><th scope="row">' + currentKey + '</th><td>' + autolinker.link(String(currentFeature.get(currentKey))) + '</td></tr>';
            }
        }
    }
    return popupText;
}
```

**`onSingleClickFeatures`関数または`onPointerMove`関数内のポップアップ生成部分の変更**:
（通常、`popupText += '<li><table>';` の部分を探す）

**変更前**:
```javascript
popupText += '<li><table>';
popupText += '<a><b>' + layer.get('popuplayertitle') + '</b></a>'; // レイヤータイトルが表示される部分
popupText += createPopupField(currentFeature, currentFeatureKeys, layer);
popupText += '</table></li>';
```
**変更後**:
```javascript
const name = currentFeature.get('名称'); // 地物の名称を取得
popupText += '<li><table>';
if (name) {
    popupText += '<a><b>' + name + '</b></a>'; // 名称をタイトルとして表示
}
// layer.get('popuplayertitle') の行は削除またはコメントアウトする
popupText += createPopupField(currentFeature, currentFeatureKeys, layer);
popupText += '</table></li>';
```

### 4.4. `styles/` フォルダ内の各スタイルファイルへの変更
qgis2webが出力する`styles/`フォルダ内の各`_style.js`ファイルを直接修正する。

#### 4.4.1. `polygon_GeoJSON_1_style.js`
`style_polygon_GeoJSON_1`関数を修正し、属性「色」を参照し、例外処理を含む透過率を動的に設定するようにする。枠線の色も属性「色」に連動させる。

**変更後**:
```javascript
var style_polygon_GeoJSON_1 = function(feature, resolution){
    // 既存のスタイル定義に以下のロジックを組み込む
    var opacity = 0.5; // デフォルト透過率
    if (feature.get('名称') === 'JR松山駅前（仮称）') {
        opacity = 1.0; // 特定の名称の地物のみ不透明
    }
    var featureColor = feature.get('色') || '#808080'; // 属性'色'がない場合のデフォルト色

    // 塗りつぶし色の設定
    var fillColor = ol.color.fromString(featureColor);
    fillColor[3] = opacity; // 透過率を適用

    // 枠線の設定
    var strokeColor = ol.color.fromString(featureColor); // 枠線も同じ色に

    var style = [ new ol.style.Style({
        fill: new ol.style.Fill({
            color: fillColor // 透過率適用済みの色
        }),
        stroke: new ol.style.Stroke({
            color: strokeColor, // 属性'色'に基づいた枠線色
            lineDash: null,
            lineCap: 'butt',
            lineJoin: 'miter',
            width: 0.988
        }),
        text: createTextStyle(feature, resolution, '', featureColor, placement) // ラベルがある場合
    })];

    return style;
};
```

#### 4.4.2. `line_GeoJSON_2_style.js`
`ol.style.Stroke`の`color`を、属性「色」を参照するように変更する。

**変更前**:
```javascript
var style = [ new ol.style.Style({
    stroke: new ol.style.Stroke({color: 'rgba(190,207,80,1.0)', lineDash: null, lineCap: 'round', lineJoin: 'round', width: 3.8}),
    text: createTextStyle(feature, resolution, '', 'rgba(0, 0, 0, 1)', placement)
})];
```
**変更後**:
```javascript
var style = [ new ol.style.Style({
    // strokeのcolorをfeature.get('色')で動的に設定
    stroke: new ol.style.Stroke({color: feature.get('色') || 'rgba(190,207,80,1.0)', lineDash: null, lineCap: 'round', lineJoin: 'round', width: 3.8}),
    text: createTextStyle(feature, resolution, '', 'rgba(0, 0, 0, 1)', placement)
})];
```

#### 4.4.3. `point_GeoJSON_3_style.js`
`ol.style.Circle`の`fill`の`color`と、ラベルの色(`labelFill`)を、属性「色」を参照するように変更する。

**変更前**:
```javascript
var labelText = String(feature.get('名称'));
var labelFont = "15.6px \'Open Sans\', sans-serif";
var labelFill = "rgba(0, 0, 0, 1)"; // ラベルの塗りつぶし色
var bufferColor = '#ffffff';
var bufferWidth = 3;
// ...
var style = [ new ol.style.Style({
    image: new ol.style.Circle({radius: 8.0, stroke: new ol.style.Stroke({color: 'rgba(0,0,0,1.0)', lineDash: null, lineCap: 'butt', lineJoin: 'miter', width: 1}), fill: new ol.style.Fill({color: 'rgba(114,155,111,1.0)'})}), // ポイントの塗りつぶし色
    text: createTextStyle(feature, resolution, labelText, labelFont, labelFill, placement, bufferColor, bufferWidth)
})];
```
**変更後**:
```javascript
var labelText = String(feature.get('名称'));
var labelFont = "15.6px \'Open Sans\', sans-serif";
var labelFill = feature.get('色') || "rgba(0, 0, 0, 1)"; // ラベルの塗りつぶし色を属性'色'で動的に設定
var bufferColor = '#ffffff';
var bufferWidth = 3;
// ...
var style = [ new ol.style.Style({
    image: new ol.style.Circle({radius: 8.0, stroke: new ol.style.Stroke({color: 'rgba(0,0,0,1.0)', lineDash: null, lineCap: 'butt', lineJoin: 'miter', width: 1}), fill: new ol.style.Fill({color: feature.get('色') || 'rgba(114,155,111,1.0)'})}), // ポイントの塗りつぶし色を属性'色'で動的に設定
    text: createTextStyle(feature, resolution, labelText, labelFont, labelFill, placement, bufferColor, bufferWidth)
})];
```

### 4.5. `layers/layers.js`への変更
qgis2webが出力する`layers/layers.js`ファイルを直接修正する。

#### 4.5.1. ポップアップの項目名表示の修正
ポリゴンレイヤーの`fieldLabels`設定で、「役割分担」の値が`'no label'`になっていたのを`'inline label - always visible'`に修正する。

**変更前**:
```javascript
lyr_polygon_GeoJSON_1.set('fieldLabels', {'fid': 'no label', '名称': 'inline label - always visible', '役割分担': 'no label', '色': 'no label', '完成時期': 'inline label - always visible', });
```
**変更後**:
```javascript
lyr_polygon_GeoJSON_1.set('fieldLabels', {'fid': 'no label', '名称': 'inline label - always visible', '役割分担': 'inline label - always visible', '色': 'no label', '完成時期': 'inline label - always visible', }); // '役割分担'の値を変更
```

### 4.6. セキュリティに関する考慮事項
本実装は、ユーザーのブラウザ内で完結する**フロントエンドのカスタマイズ（HTML, CSS, JavaScript）のみ**で構成されている。

-   **サーバーへのデータ送信**: ユーザー操作や入力データを外部サーバーに送信する機能は一切ない。
-   **クロスサイトスクリプティング (XSS)**: ユーザー入力を受け付けてHTMLとして描画する箇所はなく、クリックイベントは事前に定義されたデータ属性（`data-name`）のみを利用するため、XSSのリスクは極めて低い。
-   **外部ライブラリ**: `qgis2web`が標準で出力するファイル以外に、新たな外部ライブラリは導入していない。

以上のことから、本カスタマイズが新たなセキュリティ上の脆弱性を生む可能性は低い。
